'use strict';

const config = require('./config.js'),
        gulp = config.getGulpInstance(),
        buildConfig = config.get(),
        allTaskName = buildConfig.allTaskName,
        autoprefixer = require('autoprefixer'),
        gulpSassError = require('gulp-sass-error').gulpSassError,
        failBuild = process.env.NODE_ENV === 'production',
        postcss = require('gulp-postcss'),
        // rename = require('gulp-rename'),
        sass = require('gulp-sass'),
        sassLint = require('gulp-sass-lint'),
        fs = require('fs'),
        styleConfig = buildConfig.styles,
        styleTasks = styleConfig.tasks,
        buildTaskPrefix = styleConfig.buildTaskPrefix,
        compileTaskPrefix = styleConfig.compileTaskPrefix,
        lintTaskPrefix = styleConfig.lintTaskPrefix,
        postprocessTaskPrefix = styleConfig.postprocessTaskPrefix,
        watchTaskPrefix = styleConfig.watchTaskPrefix,
        tokensTaskPrefix = buildConfig.tokensTaskName,
        buildTasks = styleTasks.map(task => `${buildTaskPrefix}${task.name}`),
        compileTasks = styleTasks.map(task => `${compileTaskPrefix}${task.name}`),
        lintTasks = styleTasks.map(task => `${lintTaskPrefix}${task.name}`),
        lifecycleHookTaskNames = {
            lintAll: `${lintTaskPrefix}${allTaskName}`,
            compileAll: `${compileTaskPrefix}${allTaskName}`,
            watchAll: `${watchTaskPrefix}${allTaskName}`
        },
        lifecycleHookTaskNameKeys = Object.keys(lifecycleHookTaskNames);

let watchTasks = styleTasks.map(task => `${watchTaskPrefix}${task.name}`);

function generateBasePreAndPostTasks(taskName) {
    const tasksWithPreAndPostHooks = config.getBaseTaskWithPreAndPostHooks(taskName);
    gulp.task(taskName, gulp.series(tasksWithPreAndPostHooks)); // Calls :base task and pre: and post: tasks if defined 
}

function getLintOptions(c) {
    let sassLintOptions = {};
    if (c.lintOptions) {
        sassLintOptions = c.lintOptions;
    }
    if (sassLintOptions.configFile && !fs.existsSync(sassLintOptions.configFile)) {
        // eslint-disable-next-line no-console
        console.log(`Warning: ${sassLintOptions.configFile} cannot be found, using sass-lint defaults`);
        delete sassLintOptions.configFile;
    }
    return sassLintOptions;
}

function generateLintTask(c) {
    let sassLintOptions = getLintOptions(c);

    const taskName = `${lintTaskPrefix}${c.name}`; 
    gulp.task(config.getBaseTaskName(taskName), function () {
      return gulp.src(c.lintPaths)
        .pipe(sassLint(sassLintOptions))
        .pipe(sassLint.format());
    });

    generateBasePreAndPostTasks(taskName);
}

function generateCompileTask(c) {
    let sassCompileOptions = {};

    if (c.compileImportPaths) {
        sassCompileOptions.includePaths = c.compileImportPaths;
    }

    const taskName = `${compileTaskPrefix}${c.name}`; 
    gulp.task(config.getBaseTaskName(taskName), function(){
        return gulp.src(c.compileSourceFiles)
            .pipe(sass(sassCompileOptions).on('error', gulpSassError(failBuild)))
            // .pipe(rename(c.compiledFileName)) //TODO: Maybe add this back in as a feature at some point?
            .pipe(gulp.dest(c.outputPath));
    });

    generateBasePreAndPostTasks(taskName);
}

function generatePostprocessTask(c) {
    const taskName = `${postprocessTaskPrefix}${c.name}`; 
    gulp.task(config.getBaseTaskName(taskName), function() {
        let autoprefixerOptions = {};
        if (c.autoprefixerOptions) {
            autoprefixerOptions = c.autoprefixerOptions;
        }

        var plugins = [
            autoprefixer(autoprefixerOptions)
        ];
        return gulp.src(`${c.outputPath}/*.css`)
            .pipe(postcss(plugins))
            .pipe(gulp.dest(c.outputPath));
    });

    generateBasePreAndPostTasks(taskName);
}

function generateWatchTask(c) {
    const taskName = `${watchTaskPrefix}${c.name}`;
    gulp.task(config.getBaseTaskName(taskName), function(){
        return gulp.watch(c.watchFiles, gulp.series(`${buildTaskPrefix}${c.name}`));
    });

    generateBasePreAndPostTasks(taskName);
}

function generateBuildTask(c) {
    const taskName = `${buildTaskPrefix}${c.name}`;
    gulp.task(config.getBaseTaskName(taskName),
                gulp.series(
                    `${lintTaskPrefix}${c.name}`,
                    `${compileTaskPrefix}${c.name}`,
                    `${postprocessTaskPrefix}${c.name}`));

    generateBasePreAndPostTasks(taskName);
}

// Dynamically generate compile, lint, and watch tasks
styleTasks.forEach(function(c){
    const buildLintTask = c.lintPaths;

    if (buildLintTask) {
        generateLintTask(c);
    }

    generateCompileTask(c);
    generatePostprocessTask(c);
    generateBuildTask(c);
    generateWatchTask(c);
});

// Lint all scss files
gulp.task(config.getBaseTaskName(lifecycleHookTaskNames.lintAll), gulp.parallel(lintTasks));

// Compile all scss files
gulp.task(config.getBaseTaskName(lifecycleHookTaskNames.compileAll), gulp.parallel(compileTasks));

// Build all scss files
const buildAllTaskName = `${buildTaskPrefix}${allTaskName}`;
gulp.task(config.getBaseTaskName(buildAllTaskName), gulp.parallel(buildTasks));
generateBasePreAndPostTasks(buildAllTaskName);


// Watch tokens.scss and recompile
const watchTokensTaskName = `${watchTaskPrefix}${tokensTaskPrefix}`;
gulp.task(config.getBaseTaskName(watchTokensTaskName), gulp.series(buildAllTaskName));
generateBasePreAndPostTasks(watchTokensTaskName);

// Run all watch tasks in parallel
watchTasks.push(watchTokensTaskName);
gulp.task(config.getBaseTaskName(lifecycleHookTaskNames.watchAll), gulp.parallel(watchTasks));


// Generate lifecycle hook (pre & post) tasks (if defined)
lifecycleHookTaskNameKeys.forEach((k) => {
    const t = lifecycleHookTaskNames[k],
            tasksWithPreAndPostHooks = config.getBaseTaskWithPreAndPostHooks(t);

    gulp.task(t, gulp.series(tasksWithPreAndPostHooks));
});


module.exports = {
    getLintOptions: getLintOptions
};

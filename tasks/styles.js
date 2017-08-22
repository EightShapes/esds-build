'use strict';

const config = require('./config.js'),
        buildConfig = config.get(),
        autoprefixer = require('autoprefixer'),
        gulp = require('gulp'),
        gulpSassError = require('gulp-sass-error').gulpSassError,
        failBuild = process.env.NODE_ENV === 'production',
        postcss = require('gulp-postcss'),
        // rename = require('gulp-rename'),
        sass = require('gulp-sass'),
        sassLint = require('gulp-sass-lint'),
        styleConfig = buildConfig.styles,
        styleTasks = styleConfig.tasks,
        buildTaskPrefix = styleConfig.buildTaskPrefix,
        compileTaskPrefix = styleConfig.compileTaskPrefix,
        lintTaskPrefix = styleConfig.lintTaskPrefix,
        postprocessTaskPrefix = styleConfig.postprocessTaskPrefix,
        watchTaskPrefix = styleConfig.watchTaskPrefix,
        buildTasks = styleTasks.map(task => `${buildTaskPrefix}${task.name}`),
        compileTasks = styleTasks.map(task => `${compileTaskPrefix}${task.name}`),
        lintTasks = styleTasks.map(task => `${lintTaskPrefix}${task.name}`),
        watchTasks = styleTasks.map(task => `${watchTaskPrefix}${task.name}`);

function generateLintTask(c) {
    let sassLintOptions = {};
    if (c.lintOptions) {
        sassLintOptions = c.lintOptions;
    }

    gulp.task(`${lintTaskPrefix}${c.name}`, function () {
      return gulp.src(c.lintPaths)
        .pipe(sassLint(sassLintOptions))
        .pipe(sassLint.format());
    });
}

function generateCompileTask(c) {
    let sassCompileOptions = {};

    if (c.compileImportPaths) {
        sassCompileOptions.includePaths = c.compileImportPaths;
    }

    gulp.task(`${compileTaskPrefix}${c.name}`, function(){
        return gulp.src(c.compileSourceFiles)
            .pipe(sass(sassCompileOptions).on('error', gulpSassError(failBuild)))
            // .pipe(rename(c.compiledFileName)) //TODO: Maybe add this back in as a feature at some point?
            .pipe(gulp.dest(c.outputPath));
    });
}

function generatePostprocessTask(c) {
    gulp.task(`${postprocessTaskPrefix}${c.name}`, function() {
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
}

function generateWatchTask(c) {
    gulp.task(`${watchTaskPrefix}${c.name}`, function(){
        return gulp.watch([c.compileSourceFiles, c.compileImportPaths], gulp.series(`${buildTaskPrefix}${c.name}`));
    });
}

function generateBuildTask(c) {
    gulp.task(`${buildTaskPrefix}${c.name}`,
                gulp.series(
                    `${lintTaskPrefix}${c.name}`,
                    `${compileTaskPrefix}${c.name}`,
                    `${postprocessTaskPrefix}${c.name}`));
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
gulp.task(`${lintTaskPrefix}all`, gulp.parallel(lintTasks));

// Compile all scss files
gulp.task(`${compileTaskPrefix}all`, gulp.parallel(compileTasks));

// Build all scss files
gulp.task(`${buildTaskPrefix}all`, gulp.parallel(buildTasks));

// Watch tokens.scss and recompile
gulp.task(`${watchTaskPrefix}tokens`, gulp.series(`${buildTaskPrefix}all`));

// Run all watch tasks in parallel
watchTasks.push(`${watchTaskPrefix}tokens`);
gulp.task(`${watchTaskPrefix}all`, gulp.parallel(watchTasks));

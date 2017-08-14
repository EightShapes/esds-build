'use strict';

const rootPath = process.cwd(),
        autoprefixer = require('autoprefixer'),
        gulp = require('gulp'),
        postcss = require('gulp-postcss'),
        rename = require('gulp-rename'),
        sass = require('gulp-sass'),
        sassLint = require('gulp-sass-lint'),
        gulpfile = require(`${rootPath}/gulpfile.js`),
        gulp_config = gulpfile.config,
        styleConfig = gulp_config.styles,
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
            .pipe(sass(sassCompileOptions))
            .pipe(rename(c.compiledFileName))
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
        return gulp.src(`${c.outputPath}/${c.compiledFileName}`)
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

// Run all watch tasks in parallel
gulp.task(`${watchTaskPrefix}all`, gulp.parallel(watchTasks));

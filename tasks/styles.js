'use strict';

const rootPath = process.cwd(),
        gulpfile = require(`${rootPath}/gulpfile.js`),
        gulp = require('gulp'),
        gulp_config = gulpfile.config,
        rename = require('gulp-rename'),
        sass = require('gulp-sass'),
        sassLint = require('gulp-sass-lint'),
        styleConfig = gulp_config.styles,
        styleTasks = styleConfig.tasks,
        compileTaskPrefix = styleConfig.compileTaskPrefix,
        lintTaskPrefix = styleConfig.lintTaskPrefix,
        watchTaskPrefix = styleConfig.watchTaskPrefix,
        styleCompileTasks = styleTasks.map(task => `${compileTaskPrefix}${task.name}`),
        styleLintTasks = styleTasks.map(task => `${lintTaskPrefix}${task.name}`);

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

function generateWatchTask(c) {
    gulp.task(`${watchTaskPrefix}${c.name}`, function(){
        return gulp.watch([c.compileSourceFiles, c.compileImportPaths], gulp.series(`${compileTaskPrefix}${c.name}`));
    });
}

// Dynamically generate compile, lint, and watch tasks
styleTasks.forEach(function(c){
    const buildLintTask = c.lintPaths;

    if (buildLintTask) {
        generateLintTask(c);
    }

    generateCompileTask(c);
    generateWatchTask(c);
});

// Lint all scss files
gulp.task(`${lintTaskPrefix}all`, gulp.parallel(styleLintTasks));

// Compile all scss files
gulp.task(`${compileTaskPrefix}all`, gulp.parallel(styleCompileTasks));

// Watch scss files for changes

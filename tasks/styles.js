'use strict';

const gulpfile = require('../gulpfile.js'),
        gulp = require('gulp'),
        gulp_config = gulpfile.config,
        rename = require('gulp-rename'),
        sass = require('gulp-sass'),
        sassLint = require('gulp-sass-lint'),
        styleCompileTasks = gulp_config.styles.compile.map(taskConfig => taskConfig.taskName),
        styleLintTasks = gulp_config.styles.lint.map(taskConfig => taskConfig.taskName);

// Sass linting
gulp_config.styles.lint.forEach(function(c){
    let sassLintOptions = {};
    if (c.options) {
        sassLintOptions = c.options;
    }

    gulp.task(c.taskName, function () {
      return gulp.src(c.lintPaths)
        .pipe(sassLint(sassLintOptions))
        .pipe(sassLint.format());
    });
});

// Lint all scss files
gulp.task('styles:lint:all', gulp.parallel(styleLintTasks));

// Sass compilation
gulp_config.styles.compile.forEach(function(c){
    let sassCompileOptions = {};
    if (c.importPaths) {
        sassCompileOptions.includePaths = c.importPaths;
    }

    gulp.task(c.taskName, function(){
        return gulp.src(c.sourceFiles)
            .pipe(sass(sassCompileOptions))
            .pipe(rename(c.outputFileName))
            .pipe(gulp.dest(c.outputPath));
    });
});

// Compile all scss files
gulp.task('styles:build:all', gulp.parallel(styleCompileTasks));

// gulp.task('styles:build', gulp.series('styles:lint', 'styles:compile-library'));

// gulp.task('watch:styles', function(){
//     return gulp.watch(pathsToLint.concat(lintConfigFile), gulp.series('styles:build'));
// });

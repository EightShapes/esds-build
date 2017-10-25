'use strict';

const config = require('./config.js'),
        c = config.get(),
        gulp = require('gulp'),
        rename = require('gulp-rename'),
        zip = require('gulp-zip'),
        copyTasks = c.copy.tasks,
        copyTaskNames = copyTasks.filter(t => t.name !== 'dist').map(t => `${c.copy.copyTaskPrefix}${t.name}`), // don't include the copy:dist task with the copy:all tasks
        watchTaskNames = copyTasks.filter(t => t.watch).map(t => `${c.watchTaskName}:${c.copy.copyTaskPrefix}${t.name}`); // don't include the copy:dist task with the copy:all tasks

function generateCopyTask(t) {
    gulp.task(`${c.copy.copyTaskPrefix}${t.name}`, function() {
        if (t.zip_to) {
            return gulp.src(t.sources)
                .pipe(zip(t.zip_to))
                .pipe(gulp.dest(t.destination));
        } else if (t.rename) {
            return gulp.src(t.sources)
                .pipe(rename(t.rename))
                .pipe(gulp.dest(t.destination));
        } else {
            return gulp.src(t.sources)
                .pipe(gulp.dest(t.destination));
        }
    });
}

function generateWatchTask(t) {
    gulp.task(`${c.watchTaskName}:${c.copy.copyTaskPrefix}${t.name}`, function(){
        return gulp.watch(t.sources, gulp.series(`${c.copy.copyTaskPrefix}${t.name}`));
    });
}

copyTasks.forEach(t => {
    // console.log(t);
    generateCopyTask(t);

    if (t.watch) {
        generateWatchTask(t);
    }
});

// Run all copy tasks
gulp.task(`${c.copy.copyTaskPrefix}${c.allTaskName}`, gulp.parallel(copyTaskNames));

// Run all watch tasks
gulp.task(`${c.watchTaskName}:${c.copy.copyTaskPrefix}${c.allTaskName}`, gulp.parallel(watchTaskNames));

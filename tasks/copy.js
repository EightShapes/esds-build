'use strict';

const config = require('./config.js'),
        c = config.get(),
        gulp = require('gulp'),
        rename = require('gulp-rename'),
        copyTasks = c.copy.tasks,
        copyTaskNames = copyTasks.filter(t => t.name !== 'dist').map(t => `${c.copy.copyTaskPrefix}${t.name}`); // don't include the copy:dist task with the copy:all tasks

function generateCopyTask(t) {
    gulp.task(`${c.copy.copyTaskPrefix}${t.name}`, function() {
    return gulp.src(t.sources)
        .pipe(rename(function (path) {
            path.basename = t.rename ? t.rename : path.basename;
          }))
        .pipe(gulp.dest(t.destination));
    });
}

copyTasks.forEach(t => {
    // console.log(t);
    generateCopyTask(t);
});

// Run all copy tasks
gulp.task(`${c.copy.copyTaskPrefix}${c.allTaskName}`, gulp.parallel(copyTaskNames));

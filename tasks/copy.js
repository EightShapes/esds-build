'use strict';

const config = require('./config.js'),
        c = config.get(),
        gulp = require('gulp'),
        copyTasks = c.copy.tasks,
        copyTaskNames = copyTasks.map(t => `${c.copy.copyTaskPrefix}${t.name}`);

function generateCopyTask(t) {
    gulp.task(`${c.copy.copyTaskPrefix}${t.name}`, function() {
    return gulp.src(t.sources)
        .pipe(gulp.dest(t.destination));
    });
}

copyTasks.forEach(t => {
    generateCopyTask(t);
});

// Run all copy tasks
gulp.task(`${c.copy.copyTaskPrefix}${c.allTaskName}`, gulp.parallel(copyTaskNames));

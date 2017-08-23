'use strict';

const config = require('./config.js'),
        buildConfig = config.get(),
        gulp = require('gulp'),
        copyTasks = buildConfig.copy.tasks;

function generateCopyTask(c) {
    gulp.task(`${buildConfig.copy.copyTaskPrefix}${c.name}`, function() {
    return gulp.src(c.sources)
        .pipe(gulp.dest(c.destination));
    });
}

copyTasks.forEach(c => {
    generateCopyTask(c);
});

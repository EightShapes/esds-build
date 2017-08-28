'use strict';

const config = require('./config.js'),
        c = config.get(),
        iconTasks = c.icons.tasks,
        gulp = require('gulp'),
        svgmin = require('gulp-svgmin'),
        svgSprite = require('gulp-svg-sprite'),
        buildTaskPrefix = [c.iconsTaskName, c.buildTaskName].join(':') + ':',
        watchTaskPrefix = [c.watchTaskName, c.iconsTaskName].join(':') + ':',
        buildAllTask = `${buildTaskPrefix}${c.allTaskName}`,
        watchAllTask = `${watchTaskPrefix}${c.allTaskName}`,
        buildTasks = iconTasks.map(t => `${buildTaskPrefix}${t.name}`),
        watchTasks = iconTasks.map(t => `${watchTaskPrefix}${t.name}`);

function generateIconOptimizeTask(t) {
    const taskName = [c.iconsTaskName, c.optimizeTaskName, t.name].join(':');
    gulp.task(taskName, function() {
        return gulp.src(t.sources, {since: gulp.lastRun(taskName)})
            .pipe(svgmin())
            .pipe(gulp.dest(t.optimizedFileDestination));
    });
}

function generateIconConcatenateTask(t) {
    const taskName = [c.iconsTaskName, c.concatTaskName, t.name].join(':');
    gulp.task(taskName, function() {
        return gulp.src(t.sources)
            .pipe(svgSprite({
                mode: {
                    symbol: {
                        dest: '.',
                        sprite: `${t.name}.svg`,
                        example: false
                    }
                }
            }))
            .pipe(gulp.dest(t.destination));
    });
}



function generateIconBuildTask(t) {
    const taskName = [c.iconsTaskName, c.buildTaskName, t.name].join(':'),
            optimizeTask = [c.iconsTaskName, c.optimizeTaskName, t.name].join(':'),
            concatTask = [c.iconsTaskName, c.concatTaskName, t.name].join(':');
    gulp.task(taskName, gulp.series(optimizeTask, concatTask));
}

function generateIconWatchTask(t) {
    const taskName = [c.watchTaskName, c.iconsTaskName, t.name].join(':'),
            buildTask = [c.iconsTaskName, c.buildTaskName, t.name].join(':');
    gulp.task(taskName, gulp.series(buildTask));
}

iconTasks.forEach(t => {
    generateIconOptimizeTask(t);
    generateIconConcatenateTask(t);
    generateIconBuildTask(t);
    generateIconWatchTask(t);
});

// Build all icon files
gulp.task(buildAllTask, gulp.parallel(buildTasks));

// Watch all icon files
gulp.task(watchAllTask, gulp.parallel(watchTasks));

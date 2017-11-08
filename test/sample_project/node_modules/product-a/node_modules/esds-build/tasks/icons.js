'use strict';

const config = require('./config.js'),
        fs = require('fs'),
        path = require('path'),
        mkdirp = require('mkdirp'),
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

function getIconNamesManifest() {
    const iconDirectory = path.join(c.rootPath, c.iconsPath);
    let icons = [];

    if (fs.existsSync(iconDirectory)) {
        const iconFilenames = fs.readdirSync(iconDirectory);
        iconFilenames.sort().forEach(fn => {
            if (fn.indexOf('.svg') !== -1) {
                icons.push(fn.substring(0, fn.length - 4));
            }
        });
    }

    return icons;
}

function generateIconNameManifestFile() {
    const iconNames = getIconNamesManifest(),
            iconNamesJson = JSON.stringify(iconNames),
            dataDirectory = path.join(c.rootPath, c.dataPath),
            iconDataFilePath = path.join(dataDirectory, 'icons.json');

    if (!fs.existsSync(dataDirectory)) {
        mkdirp.sync(dataDirectory);
    }

    fs.writeFileSync(iconDataFilePath, iconNamesJson);
}

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
                        sprite: t.outputFilename,
                        example: false
                    }
                }
            }))
            .pipe(gulp.dest(t.destination));
    });
}

function generateIconManifestTask(t) {
    const taskName = [c.iconsTaskName, 'manifest', t.name].join(':');
    gulp.task(taskName, function(done){
        generateIconNameManifestFile();
        done();
    });
}

function generateIconBuildTask(t) {
    const taskName = [c.iconsTaskName, c.buildTaskName, t.name].join(':'),
            optimizeTask = [c.iconsTaskName, c.optimizeTaskName, t.name].join(':'),
            concatTask = [c.iconsTaskName, c.concatTaskName, t.name].join(':'),
            manifestTask = [c.iconsTaskName, 'manifest', t.name].join(':');
    gulp.task(taskName, gulp.parallel(manifestTask, gulp.series(optimizeTask, concatTask)));
}

function generateIconWatchTask(t) {
    const taskName = [c.watchTaskName, c.iconsTaskName, t.name].join(':'),
            buildTask = [c.iconsTaskName, c.buildTaskName, t.name].join(':');
    gulp.task(taskName, function(){
        return gulp.watch(t.sources, gulp.series(buildTask));
    });
}


iconTasks.forEach(t => {
    generateIconOptimizeTask(t);
    generateIconConcatenateTask(t);
    generateIconManifestTask(t);
    generateIconBuildTask(t);
    generateIconWatchTask(t);
});

// Build all icon files
gulp.task(buildAllTask, gulp.parallel(buildTasks));

// Watch all icon files
gulp.task(watchAllTask, gulp.parallel(watchTasks));

module.exports = {
    getIconNamesManifest: getIconNamesManifest,
    generateIconNameManifestFile: generateIconNameManifestFile
};

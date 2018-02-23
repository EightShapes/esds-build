'use strict';

const config = require('./config.js'),
        fs = require('fs'),
        path = require('path'),
        mkdirp = require('mkdirp'),
        gulp = config.getGulpInstance(),
        c = config.get(),
        iconTasks = c.icons.tasks,
        svgmin = require('gulp-svgmin'),
        svgSprite = require('gulp-svg-sprite'),
        buildTaskPrefix = [c.iconsTaskName, c.buildTaskName].join(':') + ':',
        watchTaskPrefix = [c.watchTaskName, c.iconsTaskName].join(':') + ':',
        buildTasks = iconTasks.map(t => `${buildTaskPrefix}${t.name}`),
        watchTasks = iconTasks.map(t => `${watchTaskPrefix}${t.name}`),
        lifecycleHookTaskNames = {
            buildAll: `${buildTaskPrefix}${c.allTaskName}`,
            watchAll: `${watchTaskPrefix}${c.allTaskName}`
        },
        lifecycleHookTaskNameKeys = Object.keys(lifecycleHookTaskNames);

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

function generateBasePreAndPostTasks(taskName) {
    const tasksWithPreAndPostHooks = config.getBaseTaskWithPreAndPostHooks(taskName);
    gulp.task(taskName, gulp.series(tasksWithPreAndPostHooks)); // Calls :base task and pre: and post: tasks if defined 
}

function generateIconOptimizeTask(t) {
    const taskName = [c.iconsTaskName, c.optimizeTaskName, t.name].join(':');
    gulp.task(config.getBaseTaskName(taskName), function() {
        return gulp.src(t.sources, {since: gulp.lastRun(taskName)})
            .pipe(svgmin())
            .pipe(gulp.dest(t.optimizedFileDestination));
    });

    generateBasePreAndPostTasks(taskName);
}

function generateIconConcatenateTask(t) {
    const taskName = [c.iconsTaskName, c.concatTaskName, t.name].join(':');
    gulp.task(config.getBaseTaskName(taskName), function() {
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

    generateBasePreAndPostTasks(taskName);
}

function generateIconManifestTask(t) {
    const taskName = [c.iconsTaskName, 'manifest', t.name].join(':');
    gulp.task(config.getBaseTaskName(taskName), function(done){
        generateIconNameManifestFile();
        done();
    });

    generateBasePreAndPostTasks(taskName);
}

function generateIconBuildTask(t) {
    const taskName = [c.iconsTaskName, c.buildTaskName, t.name].join(':'),
            optimizeTask = [c.iconsTaskName, c.optimizeTaskName, t.name].join(':'),
            concatTask = [c.iconsTaskName, c.concatTaskName, t.name].join(':'),
            manifestTask = [c.iconsTaskName, 'manifest', t.name].join(':');
    gulp.task(config.getBaseTaskName(taskName), gulp.parallel(manifestTask, gulp.series(optimizeTask, concatTask)));

    generateBasePreAndPostTasks(taskName);
}

function generateIconWatchTask(t) {
    const taskName = [c.watchTaskName, c.iconsTaskName, t.name].join(':'),
            buildTask = [c.iconsTaskName, c.buildTaskName, t.name].join(':');
    gulp.task(config.getBaseTaskName(taskName), function(){
        return gulp.watch(t.sources, gulp.series(buildTask));
    });

    generateBasePreAndPostTasks(taskName);
}

iconTasks.forEach(t => {
    generateIconOptimizeTask(t);
    generateIconConcatenateTask(t);
    generateIconManifestTask(t);
    generateIconBuildTask(t);
    generateIconWatchTask(t);
});

// Build all icon files
gulp.task(config.getBaseTaskName(lifecycleHookTaskNames.buildAll), gulp.parallel(buildTasks));

// Watch all icon files
gulp.task(config.getBaseTaskName(lifecycleHookTaskNames.watchAll), gulp.parallel(watchTasks));

// Generate lifecycle hook (pre & post) tasks (if defined)
lifecycleHookTaskNameKeys.forEach((k) => {
    const t = lifecycleHookTaskNames[k],
            tasksWithPreAndPostHooks = config.getBaseTaskWithPreAndPostHooks(t);

    gulp.task(t, gulp.series(tasksWithPreAndPostHooks));
});

module.exports = {
    getIconNamesManifest: getIconNamesManifest,
    generateIconNameManifestFile: generateIconNameManifestFile
};

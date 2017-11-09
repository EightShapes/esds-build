'use strict';

const config = require('./config.js'),
        c = config.get(),
        gulp = require('gulp'),
        rename = require('gulp-rename'),
        replace = require('gulp-replace'),
        path = require('path'),
        zip = require('gulp-zip'),
        shell = require('shelljs'),
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

// CHILD MODULE AUTO-COPYING
// Copying doc pages from a child module
function getCompiledChildModuleDocsPath(moduleName) {
    let rootPath = c.rootPath;
    if (process.cwd() !== c.rootPath) {
        rootPath = path.join(process.cwd(), c.rootPath);
    }
    const childModuleRootPath = path.join(rootPath, c.dependenciesPath, moduleName),
            cmc = config.get(childModuleRootPath),
            childCompiledDocs = path.join(childModuleRootPath, cmc.webroot, cmc.latestVersionPath, '**/*.html');
    return childCompiledDocs;
}

function generateChildModuleDocsCopyTask(d) {
    const childModuleDocsPath = getCompiledChildModuleDocsPath(d.moduleName),
        taskName = `${c.copy.copyTaskPrefix}${d.moduleName}:${c.docsTaskName}`;
    copyTaskNames.push(taskName);
    gulp.task(taskName, function(){
        shell.exec(`cd ${path.join(c.rootPath, c.dependenciesPath, d.moduleName)} && npm install && gulp build:all`);
        let stream = gulp.src(childModuleDocsPath);
        if (d.copyDocsReplacements) {
            d.copyDocsReplacements.forEach(function(replacementPair) {
                stream.pipe(replace(replacementPair[0], replacementPair[1]));
            });
        }
        stream.pipe(gulp.dest(path.join(c.rootPath, c.webroot, c.latestVersionPath)));
        return stream;
    });
}

if (c.dependencies) {
    c.dependencies.forEach(d => {
        if (d.copyDocs) {
            generateChildModuleDocsCopyTask(d);
        }
    });
}

// Run all copy tasks
gulp.task(`${c.copy.copyTaskPrefix}${c.allTaskName}`, gulp.parallel(copyTaskNames));

// Run all watch tasks
gulp.task(`${c.watchTaskName}:${c.copy.copyTaskPrefix}${c.allTaskName}`, gulp.parallel(watchTaskNames));


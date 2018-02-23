'use strict';

const config = require('./config.js'),
        c = config.get(),
        gulp = config.getGulpInstance(),
        path = require('path'),
        del = require('del'),
        taskNames = {
            cleanDist: `${c.cleanTaskName}:${c.distTaskName}`,
            cleanTokens: `${c.cleanTaskName}:${c.tokensTaskName}`,
            cleanConcatenatedMacros: `${c.cleanTaskName}:concatenated-macros`,
            cleanWebroot: `${c.cleanTaskName}:${c.webrootTaskName}`
        },
        taskNameKeys = Object.keys(taskNames);


gulp.task(config.getBaseTaskName(taskNames.cleanDist), function(){
    return del(path.join(c.rootPath, c.distPath, '**', '*'));
});

gulp.task(config.getBaseTaskName(taskNames.cleanTokens), function(){
    const tokenFiles = path.join(c.tokens.outputPath, '*'),
            tokenSourceFile = c.tokens.sourceFile;
    return del([ tokenFiles, `!${tokenSourceFile}`]);
});

gulp.task(config.getBaseTaskName(taskNames.cleanConcatenatedMacros), function(done){
    c.markup.tasks.forEach(t => {
        if (t.componentMacroOutputPath) {
            del(path.join(t.componentMacroOutputPath, t.componentMacroFilename));
        }
    });
    done();
});

gulp.task(config.getBaseTaskName(taskNames.cleanWebroot), function(done){
    let webrootPaths = [path.join(c.rootPath, c.webroot, c.latestVersionPath, '**', '*')];
    if (c.versionedDocs) {
        const versionedDocPaths = path.join(c.rootPath, c.webroot, 'v');
        webrootPaths.push(`!${versionedDocPaths}`);
    }
    return del(webrootPaths);
});

// Generate lifecycle hook tasks (if defined)
taskNameKeys.forEach((k) => {
    const t = taskNames[k],
            tasksWithPreAndPostHooks = config.getBaseTaskWithPreAndPostHooks(t);

    gulp.task(t, gulp.series(tasksWithPreAndPostHooks));
});

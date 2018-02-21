'use strict';

const config = require('./config.js'),
        c = config.get(),
        gulp = config.getGulpInstance(),
        path = require('path'),
        del = require('del');

gulp.task(`${c.cleanTaskName}:${c.distTaskName}`, function(){
    return del(path.join(c.rootPath, c.distPath, '**', '*'));
});

gulp.task(`${c.cleanTaskName}:${c.tokensTaskName}`, function(){
    const tokenFiles = path.join(c.tokens.outputPath, '*'),
            tokenSourceFile = c.tokens.sourceFile;
    return del([ tokenFiles, `!${tokenSourceFile}`]);
});

gulp.task(`${c.cleanTaskName}:concatenated-macros`, function(done){
    c.markup.tasks.forEach(t => {
        if (t.componentMacroOutputPath) {
            del(path.join(t.componentMacroOutputPath, t.componentMacroFilename));
        }
    });
    done();
});

gulp.task(`${c.cleanTaskName}:${c.webrootTaskName}`, function(done){
    let webrootPaths = [path.join(c.rootPath, c.webroot, c.latestVersionPath, '**', '*')];
    if (c.versionedDocs) {
        const versionedDocPaths = path.join(c.rootPath, c.webroot, 'v');
        webrootPaths.push(`!${versionedDocPaths}`);
    }
    return del(webrootPaths);
});

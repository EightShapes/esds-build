'use strict';

const config = require('./config.js'),
        c = config.get(),
        gulp = require('gulp'),
        path = require('path'),
        del = require('del');

gulp.task('clean:dist', function(){
    return del(path.join(c.rootPath, c.distPath, '**', '*'));
});

gulp.task('clean:tokens', function(){
    const tokenFiles = path.join(c.tokens.outputPath, '*'),
            tokenSourceFile = c.tokens.sourceFile;
    return del([ tokenFiles, `!${tokenSourceFile}`]);
});

gulp.task('clean:concatenated-macros', function(done){
    c.markup.tasks.forEach(t => {
        if (t.componentMacroOutputPath) {
            del(path.join(t.componentMacroOutputPath, t.componentMacroFilename));
        }
    });
    done();
});

gulp.task('clean:webroot', function(done){
    let webrootPaths = [path.join(c.rootPath, c.latestVersionWebroot, '**', '*')];
    if (c.versionedDocs) {
        const versionedDocPaths = path.join(c.rootPath, c.webroot, 'v');
        webrootPaths.push(`!${versionedDocPaths}`);
    }
    return del(webrootPaths);
});

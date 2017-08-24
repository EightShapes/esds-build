'use strict';

const config = require('./config.js'),
        c = config.get(),
        gulp = require('gulp'),
        del = require('del');

gulp.task('clean:dist', function(){
    return del(`${c.distPath}/**/*`);
});

gulp.task('clean:tokens', function(){
    return del([`${c.tokens.sourcePath}/*`, `!${c.tokens.sourceFile}`]);
});

gulp.task('clean:concatenated-macros', function(done){
    c.markup.tasks.forEach(t => {
        if (t.componentMacroOutputPath) {
            del(`${t.componentMacroOutputPath}/${t.componentMacroFilename}`);
        }
    });
    done();
});

gulp.task('clean:webroot', function(done){
    let webrootPaths = [`${c.localEnv.webroot}/**/*`];
    if (c.createVersionedDocs) {
        webrootPaths.push(`!${c.localEnv.webroot}/v`);
        // webrootPaths.push(`!${c.localEnv.webroot}/v/**/*`);
    }

    return del(webrootPaths);
});

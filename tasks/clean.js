'use strict';

const config = require('./config.js'),
        buildConfig = config.get(),
        gulp = require('gulp'),
        del = require('del');

gulp.task('clean:dist', function(){
    return del(`${buildConfig.distPath}/**/*`);
});

gulp.task('clean:tokens', function(){
    return del([`${buildConfig.tokens.sourcePath}/*`, `!${buildConfig.tokens.sourceFile}`]);
});

gulp.task('clean:concatenated-macros', function(done){
    buildConfig.markup.tasks.forEach(t => {
        if (t.componentMacroOutputPath) {
            del(`${t.componentMacroOutputPath}/${t.componentMacroFilename}`);
        }
    });
    done();
});

gulp.task('clean:webroot', function(done){
    let webrootPath = buildConfig.localEnv.webroot;
    if (buildConfig.createVersionedDocs) {
        webrootPath += `/${buildConfig.localEnv.latestVersionDirectory}`;
    }

    return del(`${webrootPath}/**/*`);
});

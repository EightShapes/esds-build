'use strict';

const rootPath = process.cwd(),
        gulpfile = require(`${rootPath}/gulpfile.js`),
        gulp = require('gulp'),
        gulpConfig = gulpfile.config,
        del = require('del');

gulp.task('clean:dist', function(){
    return del(`${gulpConfig.distPath}/**/*`);
});

gulp.task('clean:tokens', function(){
    return del([`${gulpConfig.tokens.sourcePath}/*`, `!${gulpConfig.tokens.sourceFile}`]);
});

gulp.task('clean:concatenated-macros', function(done){
    gulpConfig.markup.tasks.forEach(t => {
        if (t.componentMacroOutputPath) {
            del(`${t.componentMacroOutputPath}/${t.componentMacroFilename}`);
        }
    });
    done();
});

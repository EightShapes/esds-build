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

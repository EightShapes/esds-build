'use strict';

const rootPath = process.cwd(),
        gulpfile = require(`${rootPath}/gulpfile.js`),
        gulp = require('gulp'),
        gulp_config = gulpfile.config,
        del = require('del');

gulp.task('clean:dist', function(){
    return del(`${gulp_config.distPath}/**/*`);
});

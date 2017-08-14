'use strict';

const gulpfile = require('../gulpfile.js'),
        gulp = require('gulp'),
        gulp_config = gulpfile.config,
        del = require('del');

gulp.task('clean:dist', function(){
    return del(`${gulp_config.distPath}/**/*`);
});

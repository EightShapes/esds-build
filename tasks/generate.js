'use strict';

const config = require('./config.js'),
        buildConfig = config.get(),
        gulp = require('gulp'),
        mkdirp = require('mkdirp'),
        projectRoot = buildConfig.scaffoldPath;

gulp.task('generate:project-directories', function(done){
    const defaultProjectDirectories = [
        'components',
        'dist',
        'docs',
        'icons',
        'images',
        'includes',
        'scripts',
        'styles',
        'templates',
        'tests',
        'tokens'
    ];

    defaultProjectDirectories.forEach(dir => mkdirp.sync(`${projectRoot}/${dir}`));
    done();
});

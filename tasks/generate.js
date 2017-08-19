'use strict';

const config = require('./config.js'),
        buildConfig = config.get(),
        fs = require('fs-extra'),
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

gulp.task('generate:default-config', function(done){
    mkdirp.sync(`${projectRoot}`);
    fs.copySync(`${__dirname}/default-build-config.js`, `${projectRoot}/build-config.js`);
    done();
});

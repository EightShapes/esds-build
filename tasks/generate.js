'use strict';

const rootPath = process.cwd(),
        gulp = require('gulp'),
        mkdirp = require('mkdirp'),
        buildConfig = require(`${rootPath}/gulpfile.js`).config,
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

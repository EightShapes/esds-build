'use strict';

const rootPath = process.cwd(),
        browserSync = require('browser-sync'),
        gulp = require('gulp'),
        gulpfile = require(`${rootPath}/gulpfile.js`),
        envConfig = gulpfile.config.localEnv;

// Start local server and auto-reload browser when relevant files change
gulp.task('serve:local-docs', function() {
    browserSync.init({
        ghostMode: {
            clicks: false, // Syncing clicks causes form elements to be focused after clicking which doesn't happen in normal browser behavior
            forms: true,
            scroll: true
        },
        server: {
            baseDir: envConfig.webroot
        },
        middleware: function(req, res, next) {
          if (!req.url.match(/\/v\//g)) {
            req.url = `/${envConfig.latestVersionDirectory}/` + req.url;
          }
          return next();
        }
    });
});

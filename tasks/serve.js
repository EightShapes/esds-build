'use strict';

const rootPath = process.cwd(),
        browserSync = require('browser-sync'),
        gulp = require('gulp'),
        gulpfile = require(`${rootPath}/gulpfile.js`),
        envConfig = gulpfile.config.localEnv,
        styleConfig = gulpfile.config.styles,
        styleWatchPaths = styleConfig.tasks.map(t => `${t.outputPath}/**/*.css`),
        markupConfig = gulpfile.config.markup,
        markupWatchPaths = markupConfig.tasks.map(t => `${t.docOutputPath}/**/*.html`);

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

gulp.task('browser-sync-reload', function reload(done) {
  browserSync.reload();
  done();
});

gulp.task('browser-sync-reload-styles', function reload(done) {
  browserSync.reload('*.css');
  done();
});

// Watch styles
gulp.task('watch:serve:reload:styles', function(){
    return gulp.watch(styleWatchPaths, gulp.series('browser-sync-reload-styles'));
});

// Watch markup
gulp.task('watch:serve:reload:files', function(){
    return gulp.watch(markupWatchPaths, gulp.series('browser-sync-reload'));
});

gulp.task('watch:serve:all', gulp.parallel('watch:serve:reload:styles', 'watch:serve:reload:files'));

'use strict';

const config = require('./config.js'),
        c = config.get(),
        browserSync = require('browser-sync'),
        gulp = require('gulp'),
        path = require('path'),
        scriptConfig = c.scripts,
        scriptWatchPaths = scriptConfig.tasks.map(t => `${t.outputPath}/**/*.js`),
        styleConfig = c.styles,
        styleWatchPaths = styleConfig.tasks.map(t => `${t.outputPath}/**/*.css`),
        markupConfig = c.markup,
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
            baseDir: path.join(c.rootPath, c.webroot)
        },
        middleware: function(req, res, next) {
          if (!req.url.match(/\/v\//g)) {
            req.url = `/${c.latestVersionPath}/` + req.url;
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
    return gulp.watch(markupWatchPaths.concat(scriptWatchPaths), gulp.series('browser-sync-reload'));
});

gulp.task('watch:serve:all', gulp.parallel('watch:serve:reload:styles', 'watch:serve:reload:files'));

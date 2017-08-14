const   configFileLocation = './tests/sample_project/gulp-config.js',
        config = require(configFileLocation),
        gulp = require('gulp'),
        tasks = './tasks/*.js',
        HubRegistry = require('gulp-hub');

module.exports.config = config;
        
/* load some gulpfiles into the registry */
var hub = new HubRegistry([tasks]);

/* tell gulp to use the tasks just loaded */
gulp.registry(hub);

// Composite tasks
gulp.task('default', gulp.series('styles:build:all', gulp.parallel('watch:styles:all', 'serve:local-docs')));


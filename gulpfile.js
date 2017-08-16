const   configFile = './tests/sample_project/build-config.js',
        taskFiles = './tasks/*.js',
        gulp = require('gulp'),
        HubRegistry = require('gulp-hub');

module.exports.config = require(configFile);
        
/* load some gulpfiles into the registry */
var hub = new HubRegistry([taskFiles]);

/* tell gulp to use the tasks just loaded */
gulp.registry(hub);


/**************************************************/
/* Composite tasks ********************************/
/**************************************************/

// Watch everything
gulp.task('watch:all', gulp.parallel('watch:styles:all', 'watch:markup:all'));

//Build everything
gulp.task('build:all', gulp.parallel('styles:build:all', gulp.series('markup:concatenate-macros:all', 'markup:build:all')));

// Build and serve the project, watch for changes to files
gulp.task('default', gulp.series('build:all', gulp.parallel('watch:all', 'serve:local-docs')));


'use strict';

const rootPath = process.cwd(),
        taskFiles = ['**/*.js', '!uds_tasks.js'],
        gulp = require(`${rootPath}/node_modules/gulp`), // Need to make sure the "gulp" loaded is the gulp installed in ./node_modules/gulp, not the one installed in this package
        HubRegistry = require('gulp-hub');

/* load some gulpfiles into the registry */
var hub = new HubRegistry(taskFiles);


/* tell gulp to use the tasks just loaded */
gulp.registry(hub);
/**************************************************/
/* Composite tasks ********************************/
/**************************************************/

// Watch everything
gulp.task('watch:all', gulp.parallel('watch:styles:all', 'watch:markup:all', 'watch:serve:all'));

//Build everything
gulp.task('build:all', gulp.parallel('styles:build:all', gulp.series('markup:concatenate-macros:all', 'markup:build:all')));

// Build and serve the project, watch for changes to files
gulp.task('default', gulp.series('clean:webroot', 'build:all', gulp.parallel('watch:all', 'serve:local-docs')));

module.exports = gulp;

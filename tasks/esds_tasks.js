'use strict';

const rootPath = process.cwd(),
        taskFiles = ['**/*.js', '!esds_tasks.js'],
        gulp = require(`${rootPath}/node_modules/gulp`), // Need to make sure the "gulp" loaded is the gulp installed in ./node_modules/gulp, not the one installed in this package
        HubRegistry = require('gulp-hub'),
        config = require('./config.js'),
        c = config.get(),
        watchAll = [c.watchTaskName, c.allTaskName].join(':'),
        watchTaskTypes = [c.tokensTaskName, c.iconsTaskName, c.stylesTaskName, c.scriptsTaskName, c.markupTaskName, 'serve'],
        watchTaskNames = watchTaskTypes.map(t => [c.watchTaskName, t, c.allTaskName].join(':')),
        buildAll = [c.buildTaskName, c.allTaskName].join(':'),
        buildTokens = [c.tokensTaskName, c.buildTaskName, c.allTaskName].join(':'),
        copyAll = [c.copyTaskName, c.allTaskName].join(':'),
        buildScripts = [c.scriptsTaskName, c.buildTaskName, c.allTaskName].join(':'),
        buildStyles = [c.stylesTaskName, c.buildTaskName, c.allTaskName].join(':'),
        buildIcons = [c.iconsTaskName, c.buildTaskName, c.allTaskName].join(':'),
        buildMarkup = [c.markupTaskName, c.buildTaskName, c.allTaskName].join(':'),
        concatenateMacros = [c.markupTaskName, c.concatTaskName, c.macrosTaskName, c.allTaskName].join(':'),
        copyDist = [c.copyTaskName, c.distTaskName].join(':'),
        cleanWebroot = [c.cleanTaskName, c.webrootTaskName].join(':');

/* load some gulpfiles into the registry */
var hub = new HubRegistry(taskFiles);


/* tell gulp to use the tasks just loaded */
gulp.registry(hub);
/**************************************************/
/* Composite tasks ********************************/
/**************************************************/

// Watch everything
gulp.task(watchAll, gulp.parallel(watchTaskNames));

//Build everything
gulp.task(buildAll, gulp.series(buildTokens,
                                    copyAll,
                                    gulp.parallel(buildScripts, buildStyles, buildIcons,
                                    gulp.series(concatenateMacros,
                                                buildMarkup)),
                                    copyDist)); // copy to dist last

// Build and serve the project, watch for changes to files
gulp.task('default', gulp.series(cleanWebroot, buildAll, gulp.parallel(watchAll, 'serve:local-docs')));

module.exports = gulp;

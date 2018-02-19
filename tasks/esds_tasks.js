'use strict';

const rootPath = process.cwd(),
        taskFiles = ['_tmp_project_gulp_tasks.js', '**/*.js', '!esds_tasks.js'],
        gulp = require(`${rootPath}/node_modules/gulp`), // Need to make sure the "gulp" loaded is the gulp installed in ./node_modules/gulp, not the one installed in this package
        HubRegistry = require('gulp-hub'),
        config = require('./config.js'),
        del = require('del'),
        fs = require('fs-extra'),
        path = require('path'),
        c = config.get(),
        watchAll = [c.watchTaskName, c.allTaskName].join(':'),
        watchTaskTypes = [c.tokensTaskName, c.iconsTaskName, c.stylesTaskName, c.scriptsTaskName, c.markupTaskName, c.copyTaskName, 'serve'],
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
        cleanWebroot = [c.cleanTaskName, c.webrootTaskName].join(':'),
        copiedGulpTasksFilename = '~tmp_project_gulp_tasks.js', // The ~ in the file puts the copied file after all the ESDS Task files, for some reason this allows them to be accessed by gulp registries in all the other files, seems brittle, but works for now 
        copiedGulpTasksFilepath = path.join(__dirname, copiedGulpTasksFilename);

// copy gulpfile.js tasks from project into the esds-build registry into esds build registry
if (fs.existsSync(module.parent.filename)) { // The project's gulpfile.js is what calls this file, so it's available at module.parent.filename
    const parentGulpfileText = fs.readFileSync(module.parent.filename, 'utf8');
    const parentGulpTasks = parentGulpfileText.replace(/const gulp.+/, "gulp = require('gulp')"); // Replace the line with the gulp definition from the parent file with a basic require('gulp') call, it will fail when it tries to require esds-build in the new location and would throw a recursion error if it could resolve
    fs.writeFileSync(copiedGulpTasksFilepath, parentGulpTasks, 'utf8');
}


/* load tasks into the registry */
var hub = new HubRegistry(taskFiles);
/* tell gulp to use the tasks just loaded */
gulp.registry(hub);
const definedTasks = gulp.tree().nodes;
/**************************************************/
/* Composite tasks ********************************/
/**************************************************/


//Build everything
const buildAllTasks = [ buildTokens,
                        copyAll,
                        gulp.parallel(buildScripts, buildStyles, buildIcons,
                        gulp.series(concatenateMacros,
                                    buildMarkup)),
                        copyDist];

// Add prebuild all hook
if (definedTasks.includes('esds-hook:prebuild:all')) {
    buildAllTasks.unshift('esds-hook:prebuild:all');
} else {
    console.log("No esds-hook:prebuild:all task found"); // eslint-disable-line no-console
}

// Add postbuild all hook
if (definedTasks.includes('esds-hook:postbuild:all')) {
    buildAllTasks.push('esds-hook:postbuild:all');
} else {
    console.log("No esds-hook:postbuild:all task found"); // eslint-disable-line no-console
}


gulp.task(buildAll, gulp.series(buildAllTasks)); // copy to dist last

// Build and serve the project, watch for changes to files
gulp.task('default', gulp.series(cleanWebroot, buildAll, gulp.parallel(watchAll, 'serve:local-docs')));

// Watch everything
gulp.task(watchAll, gulp.parallel(watchTaskNames));

// Project tasks are already loaded into registry at this point, delete the copied project gulpfile.js contents
if (fs.existsSync(copiedGulpTasksFilepath)) {
    del(copiedGulpTasksFilepath);
}

module.exports = gulp;

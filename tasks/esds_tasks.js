'use strict';

const taskFiles = ['~tmp_project_gulp_tasks.js', 'clean.js', 'copy.js', 'generate.js', 'icons.js', 'markup.js', 'scripts.js', 'serve.js', 'styles.js', 'tokens.js'],
        HubRegistry = require('gulp-hub'),
        config = require('./config.js'),
        del = require('del'),
        fs = require('fs-extra'),
        gulp = require(`${process.cwd()}/node_modules/gulp`), // Load this gulp, not another version
        path = require('path'),
        c = config.get(),
        watchAllTaskName = [c.watchTaskName, c.allTaskName].join(':'),
        watchTaskTypes = [c.tokensTaskName, c.iconsTaskName, c.stylesTaskName, c.scriptsTaskName, c.markupTaskName, c.copyTaskName, 'serve'],
        watchTaskNames = watchTaskTypes.map(t => [c.watchTaskName, t, c.allTaskName].join(':')),
        buildAllTaskName = [c.buildTaskName, c.allTaskName].join(':'),
        buildTokens = [c.tokensTaskName, c.buildTaskName, c.allTaskName].join(':'),
        copyAll = [c.copyTaskName, c.allTaskName].join(':'),
        buildScripts = [c.scriptsTaskName, c.buildTaskName, c.allTaskName].join(':'),
        buildStyles = [c.stylesTaskName, c.buildTaskName, c.allTaskName].join(':'),
        buildIcons = [c.iconsTaskName, c.buildTaskName, c.allTaskName].join(':'),
        buildMarkup = [c.markupTaskName, c.buildTaskName, c.allTaskName].join(':'),
        concatenateMacros = [c.markupTaskName, c.concatTaskName, c.macrosTaskName, c.allTaskName].join(':'),
        copyDist = [c.copyTaskName, c.distTaskName].join(':'),
        cleanWebroot = [c.cleanTaskName, c.webrootTaskName].join(':'),
        copiedGulpTasksFilepath = path.join(__dirname, config.projectGulpTasksFilename);

// copy gulpfile.js tasks from project into the esds-build registry into esds build registry
if (fs.existsSync(module.parent.filename)) { // The project's gulpfile.js is what calls this file, so it's available at module.parent.filename
    const parentGulpfileText = fs.readFileSync(module.parent.filename, 'utf8');
    // The following line intentionally exports the gulp instance out of the parent gulpfile, this is so it can be used and referenced by all of the esds-build tasks. This is crucial to allowing lifecycle hooks and task overrides to function
    let parentGulpTasks = parentGulpfileText.replace(/gulp\s*=\s*require[^;,]+/, "gulp = require('gulp')") + `\n module.exports = gulp;`; // Replace the line with the gulp definition from the parent file with a basic require('gulp') call, it will fail when it tries to require esds-build in the new location and would throw a recursion error if it could resolve

    // Inject the forward-reference functionality so custom gulp tasks can reference internal esds-build tasks
    parentGulpTasks = parentGulpTasks.replace(/\ngulp.task/, '\nconst FwdRef = require("undertaker-forward-reference");\ngulp.registry(FwdRef());\ngulp.task');

    fs.writeFileSync(copiedGulpTasksFilepath, parentGulpTasks, 'utf8');
}

/* load tasks into the registry */
var hub = new HubRegistry(taskFiles);
/* tell gulp to use the tasks just loaded */
gulp.registry(hub);


/**************************************************/
/* Composite tasks ********************************/
/**************************************************/
function generateBasePreAndPostTasks(taskName) {
    const tasksWithPreAndPostHooks = config.getBaseTaskWithPreAndPostHooks(taskName);
    gulp.task(taskName, gulp.series(tasksWithPreAndPostHooks)); // Calls :base task and pre: and post: tasks if defined 
}

//Build everything
const buildAllTasks = [ buildTokens,
                        copyAll,
                        gulp.parallel(buildScripts, buildStyles, buildIcons,
                        gulp.series(concatenateMacros,
                                    buildMarkup)),
                        copyDist];
gulp.task(config.getBaseTaskName(buildAllTaskName), gulp.series(buildAllTasks)); // copy to dist last
generateBasePreAndPostTasks(buildAllTaskName);

// Watch everything
gulp.task(config.getBaseTaskName(watchAllTaskName), gulp.parallel(watchTaskNames));
generateBasePreAndPostTasks(watchAllTaskName);

// Build and serve the project, watch for changes to files
gulp.task(config.getBaseTaskName('default'), gulp.series(cleanWebroot, buildAllTaskName, gulp.parallel(watchAllTaskName, 'serve:local-docs')));
generateBasePreAndPostTasks('default');

// Project tasks are already loaded into registry at this point, delete the copied project gulpfile.js contents
if (fs.existsSync(copiedGulpTasksFilepath)) {
    del(copiedGulpTasksFilepath);
}

module.exports = gulp;

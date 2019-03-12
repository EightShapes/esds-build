'use strict';

const config = require('./config.js'),
        fs = require('fs-extra'),
        path = require('path'),
        backstop = require('backstopjs'),
        c = config.get(),
        gulp = config.getGulpInstance(),
        avrApproveTaskName = `${c.avrTaskName}:approve`;

function generateBasePreAndPostTasks(taskName) {
    const tasksWithPreAndPostHooks = config.getBaseTaskWithPreAndPostHooks(taskName);
    gulp.task(taskName, gulp.series(tasksWithPreAndPostHooks)); // Calls :base task and pre: and post: tasks if defined
}

function startLocalServerWithCallback(callback, taskCallback) {
    const localEnv = require('browser-sync').create();
    const browserSyncConfig = {
        ghostMode: {
            clicks: false, // Syncing clicks causes form elements to be focused after clicking which doesn't happen in normal browser behavior
            forms: true,
            scroll: true
        },
        open: false,
        notify: false,
        server: {
            baseDir: path.join(c.rootPath, c.webroot, c.latestVersionPath)
        }
    };
    localEnv.init(browserSyncConfig, function(){
        callback(localEnv, taskCallback);
    });
}

function createAvrRuntimeConfig(localEnv) {
    const runtimeConfig = {
            testingPort: localEnv.getOption('port'),
            baseConfig: {},
            hostUrl: c.runAvrInDocker ? 'host.docker.internal' : 'localhost'
        };

    try { // Get a base backstop config if set in esds-build config - useful for monorepos
        const baseBackstopConfig = require(path.join(process.cwd(), c.avrBaseConfig));
        runtimeConfig.baseConfig = baseBackstopConfig;
    } catch (e) {
        console.log('Base Backstop Config could not be loaded, using local config only');
    }

    fs.writeFileSync('./backstop-runtime-config.json', JSON.stringify(runtimeConfig), 'UTF-8');
}

function createAvrReferenceImages(localEnv, done) {
    createAvrRuntimeConfig(localEnv);

    backstop('reference', {
        docker: c.runAvrInDocker,
        config: c.avrConfig
    }).then(() => {
        localEnv.exit();
        done();
    }).catch(err => {
        console.error(err);
        localEnv.exit();
        done();
    });
}

function runTests(localEnv, done) {
    createAvrRuntimeConfig(localEnv);

    backstop('test', {
        docker: c.runAvrInDocker,
        config: c.avrConfig
    }).then(() =>{
        localEnv.exit();
        done();
    }).catch(err => {
        console.error(err);
        localEnv.exit();
        done();
    });
}

gulp.task(`${c.avrTaskName}:create-reference-images`, function(done){
    startLocalServerWithCallback(createAvrReferenceImages, done);
});

gulp.task(`${c.avrTaskName}:run-tests`, function(done){
    startLocalServerWithCallback(runTests, done);
});

gulp.task(config.getBaseTaskName(avrApproveTaskName), function(done){
    backstop('approve', {
        config: c.avrConfig
    }).then(function(){
        done();
    });
    done();
});
generateBasePreAndPostTasks(avrApproveTaskName);

module.exports = {
    createAvrRuntimeConfig: createAvrRuntimeConfig
};

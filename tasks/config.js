'use strict';

const productBuildConfigFileName = 'esds-build-config',
        fs = require('fs'),
        path = require('path'),
        globals = {},
        projectGulpTasksFilename = '~tmp_project_gulp_tasks.js';

function retrieveProductBuildConfig(absolutePath) {
    absolutePath = typeof absolutePath === 'undefined' ? process.cwd() : absolutePath;
    const jsConfigPath = path.join(absolutePath, productBuildConfigFileName + '.js'),
            jsonConfigPath = path.join(absolutePath, productBuildConfigFileName + '.json');
    if (fs.existsSync(jsConfigPath)) {
        return require(jsConfigPath);
    } else if (fs.existsSync(jsonConfigPath)) {
        return require(jsonConfigPath);
    } else {
        return {};
    }
}

function retrieveDefaultBuildConfig() {
    return require(`${__dirname}/../default_templates/${productBuildConfigFileName}-default.js`);
}

function retrieveBuildConfig(absolutePath) {
    absolutePath = typeof absolutePath === 'undefined' ? process.cwd() : absolutePath;
    const defaultConfig = Object.assign({}, retrieveDefaultBuildConfig()), // copy technique, won't work when config is more than one level dep
            productConfig = Object.assign({}, retrieveProductBuildConfig(absolutePath)); // copy technique, won't work when config is more than one level dep

    let buildConfig = Object.assign(defaultConfig, productConfig),
        useProductConfig = buildConfig.configMethod === 'overwrite';

    if (useProductConfig) {
        return productConfig;
    } else {
        return buildConfig;
    }
}

function getStylesConfig(buildConfig) {
    const c = buildConfig, // for brevity in task names
        defaultTask = {
            name: c.productTaskName,
            outputPath: winPathToGlob(path.join(c.rootPath, c.webroot, c.latestVersionPath, c.stylesPath)),
            compileSourceFiles: winPathToGlob(path.join(c.rootPath, c.stylesPath, '*' + c.stylesSourceExtension)),
            compileImportPaths: [
                winPathToGlob(path.join(c.rootPath, c.dependenciesPath)),
                winPathToGlob(path.join(c.rootPath, c.componentsPath)),
                winPathToGlob(path.join(c.rootPath, c.tokensPath)),
                winPathToGlob(path.join(c.rootPath, c.stylesPath))
            ],
            lintOptions: {
                configFile: c.stylesLintConfig
            },
            lintPaths: [
                winPathToGlob(path.join(c.rootPath, c.componentsPath, '**', '*' + c.stylesSourceExtension)),
                winPathToGlob(path.join(c.rootPath, c.stylesPath, '**', '*' + c.stylesSourceExtension))
            ],
            watchFiles: [
                winPathToGlob(path.join(c.rootPath, c.componentsPath, '**', '*' + c.stylesSourceExtension)),
                winPathToGlob(path.join(c.rootPath, c.stylesPath, '**', '*' + c.stylesSourceExtension)),
                winPathToGlob(path.join(c.rootPath, c.tokensPath, '*' + c.stylesSourceExtension))
            ],
            autoprefixerOptions: {
                browsers: ['last 2 versions'],
                grid: true
            }
        };

    let tasks = [defaultTask];


    return {
        buildTaskPrefix: [c.stylesTaskName, c.buildTaskName].join(':') + ':',
        compileTaskPrefix: [c.stylesTaskName, c.precompileTaskName].join(':') + ':',
        postprocessTaskPrefix: [c.stylesTaskName, c.postprocessTaskName].join(':') + ':',
        lintTaskPrefix: [c.stylesTaskName, c.lintTaskName].join(':') + ':',
        watchTaskPrefix: [c.watchTaskName, c.stylesTaskName].join(':') + ':',
        tasks: tasks
    };
}

function getMarkupConfig(buildConfig) {
    const c = buildConfig, // for brevity in task names
        defaultTask = {
            name: c.productTaskName,
            componentMacros: winPathToGlob(path.join(c.rootPath, c.componentsPath, '**', '*' + c.markupSourceExtension)),
            componentMacroOutputPath: winPathToGlob(path.join(c.rootPath, c.componentsPath)),
            componentMacroFilename: `${c.codeNamespace}${c.markupSourceExtension}`,
            docSourceFilePaths: winPathToGlob(path.join(c.rootPath, c.docsPath, '**', '*' + c.markupSourceExtension)),
            templateSourceFilePaths: winPathToGlob(path.join(c.rootPath, c.templatesPath, '**', '*' + c.markupSourceExtension)),
            docTemplateImportPaths: [c.rootPath, winPathToGlob(path.join(c.rootPath, c.dependenciesPath))],
            docTemplateWatchPaths: [
                winPathToGlob(path.join(c.rootPath, c.docsPath, '**', '*' + c.markupSourceExtension)),
                winPathToGlob(path.join(c.rootPath, c.templatesPath, '**', '*' + c.markupSourceExtension)),
                winPathToGlob(path.join(c.rootPath, c.tokensPath, '*.json')), // Watch tokens.json for changes and rebuild docs if they change
                winPathToGlob(path.join(c.rootPath, c.dataPath, '**', '*.json')) // Watch data/*.json for changes and rebuild docs if any of those files change
            ],
            docOutputPath: winPathToGlob(path.join(c.rootPath, c.webroot, c.latestVersionPath))
        };

    let tasks = [defaultTask];

    return {
        buildTaskPrefix: [c.markupTaskName, c.buildTaskName].join(':') + ':',
        concatMacrosTaskPrefix: [c.markupTaskName, c.concatTaskName, c.macrosTaskName].join(':') + ':',
        watchTaskPrefix: [c.watchTaskName, c.markupTaskName].join(':') + ':',
        watchDocsTaskPrefix: [c.watchTaskName, c.markupTaskName, c.docsTaskName].join(':') + ':',
        watchMacrosTaskPrefix: [c.watchTaskName, c.markupTaskName, c.macrosTaskName].join(':') + ':',
        watchTemplatesTaskPrefix: [c.watchTaskName, c.markupTaskName, c.templatesTaskName].join(':') + ':',
        tasks: tasks
    };
}

function setScriptLintConfig(t) {
    // use eslint's own methods to see if an .eslintrc file exists, otherwise switch the config to use built-in eslint defaults
    var CLIEngine = require("eslint").CLIEngine;

    var cli = new CLIEngine();

    try {
        cli.getConfigForFile(t.sourcePaths[0]);
    } catch (e) {
        // Exception occurs if a config file can't be found. In this case update the lint options
        if (t.lintOptions.configFile) {
            // eslint-disable-next-line no-console
            console.log(`Warning: ${t.lintOptions.configFile} cannot be found, using eslint defaults`);
            delete t.lintOptions.configFile;
        } else {
            // eslint-disable-next-line no-console
            console.log(`Warning: No eslint config file found, using eslint defaults`);
        }
        t.lintOptions.useEslintrc = false;
    }
}

function getScriptsConfig(buildConfig) {
    const c = buildConfig, // for brevity in task names
        defaultTask = {
            name: c.productTaskName,
            outputFilename: `${c.codeNamespace}${c.scriptsSourceExtension}`,
            outputPath: winPathToGlob(path.join(c.rootPath, c.webroot, c.latestVersionPath, c.scriptsPath)),
            sourcePaths: [
                winPathToGlob(path.join(c.rootPath, c.scriptsPath, '**', '*' + c.scriptsSourceExtension)),
                winPathToGlob(path.join(c.rootPath, c.componentsPath, '**', '*' + c.scriptsSourceExtension))
            ],
            lintOptions: {
                configFile: c.scriptsLintConfig
            }
        };

    setScriptLintConfig(defaultTask);

    let tasks = [defaultTask];

    return {
        buildTaskPrefix: [c.scriptsTaskName, c.buildTaskName].join(':') + ':',
        concatTaskPrefix: [c.scriptsTaskName, c.concatTaskName].join(':') + ':',
        lintTaskPrefix: [c.scriptsTaskName, c.lintTaskName].join(':') + ':',
        watchTaskPrefix: [c.watchTaskName, c.scriptsTaskName].join(':') + ':',
        tasks: tasks
    };
}

function getTokensConfig(buildConfig) {
    const c = buildConfig;

    return {
        namespace: c.codeNamespace,
        sourceFile: winPathToGlob(path.join(c.rootPath, c.tokensPath, c.tokensSourceFile)),
        outputPath: winPathToGlob(path.join(c.rootPath, c.tokensPath)),
        formats: c.tokensFormats
    };
}

function getDependencyConfig(dependency, rootPath) {
    const fullRootPath = rootPath.includes(process.cwd()) ? rootPath : path.join(process.cwd(), rootPath);
    const c = retrieveBuildConfig(fullRootPath),
            dependencyPath = path.join(fullRootPath, c.dependenciesPath, dependency);
    return getTaskConfig(dependencyPath);
}

function getCopyConfig(buildConfig) {
    const c = buildConfig, // for brevity
        latestVersionWebroot = winPathToGlob(path.join(c.rootPath, c.webroot, c.latestVersionPath)),
        imageTask = {
            name: c.imagesTaskName,
            sources: [
                winPathToGlob(path.join(c.rootPath, c.imagesPath, '**', '*'))
            ],
            destination: winPathToGlob(path.join(c.rootPath, c.webroot, c.latestVersionPath, c.imagesPath)),
            watch: true
        },
        distTask = {
            name: c.distTaskName,
            sources: [
                winPathToGlob(path.join(latestVersionWebroot, c.stylesPath, '*.css')), // copy any css file from the root of webroot/styles
                winPathToGlob(path.join(latestVersionWebroot, c.scriptsPath, `*.js`)), // copy any js file from the root of webroot/scripts
                winPathToGlob(path.join(latestVersionWebroot, c.iconsPath, `*.svg`)) // copy any svg file from the root of webroot/icons
            ],
            destination: winPathToGlob(path.join(c.rootPath, c.distPath)),
            watch: true
        };

    let tasks = [imageTask, distTask];

    if (c.copyTasks) {
        c.copyTasks.forEach(t => {
            let task = t;

            tasks.push(task);
        });
    }

    return {
        copyTaskPrefix: [c.copyTaskName].join(':') + ':',
        tasks: tasks
    };
}

function getIconsConfig(buildConfig) {
    const c = buildConfig, // for brevity
        defaultTask = {
            name: c.productTaskName,
            sources: [
                winPathToGlob(path.join(c.rootPath, c.iconsPath, '**', `*${c.iconSourceExtension}`))
            ],
            outputFilename: `${c.codeNamespace}${c.iconSourceExtension}`,
            optimizedFileDestination: winPathToGlob(path.join(c.rootPath, c.iconsPath)),
            destination: winPathToGlob(path.join(c.rootPath, c.webroot, c.latestVersionPath, c.iconsPath))
        };

    let tasks = [defaultTask];

    return {
        tasks: tasks
    };
}

function getTaskConfig(absolutePath) {
    let buildConfig = retrieveBuildConfig(absolutePath);

    buildConfig.copy = getCopyConfig(buildConfig);
    buildConfig.icons = getIconsConfig(buildConfig);
    buildConfig.markup = getMarkupConfig(buildConfig);
    buildConfig.scripts = getScriptsConfig(buildConfig);
    buildConfig.styles = getStylesConfig(buildConfig);
    buildConfig.tokens = getTokensConfig(buildConfig);

    return buildConfig; // If no config file has been defined, use the default config
}

function getBaseTaskName(taskName) {
    return [taskName, 'base'].join(':');
}

function getBaseTaskWithPreAndPostHooks(taskName) {
    const taskNames = [getBaseTaskName(taskName)],
            preTaskName = `esds-hook:pre:${taskName}`,
            postTaskName = `esds-hook:post:${taskName}`,
            c = retrieveBuildConfig();

    if (projectTaskIsDefined(preTaskName)) {
        taskNames.unshift(preTaskName);
    } else if (c.showTaskHookNames) {
        console.log(`${preTaskName} is not defined, skipping`);
    }

    if (projectTaskIsDefined(postTaskName)) {
        taskNames.push(postTaskName);
    } else if (c.showTaskHookNames) {
        console.log(`${postTaskName} is not defined, skipping`);
    }

    return taskNames;
}

function getProjectTaskList() {
    if (typeof globals.projectTaskList === 'undefined') {
        globals.projectTaskList = getGulpInstance().tree().nodes;
    }

    return globals.projectTaskList;
}

function projectTaskIsDefined(taskName) {
    const tasks = getProjectTaskList();
    return tasks.includes(taskName);
}

function getGulpInstance() {
    // Try to use the gulp instance exported from the parent project's gulpfile so lifecycle hook tasks and overrides will be processed first
    // If the parent project's gulpfile cannot be found, this will default to the version of gulp bundled with esds-build
    const projectTasksFilepath = `${__dirname}/${projectGulpTasksFilename}`;
    let response = require(`${process.cwd()}/node_modules/gulp`);

    if (typeof globals.gulp === 'undefined') {
        if (fs.existsSync(projectTasksFilepath)) {
            globals.gulp = require(projectTasksFilepath);
            response = globals.gulp;
        }
    } else {
        response = globals.gulp;
    }
    return response;
}

function winPathToGlob(path) {
    return path.replace(/\\/g, '/');
}

module.exports = {
    get: getTaskConfig,
    getDependencyConfig: getDependencyConfig,
    retrieveProductBuildConfig: retrieveProductBuildConfig,
    retrieveDefaultBuildConfig: retrieveDefaultBuildConfig,
    retrieveBuildConfig: retrieveBuildConfig,
    getGulpInstance: getGulpInstance,
    projectGulpTasksFilename: projectGulpTasksFilename,
    projectTaskIsDefined: projectTaskIsDefined,
    getBaseTaskName: getBaseTaskName,
    getBaseTaskWithPreAndPostHooks: getBaseTaskWithPreAndPostHooks,
    winPathToGlob: winPathToGlob
};

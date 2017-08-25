'use strict';

const productBuildConfigFileName = 'uds-build-tools-config',
        fs = require('fs'),
        path = require('path');

function retrieveProductBuildConfig(rootPath) {
    rootPath = typeof rootPath === 'undefined' ? process.cwd() : rootPath;
    const jsConfigPath = path.join(rootPath, productBuildConfigFileName + '.js'),
            jsonConfigPath = path.join(rootPath, productBuildConfigFileName + '.json');
    if (fs.existsSync(jsConfigPath)) {
        return require(jsConfigPath);
    } else if (fs.existsSync(jsonConfigPath)) {
        return require(jsonConfigPath);
    } else {
        return {};
    }
}

function retrieveDefaultBuildConfig() {
    return require(`${__dirname}/../default_templates/uds-build-tools-config-default.js`);
}

function retrieveBuildConfig(rootPath) {
    rootPath = typeof rootPath === 'undefined' ? process.cwd() : rootPath;
    const defaultConfig = retrieveDefaultBuildConfig(),
            productConfig = retrieveProductBuildConfig(rootPath);

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
            outputPath: path.join(c.latestVersionWebroot, c.stylesPath),
            compileSourceFiles: path.join(c.rootPath, c.stylesPath, '*', c.stylesSourceExtension),
            compileImportPaths: [
                path.join(c.rootPath, c.componentsPath),
                path.join(c.rootPath, c.tokensPath),
                path.join(c.rootPath, c.stylesPath)
            ],
            lintOptions: {
                configFile: c.stylesLintConfig
            },
            lintPaths: [
                path.join(c.rootPath, c.componentsPath, '**', '*', c.stylesSourceExtension),
                path.join(c.rootPath, c.stylesPath, '**', '*', c.stylesSourceExtension)
            ],
            watchFiles: [
                path.join(c.rootPath, c.componentsPath, '**', '*', c.stylesSourceExtension),
                path.join(c.rootPath, c.stylesPath, '**', '*', c.stylesSourceExtension),
                path.join(c.rootPath, c.tokensPath, '*', c.stylesSourceExtension)
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
            componentMacros: path.join(c.rootPath, c.componentsPath, '**', '*', c.markupSourceExtension),
            componentMacroOutputPath: path.join(c.rootPath, c.componentsPath),
            componentMacroFilename: `${c.productTaskName}${c.markupSourceExtension}`,
            docSourceFilePaths: path.join(c.rootPath, c.docsPath, '**', '*', c.markupSourceExtension),
            docTemplateImportPaths: [c.rootPath],
            docTemplateWatchPaths: [
                path.join(c.rootPath, c.docsPath, '**', '*', c.markupSourceExtension),
                path.join(c.rootPath, c.templatesPath, '**', '*', c.markupSourceExtension)
            ],
            docOutputPath: c.latestVersionWebroot
        };

    let tasks = [defaultTask];

    return {
        buildTaskPrefix: [c.markupTaskName, c.buildTaskName].join(':') + ':',
        concatMacrosTaskPrefix: [c.markupTaskName, c.concatTaskName, c.macrosTaskName].join(':') + ':',
        watchTaskPrefix: [c.watchTaskName, c.markupTaskName].join(':') + ':',
        watchDocsTaskPrefix: [c.watchTaskName, c.markupTaskName, c.docsTaskName].join(':') + ':',
        watchMacrosTaskPrefix: [c.watchTaskName, c.markupTaskName, c.macrosTaskName].join(':') + ':',
        tasks: tasks
    };
}

function getScriptsConfig(buildConfig) {
    const c = buildConfig, // for brevity in task names
        defaultTask = {
            name: c.productTaskName,
            outputFilename: `${c.productTaskName}${c.scriptsSourceExtension}`,
            outputPath: path.join(c.latestVersionWebroot, c.scriptsPath),
            sourcePaths: [
                path.join(c.rootPath, c.componentsPath, '**', '*', c.scriptsSourceExtension),
                path.join(c.rootPath, c.scriptsPath, '**', '*', c.scriptsSourceExtension)
            ],
            lintOptions: {
                configFile: c.scriptsLintConfig
            }
        };

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
        namespace: c.classPrefix,
        sourceFile: path.join(c.rootPath, c.tokensPath, c.tokensSourceFile),
        outputPath: path.join(c.rootPath, c.tokensPath),
        formats: c.tokensFormats
    };
}

function getCopyConfig(buildConfig) {
    const c = buildConfig, // for brevity
        imageTask = {
            name: c.imagesTaskName,
            sources: [
                path.join(c.rootPath, c.imagesPath, '**', '*')
            ],
            destination: path.join(c.latestVersionWebroot, c.imagesPath)
        };

    let tasks = [imageTask];

    return {
        copyTaskPrefix: [c.copyTaskName].join(':') + ':',
        tasks: tasks
    };
}

function getTaskConfig(rootPath) {
    let buildConfig = retrieveBuildConfig(rootPath);

    buildConfig.copy = getCopyConfig(buildConfig);
    buildConfig.markup = getMarkupConfig(buildConfig);
    buildConfig.scripts = getScriptsConfig(buildConfig);
    buildConfig.styles = getStylesConfig(buildConfig);
    buildConfig.tokens = getTokensConfig(buildConfig);

    return buildConfig; // If no config file has been defined, use the default config
}

module.exports = {
    get: getTaskConfig,
    retrieveProductBuildConfig: retrieveProductBuildConfig,
    retrieveDefaultBuildConfig: retrieveDefaultBuildConfig,
    retrieveBuildConfig: retrieveBuildConfig
};

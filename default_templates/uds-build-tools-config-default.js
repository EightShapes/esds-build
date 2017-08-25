'use strict';
const fs = require('fs'),
        path = require('path'),
        packageRoot = process.cwd(),
        packageJsonFile = path.join(packageRoot, 'package.json'),
        webroot = '_site';

let packageJson,
    projectName,
    classPrefix = 'uds';

function makeSafeForCss(name) {
    let safeName = name.replace(/[^a-z0-9]/g, '-');
    while (safeName.indexOf('-') === 0) {
        safeName = safeName.substring(1);
    }

    return safeName;
}

if (fs.existsSync(packageJsonFile)) {
    packageJson = require(packageJsonFile);
    projectName = packageJson.name;

    classPrefix = makeSafeForCss(projectName);
}

module.exports = {
    configMethod: 'extend',
    classPrefix: classPrefix,
    rootPath: packageRoot,
    scaffoldPath: packageRoot,
    distPath: 'dist',
    docsPath: 'docs',
    componentsPath: 'components',
    tokensPath: 'tokens',
    stylesPath: 'styles',
    scriptsPath: 'scripts',
    templatesPath: 'templates',
    imagesPath: 'images',
    dataPath: 'data',
    webroot: '_site',
    versionedDocs: true,
    latestVersionWebroot: path.join(webroot, 'latest'),
    //Tokens filename
    tokensSourceFile: 'tokens.yaml',
    tokensFormats: ['.scss', '.json'],
    //Lint config
    stylesLintConfig: path.join(packageRoot, '.sass-lint.yml'),
    scriptsLintConfig: path.join(packageRoot, '.eslintrc'),
    //File extensions
    stylesSourceExtension: '.scss',
    markupSourceExtension: '.njk',
    scriptsSourceExtension: '.js',
    //Gulp task name segments, like watch:markup, styles:build, etc.
    allTaskName: 'all',
    copyTaskName: 'copy',
    buildTaskName: 'build',
    concatTaskName: 'concatenate',
    docsTaskName: 'docs',
    imagesTaskName: 'images',
    lintTaskName: 'lint',
    markupTaskName: 'markup',
    macrosTaskName: 'macros',
    postprocessTaskName: 'postprocess',
    precompileTaskName: 'precompile',
    productTaskName: classPrefix,
    scriptsTaskName: 'scripts',
    stylesTaskName: 'styles',
    watchTaskName: 'watch'
};

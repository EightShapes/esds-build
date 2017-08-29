'use strict';
const fs = require('fs'),
        path = require('path'),
        packageRoot = process.cwd(),
        packageJsonFile = path.join(packageRoot, 'package.json'),
        webroot = '_site',
        latestVersionPath = 'latest';

let packageJson,
    productNameNamespace;

function makeSafeForCss(name) {
    let safeName = name.replace(/[^a-z0-9]/g, '-');
    while (safeName.indexOf('-') === 0) {
        safeName = safeName.substring(1);
    }

    return safeName;
}

if (fs.existsSync(packageJsonFile)) {
    packageJson = require(packageJsonFile);
    productNameNamespace = makeSafeForCss(packageJson.name);
}

module.exports = {
    productName: productNameNamespace,
    configMethod: 'extend',
    codeNamespace: productNameNamespace, // Used as the name for concatenated macro, icon, and script files as well as the JSON tokens namespace and SCSS token prefix. If the namespace was 'esds' this would result in: esds.njk, esds.svg, esds.js, {{ esds.token_name }}, and $esds-token-name
    rootPath: packageRoot,
    componentsPath: 'components',
    dataPath: 'data',
    dependenciesPath: 'node_modules',
    distPath: 'dist',
    docsPath: 'docs',
    iconsPath: 'icons',
    imagesPath: 'images',
    scriptsPath: 'scripts',
    sinksPath: 'sink-pages',
    stylesPath: 'styles',
    templatesPath: 'templates',
    tokensPath: 'tokens',
    webroot: '_site',
    latestVersionPath: latestVersionPath,
    versionedDocs: true,
    latestVersionWebroot: path.join(webroot, latestVersionPath),
    //Tokens filename
    tokensSourceFile: 'tokens.yaml',
    tokensFormats: ['.scss', '.json'],
    //Lint config
    stylesLintConfig: path.join(packageRoot, '.sass-lint.yml'),
    scriptsLintConfig: path.join(packageRoot, '.eslintrc'),
    //File extensions
    iconSourceExtension: '.svg',
    markupSourceExtension: '.njk',
    scriptsSourceExtension: '.js',
    stylesSourceExtension: '.scss',
    //Gulp task name segments, like watch:markup, styles:build, etc.
    allTaskName: 'all',
    copyTaskName: 'copy',
    buildTaskName: 'build',
    concatTaskName: 'concatenate',
    docsTaskName: 'docs',
    iconsTaskName: 'icons',
    imagesTaskName: 'images',
    lintTaskName: 'lint',
    markupTaskName: 'markup',
    macrosTaskName: 'macros',
    optimizeTaskName: 'optimize',
    postprocessTaskName: 'postprocess',
    precompileTaskName: 'precompile',
    productTaskName: productNameNamespace,
    scriptsTaskName: 'scripts',
    stylesTaskName: 'styles',
    watchTaskName: 'watch'
};

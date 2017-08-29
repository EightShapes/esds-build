'use strict';
const fs = require('fs'),
        path = require('path'),
        packageRoot = process.cwd(),
        packageJsonFile = path.join(packageRoot, 'package.json');

let packageJson,
    productName = 'please-set-a-product-name-in-package-json',
    sanitizedProductName = 'set-a-product-name-in-package-json';

function makeSafeForCss(name) {
    let safeName = name.replace(/[^a-z0-9]/g, '-');
    while (safeName.indexOf('-') === 0) {
        safeName = safeName.substring(1);
    }
    return safeName;
}

if (fs.existsSync(packageJsonFile)) {
    packageJson = require(packageJsonFile);
    productName = packageJson.name;
    sanitizedProductName = makeSafeForCss(packageJson.name);
}

module.exports = {
    productName: productName,                                           // The "name" key from the Product's package.json file
    configMethod: 'extend',                                             // Method of modifying default config. If 'extend', Product-specific config will merge with defaults, if 'override', Product-specific config will completely replace defaults
    codeNamespace: sanitizedProductName,                                // Used as the name for concatenated macro, icon, and script files as well as the JSON tokens namespace and SCSS token prefix. If the namespace was 'esds' this would result in: esds.njk, esds.svg, esds.js, {{ esds.token_name }}, and $esds-token-name
    rootPath: packageRoot,                                              // The root path of the entire Product, defaults to the same directory as the Product's gulpfile.js
    componentsPath: 'components',                                       // Name of the top-level components directory
    dataPath: 'data',                                                   // Name of the top-level data directory
    dependenciesPath: 'node_modules',                                   // Name of the top-level dependencies directory
    distPath: 'dist',                                                   // Name of the top-level dist directory
    docsPath: 'docs',                                                   // Name of the top-level docs directory
    iconsPath: 'icons',                                                 // Name of the top-level icons directory
    imagesPath: 'images',                                               // Name of the top-level images directory
    scriptsPath: 'scripts',                                             // Name of the top-level scripts directory
    sinksPath: 'sink-pages',                                            // Name of the top-level sink-pages directory
    stylesPath: 'styles',                                               // Name of the top-level styles directory
    templatesPath: 'templates',                                         // Name of the top-level templates directory
    tokensPath: 'tokens',                                               // Name of the top-level tokens directory
    webroot: '_site',                                                   // Name of the top-level webroot directory
    versionedDocs: true,                                                // If true, webroot folder structure will support a '/v/' directory containing previous releases
    latestVersionPath: 'latest',                                        // If versionedDocs is true, where is the latest version of the docs built? Relative to webroot
    tokensSourceFile: 'tokens.yaml',                                    // Tokens source filename
    tokensFormats: ['.scss', '.json'],                                  // File formats of generated tokens files
    stylesLintConfig: path.join(packageRoot, '.sass-lint.yml'),         // Location of styles lint config, defaults to .sass-lint.yml in the root
    scriptsLintConfig: path.join(packageRoot, '.eslintrc'),             // Location of scripts lint config, defaults to .eslintrc in the root
    iconSourceExtension: '.svg',                                        // Icon File extension
    markupSourceExtension: '.njk',                                      // Markup template file extension
    scriptsSourceExtension: '.js',                                      // Scripts file extension
    stylesSourceExtension: '.scss',                                     // Styles file extension
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
    productTaskName: sanitizedProductName,
    scriptsTaskName: 'scripts',
    stylesTaskName: 'styles',
    watchTaskName: 'watch'
};

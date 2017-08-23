'use strict';

/*
    - Clearer variable names
    - Are there good default paths/names that can be used? Convention over configuration
    - Overriding, Extending, Starting from Scratch - 3 distinct use cases
*/

const packageRoot = process.cwd(),
        packageJson = require(`${packageRoot}/package.json`),
        projectNamespace = packageJson.name,
        rootPath = packageRoot,
        distPath = `${rootPath}/dist`,
        tokensPath = `${rootPath}/tokens`,
        sinkPath = `${rootPath}/docs/sink-pages`,
        componentsPath = `${rootPath}/components`,
        componentSinkPath = `${sinkPath}/components`,
        webroot = `${rootPath}/_site`;

module.exports = {
    rootPath: rootPath,
    scaffoldPath: rootPath, // In an actual project this will always be rootPath, separated here for testing
    distPath: distPath,
    componentSinkPath: componentSinkPath,
    componentPath: componentsPath,
    createVersionedDocs: true,
    localEnv: {
        webroot: webroot,
        latestVersionDirectory: `latest`
    },
    markup: {
        buildTaskPrefix: 'markup:build:',
        concatMacrosTaskPrefix: 'markup:concatenate-macros:',
        watchPrefix: 'watch:markup:',
        watchDocsTaskPrefix: 'watch:markup:docs:',
        watchMacrosTaskPrefix: 'watch:markup:macros:',
        tasks: [
            {
                name: 'product',
                componentMacros: `${rootPath}/components/**/*.njk`,
                componentMacroOutputPath: `${rootPath}/components`,
                componentMacroFilename: `all_components.njk`,
                docSourceFilePaths: `${rootPath}/docs/**/*.njk`,
                docTemplateImportPaths: [`${rootPath}`],
                docTemplateWatchPaths: [`${rootPath}/docs/**/*.njk`,
                                        `${rootPath}/templates/**/*.njk`], // Don't need to watch components, already monitored
                docOutputPath: `${webroot}/latest`
            }
        ]
    },
    scripts: {
        buildTaskPrefix: 'scripts:build:', // Will lint, precompile, and postcss
        concatTaskPrefix: 'scripts:concatenate:',
        lintTaskPrefix: 'scripts:lint:',
        watchTaskPrefix: 'watch:scripts:',
        tasks: [
            {
                name: 'product',
                outputFilename: 'main.js',
                outputPath: `${webroot}/latest/scripts`,
                sourcePaths: [`${rootPath}/components/**/*.js`, `${rootPath}/scripts/**/*.js`],
                lintOptions: {
                    configFile: `${rootPath}/.eslintrc` /* Pulling js lint config from "library" module */
                }
            }
        ]
    },
    styles: {
        buildTaskPrefix: 'styles:build:', // Will lint, precompile, and postcss
        compileTaskPrefix: 'styles:precompile:',
        postprocessTaskPrefix: 'styles:postprocess:',
        lintTaskPrefix: 'styles:lint:',
        watchTaskPrefix: 'watch:styles:',
        tasks: [
            {
                name: 'product',
                outputPath: `${webroot}/latest/styles`,
                compileSourceFiles: [`${rootPath}/styles/*.scss`],
                compileImportPaths: [`${rootPath}/components`, `${rootPath}/tokens`, `${rootPath}/styles`],
                lintOptions: {
                    configFile: `${rootPath}/.sass-lint.yaml`
                },
                lintPaths: [`${rootPath}/styles/**/*.scss`,
                            `${rootPath}/components/**/*.scss`],
                watchFiles: [`${rootPath}/styles/**/*.scss`,
                            `${rootPath}/components/**/*.scss`,
                            `${rootPath}/tokens/*.scss`
                ],
                autoprefixerOptions: {
                    browsers: ['last 2 versions'],
                    grid: true
                }
            }
        ]
    },
    tokens: {
        namespace: projectNamespace,
        sourcePath: tokensPath,
        sourceFile: `${tokensPath}/tokens.yaml`, // Support Multiple tokens path?
        outputPath: tokensPath,
        jsonOutputFile: `${tokensPath}/tokens.json`,
        scssOutputFile: `${tokensPath}/tokens.scss`
    },
    copy: {
        copyTaskPrefix: 'copy:',
        tasks: [
            {
                name: 'images',
                sources: [`${rootPath}/images/**/*`],
                destination: `${webroot}/latest/images`
            }
        ]
    }
};

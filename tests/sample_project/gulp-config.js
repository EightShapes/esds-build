'use strict';

const projectNamespace = 'uds',
        rootPath = './tests/sample_project',
        distPath = `${rootPath}/dist`,
        nodeModulesPath = `${rootPath}/node_modules`,
        tokensPath = `${nodeModulesPath}/library-component-module/tokens`,
        webroot = `${rootPath}/_site`;

module.exports = {
    rootPath: rootPath,
    distPath: distPath,
    createVersionedDocs: true,
    localEnv: {
        webroot: webroot,
        latestVersionDirectory: `latest`
    },
    markup: {
        buildTaskPrefix: 'markup:build:',
        concatMacrosTaskPrefix: 'markup:concatenate-macros:',
        tasks: [
            {
                name: 'components',
                componentMacros: `${nodeModulesPath}/library-component-module/components/**/*.njk`,
                componentMacroOutputPath: `${nodeModulesPath}/library-component-module/components`,
                componentMacroFilename: `${projectNamespace}.njk`,
                docSourceFilePaths: `${nodeModulesPath}/library-component-module/docs/**/*.njk`,
                docTemplateRootPaths: [`${nodeModulesPath}/library-component-module`],
                docOutputPath: `${nodeModulesPath}/library-component-module/_site/latest`
            },
            {
                name: 'doc-components',
                componentMacros: `${nodeModulesPath}/doc-component-module/components/**/*.njk`,
                componentMacroOutputPath: `${nodeModulesPath}/doc-component-module/components`,
                componentMacroFilename: `${projectNamespace}_doc_library.njk`,
                docSourceFilePaths: `${nodeModulesPath}/doc-component-module/docs/**/*.njk`,
                docTemplateRootPaths: [`${nodeModulesPath}/doc-component-module`,
                                        `${nodeModulesPath}/library-component-module`
                                        ],
                docOutputPath: `${nodeModulesPath}/doc-component-module/_site/latest`
            },
            {
                name: 'doc',
                docDataFile: `${nodeModulesPath}/library-component-module/tokens/tokens.json`,
                docSourceFilePaths: [`${nodeModulesPath}/library-component-module/docs/**/*.njk`, // compile "library" docs with "doc" context
                                        `${rootPath}/docs/**/*.njk`],
                docTemplateRootPaths: [ `${rootPath}`, // Use "doc" nunjucks paths first (doc templates "win")
                                        `${nodeModulesPath}/doc-component-module`, // Use "doc library" nunjucks paths second
                                        `${nodeModulesPath}/library-component-module` // Use "library" nunjucks paths last
                                        ],
                docOutputPath: `${webroot}/latest`
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
                name: 'components',
                compiledFileName: `${projectNamespace}.css`,
                outputPath: `${distPath}/styles`,
                compileSourceFiles: [`${nodeModulesPath}/library-component-module/styles/${projectNamespace}_library.scss`],
                compileImportPaths: [`${nodeModulesPath}/library-component-module/components`, `${nodeModulesPath}/library-component-module/tokens`],
                lintOptions: {
                    configFile: `${nodeModulesPath}/library-component-module/.sass-lint.yaml` /* Pulling sass lint config from "library" module */
                },
                lintPaths: [`${nodeModulesPath}/library-component-module/styles/**/*.scss`,
                            `${nodeModulesPath}/library-component-module/components/**/*.scss`],
                autoprefixerOptions: {
                    browsers: ['last 2 versions'],
                    grid: true
                }
            },
            {
                name: 'doc-components',
                compiledFileName: `${projectNamespace}-doc-components.css`,
                outputPath: `${distPath}/styles`,
                compileSourceFiles: [`${nodeModulesPath}/doc-component-module/styles/doc_components.scss`],
                compileImportPaths: [`${nodeModulesPath}/doc-component-module/components`, `${nodeModulesPath}`],
                lintOptions: {
                    configFile: `${nodeModulesPath}/library-component-module/.sass-lint.yaml` /* Pulling sass lint config from "library" module */
                },
                lintPaths: [`${nodeModulesPath}/doc-component-module/styles/**/*.scss`,
                            `${nodeModulesPath}/doc-component-module/components/**/*.scss`],
                autoprefixerOptions: {
                    browsers: ['last 2 versions'],
                    grid: true
                }
            },
            {
                name: 'doc',
                compiledFileName: `${projectNamespace}-doc.css`,
                outputPath: `${distPath}/styles`,
                compileSourceFiles: [`${rootPath}/styles/doc.scss`],
                compileImportPaths: [`${nodeModulesPath}`],
                lintOptions: {
                    configFile: `${nodeModulesPath}/library-component-module/.sass-lint.yaml` /* Pulling sass lint config from "library" module */
                },
                lintPaths: [`${rootPath}/styles/**/*.scss`],
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
        sourceFile: `${tokensPath}/tokens.yaml`,
        outputPath: tokensPath,
        jsonOutputFile: `${tokensPath}/tokens.json`,
        scssOutputFile: `${tokensPath}/tokens.scss`
    }
};

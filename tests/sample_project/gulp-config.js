'use strict';

const projectNamespace = 'uds',
        rootPath = './tests/sample_project',
        distPath = `${rootPath}/dist`,
        nodeModulesPath = `${rootPath}/node_modules`,
        tokensPath = `${nodeModulesPath}/library-component-module/tokens`;

module.exports = {
    rootPath: rootPath,
    distPath: distPath,
    localEnv: {
        webroot: `${rootPath}/_site`,
        latestVersionDirectory: `latest`
    },
    markup: {
        compileTaskPrefix: 'markup:compile:',
        concatMacrosTaskPrefix: 'markup:concatenate-macros:',
        tasks: [
            {
                name: 'components',
                componentMacros: [`${nodeModulesPath}/library-component-module/components/*.njk`],
                componentMacroOutputPath: `${nodeModulesPath}/library-component-module/components`,
                componentMacroFilename: projectNamespace,
                componentSinkPages: [`${nodeModulesPath}/library-component-module/components/*.sink.njk`]
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

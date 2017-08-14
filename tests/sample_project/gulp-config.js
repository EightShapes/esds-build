'use strict';

const projectNamespace = 'uds',
        rootPath = './tests/sample_project',
        distPath = `${rootPath}/dist`,
        nodeModulesPath = `${rootPath}/node_modules`;

module.exports = {
    rootPath: rootPath,
    distPath: distPath,
    styles: {
        compileTaskPrefix: 'styles:build:',
        lintTaskPrefix: 'styles:lint:',
        watchTaskPrefix: 'watch:styles:',
        tasks: [
            {
                name: 'components',
                compiledFileName: `${projectNamespace}.css`,
                outputPath: distPath,
                compileSourceFiles: [`${nodeModulesPath}/library-component-module/styles/${projectNamespace}_library.scss`],
                compileImportPaths: [`${nodeModulesPath}/library-component-module/components`, `${nodeModulesPath}/library-component-module/tokens`],
                lintOptions: {
                    configFile: `${nodeModulesPath}/library-component-module/.sass-lint.yaml` /* Pulling sass lint config from "library" module */
                },
                lintPaths: [`${nodeModulesPath}/library-component-module/styles/**/*.scss`,
                            `${nodeModulesPath}/library-component-module/components/**/*.scss`]
            },
            {
                name: 'doc-components',
                compiledFileName: `${projectNamespace}-doc-components.css`,
                outputPath: distPath,
                compileSourceFiles: [`${nodeModulesPath}/doc-component-module/styles/doc_components.scss`],
                compileImportPaths: [`${nodeModulesPath}/doc-component-module/components`, `${nodeModulesPath}`],
                lintOptions: {
                    configFile: `${nodeModulesPath}/library-component-module/.sass-lint.yaml` /* Pulling sass lint config from "library" module */
                },
                lintPaths: [`${nodeModulesPath}/doc-component-module/styles/**/*.scss`,
                            `${nodeModulesPath}/doc-component-module/components/**/*.scss`]
            },
            {
                name: 'doc',
                compiledFileName: `${projectNamespace}-doc.css`,
                outputPath: distPath,
                compileSourceFiles: [`${rootPath}/styles/doc.scss`],
                compileImportPaths: [`${nodeModulesPath}`],
                lintOptions: {
                    configFile: `${nodeModulesPath}/library-component-module/.sass-lint.yaml` /* Pulling sass lint config from "library" module */
                },
                lintPaths: [`${rootPath}/styles/**/*.scss`]
            }
        ]
    }
};

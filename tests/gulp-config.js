'use strict';

const projectNamespace = 'uds',
        rootPath = './tests',
        distPath = `${rootPath}/dist`,
        nodeModulesPath = `${rootPath}/node_modules`;

module.exports = {
    rootPath: rootPath,
    distPath: distPath,
    styles: {
        compile: [
            {
                taskName: 'styles:build:components',
                outputFileName: `${projectNamespace}.css`,
                outputPath: distPath,
                sourceFiles: [`${nodeModulesPath}/library-component-module/styles/${projectNamespace}_library.scss`],
                importPaths: [`${nodeModulesPath}/library-component-module/components`, `${nodeModulesPath}/library-component-module/tokens`]
            },
            {
                taskName: 'styles:build:doc-components',
                outputFileName: `${projectNamespace}-doc-components.css`,
                outputPath: distPath,
                sourceFiles: [`${nodeModulesPath}/doc-component-module/styles/doc_components.scss`],
                importPaths: [`${nodeModulesPath}/doc-component-module/components`, `${nodeModulesPath}`]
            },
            {
                taskName: 'styles:build:doc',
                outputFileName: `${projectNamespace}-doc.css`,
                outputPath: distPath,
                sourceFiles: [`${rootPath}/styles/doc.scss`],
                importPaths: [`${nodeModulesPath}`]
            }
        ],
        lint: [
            {
                taskName: 'styles:lint:components',
                options: {
                    configFile: `${nodeModulesPath}/library-component-module/.sass-lint.yaml` /* Pulling sass lint config from "library" module */
                },
                lintPaths: [`${nodeModulesPath}/library-component-module/styles/**/*.scss`,
                            `${nodeModulesPath}/library-component-module/components/**/*.scss`]
            },
            {
                taskName: 'styles:lint:doc-components',
                options: {
                    configFile: `${nodeModulesPath}/library-component-module/.sass-lint.yaml` /* Pulling sass lint config from "library" module */
                },
                lintPaths: [`${nodeModulesPath}/doc-component-module/styles/**/*.scss`,
                            `${nodeModulesPath}/doc-component-module/components/**/*.scss`]
            },
            {
                taskName: 'styles:lint:doc',
                options: {
                    configFile: `${nodeModulesPath}/library-component-module/.sass-lint.yaml` /* Pulling sass lint config from "library" module */
                },
                lintPaths: [`${rootPath}/styles/**/*.scss`]
            }
        ]
    }
};

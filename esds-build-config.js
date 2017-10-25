'use strict';
const rootPath = "test/sample_project/";

module.exports = {
    rootPath: rootPath,
    codeNamespace: "esds",
    manageNunjucksEnv: function(env) {
        env.addFilter('isarray', function(obj) {
          return Array.isArray(obj);
        });
    },
    copyTasks: [
        {
            name: 'fonts',
            sources: [`${rootPath}/node_modules/product-a/fonts/*`],
            destination: `${rootPath}/_site/latest/fonts`
        },
        {
            name: 'random-dependencies',
            sources: [`${rootPath}/node_modules/random-file-to-be-copied.js`],
            destination: `${rootPath}/_site/latest/scripts/dependencies`,
            watch: true
        },
        {
            name: 'renamed-dependencies',
            sources: [`${rootPath}/node_modules/random-file-to-be-copied.js`],
            destination: `${rootPath}/_site/latest/scripts/dependencies`,
            rename: 'this-file-was-renamed.js'
        },
        {
            name: 'zip-these-files',
            sources: [`${rootPath}/node_modules/product-a/icons/*.svg`],
            destination: `${rootPath}/_site/latest/icons`,
            zip_to: 'my-icons-zipped.zip'
        }
    ],
    dependencies: [
        {
            moduleName: 'product-a',
            codeNamespace: 'product_a',
            tokens: 'copy' // Could be 'copy', 'reference', 'merge', or 'overwrite': 'merge' and 'overwrite' behaviors not written yet
        },
        {
            moduleName: 'product-b',
            codeNamespace: 'product_b',
            tokens: 'reference' // Reference makes the tokens from this module available to the nunjucks environment without actually copying the tokens.json file
        }
    ]
};

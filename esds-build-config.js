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
            copyDocs: true,
            copyDocsReplacements: [
                [/\/styles\/product_a.css/g, '/styles/dependencies/product-a.css'],
                [/\/scripts\/product_a.js/g, '/styles/dependencies/product_as_scripts.js'],
                [/\/icons\/product_a.svg/g, '/icons/dependencies/product_a.svg#stopwatch']
            ]
        },
        {
            moduleName: 'product-b'
        }
    ]
};

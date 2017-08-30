'use strict';
const rootPath = "tests/sample_project/";

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
            destination: `${rootPath}/_site/latest/scripts/dependencies`
        }
    ]
};

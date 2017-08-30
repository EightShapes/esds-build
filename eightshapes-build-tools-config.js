'use strict';
module.exports = {
    rootPath: "tests/sample_project/",
    codeNamespace: "esds",
    manageNunjucksEnv: function(env) {
        env.addFilter('isarray', function(obj) {
          return Array.isArray(obj);
        });
    }
};

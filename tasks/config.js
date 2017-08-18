'use strict';

function retrieveGulpfile() {
    const rootPath = process.cwd();
    return require(`${rootPath}/gulpfile.js`);
}

module.exports = {
    get: function(useDefaults) {
        const gulpfile = retrieveGulpfile();
        useDefaults = typeof useDefaults === 'undefined' ? false : true;

        if (!useDefaults && gulpfile.config) { // See if a config file has been defined in the gulpfile
            return gulpfile.config;
        } else {
            return require('./default-build-config.js'); // If no config file has been defined, use the default config
        }
    }
};

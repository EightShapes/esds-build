'use strict';

const productBuildConfigFileName = 'uds-build-tool-config.js',
        fs = require('fs');

function retrieveProductBuildConfig(rootPath) {
    rootPath = typeof rootPath === 'undefined' ? process.cwd() : rootPath;
    if (fs.existsSync(`${rootPath}${productBuildConfigFileName}`)) {
        return require(`${rootPath}${productBuildConfigFileName}`);
    } else {
        return {};
    }
}

function retrieveGulpfile() {
    const rootPath = process.cwd();
    return require(`${rootPath}/gulpfile.js`);
}

module.exports = {
    get: function(useDefaults) {
        const gulpfile = retrieveGulpfile();
        useDefaults = typeof useDefaults === 'undefined' ? false : true; // Used for testing, tasks don't use this argument, config file either exists or it doesn't

        if (!useDefaults && gulpfile.config) { // See if a config file has been defined in the gulpfile
            return gulpfile.config;
        } else {
            return require(`${__dirname}/../default_templates/default-build-config.js`); // If no config file has been defined, use the default config
        }
    },
    retrieveProductBuildConfig: retrieveProductBuildConfig
};

/* global it */
/* global xit */
/* global describe */
/* global before */
/* global after */

'use strict';
const assert = require('yeoman-assert'),
        fs = require('fs');

let config,
    buildConfig;

module.exports = function(){
    describe('get config when config file exists', function(){
      it('should retrieve the config from the path set in the gulpfile', function() {
        config = require('../tasks/config.js');
        buildConfig = config.get();
        assert(buildConfig.rootPath === './tests/sample_project');
        assert(buildConfig.localEnv.webroot === './tests/sample_project/_site');
      });
    });

    describe('get config when no config file exists', function(){
        it('should use the default config', function() {
            const useDefaults = true;
            config = require('../tasks/config.js');
            buildConfig = config.get(useDefaults); // Gets default config
            assert(buildConfig.rootPath === '.');
            assert(buildConfig.scaffoldPath === '.');
            assert(buildConfig.localEnv.webroot === './_site');
        });
    });
};

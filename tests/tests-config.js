/* global it */
/* global xit */
/* global describe */
/* global before */
/* global after */

'use strict';
const assert = require('yeoman-assert');

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
            assert(buildConfig.rootPath.includes('/uds-build-tools'));
            assert(buildConfig.scaffoldPath.includes('/uds-build-tools'));
            assert(buildConfig.localEnv.webroot.includes('/uds-build-tools/_site'));
        });
    });

    describe.only('when retrieving product config', function(){
        it('should return an empty config object when a product config file cannot be found', function(){
            const config = require('../tasks/config.js'),
                    productConfig = config.retrieveProductBuildConfig('/path/doesnt/exist/'),
                    keys = Object.keys(productConfig);
            console.log(typeof productConfig);
            assert(typeof productConfig === 'object');
            assert(keys.length === 0);
        });
    });
};

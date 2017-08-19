/* global it */
/* global xit */
/* global describe */
/* global after */
/* global beforeEach */

'use strict';
const gulp = require('./tests-gulp.js'),
      assert = require('yeoman-assert'),
      del = require('del'),
      scaffoldDir = './tests/scaffold_test';

module.exports = function(){
    describe('generate:project-directories', function(){
      after(function() {
        return del(scaffoldDir);
      });

      it('should generate all the top level directories using default names', function() {
        return gulp('generate:project-directories')
          .then(result => {
            const defaultProjectDirectories = [
                'components',
                'dist',
                'docs',
                'icons',
                'images',
                'includes',
                'scripts',
                'styles',
                'templates',
                'tests',
                'tokens'
            ];
            defaultProjectDirectories.forEach(dir => assert.file(`${scaffoldDir}/${dir}`));
          });
      });
    });

    describe('generate:default-config', function(){
      after(function() {
        return del(scaffoldDir);
      });

      it('should generate a default config', function() {
        return gulp('generate:default-config')
          .then(result => {
            assert.file(`${scaffoldDir}/build-config.js`);
            const defaultConfig = require(`${__dirname}/scaffold_test/build-config.js`);
            assert(defaultConfig.rootPath === '.');
            assert(defaultConfig.scaffoldPath === '.');
            assert(defaultConfig.localEnv.webroot === './_site');
          });
      });
    });
};

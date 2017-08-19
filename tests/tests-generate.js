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
    describe('generate:project-scaffold', function(){
      after(function() {
        return del(scaffoldDir);
      });

      it('should generate a project scaffold with top level directories and basic files', function() {
        return gulp('generate:project-scaffold')
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
            assert.fileContent(`${scaffoldDir}/docs/index.njk`, '<h1>Design System</h1>');
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

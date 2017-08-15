/* global it */
/* global xit */
/* global describe */
/* global beforeEach */

'use strict';
const gulp = require('./tests-gulp.js'),
      assert = require('yeoman-assert');

module.exports = function(){
    const projectPath = './tests/sample_project',
          nodeModulesPath = `${projectPath}/node_modules`,
          componentMacros = `${nodeModulesPath}/library-component-module/components`;

    describe('markup:compile', function(){
      it('should concatenate "library" macros', function() {
        return gulp('markup:concatenate-macros:components')
          .then(result => {
            assert.file(`${componentMacros}/uds.njk`);
            // assert.fileContent(componentsCssFile, '.uds-button {');
            // assert.fileContent(componentsCssFile, 'background: #0ff');
          });
      });
    });
  };

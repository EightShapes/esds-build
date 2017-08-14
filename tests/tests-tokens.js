/* global it */
/* global xit */
/* global describe */
/* global beforeEach */

'use strict';
const { exec } = require('child_process'),
      gulp = require('./tests-gulp.js'),
      assert = require('yeoman-assert'),
      fs = require('fs');

module.exports = function(){
    const projectPath = './tests/sample_project',
          componentsCssFile = `${projectPath}/dist/styles/uds.css`,
          docComponentsCssFile = `${projectPath}/dist/styles/uds-doc-components.css`,
          docCssFile = `${projectPath}/dist/styles/uds-doc.css`;

    describe('styles:precompile', function(){
      beforeEach(function() {
        return gulp('clean:tokens');
      });

      it('should be able to compile "library" styles', function() {
        return gulp('styles:precompile:components')
          .then(result => {
            assert.fileContent(componentsCssFile, '.uds-button {');
            assert.fileContent(componentsCssFile, 'background: #0ff');
          });
      });
    });
};

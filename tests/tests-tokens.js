/* global it */
/* global xit */
/* global describe */
/* global beforeEach */

'use strict';
const gulp = require('./tests-gulp.js'),
      assert = require('yeoman-assert');

module.exports = function(){
    const projectPath = './tests/sample_project',
          tokensPath = `${projectPath}/node_modules/library-component-module/tokens`,
          tokensScss = `${tokensPath}/tokens.scss`,
          tokensJson = `${tokensPath}/tokens.json`;

    describe('tokens:build', function(){
      beforeEach(function() {
        return gulp('clean:tokens');
      });

      it('should convert tokens.yaml to scss and json', function() {
        return gulp('tokens:build:all')
          .then(result => {
            assert.fileContent(tokensScss, '$uds-color-interactive-primary: #0ff');
            assert.fileContent(tokensJson, '"tokens": {');
            assert.fileContent(tokensJson, '"primary": "#0ff"');
          });
      });
    });

    describe('tokens:watch', function(){
      xit('should watch tokens.yaml for changes and rebuild scss and json', function(){});
    });
};

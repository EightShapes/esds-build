/* global it */
/* global xit */
/* global describe */
/* global beforeEach */

'use strict';
const gulp = require('./tests-gulp.js'),
      assert = require('yeoman-assert'),
      fs = require('fs');

module.exports = function(){
    const projectPath = './tests/sample_project',
          tokensPath = `${projectPath}/node_modules/library-component-module/tokens`,
          dist = `${projectPath}/dist`;

    describe('clean:dist', function(){

      it('should delete all the files in dist', function() {
        const testFilename = `${dist}/some-random-file.txt`;
        fs.writeFileSync(testFilename, 'blah blah blah');

        return gulp('clean:dist')
          .then(result => {
            assert.noFile(testFilename);
          });
      });
    });

    describe('clean:tokens', function(){
      it('should delete any tokens file except tokens.yaml', function(){
        const tokensScssFilename = `${tokensPath}/tokens.scss`,
              tokensJsonFilename = `${tokensPath}/tokens.json`,
              tokensYamlFilename = `${tokensPath}/tokens.yaml`;

        fs.writeFileSync(tokensScssFilename, 'tokens scss');
        fs.writeFileSync(tokensJsonFilename, 'tokens json');

        return gulp('clean:tokens')
          .then(result => {
            assert.noFile(tokensScssFilename);
            assert.noFile(tokensJsonFilename);
            assert.file(tokensYamlFilename);
          });
      });
    });

    describe('clean:concatenated-macros', function(){
      it('should delete all concatenated macro files', function(){
        const concatenatedComponentsFilename = `${projectPath}/node_modules/library-component-module/components/uds.njk`;

        fs.writeFileSync(concatenatedComponentsFilename, 'concatenated macros');

        return gulp('clean:concatenated-macros')
          .then(result => {
            assert.noFile(concatenatedComponentsFilename);
          });
      });
    });
};

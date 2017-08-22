/* global it */
/* global xit */
/* global describe */
/* global beforeEach */

'use strict';
const { exec } = require('child_process'),
      gulp = require('./tests-gulp.js'),
      assert = require('yeoman-assert'),
      fs = require('fs');

// TODO Move this function to a commonly shared place
function recursivelyCheckForFiles(filePaths, done) {
  let allFilesFound = filePaths.every(file => fs.existsSync(file));

  if (allFilesFound) {
    // assert.file(filePath);
    done();
  } else {
    setTimeout(function() {
      recursivelyCheckForFiles(filePaths, done);
    }, 20);
  }
}

module.exports = function(){
    const projectPath = './tests/sample_project',
          componentsJsFile = `${projectPath}/_site/latest/scripts/components.js`,
          docComponentsJsFile = `${projectPath}/_site/latest/scripts/doc-components.js`,
          docJsFile = `${projectPath}/_site/latest/scripts/doc.js`;

    describe('scripts', function(){
      describe('scripts:concatenate', function(){
        beforeEach(function() {
          return gulp('clean:webroot')
            .then(result => gulp('tokens:build:all'));
        });

        it('should be able to concatenate "library" scripts', function() {
          return gulp('scripts:concatenate:components')
            .then(result => {
              assert.fileContent(componentsJsFile, 'Uds.Button');
              assert.fileContent(componentsJsFile, 'globalFunctionHelper');
            });
        });

        it('should be able to concatenate "doc library" scripts', function() {
          return gulp('scripts:concatenate:doc-components')
            .then(result => {
              assert.fileContent(docComponentsJsFile, 'DocLibrary.CodeSnippet');
              assert.fileContent(docComponentsJsFile, 'Global8SHelper');
            });
        });

        it('should be able to concatenate "doc" scripts', function() {
          return gulp('scripts:concatenate:doc')
            .then(result => {
              assert.fileContent(docJsFile, 'GlobalDocFunction');
            });
        });

        it('should be able to concatenate all scripts with one composite gulp task', function() {
          return gulp('scripts:concatenate:all')
            .then(result => {
              assert.fileContent(componentsJsFile, 'Uds.Button');
              assert.fileContent(componentsJsFile, 'globalFunctionHelper');
              assert.fileContent(docComponentsJsFile, 'DocLibrary.CodeSnippet');
              assert.fileContent(docComponentsJsFile, 'Global8SHelper');
              assert.fileContent(docJsFile, 'GlobalDocFunction');
            });
        });
      });
    });
  };

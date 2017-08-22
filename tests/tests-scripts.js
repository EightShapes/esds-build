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

      describe('scripts:lint', function(){
        it('should be able to lint "library" scripts', function() {
          return gulp('scripts:lint:components')
            .then(result => {
              assert(result.stderr.includes('Unexpected console statement. (no-console)'));
              assert(result.stderr.includes('components/button/button.js'));
            });
        });

        it('should be able to lint "doc library" scripts', function() {
          return gulp('scripts:lint:doc-components')
            .then(result => {
              assert(result.stderr.includes('Unexpected console statement. (no-console)'));
              assert(result.stderr.includes('components/code_snippet/code_snippet.js'));
            });
        });

        it('should be able to lint "doc" scripts', function() {
          return gulp('scripts:lint:doc')
            .then(result => {
              assert(result.stderr.includes('Unexpected console statement. (no-console)'));
              assert(result.stderr.includes('scripts/global.js'));
            });
        });

        it('should be able to lint all scripts with a composite lint task', function() {
          return gulp('scripts:lint:all')
            .then(result => {
              assert(result.stderr.includes('components/button/button.js'));
              assert(result.stderr.includes('components/code_snippet/code_snippet.js'));
              assert(result.stderr.includes('scripts/global.js'));
            });
        });
      });

      describe('scripts:build', function(){
        beforeEach(function() {
          return gulp('clean:webroot')
            .then(result => gulp('tokens:build:all'));
        });

        xit('should be able to lint and then concatenate "library" scripts', function() {
          return gulp('scripts:build:components')
            .then(result => {
              assert(result.stderr.includes('Unexpected console statement. (no-console)'));
              assert(result.stderr.includes('components/button/button.js'));
              assert.fileContent(componentsJsFile, 'Uds.Button');
              assert.fileContent(componentsJsFile, 'globalFunctionHelper');
            });
        });

        xit('should be able to lint and then concatenate "doc library" scripts', function() {
          return gulp('scripts:build:doc-components')
            .then(result => {
              assert(result.stderr.includes('Unexpected console statement. (no-console)'));
              assert(result.stderr.includes('components/code_snippet/code_snippet.js'));
              assert.fileContent(docComponentsJsFile, 'DocLibrary.CodeSnippet');
              assert.fileContent(docComponentsJsFile, 'Global8SHelper');
            });
        });
      });
    });
  };

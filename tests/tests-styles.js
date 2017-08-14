/* global it */
/* global xit */
/* global describe */
/* global beforeEach */

'use strict';
const { exec } = require('child_process'),
      gulp = require('./tests-gulp.js'),
      assert = require('yeoman-assert'),
      fs = require('fs');

function recursivelyCheckForFile(filePath, done) {
  if (fs.existsSync(filePath)) {
    assert.file(filePath);
    done();
  } else {
    setTimeout(function() {
      recursivelyCheckForFile(filePath, done);
    }, 20);
  }
}

module.exports = function(){
    const projectPath = './tests/sample_project',
          componentsCssFile = `${projectPath}/dist/uds.css`,
          docComponentsCssFile = `${projectPath}/dist/uds-doc-components.css`,
          docCssFile = `${projectPath}/dist/uds-doc.css`;

    describe('styles:build', function(){
      beforeEach(function() {
        return gulp('clean:dist');
      });

      it('should be able to compile "library" styles', function() {
        return gulp('styles:build:components')
          .then(result => {
            assert.file(componentsCssFile);
            assert.fileContent(componentsCssFile, '.uds-button {');
            assert.fileContent(componentsCssFile, 'background: #0ff');
          });
      });

      it('should be able to compile "doc library" styles with tokens from "library"', function() {
        return gulp('styles:build:doc-components')
          .then(result => {
            assert.file(docComponentsCssFile);
            assert.fileContent(docComponentsCssFile, '.uds-doc-code-snippet {');
            assert.fileContent(docComponentsCssFile, 'box-sizing: border-box;');
            assert.fileContent(docComponentsCssFile, 'border: solid 3px #000;'); // token from library
          });
      });

      it('should be able to compile "doc" styles with tokens from "library"', function() {
        return gulp('styles:build:doc')
          .then(result => {
            assert.file(docCssFile);
            assert.fileContent(docCssFile, '.uds-doc-nav {');
            assert.fileContent(docCssFile, 'border: solid 3px #000;'); // token from library
          });
      });

      it('should be able to compile all styles with one composite gulp task', function() {
        return gulp('styles:build:all')
          .then(result => {
            assert.file(componentsCssFile);
            assert.file(docComponentsCssFile);
            assert.file(docCssFile);
          });
      });
    });

    describe('styles:lint', function(){
      it('should be able to lint "library" styles', function() {
        return gulp('styles:lint:components')
          .then(result => {
            assert(result.stdout.includes('warning  Color \'red\' should be written in its hexadecimal form #ff0000'));
          });
      });

      it('should be able to lint "doc library" styles', function() {
        return gulp('styles:lint:doc-components')
          .then(result => {
            assert(result.stdout.includes('warning  Color \'hotpink\' should be written in its hexadecimal form #ff69b4'));
          });
      });

      it('should be able to lint "doc" styles', function() {
        return gulp('styles:lint:doc')
          .then(result => {
            assert(result.stdout.includes('warning  Color \'lemonchiffon\' should be written in its hexadecimal form #fffacd'));
          });
      });

      it('should be able to lint all styles with one composite gulp task', function() {
        return gulp('styles:lint:all')
          .then(result => {
            assert(result.stdout.includes('warning  Color \'red\' should be written in its hexadecimal form #ff0000'));
            assert(result.stdout.includes('warning  Color \'lemonchiffon\' should be written in its hexadecimal form #fffacd'));
            assert(result.stdout.includes('warning  Color \'hotpink\' should be written in its hexadecimal form #ff69b4'));
          });
      });
    });

    describe('watch:styles', function(){
      it('should watch "library" styles for changes', function(done) {
        exec(`gulp watch:styles:components`); // start watch
        gulp('clean:dist') // clear dist
          .then(result => {
            exec(`touch ${projectPath}/node_modules/library-component-module/styles/uds_library.scss`);
            recursivelyCheckForFile(componentsCssFile, done);
          });
      });

      it('should watch "doc library" styles for changes', function(done) {
        exec(`gulp watch:styles:doc-components`); // start watch
        gulp('clean:dist') // clear dist
          .then(result => {
            exec(`touch ${projectPath}/node_modules/doc-component-module/styles/doc_components.scss`);
            recursivelyCheckForFile(docComponentsCssFile, done);
          });
      });

      it('should rebuild "doc library" styles when "library" tokens are updated', function(done) {
        exec(`gulp watch:styles:doc-components`); // start watch
        gulp('clean:dist') // clear dist
          .then(result => {
            exec(`touch ${projectPath}/node_modules/library-component-module/tokens/tokens.scss`);
            recursivelyCheckForFile(docComponentsCssFile, done);
          });
      });

      it('should watch "doc" styles for changes', function(done) {
        exec(`gulp watch:styles:doc`); // start watch
        gulp('clean:dist') // clear dist
          .then(result => {
            exec(`touch ${projectPath}/styles/doc.scss`);
            recursivelyCheckForFile(docCssFile, done);
          });
      });

      it('should rebuild "doc" styles when "library" tokens are updated', function(done) {
        exec(`gulp watch:styles:doc`); // start watch
        gulp('clean:dist') // clear dist
          .then(result => {
            exec(`touch ${projectPath}/node_modules/library-component-module/tokens/tokens.scss`);
            recursivelyCheckForFile(docCssFile, done);
          });
      });
    });
  };

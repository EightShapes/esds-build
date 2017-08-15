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
    console.log("CHECKING FOR FILES");

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
          nodeModulesPath = `${projectPath}/node_modules`,
          componentMacros = `${nodeModulesPath}/library-component-module/components`,
          docComponentMacros = `${nodeModulesPath}/doc-component-module/components`,
          webroot = `${projectPath}/_site`;

    describe('markup:concatenate-macros:', function(){
      beforeEach(function(){
        return gulp('clean:concatenated-macros');
      });

      it('should concatenate "library" macros', function() {
        return gulp('markup:concatenate-macros:components')
          .then(result => {
            assert.fileContent(`${componentMacros}/uds.njk`, '{% macro button(');
            assert.fileContent(`${componentMacros}/uds.njk`, '{% macro data_table(');
          });
      });

      it('should concatenate "doc library" macros', function() {
        return gulp('markup:concatenate-macros:doc-components')
          .then(result => {
            assert.fileContent(`${docComponentMacros}/uds_doc_library.njk`, '{% macro code_snippet(');
            assert.fileContent(`${docComponentMacros}/uds_doc_library.njk`, '{% macro tint_stack(');
          });
      });

      it('should concatenate all macros into their respective files', function() {
        return gulp('markup:concatenate-macros:all')
          .then(result => {
            assert.file(`${componentMacros}/uds.njk`);
            assert.file(`${docComponentMacros}/uds_doc_library.njk`);
          });
      });

    });

    describe('markup:build:', function(){
      beforeEach(function(){
        return gulp('clean:webroot');
      });

      it('should compile "library" docs (sink pages)', function() {
        return gulp('tokens:build:all')
          .then(result => gulp('markup:concatenate-macros:components'))
          .then(result => gulp('markup:build:components'))
          .then(result => {
            assert.fileContent(`${nodeModulesPath}/library-component-module/_site/latest/sink-pages/components/buttons.html`, '<button class="uds-button"');
            assert.fileContent(`${nodeModulesPath}/library-component-module/_site/latest/index.html`, '<h1>Components Index Page</h1>');
          });
      });

      it('should use the default "library" template when building doc pages for the "library"', function() {
        return gulp('tokens:build:all')
          .then(result => gulp('markup:concatenate-macros:components'))
          .then(result => gulp('markup:build:components'))
          .then(result => {
            assert.fileContent(`${nodeModulesPath}/library-component-module/_site/latest/sink-pages/components/buttons.html`, '<title>Library Component Module</title>');
          });
      });

      it('should use the default "doc" template when building doc pages for the "library" through the doc build task', function() {
        return gulp('tokens:build:all')
          .then(result => gulp('markup:concatenate-macros:components'))
          .then(result => gulp('markup:build:doc'))
          .then(result => {
            assert.noFileContent(`${webroot}/latest/sink-pages/components/buttons.html`, '<title>Library Component Module</title>');
            assert.fileContent(`${webroot}/latest/sink-pages/components/buttons.html`, '<title>Doc Base Template</title>');
          });
      });

      it('should compile "doc library" docs (sink pages)', function() {
        return gulp('tokens:build:all')
          .then(result => gulp('markup:concatenate-macros:all'))
          .then(result => gulp('markup:build:doc-components'))
          .then(result => {
            assert.fileContent(`${nodeModulesPath}/doc-component-module/_site/latest/sink-pages/components/code-snippets.html`, '<div class="uds-doc-code-snippet"');

            // One library should be able to utilize another library, Show usage of "library" by "doc library"
            assert.fileContent(`${nodeModulesPath}/doc-component-module/_site/latest/sink-pages/components/code-snippets.html`, '<button class="uds-button');
            assert.fileContent(`${nodeModulesPath}/doc-component-module/_site/latest/index.html`, '<h1>Doc Components Index Page</h1>');
          });
      });

      it('should compile "doc" docs', function() {
        return gulp('tokens:build:all')
          .then(result => gulp('markup:concatenate-macros:all'))
          .then(result => gulp('markup:build:doc'))
          .then(result => {
            assert.fileContent(`${webroot}/latest/index.html`, '<h1>Doc Site Homepage</h1>');
            assert.fileContent(`${webroot}/latest/index.html`, '<button class="uds-button"');
            assert.fileContent(`${webroot}/latest/index.html`, '<div class="uds-doc-code-snippet"');
          });
      });

      it('should compile all docs', function() {
        return gulp('tokens:build:all')
          .then(result => gulp('markup:concatenate-macros:all'))
          .then(result => gulp('markup:build:all'))
          .then(result => {
            assert.file(`${webroot}/latest/index.html`);
            assert.file(`${nodeModulesPath}/library-component-module/_site/latest/index.html`);
            assert.file(`${nodeModulesPath}/doc-component-module/_site/latest/index.html`);
          });
      });
    });

    describe.only('watch:markup:macros', function(){
      xit('should reconcatenate macros and rebuild docs for the "library" when macro files are saved', function(){
        exec(`gulp watch:markup:macros:components`); // start watch
        gulp('clean:concatenated-macros')
          .then(result => {
            exec(`touch ${componentMacros}/button/button.njk`);
            recursivelyCheckForFiles([`${componentMacros}/uds.njk`,
                                      `${nodeModulesPath}/library-component-module/_site/latest/sink-pages/components/buttons.html`]);
          });
      });
    });
  };

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

    describe.only('markup:build:', function(){
      beforeEach(function(){
        return gulp('clean:webroot');
      });

      it('should compile "library" docs (sink pages)', function() {
        return gulp('tokens:build:all')
          .then(result => gulp('markup:concatenate-macros:components'))
          .then(result => gulp('markup:build:components'))
          .then(result => {
            assert.fileContent(`${webroot}/latest/sink-pages/components/buttons.html`, '<button class="uds-button"');
            assert.fileContent(`${webroot}/latest/index.html`, '<h1>Components Index Page</h1>');
          });
      });

      it('should compile "doc library" docs (sink pages)', function() {
        return gulp('tokens:build:all')
          .then(result => gulp('markup:concatenate-macros:all'))
          .then(result => gulp('markup:build:doc-components'))
          .then(result => {
            assert.fileContent(`${webroot}/latest/sink-pages/components/code-snippets.html`, '<div class="uds-doc-code-snippet"');

            // One library should be able to utilize another library, Show usage of "library" by "doc library"
            assert.fileContent(`${webroot}/latest/sink-pages/components/code-snippets.html`, '<button class="uds-button');
            assert.fileContent(`${webroot}/latest/index.html`, '<h1>Doc Components Index Page</h1>');
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
    });
  };

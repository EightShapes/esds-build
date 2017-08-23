/* global it */
/* global xit */
/* global describe */
/* global beforeEach */

'use strict';
const { exec } = require('child_process'),
      gulp = require('./tests-gulp.js'),
      assert = require('yeoman-assert'),
      del = require('del'),
      fs = require('fs'),
      projectPath = './tests/sample_project',
      nodeModulesPath = `${projectPath}/node_modules`,
      componentMacros = `${nodeModulesPath}/library-component-module/components`,
      docComponentMacros = `${nodeModulesPath}/doc-component-module/components`,
      webroot = `${projectPath}/_site`;

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

function deleteNodeModuleWebroots() {
  return del([`${nodeModulesPath}/library-component-module/_site`, `${nodeModulesPath}/doc-component-module/_site`]);
}


module.exports = function(){
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

      it('should compile "doc" docs, including markdown filter usage', function() {
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

      it('should compile using a markdown filter', function() {
        return gulp('tokens:build:all')
          .then(result => gulp('markup:concatenate-macros:all'))
          .then(result => gulp('markup:build:all'))
          .then(result => {
            assert.fileContent(`${webroot}/latest/index.html`, '<h1 id="doc-compiled-from-markdown">Doc Compiled from Markdown</h1>');
            assert.fileContent(`${nodeModulesPath}/library-component-module/_site/latest/index.html`, '<h1 id="library-compiled-from-markdown">Library Compiled from Markdown</h1>');
            assert.fileContent(`${nodeModulesPath}/doc-component-module/_site/latest/index.html`, '<h1 id="doc-library-compiled-from-markdown">Doc Library Compiled from Markdown</h1>');
          });
      });
    });

    describe('watch:markup:macros', function(){
      it('should reconcatenate macros and rebuild docs for "library", "doc library", and "doc" when library macro files are saved', function(done){
        exec(`gulp watch:markup:macros:components`); // start watch
        deleteNodeModuleWebroots();
        gulp('clean:concatenated-macros')
          .then(result => gulp('markup:concatenate-macros:doc-components')) // Rebuild the doc components concatenated macro file since this task shouldn't do that
          .then(result => gulp('clean:webroot'))
          .then(result => {
            exec(`touch ${componentMacros}/button/button.njk`);
            recursivelyCheckForFiles([`${componentMacros}/uds.njk`,
                                      `${nodeModulesPath}/library-component-module/_site/latest/sink-pages/components/buttons.html`,
                                      `${nodeModulesPath}/doc-component-module/_site/latest/sink-pages/components/code-snippets.html`,
                                      `${webroot}/latest/index.html`], done);
          });
      });

      it('should reconcatenate "doc library" macros and rebuild "doc library" and when macro files are saved', function(done){
        exec(`gulp watch:markup:macros:doc-components`); // start watch
        deleteNodeModuleWebroots();
        gulp('clean:concatenated-macros')
          .then(result => gulp('clean:webroot'))
          .then(result => {
            exec(`touch ${docComponentMacros}/code_snippet/code_snippet.njk`);
            recursivelyCheckForFiles([`${docComponentMacros}/uds_doc_library.njk`,
                                      `${nodeModulesPath}/doc-component-module/_site/latest/sink-pages/components/code-snippets.html`,
                                      `${webroot}/latest/index.html`], done);
          });
      });

      it('should watch all macro files and trigger correct rebuilds when macro files are saved', function(done){
        exec(`gulp watch:markup:macros:all`); // start watch
        deleteNodeModuleWebroots();
        gulp('clean:concatenated-macros')
          .then(result => gulp('clean:webroot'))
          .then(result => {
            exec(`touch ${docComponentMacros}/code_snippet/code_snippet.njk`);
            exec(`touch ${componentMacros}/button/button.njk`);
            recursivelyCheckForFiles([`${componentMacros}/uds.njk`,
                                      `${nodeModulesPath}/library-component-module/_site/latest/sink-pages/components/buttons.html`,
                                      `${docComponentMacros}/uds_doc_library.njk`,
                                      `${nodeModulesPath}/doc-component-module/_site/latest/sink-pages/components/code-snippets.html`,
                                      `${webroot}/latest/index.html`], done);
          });
      });
    });

    describe('watch:markup:docs', function(){
      it('should rebuild doc files for "library" when library doc files are saved', function(done){
        exec(`gulp watch:markup:docs:components`); // start watch
        deleteNodeModuleWebroots();
        gulp('markup:concatenate-macros:all')
          .then(result => {
            exec(`touch ${nodeModulesPath}/library-component-module/docs/index.njk`);
            recursivelyCheckForFiles([`${nodeModulesPath}/library-component-module/_site/latest/sink-pages/components/buttons.html`,
                                      `${nodeModulesPath}/library-component-module/_site/latest/index.html`], done);
          });
      });

      it('should rebuild doc files for "doc library" when "doc library" doc files are saved', function(done){
        exec(`gulp watch:markup:docs:doc-components`); // start watch
        deleteNodeModuleWebroots();
        gulp('markup:concatenate-macros:all')
          .then(result => {
            exec(`touch ${nodeModulesPath}/doc-component-module/docs/index.njk`);
            recursivelyCheckForFiles([`${nodeModulesPath}/doc-component-module/_site/latest/sink-pages/components/code-snippets.html`,
                                      `${nodeModulesPath}/doc-component-module/_site/latest/index.html`], done);
          });
      });

      it('should rebuild doc files for "doc" when "library" doc files are saved', function(done){
        exec(`gulp watch:markup:docs:doc`); // start watch
        gulp('markup:concatenate-macros:all')
          .then(result => gulp('clean:webroot'))
          .then(result => {
            exec(`touch ${nodeModulesPath}/library-component-module/docs/sink-pages/components/buttons.njk`);
            recursivelyCheckForFiles([`${webroot}/latest/index.html`], done);
          });
      });

      it('should rebuild doc files for "doc" when "doc library" doc files are saved', function(done){
        exec(`gulp watch:markup:docs:doc`); // start watch
        gulp('markup:concatenate-macros:all')
          .then(result => gulp('clean:webroot'))
          .then(result => {
            exec(`touch ${nodeModulesPath}/doc-component-module/docs/sink-pages/components/code_snippet.njk`);
            recursivelyCheckForFiles([`${webroot}/latest/index.html`], done);
          });
      });

      it('should rebuild doc files for "doc" when "doc" doc files are saved ;)', function(done){
        exec(`gulp watch:markup:docs:doc`); // start watch
        gulp('markup:concatenate-macros:all')
          .then(result => gulp('clean:webroot'))
          .then(result => {
            exec(`touch ${projectPath}/docs/index.njk`);
            recursivelyCheckForFiles([`${webroot}/latest/index.html`], done);
          });
      });

      it('should rebuild "library" doc files when all doc files are being watched', function(done){
        exec(`gulp watch:markup:docs:all`); // start watch
        deleteNodeModuleWebroots();
        gulp('markup:concatenate-macros:all')
          .then(result => gulp('clean:webroot'))
          .then(result => {
            exec(`touch ${nodeModulesPath}/library-component-module/docs/index.njk`);
            recursivelyCheckForFiles([`${nodeModulesPath}/library-component-module/_site/latest/index.html`], done);
          });
      });

      it('should rebuild "doc library" doc files when all doc files are being watched', function(done){
        exec(`gulp watch:markup:docs:all`); // start watch
        deleteNodeModuleWebroots();
        gulp('markup:concatenate-macros:all')
          .then(result => gulp('clean:webroot'))
          .then(result => {
            exec(`touch ${nodeModulesPath}/doc-component-module/docs/index.njk`);
            recursivelyCheckForFiles([`${nodeModulesPath}/doc-component-module/_site/latest/index.html`], done);
          });
      });

      it('should rebuild "doc" files when all doc files are being watched', function(done){
        exec(`gulp watch:markup:docs:all`); // start watch
        deleteNodeModuleWebroots();
        gulp('markup:concatenate-macros:all')
          .then(result => gulp('clean:webroot'))
          .then(result => {
            exec(`touch ${projectPath}/docs/index.njk`);
            recursivelyCheckForFiles([`${webroot}/latest/index.html`], done);
          });
      });
    });
  };

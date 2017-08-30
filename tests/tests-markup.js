/* global it */
/* global xit */
/* global describe */
/* global beforeEach */
/* global afterEach */

'use strict';
const { exec } = require('child_process'),
      config = require('../tasks/config.js'),
      c = config.get(),
      gulp = require('./tests-gulp.js'),
      assert = require('yeoman-assert'),
      del = require('del'),
      fs = require('fs'),
      projectPath = './tests/sample_project',
      nodeModulesPath = `${projectPath}/node_modules`,
      componentMacros = `${projectPath}/components`,
      webroot = `${projectPath}/_site`;

// TODO Move this function to a commonly shared place
function recursivelyCheckForFiles(filePaths, done) {
  let allFilesFound = filePaths.every(file => fs.existsSync(file));

  if (allFilesFound) {
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
    describe('markup:concatenate:macros:', function(){
      beforeEach(function(){
        return gulp('clean:concatenated-macros');
      });

      it('should concatenate macros', function() {
        return gulp(`markup:concatenate:macros:${c.productTaskName}`)
          .then(result => {
            assert.fileContent(`${componentMacros}/${c.codeNamespace}.njk`, '{% macro button(');
            assert.fileContent(`${componentMacros}/${c.codeNamespace}.njk`, '{% macro data_table(');
          });
      });

      it('should concatenate all macros into their respective files', function() {
        return gulp('markup:concatenate:macros:all')
          .then(result => {
            assert.fileContent(`${componentMacros}/${c.codeNamespace}.njk`, '{% macro button(');
          });
      });

    });

    describe('markup:build:', function(){
      beforeEach(function(){
        return gulp('clean:webroot');
      });

      it('should compile docs', function() {
        return gulp('tokens:build:all')
          .then(result => gulp('markup:concatenate:macros:all'))
          .then(result => gulp(`markup:build:${c.productTaskName}`))
          .then(result => {
            assert.fileContent(`${webroot}/latest/index.html`, '<h1>Doc Site Homepage</h1>');
            assert.fileContent(`${webroot}/latest/index.html`, '<button class="esds-button"');
          });
      });

      it('should compile all docs', function() {
        return gulp('tokens:build:all')
          .then(result => gulp('markup:concatenate:macros:all'))
          .then(result => gulp('markup:build:all'))
          .then(result => {
            assert.file(`${webroot}/latest/index.html`);
          });
      });

      it('should compile using a markdown filter', function() {
        return gulp('tokens:build:all')
          .then(result => gulp('markup:concatenate:macros:all'))
          .then(result => gulp('markup:build:all'))
          .then(result => {
            assert.fileContent(`${webroot}/latest/index.html`, '<h1 id="doc-compiled-from-markdown">Doc Compiled from Markdown</h1>');
          });
      });

      it('should compile docs while referencing a macro from a dependency', function() {
        return gulp('tokens:build:all')
          .then(result => gulp('markup:concatenate:macros:all'))
          .then(result => gulp('markup:build:all'))
          .then(result => {
            assert.fileContent(`${webroot}/latest/index.html`, '<button>I\'m a button from Product A</button>');
          });
      });
    });

    describe('custom nunjucks filters', function(){
      const customFilterTestFilepath = './tests/sample_project/docs/custom-filter-example.njk';
      beforeEach(function(){
        fs.writeFileSync(customFilterTestFilepath, "{% set test_array = ['a', 'b', 'c'] %}{% set is_it_an_array = test_array | isarray %}{% if is_it_an_array %}<p>Yes! It IS an array!</p>{% endif %}");
        return gulp('clean:webroot');
      });

      afterEach(function(){
        return del(customFilterTestFilepath);
      });

      it('should compile docs that use custom Product-level filters', function(){
        return gulp('markup:build:all')
          .then(result => {
            assert.fileContent(`${webroot}/latest/custom-filter-example.html`, 'Yes! It IS an array!');
          });
      });
    });

    describe('tokens available in nunjucks', function(){
      const nunjucksTokensTestFilepath = './tests/sample_project/docs/using-tokens-example.njk';
      beforeEach(function(){
        fs.writeFileSync(nunjucksTokensTestFilepath, "<h1>These tokens are {{ esds['what-are-the-tokens'] }}</h1>");
        return gulp('clean:webroot')
            .then(result => gulp('tokens:build:all'));
      });

      afterEach(function(){
        return del(nunjucksTokensTestFilepath);
      });

      it('should compile docs that use custom Product-level filters', function(){
        return gulp('markup:build:all')
          .then(result => {
            assert.fileContent(`${webroot}/latest/using-tokens-example.html`, 'These tokens are limegreen');
          });
      });
    });

    describe('json data available in nunjucks', function(){
      beforeEach(function(){
        return gulp('clean:webroot')
            .then(result => gulp('tokens:build:all'));
      });

      it('should compile docs that use custom Product-level filters', function(){
        return gulp('markup:build:all')
          .then(result => {
            assert.fileContent(`${webroot}/latest/using-content-example.html`, 'The elephant is gray.');
            assert.fileContent(`${webroot}/latest/using-content-example.html`, 'The tiger is orange.');
            assert.fileContent(`${webroot}/latest/using-content-example.html`, 'The duck is yellow.');
            assert.fileContent(`${webroot}/latest/using-content-example.html`, '&copy; 2017 Your Company Name');
            assert.fileContent(`${webroot}/latest/using-content-example.html`, '<a href="/">Home</a>');
          });
      });
    });

    describe('watch:markup:macros', function(){
      it('should reconcatenate macros and rebuild docs when macro files are saved', function(done){
        exec(`gulp watch:markup:macros:${c.productTaskName}`); // start watch
        deleteNodeModuleWebroots();
        gulp('clean:concatenated-macros')
          .then(result => gulp('clean:webroot'))
          .then(result => {
            exec(`touch ${componentMacros}/button/button.njk`);
            recursivelyCheckForFiles([`${componentMacros}/${c.codeNamespace}.njk`,
                                      `${webroot}/latest/index.html`], done);
          });
      });

      it('should watch all macro files and trigger correct rebuilds when macro files are saved', function(done){
        exec(`gulp watch:markup:macros:all`); // start watch
        deleteNodeModuleWebroots();
        gulp('clean:concatenated-macros')
          .then(result => gulp('clean:webroot'))
          .then(result => {
            exec(`touch ${componentMacros}/button/button.njk`);
            recursivelyCheckForFiles([`${componentMacros}/${c.codeNamespace}.njk`,
                                      `${webroot}/latest/index.html`], done);
          });
      });
    });

    describe('watch:markup:docs', function(){
      it('should rebuild doc files when doc files are saved', function(done){
        exec(`gulp watch:markup:docs:${c.productTaskName}`); // start watch
        gulp('markup:concatenate:macros:all')
          .then(result => gulp('clean:webroot'))
          .then(result => {
            exec(`touch ${projectPath}/docs/index.njk`);
            recursivelyCheckForFiles([`${webroot}/latest/index.html`], done);
          });
      });

      it('should rebuild "doc" files when all doc files are being watched', function(done){
        exec(`gulp watch:markup:docs:all`); // start watch
        deleteNodeModuleWebroots();
        gulp('markup:concatenate:macros:all')
          .then(result => gulp('clean:webroot'))
          .then(result => {
            exec(`touch ${projectPath}/docs/index.njk`);
            recursivelyCheckForFiles([`${webroot}/latest/index.html`], done);
          });
      });
    });
  };

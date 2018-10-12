/* global it */
/* global xit */
/* global describe */
/* global beforeEach */
/* global afterEach */
/* global before */
/* global after */

'use strict';
const { exec } = require('child_process'),
      config = require('../tasks/config.js'),
      c = config.get(),
      gulp = require('./tests-gulp.js'),
      assert = require('yeoman-assert'),
      del = require('del'),
      fs = require('fs-extra'),
      projectPath = './test/sample_project',
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

    describe('when the /components directory does not exist', function(){
      before(function(){
        fs.moveSync(componentMacros, `${projectPath}/moved-components`);
      });

      after(function(){
        fs.moveSync(`${projectPath}/moved-components`, componentMacros);
      });

      it('should run the markup:concatenate:macros:all task without failing', function() {
        return gulp('markup:concatenate:macros:all')
          .then(result => {
            assert(result.stdout.includes("Finished 'markup:concatenate:macros:all'"));
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

    describe('markup customize markdown filter', function() {
      before(function(){
        fs.moveSync(`esds-build-config.js`, `moved-esds-build-config.js`);
        let newConfig = {
          rootPath: 'test/sample_project/',
          includeMarkdownWrapper: true,
          markdownWrapperClass: 'my-special-markdown-filter-class'
        };

        fs.writeFileSync('esds-build-config.json', JSON.stringify(newConfig));
      });

      after(function(){
        fs.moveSync(`moved-esds-build-config.js`, `esds-build-config.js`);
        del.sync('esds-build-config.json');
      });

      it('should allow the markdown filter wrapper to be customized via config', function() {
        return gulp('clean:webroot')
          .then(result => gulp('markup:build:all'))
          .then(result => {
            assert.fileContent(`${webroot}/latest/index.html`, '<div class="my-special-markdown-filter-class">');
          });
      });
    });

    describe('markup:build: when tokens are updated', function(){
      before(function(){
        fs.copySync(`${projectPath}/tokens/tokens.yaml`, `${projectPath}/tokens/moved-tokens.yaml`);
        fs.copySync(`${projectPath}/docs/index.njk`, `${projectPath}/docs/moved-index.njk`);
      });

      after(function(){
        fs.moveSync(`${projectPath}/tokens/moved-tokens.yaml`, `${projectPath}/tokens/tokens.yaml`, { overwrite: true });
        fs.moveSync(`${projectPath}/docs/moved-index.njk`, `${projectPath}/docs/index.njk`, { overwrite: true });
      });

      it('should compile docs with the latest data', function() {
        return gulp('tokens:build:all')
          .then(result => gulp('markup:build:all'))
          .then(result => {
            fs.appendFileSync(`${projectPath}/docs/index.njk`, '{{ esds_tokens.something_new }} {{ esds_tokens.another_value }}');
            fs.appendFileSync(`${projectPath}/tokens/tokens.yaml`, "something_new: 'testing-1-2-3'");
          })
          .then(result => gulp('tokens:build:all'))
          .then(result => gulp('markup:build:all'))
          .then(result => {
            assert.fileContent(`${webroot}/latest/index.html`, 'hotpink');
            assert.fileContent(`${webroot}/latest/index.html`, 'testing-1-2-3');
          });
      });
    });

    describe('when the /docs directory does not exist', function(){
      before(function(){
        fs.moveSync(`${projectPath}/docs`, `${projectPath}/moved-docs`);
      });

      after(function(){
        fs.moveSync(`${projectPath}/moved-docs`, `${projectPath}/docs`);
      });

      it('should run the markup:build:all task without failing', function() {
        return gulp('markup:build:all')
          .then(result => {
            assert(result.stdout.includes("Finished 'markup:build:all'"));
          });
      });
    });

    describe('custom nunjucks filters', function(){
      const customFilterTestFilepath = './test/sample_project/docs/custom-filter-example.njk';
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
      const nunjucksTokensTestFilepath = './test/sample_project/docs/using-tokens-example.njk';
      beforeEach(function(){
        fs.writeFileSync(nunjucksTokensTestFilepath, "<h1>These tokens are {{ esds_tokens['what-are-the-tokens'] }}</h1>");
        return gulp('clean:webroot')
            .then(result => gulp('tokens:build:all'));
      });

      afterEach(function(){
        return del(nunjucksTokensTestFilepath);
      });

      it('should compile docs that reference tokens', function(){
        return gulp('markup:build:all')
          .then(result => {
            assert.fileContent(`${webroot}/latest/using-tokens-example.html`, 'These tokens are limegreen');
          });
      });
    });

    describe('child module tokens referenced and available in nunjucks', function(){
      const childTokensReferenceTestFilepath = './test/sample_project/docs/using-child-module-tokens-by-reference-example.njk';
      beforeEach(function(){
        fs.writeFileSync(childTokensReferenceTestFilepath, "<h1>This is a token from the child module: {{ product_b.color.text.default }}</h1>");
        return gulp('clean:webroot')
            .then(result => gulp('tokens:build:all'));
      });

      afterEach(function(){
        return del(childTokensReferenceTestFilepath);
      });

      it('should compile docs that use copied tokens from a child module', function(){
        return gulp('markup:build:all')
          .then(result => {
            assert.noFile(`${projectPath}/tokens/product_b_tokens.json`);
            assert.fileContent(`${webroot}/latest/using-child-module-tokens-by-reference-example.html`, 'This is a token from the child module: #ff0055');
          });
      });
    });

    describe('json data available in nunjucks', function(){
      beforeEach(function(){
        return gulp('clean:webroot')
            .then(result => gulp('tokens:build:all'));
      });

      it('should compile docs that reference content defined in data/*.json files', function(){
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

    describe('package.json content available in nunjucks', function(){
      beforeEach(function(){
        return gulp('clean:webroot');
      });

      it('should compile docs that reference package.json keys', function(){
        return gulp('markup:build:all')
          .then(result => {
            assert.fileContent(`${webroot}/latest/using-package-json-example.html`, 'esds-sample-project');
            assert.fileContent(`${webroot}/latest/using-package-json-example.html`, '1.10.2');
          });
      });
    });

    describe('nunjucks filters defined in a dependency', function(){
      beforeEach(function(){
        return gulp('clean:webroot');
      });

      it('should compile docs that use custom filters defined in a dependency', function(){
        return gulp('markup:build:all')
          .then(result => {
            assert.fileContent(`${webroot}/latest/using-dependency-filters.html`, 'Is Array: true');
            assert.fileContent(`${webroot}/latest/using-dependency-filters.html`, 'Is Number: true');
            assert.fileContent(`${webroot}/latest/using-dependency-filters.html`, 'Is Number: false');
            assert.fileContent(`${webroot}/latest/using-dependency-filters.html`, "<a href='#'>Link</a>");
            assert.fileContent(`${webroot}/latest/using-dependency-filters.html`, "STOMP!");
          });
      });
    });

    describe('watch:markup:macros', function(){
      it('should reconcatenate macros and rebuild docs when macro files are saved', function(done){
        const watchTask = exec(`gulp watch:markup:macros:${c.productTaskName}`); // start watch
        deleteNodeModuleWebroots();
        gulp('clean:concatenated-macros')
          .then(result => gulp('clean:webroot'))
          .then(result => {
            exec(`touch ${componentMacros}/button/button.njk`);
            recursivelyCheckForFiles([`${componentMacros}/${c.codeNamespace}.njk`,
                                      `${webroot}/latest/index.html`], function(){
                                        watchTask.kill();
                                        done();
                                      });
          });
      });

      it('should watch all macro files and trigger correct rebuilds when macro files are saved', function(done){
        const watchTask = exec(`gulp watch:markup:macros:all`); // start watch
        deleteNodeModuleWebroots();
        gulp('clean:concatenated-macros')
          .then(result => gulp('clean:webroot'))
          .then(result => {
            exec(`touch ${componentMacros}/button/button.njk`);
            recursivelyCheckForFiles([`${componentMacros}/${c.codeNamespace}.njk`,
                                      `${webroot}/latest/index.html`], function(){
                                        watchTask.kill();
                                        done();
                                      });
          });
      });
    });

    describe('watch:markup:docs', function(){
      it('should rebuild doc files when doc files are saved', function(done){
        const watchTask = exec(`gulp watch:markup:docs:${c.productTaskName}`); // start watch
        gulp('markup:concatenate:macros:all')
          .then(result => gulp('clean:webroot'))
          .then(result => {
            exec(`touch ${projectPath}/docs/index.njk`);
            recursivelyCheckForFiles([`${webroot}/latest/index.html`], function(){
              watchTask.kill();
              done();
            });
          });
      });

      it('should rebuild "doc" files when all doc files are being watched', function(done){
        const watchTask = exec(`gulp watch:markup:docs:all`); // start watch
        deleteNodeModuleWebroots();
        gulp('markup:concatenate:macros:all')
          .then(result => gulp('clean:webroot'))
          .then(result => {
            exec(`touch ${projectPath}/docs/index.njk`);
            recursivelyCheckForFiles([`${webroot}/latest/index.html`], function(){
              watchTask.kill();
              done();
            });
          });
      });
    });
  };

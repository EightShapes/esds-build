/* global it */
/* global xit */
/* global describe */
/* global beforeEach */
/* global before */
/* global after */

'use strict';
const { exec } = require('child_process'),
      config = require('../tasks/config.js'),
      c = config.get(),
      gulp = require('./tests-gulp.js'),
      assert = require('yeoman-assert'),
      fs = require('fs-extra');

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

module.exports = function(){
    const projectPath = './test/sample_project',
          compiledCssFile = `${projectPath}/_site/latest/styles/doc.css`;

    describe('styles', function(){
      describe('styles:precompile', function(){
        beforeEach(function() {
          return gulp('clean:webroot')
            .then(result => gulp('tokens:build:all'));
        });

        it('should be able to compile styles with tokens', function() {
          return gulp(`styles:precompile:${c.productTaskName}`)
            .then(result => {
              assert.fileContent(compiledCssFile, `.${c.codeNamespace}-nav {`);
              assert.fileContent(compiledCssFile, 'border: solid 3px #000;');
            });
        });

        it('should be able to compile styles with tokens accessed via sass maps', function() {
          return gulp(`styles:precompile:${c.productTaskName}`)
            .then(result => {
              assert.fileContent(compiledCssFile, `.map-testing {`);
              assert.fileContent(compiledCssFile, 'fill: #0ff;');
              assert.fileContent(compiledCssFile, 'border: solid 10px #ff0000;');
            });
        });

        it('should be able to compile the primary Product styles using tokens from a dependency', function(){
          return gulp(`styles:precompile:${c.productTaskName}`)
            .then(result => {
              assert.fileContent(compiledCssFile, `.${c.codeNamespace}-nav {`);
              assert.fileContent(compiledCssFile, 'content: "content token in product-a";'); // token from dependency
            });
        });


        it('should be able to compile all styles with one composite gulp task', function() {
          return gulp('styles:precompile:all')
            .then(result => {
              assert.file(compiledCssFile);
            });
        });
      });

      describe('styles:lint', function(){
        it('should be able to lint styles', function() {
          return gulp(`styles:lint:${c.productTaskName}`)
            .then(result => {
              assert(result.stdout.includes('warning  Color \'lemonchiffon\' should be written in its hexadecimal form #fffacd'));
            });
        });

        it('should be able to lint all styles with one composite gulp task', function() {
          return gulp('styles:lint:all')
            .then(result => {
              assert(result.stdout.includes('warning  Color \'lemonchiffon\' should be written in its hexadecimal form #fffacd'));
            });
        });

        it('should get an empty set of sass lint options that does not include a lint config file when the config file does not exist', function(){
          const nonExistentConfigPath = './path/does/not/exist',
                stylesTasks = require('../tasks/styles.js'),
                taskConfig = {
                  lintOptions: {
                    configFile: nonExistentConfigPath
                  }
                },
                lintOptions = stylesTasks.getLintOptions(taskConfig);
          assert(typeof lintOptions.configFile === 'undefined');
        });
      });

      describe('styles:postprocess', function(){
        beforeEach(function() {
          return gulp('clean:webroot')
            .then(result => gulp('tokens:build:all'));
        });

        it('should be able to auto-prefix styles with vendor-specific rules', function() {
          return gulp(`styles:precompile:${c.productTaskName}`)
            .then(result => gulp(`styles:postprocess:${c.productTaskName}`))
            .then(result => {
              assert.fileContent(compiledCssFile, '-ms-grid-row: 1;');
            });
        });
      });

      describe('styles:build', function(){
        beforeEach(function() {
          return gulp('clean:webroot')
          .then(result => gulp('tokens:build:all'));
        });

        it('should lint, precompile, and post-process styles', function() {
          return gulp(`styles:build:${c.productTaskName}`)
            .then(result => {
              assert(result.stdout.includes('warning  Color \'lemonchiffon\' should be written in its hexadecimal form #fffacd'));
              assert.fileContent(compiledCssFile, `.${c.codeNamespace}-nav {`);
              assert.fileContent(compiledCssFile, 'border: solid 3px #000;'); // token from library
              assert.fileContent(compiledCssFile, '-ms-grid-row: 1;');
            });
        });

        it('should lint, precompile, and post-process all styles', function() {
          return gulp('tokens:build:all')
            .then(result => gulp('styles:build:all'))
            .then(result => {
              assert(result.stdout.includes('warning  Color \'lemonchiffon\' should be written in its hexadecimal form #fffacd'));
              assert.file(compiledCssFile);
            });
        });
      });

      describe('when the /styles directory does not exist', function(){
        before(function(){
          fs.moveSync(`${projectPath}/styles`, `${projectPath}/moved-styles`);
        });

        after(function(){
          fs.moveSync(`${projectPath}/moved-styles`, `${projectPath}/styles`);
        });

        it('should run the styles:build:all task without failing', function() {
          return gulp('styles:build:all')
            .then(result => {
              assert(result.stdout.includes("Finished 'styles:build:all'"));
            });
        });
      });

      describe('watch:styles', function(){
        it('should watch styles for changes', function(done) {
          const watchTask = exec(`gulp watch:styles:${c.productTaskName}`); // start watch
          gulp('clean:webroot') // clear webroot
            .then(result => gulp('tokens:build:all'))
            .then(result => {
              exec(`touch ${projectPath}/styles/doc.scss`);
              recursivelyCheckForFiles([compiledCssFile], function(){
                watchTask.kill();
                done();
              });
            });
        });

        it('should rebuild styles when tokens are updated', function(done) {
          const watchTask = exec(`gulp watch:styles:${c.productTaskName}`); // start watch
          gulp('clean:webroot') // clear webroot
            .then(result => gulp('tokens:build:all'))
            .then(result => {
              exec(`touch ${projectPath}/tokens/tokens.scss`);
              recursivelyCheckForFiles([compiledCssFile], function(){
                watchTask.kill();
                done();
              });
            });
        });

        it('should run all watch:style tasks simultaneously', function(done) {
          const watchTask = exec(`gulp watch:styles:all`); // start watch
          gulp('clean:webroot') // clear webroot
            .then(result => gulp('tokens:build:all'))
            .then(result => {
              exec(`touch ${projectPath}/tokens/tokens.scss`);
              recursivelyCheckForFiles([compiledCssFile], function(){
                watchTask.kill();
                done();
              });
            });
        });

        it('should watch tokens.scss for changes and recompile', function(done){
          exec(`gulp watch:styles:tokens`); // start watch
          gulp('clean:webroot') // clear webroot
            .then(result => gulp('tokens:build:all'))
            .then(result => {
              recursivelyCheckForFiles([compiledCssFile], done);
            });
        });
      });
    });
  };

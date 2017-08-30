/* global it */
/* global it */
/* global describe */
/* global beforeEach */

'use strict';
const { exec } = require('child_process'),
      config = require('../tasks/config.js'),
      c = config.get(),
      gulp = require('./tests-gulp.js'),
      assert = require('yeoman-assert'),
      fs = require('fs');

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
    const projectPath = './tests/sample_project',
          docJsFile = `${projectPath}/_site/latest/scripts/${c.codeNamespace}.js`;

    describe('scripts', function(){
      describe('scripts:concatenate', function(){
        beforeEach(function() {
          return gulp('clean:webroot');
        });

        it('should be able to concatenate scripts', function() {
          return gulp(`scripts:concatenate:${c.productTaskName}`)
            .then(result => {
              assert.fileContent(docJsFile, 'GlobalDocFunction');
            });
        });

        it('should be able to concatenate all scripts with one composite gulp task', function() {
          return gulp('scripts:concatenate:all')
            .then(result => {
              assert.fileContent(docJsFile, 'GlobalDocFunction');
            });
        });
      });

      describe('scripts:lint', function(){
        it('should be able to lint scripts', function() {
          return gulp(`scripts:lint:${c.productTaskName}`)
            .then(result => {
              assert(result.stderr.includes('Unexpected console statement. (no-console)'));
              assert(result.stderr.includes('scripts/global.js'));
            });
        });

        it('should be able to lint all scripts with a composite lint task', function() {
          return gulp('scripts:lint:all')
            .then(result => {
              assert(result.stderr.includes('scripts/global.js'));
            });
        });

        it('should get an empty set of eslint options that does not include a lint config file when the config file does not exist', function(){
          const nonExistentConfigPath = './path/does/not/exist',
                scriptsTasks = require('../tasks/scripts.js'),
                taskConfig = {
                  lintOptions: {
                    configFile: nonExistentConfigPath
                  }
                },
                lintOptions = scriptsTasks.getLintOptions(taskConfig);
          assert(typeof lintOptions.configFile === 'undefined');
        });
      });

      describe('scripts:build', function(){
        beforeEach(function() {
          return gulp('clean:webroot');
        });

        it('should be able to lint and then concatenate scripts', function() {
          return gulp(`scripts:build:${c.productTaskName}`)
            .then(result => {
              assert(result.stderr.includes('Unexpected console statement. (no-console)'));
              assert(result.stderr.includes('scripts/global.js'));
              assert.fileContent(docJsFile, 'GlobalDocFunction');
            });
        });

        it('should be able to lint and then concatenate all scripts', function() {
          return gulp('scripts:build:all')
            .then(result => {
              assert(result.stderr.includes('scripts/global.js'));
              assert.fileContent(docJsFile, 'GlobalDocFunction');
            });
        });
      });

      describe('watch:scripts', function(){
        it('should watch scripts for changes', function(done) {
          exec(`gulp watch:scripts:${c.productTaskName}`); // start watch
          gulp('clean:webroot') // clear webroot
            .then(result => {
              exec(`touch ${projectPath}/scripts/global.js`);
              recursivelyCheckForFiles([docJsFile], done);
            });
        });

        it('should watch all scripts for changes', function(done) {
          exec(`gulp watch:scripts:all`); // start watch
          gulp('clean:webroot') // clear webroot
            .then(result => {
              exec(`touch ${projectPath}/scripts/global.js`);
              recursivelyCheckForFiles([docJsFile], done);
            });
        });
      });
    });
  };

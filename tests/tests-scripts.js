/* global it */
/* global it */
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
          return gulp('clean:webroot');
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

        it('should get eslint options including a lint config file when config file exists', function(){
          const existingConfigFilePath = './tests/sample_project/node_modules/library-component-module/.eslintrc',
                scriptsTasks = require('../tasks/scripts.js'),
                taskConfig = {
                  lintOptions: {
                    configFile: existingConfigFilePath
                  }
                },
                lintOptions = scriptsTasks.getLintOptions(taskConfig);
          assert(lintOptions.configFile === existingConfigFilePath);
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

        it('should be able to lint and then concatenate "library" scripts', function() {
          return gulp('scripts:build:components')
            .then(result => {
              assert(result.stderr.includes('Unexpected console statement. (no-console)'));
              assert(result.stderr.includes('components/button/button.js'));
              assert.fileContent(componentsJsFile, 'Uds.Button');
              assert.fileContent(componentsJsFile, 'globalFunctionHelper');
            });
        });

        it('should be able to lint and then concatenate "doc library" scripts', function() {
          return gulp('scripts:build:doc-components')
            .then(result => {
              assert(result.stderr.includes('Unexpected console statement. (no-console)'));
              assert(result.stderr.includes('components/code_snippet/code_snippet.js'));
              assert.fileContent(docComponentsJsFile, 'DocLibrary.CodeSnippet');
              assert.fileContent(docComponentsJsFile, 'Global8SHelper');
            });
        });

        it('should be able to lint and then concatenate "doc" scripts', function() {
          return gulp('scripts:build:doc')
            .then(result => {
              assert(result.stderr.includes('Unexpected console statement. (no-console)'));
              assert(result.stderr.includes('scripts/global.js'));
              assert.fileContent(docJsFile, 'GlobalDocFunction');
            });
        });

        it('should be able to lint and then concatenate all scripts', function() {
          return gulp('scripts:build:all')
            .then(result => {
              assert(result.stderr.includes('components/button/button.js'));
              assert(result.stderr.includes('components/code_snippet/code_snippet.js'));
              assert(result.stderr.includes('scripts/global.js'));
              assert.fileContent(componentsJsFile, 'Uds.Button');
              assert.fileContent(componentsJsFile, 'globalFunctionHelper');
              assert.fileContent(docComponentsJsFile, 'DocLibrary.CodeSnippet');
              assert.fileContent(docComponentsJsFile, 'Global8SHelper');
              assert.fileContent(docJsFile, 'GlobalDocFunction');
            });
        });
      });

      describe('watch:scripts', function(){
        it('should watch "library" scripts for changes', function(done) {
          exec(`gulp watch:scripts:components`); // start watch
          gulp('clean:webroot') // clear webroot
            .then(result => {
              exec(`touch ${projectPath}/node_modules/library-component-module/components/button/button.js`);
              recursivelyCheckForFiles([componentsJsFile], done);
            });
        });

        it('should watch "doc library" scripts for changes', function(done) {
          exec(`gulp watch:scripts:doc-components`); // start watch
          gulp('clean:webroot') // clear webroot
            .then(result => {
              exec(`touch ${projectPath}/node_modules/doc-component-module/components/code_snippet/code_snippet.js`);
              recursivelyCheckForFiles([docComponentsJsFile], done);
            });
        });

        it('should watch "doc" scripts for changes', function(done) {
          exec(`gulp watch:scripts:doc`); // start watch
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
              exec(`touch ${projectPath}/node_modules/library-component-module/components/button/button.js`);
              exec(`touch ${projectPath}/node_modules/doc-component-module/components/code_snippet/code_snippet.js`);
              exec(`touch ${projectPath}/scripts/global.js`);
              recursivelyCheckForFiles([docJsFile, docComponentsJsFile, componentsJsFile], done);
            });
        });
      });
    });
  };

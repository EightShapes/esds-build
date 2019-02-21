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
      tokensTasks = require('../tasks/tokens.js'),
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
    // const projectPath = './test/sample_project',
    //       tokensPath = `${projectPath}/tokens`,
    //       altTokensScss = `${tokensPath}/alt_tokens.scss`,
    //       tokensScss = `${tokensPath}/tokens.scss`,
    //       tokensJson = `${tokensPath}/tokens.json`;
    //
    // describe('tokens:build', function(){
    //   beforeEach(function() {
    //     return gulp('clean:tokens');
    //   });
    //
    //   it('should convert tokens.yaml to scss (with !default) and json and include codeNamespace from config', function() {
    //     return gulp('tokens:build:all')
    //       .then(result => {
    //         assert.fileContent(tokensScss, `$${c.codeNamespace}-color-interactive-primary: #0ff !default;`);
    //         assert.fileContent(tokensScss, `$esds-namespace: "${c.codeNamespace}"`);
    //         assert.fileContent(tokensJson, '"esds_tokens": {');
    //         assert.fileContent(tokensJson, `"namespace": "${c.codeNamespace}"`);
    //         assert.fileContent(tokensJson, '"primary": "#0ff"');
    //       });
    //   });
    //
    //   it('should convert tokens.yaml to a nested sass map', function() {
    //     return gulp('tokens:build:all')
    //       .then(result => {
    //         assert.fileContent(tokensScss, `$${c.codeNamespace}-tokens: (`);
    //         assert.fileContent(altTokensScss, `$${c.codeNamespace}-alt-tokens: (`);
    //       });
    //   });
    //
    //   it('should wrap sass map values in quotes if the value contains a comma or a space', function() {
    //     return gulp('tokens:build:all')
    //       .then(result => {
    //         assert.fileContent(tokensScss, `'sans-serif': $esds-font-sans-serif`);
    //       });
    //   });
    //
    //   it('should return a warning when the tokens.yaml source file does not exist', function(){
    //     tokensTasks.convertTokensYaml('/path/does/not/exist', function(){});
    //     assert.noFile(`${tokensPath}/tokens.json`);
    //     assert.noFile(`${tokensPath}/tokens.scss`);
    //   });
    // });
    //
    // describe('when the /tokens directory does not exist', function(){
    //   before(function(){
    //     fs.moveSync(`${projectPath}/tokens`, `${projectPath}/moved-tokens`);
    //   });
    //
    //   after(function(){
    //     fs.moveSync(`${projectPath}/moved-tokens`, `${projectPath}/tokens`);
    //   });
    //
    //   it('should run the tokens:build:all task without failing', function() {
    //     return gulp('tokens:build:all')
    //       .then(result => {
    //         assert(result.stdout.includes("Finished 'tokens:build:all'"));
    //       });
    //   });
    // });
    //
    // describe('watch:tokens', function(){
    //   // Skipping watch tests for now, causing intermittent failures on TravisCI
    //   xit('should watch tokens.yaml for changes and rebuild scss and json', function(done){
    //     exec(`gulp watch:tokens:all`); // start watch
    //     gulp('clean:tokens') // clear webroot
    //       .then(result => {
    //         exec(`touch ${tokensPath}/tokens.yaml`);
    //         recursivelyCheckForFiles([
    //           `${tokensPath}/tokens.json`,
    //           `${tokensPath}/tokens.scss`], done);
    //       });
    //   });
    // });
    //
    // describe('invalid tokens file', function(){
    //   it('should return an empty object when parsing an empty tokens file', function(){
    //     const tokens = tokensTasks.tokensToJson(`${process.cwd()}/test/sample_project/empty-tokens/empty-tokens.yaml`),
    //           keys = Object.keys(tokens);
    //     assert(typeof tokens === 'object');
    //     assert(keys.length === 0);
    //   });
    //
    //   it('should return an empty object when parsing a tokens file that contains the text "tokens.yaml"', function(){
    //     const tokens = tokensTasks.tokensToJson(`${process.cwd()}/test/sample_project/invalid-tokens/invalid-tokens.yaml`),
    //           keys = Object.keys(tokens);
    //     assert(typeof tokens === 'object');
    //     assert(keys.length === 0);
    //   });
    // });
};

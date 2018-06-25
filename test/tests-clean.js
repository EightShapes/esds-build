/* global it */
/* global xit */
/* global describe */
/* global beforeEach */

'use strict';
const gulp = require('./tests-gulp.js'),
      assert = require('yeoman-assert'),
      fs = require('fs'),
      del = require('del'),
      path = require('path'),
      mkdirp = require('mkdirp');

module.exports = function(){
    const projectPath = './test/sample_project',
          tokensPath = `${projectPath}/tokens`,
          dist = `${projectPath}/dist`;

    describe('clean:dist', function(){

      it('should delete all the files in dist', function() {
        const testFilename = `${dist}/some-random-file.txt`;
        mkdirp.sync(dist);
        fs.writeFileSync(testFilename, 'blah blah blah');

        return gulp('clean:dist')
          .then(result => {
            assert.noFile(testFilename);
          });
      });
    });

    describe('clean:tokens', function(){
      it('should delete any tokens file except tokens.yaml', function(){
        const tokensScssFilename = `${tokensPath}/tokens.scss`,
              tokensJsonFilename = `${tokensPath}/tokens.json`,
              tokensYamlFilename = `${tokensPath}/tokens.yaml`;

        mkdirp.sync(tokensPath);
        fs.writeFileSync(tokensScssFilename, 'tokens scss');
        fs.writeFileSync(tokensJsonFilename, 'tokens json');

        return gulp('clean:tokens')
          .then(result => {
            assert.noFile(tokensScssFilename);
            assert.noFile(tokensJsonFilename);
            assert.file(tokensYamlFilename);
          });
      });
    });

    describe('clean:concatenated-macros', function(){
      it('should delete all concatenated macro files', function(){
        const configDefaults = require('../esds-build-config.js');
        const concatenatedComponentsFilename = `${projectPath}/components/${configDefaults.codeNamespace}.njk`;
        mkdirp.sync(path.join(projectPath, 'components'));

        fs.writeFileSync(concatenatedComponentsFilename, 'concatenated macros');

        return gulp('clean:concatenated-macros')
          .then(result => {
            assert.noFile(concatenatedComponentsFilename);
          });
      });
    });

    describe('clean:webroot', function(){
      it('should delete all files in the project webroot', function(){
        const webroot = `${projectPath}/_site/latest`,
              webrootFile = `${webroot}/index.html`,
              webrootDirectory = `${webroot}/styles`;

        mkdirp.sync(webroot);
        mkdirp.sync(webrootDirectory);
        fs.writeFileSync(webrootFile, 'Homepage goes here');
        fs.writeFileSync(`${webrootDirectory}/esds.css`, 'Component Library CSS goes here');

        return gulp('clean:webroot')
          .then(result => {
            assert.noFile(webrootFile);
            assert.noFile(`${webrootDirectory}/esds.css`);
          });
      });
    });

    describe('clean:webroot outside of project root', function(){
      it('should delete all files in the project webroot even when the project webroot is outside of the project directory', function(){
        fs.copyFileSync('esds-build-config.js', 'esds-build-config.js.original');
        del('esds-build-config.js');
        const alternateWebrootConfig = JSON.stringify({rootPath: "test/sample_project/", webroot: "../outside-webroot-docs", latestVersionPath: ""});
        fs.writeFileSync('esds-build-config.json', alternateWebrootConfig);
        const webroot = `${projectPath}/../outside-webroot-docs`,
              webrootFile = `${webroot}/index.html`,
              webrootDirectory = `${webroot}/styles`;

        mkdirp.sync(webroot);
        mkdirp.sync(webrootDirectory);
        fs.writeFileSync(webrootFile, 'Homepage goes here');
        fs.writeFileSync(`${webrootDirectory}/esds.css`, 'Component Library CSS goes here');

        return gulp('clean:webroot')
          .then(result => {
            assert.noFile(webrootFile);
            assert.noFile(`${webrootDirectory}/esds.css`);
            fs.copyFileSync('esds-build-config.js.original', 'esds-build-config.js');
            del('esds-build-config.js.original');
            del('test/outside-webroot-docs');
            del('esds-build-config.json');
          });
      });
    });

    describe('lifecycle hooks', function(){
      it('should run a lifecycle task BEFORE running clean:webroot', function(done) {
        gulp(' clean:webroot')
        .then(result => {
          const output = result.stdout;
          assert(output.indexOf('Do this before cleaning up the webroot!') !== -1);
          done();
        });
      });

      it('should run a lifecycle task AFTER running clean:webroot', function(done) {
        gulp(' clean:webroot')
        .then(result => {
          const output = result.stdout;
          assert(output.indexOf('A little post webroot cleaning task') !== -1);
          done();
        });
      });
    });
};

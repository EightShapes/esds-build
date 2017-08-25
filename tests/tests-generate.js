/* global it */
/* global xit */
/* global describe */
/* global after */
/* global beforeEach */

'use strict';
const gulp = require('./tests-gulp.js'),
      assert = require('yeoman-assert'),
      del = require('del'),
      fs = require('fs'),
      scaffoldDir = './tests/scaffold_test';

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
    describe('generate:scaffold', function(){
      after(function() {
        return del(scaffoldDir);
      });

      it('should generate a project scaffold with top level directories and basic files', function() {
        const generate = require('../tasks/generate.js'),
              defaultProjectDirectories = [
                'components',
                'data',
                'dist',
                'docs',
                'icons',
                'images',
                'includes',
                'scripts',
                'styles',
                'templates',
                'tests',
                'tokens'
            ];
        generate.createTopLevelDirectories(scaffoldDir);
        defaultProjectDirectories.forEach(dir => assert.file(`${scaffoldDir}/${dir}`));
        assert.fileContent(`${scaffoldDir}/docs/index.njk`, '<h1>Design System</h1>');
      });
    });

    describe('generate:default-config', function(){
      after(function() {
        return del(scaffoldDir);
      });

      it('should generate a default config', function() {
        const generate = require('../tasks/generate.js');
        generate.copyDefaultConfig(scaffoldDir);
        assert.file(`${scaffoldDir}/uds-build-tools-config.js`);

        const defaultConfig = require(`${__dirname}/scaffold_test/uds-build-tools-config.js`);
        assert(defaultConfig.rootPath.includes('/uds-build-tools'));
        assert(defaultConfig.webroot === '_site');
      });
    });

    describe('generate:new-component', function(){
      after(function() {
        return del(scaffoldDir);
      });

      it('should generate default component files', function(done) {
        const generate = require('../tasks/generate.js');
        generate.generateComponentFiles({componentName: 'Data Table', componentJavascript: true}, scaffoldDir);

          recursivelyCheckForFiles([
            `${scaffoldDir}/components/data_table/data_table.njk`,
            `${scaffoldDir}/components/data_table/data_table.scss`,
            `${scaffoldDir}/components/data_table/data_table.js`,
            `${scaffoldDir}/docs/sink-pages/components/data-tables.njk`
          ], done);
      });
    });
};

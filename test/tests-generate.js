/* global it */
/* global xit */
/* global describe */
/* global after */
/* global beforeEach */

'use strict';
const assert = require('yeoman-assert'),
      del = require('del'),
      fs = require('fs'),
      scaffoldDir = './test/scaffold_test';

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
                'scripts',
                'styles',
                'templates',
                'test',
                'tokens'
            ];
        generate.createTopLevelDirectories(scaffoldDir);
        defaultProjectDirectories.forEach(dir => assert.file(`${scaffoldDir}/${dir}`));
        assert.fileContent(`${scaffoldDir}/docs/index.njk`, '<h1>Design System</h1>');
        assert.fileContent(`${scaffoldDir}/.gitignore`, '/_site');
        assert.fileContent(`${scaffoldDir}/.gitignore`, 'node_modules');
        assert.fileContent(`${scaffoldDir}/.gitignore`, '/dist');
        assert.noFileContent(`${scaffoldDir}/.npmignore`, '/dist'); // npm package SHOULD contain /dist
      });
    });

    describe('generate:default-config', function(){
      after(function() {
        return del(scaffoldDir);
      });

      it('should generate a default config', function() {
        const generate = require('../tasks/generate.js');
        generate.copyDefaultConfig(scaffoldDir);
        assert.file(`${scaffoldDir}/eightshapes-build-tools-config.js`);

        const defaultConfig = require(`${__dirname}/scaffold_test/eightshapes-build-tools-config.js`);
        assert(defaultConfig.rootPath.includes('/esds-build'));
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

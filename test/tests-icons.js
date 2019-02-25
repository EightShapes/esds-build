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
        assert = require('yeoman-assert'),
        gulp = require('./tests-gulp.js'),
        del = require('del'),
        fs = require('fs-extra'),
        path = require('path'),
        projectPath = './test/sample_project',
        webroot = `${projectPath}/_site/latest`,
        webrootIcons = `${webroot}/icons`,
        unoptimizedSVGSource = '<?xml version="1.0" encoding="utf-8"?><!-- Generator: Adobe Illustrator 16.0.4, SVG Export Plug-In . SVG Version: 6.00 Build 0)  --><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="28px" height="28px" viewBox="0 0 28 28" stroke="currentColor" enable-background="new 0 0 28 28" xml:space="preserve"><circle cx="12.223" cy="5.613" r="2.967"/><rect x="10.137" y="7.273" width="4.171" height="6.002"/></svg>',
        unoptimizedSVGPath = path.join(projectPath, 'icons', 'unoptimized-user.svg'),
        compiledIconsFile = path.join(webroot, 'icons', `${c.codeNamespace}.svg`);

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
    describe('icons:optimize', function(){
        beforeEach(function(){
            fs.writeFileSync(unoptimizedSVGPath, unoptimizedSVGSource);
            return gulp('clean:webroot');
        });

        afterEach(function(){
            return del(unoptimizedSVGPath);
        });

        it('should optimize svgs inline', function() {
            return gulp(`icons:optimize:${c.productTaskName}`)
                .then(result => {
                    assert.noFileContent(`${projectPath}/icons/unoptimized-user.svg`, 'Adobe Illustrator');
                });
        });

        it('should optimize svgs using a custom svgmin config', function() {
            return gulp(`icons:optimize:${c.productTaskName}`)
                .then(result => {
                    assert.noFileContent(`${projectPath}/icons/unoptimized-user.svg`, 'stroke="currentColor"');
                });
        });
    });

    describe('icons:concatenate', function(){
        beforeEach(function(){
            return gulp('clean:webroot');
        });

        it('should concatenate source svgs into a single icon sprite', function() {
            return gulp(`icons:concatenate:${c.productTaskName}`)
                .then(result => {
                    assert.fileContent(`${webrootIcons}/${c.codeNamespace}.svg`, 'id="user"');
                    assert.fileContent(`${webrootIcons}/${c.codeNamespace}.svg`, 'id="heart"');
                });
        });
    });

    describe('icons:build', function(){
        beforeEach(function(){
            fs.writeFileSync(unoptimizedSVGPath, unoptimizedSVGSource);
            return gulp('clean:webroot');
        });

        afterEach(function(){
            return del(unoptimizedSVGPath);
        });

       it('should optimize and concatenate source svgs into a single icon sprite', function() {
           return gulp(`icons:build:${c.productTaskName}`)
               .then(result => {
                   assert.fileContent(`${webrootIcons}/${c.codeNamespace}.svg`, 'id="user"');
                   assert.fileContent(`${webrootIcons}/${c.codeNamespace}.svg`, 'id="heart"');
                   assert.fileContent(`${webrootIcons}/${c.codeNamespace}.svg`, 'id="unoptimized-user"');
                   assert.noFileContent(`${webrootIcons}/${c.codeNamespace}.svg`, 'Adobe Illustrator');
               });
        });

       it('should optimize and concatenate all svg tasks in one composite task', function() {
        return gulp(`icons:build:all`)
            .then(result => {
                assert.fileContent(`${webrootIcons}/${c.codeNamespace}.svg`, 'id="user"');
                assert.fileContent(`${webrootIcons}/${c.codeNamespace}.svg`, 'id="heart"');
                assert.fileContent(`${webrootIcons}/${c.codeNamespace}.svg`, 'id="unoptimized-user"');
                assert.noFileContent(`${webrootIcons}/${c.codeNamespace}.svg`, 'Adobe Illustrator');
            });
       });
    });

    describe('icons:generate-manifest', function(){
      it('should generate an array containing the name of each of the SVGs in the /icons directory ordered alphabetically', function(){
        const iconsTasks = require('../tasks/icons.js'),
              manifest = iconsTasks.getIconNamesManifest();
        assert.equal(manifest[0], 'heart');
        assert.equal(manifest[1], 'user');
      });

      it('should write the array of icon names to data/icons.json', function(){
        const iconsTasks = require('../tasks/icons.js'),
              expectedFile = path.join(projectPath, 'data', 'icons.json');

        iconsTasks.generateIconNameManifestFile();

        assert.fileContent(expectedFile, '["heart","user"]');
      });

      it('should create a task to generate the manifest file', function(){
        return gulp('--tasks')
          .then(result => {
            assert(result.stdout.includes('icons:manifest:esds-build'));
          });
      });
    });

    describe('when the /icons directory does not exist', function(){
      before(function(){
        fs.moveSync(`${projectPath}/icons`, `${projectPath}/moved-icons`);
      });

      after(function(){
        fs.moveSync(`${projectPath}/moved-icons`, `${projectPath}/icons`);
      });

      it('should run the icons:build:all task without failing, and not generate an icons.json file', function() {
        del(`${projectPath}/data/icons.json`);
        return gulp('icons:build:all')
          .then(result => {
            assert(result.stdout.includes("Finished 'icons:build:all'"));
            assert.noFile(`${projectPath}/data/icons.json`);
          });
      });
    });

    describe('icons:watch', function(){
        beforeEach(function(){
            return gulp('clean:webroot');
        });

        // Skipping failing watch tasks for now
        xit('should watch icons for changes', function(done) {
          exec(`gulp watch:icons:${c.productTaskName}`); // start watch
          gulp('clean:webroot') // clear webroot
            .then(result => {
              exec(`touch ${projectPath}/icons/user.svg`);
              recursivelyCheckForFiles([compiledIconsFile], done);
            });
        });

        // Skipping failing watch tasks for now
        xit('should watch all icons for changes and build respective sprites', function(done) {
          exec(`gulp watch:icons:all`); // start watch
          gulp('clean:webroot') // clear webroot
            .then(result => {
              exec(`touch ${projectPath}/icons/user.svg`);
              recursivelyCheckForFiles([compiledIconsFile], done);
            });
        });
    });
};

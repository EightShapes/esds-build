/* global it */
/* global xit */
/* global describe */
/* global beforeEach */
/* global before */

'use strict';
const assert = require('yeoman-assert'),
        gulp = require('./tests-gulp.js'),
        fs = require('fs'),
        del = require('del'),
        path = require('path'),
        mkdirp = require('mkdirp'),
        projectPath = './test/sample_project',
        webroot = `${projectPath}/_site/latest`,
        webrootImages = `${webroot}/images`;

module.exports = function(){
    describe('copy', function(){
        describe('copy:images', function(){
            beforeEach(function(){
                return gulp('clean:webroot');
            });

            it('should copy images to the webroot', function(done) {
                gulp('copy:images')
                    .then(result => {
                        assert.file(`${webrootImages}/eightshapes_logo.png`);
                        assert.file(`${webrootImages}/components/button/eightshapes_logo_for_component.png`);
                        done();
                    });
            });
        });

        describe('watch task generation', function(){
            it('should have a watch task to monitor changes to copied files and re-copy when updated', function() {
                return gulp('--tasks')
                  .then(result => {
                    assert(result.stdout.includes('watch:copy:images'));
                    assert(result.stdout.includes('watch:copy:dist'));
                    assert(result.stdout.includes('watch:copy:random-dependencies'));
                  });
            });
        });

        describe('copying named assets to fonts directory', function(){
            beforeEach(function(){
                return gulp('clean:webroot');
            });

            it('should copy miscellaneous files specified in the build config', function(done) {
                gulp('copy:fonts')
                    .then(result => {
                        assert.file(`${webroot}/fonts/font-format-1.woff`);
                        assert.file(`${webroot}/fonts/font-format-2.ttf`);
                        // assert.file(`${webroot}/scripts/dependencies/random-file-to-be-copied.js`);
                        done();
                    });
            });
        });

        describe('copying dependencies to a dependencies directory', function(){
            beforeEach(function(){
                return gulp('clean:webroot');
            });

            it('should copy random dependencies specified in the build config', function(done) {
                gulp('copy:random-dependencies')
                    .then(result => {
                        assert.file(`${webroot}/scripts/dependencies/random-file-to-be-copied.js`);
                        done();
                    });
            });

            it('should allow copied dependencies to be renamed based on the build config', function(done) {
                gulp('copy:renamed-dependencies')
                    .then(result => {
                        assert.file(`${webroot}/scripts/dependencies/this-file-was-renamed.js`);
                        done();
                    });
            });

            it('should allow copied dependencies to be ZIPed based on the build config', function() {
                return gulp('copy:zip-these-files')
                    .then(result => {
                        assert.file(`${webroot}/icons/my-icons-zipped.zip`);
                        assert(fs.lstatSync(`${webroot}/icons/my-icons-zipped.zip`).isFile());
                    });
            });
        });

        describe('copying default dist assets to a dist directory', function(){
            beforeEach(function(){
                return gulp('clean:webroot')
                        .then(result => gulp('clean:dist'));
            });

            it('should copy compiled css, js, and svg sprite to /dist directory', function() {
                return gulp('tokens:build:all')
                    .then(result => gulp('styles:build:all'))
                    .then(result => gulp('scripts:build:all'))
                    .then(result => gulp('icons:build:all'))
                    .then(result => gulp('copy:dist'))
                    .then(result => {
                        assert.file(`${projectPath}/dist/esds.js`);
                        assert.file(`${projectPath}/dist/esds.svg`);
                        assert.file(`${projectPath}/dist/doc.css`);
                    });
            });

            it('should not blow up the build when any of the expected dist assets cannot be copied', function(){
                mkdirp.sync(`${webroot}/icons`);
                fs.writeFileSync(`${webroot}/icons/esds.svg`, '<xml stuff here/>');
                return gulp('copy:dist')
                    .then(result => {
                        assert.noFile(`${projectPath}/dist/esds.js`); // JS not copied
                        assert.noFile(`${projectPath}/dist/doc.css`); // CSS not copied
                        assert.file(`${projectPath}/dist/esds.svg`); // SVG is copied because it exists
                    });
            });
        });

        describe('copying doc pages from a child module into a parent module', function() {
            this.timeout(120000);

            before(function(){
                del.sync(path.join(projectPath, 'node_modules', 'product-a', 'node_modules'));
            });

            it('should copy compiled child module docs to the parent module docs folder', function(){
                return gulp('copy:product-a:docs')
                    .then(result => {
                        assert.fileContent(path.join(webroot, 'sink-pages', 'components', 'buttons.html'), 'This is the Buttons Sink');
                    });
            });

            it('should allow regex replacements of copied child module doc content', function(){
                return gulp('copy:product-a:docs')
                    .then(result => {
                        assert.fileContent(path.join(webroot, 'sink-pages', 'components', 'buttons.html'), '/styles/dependencies/product-a.css');
                        assert.fileContent(path.join(webroot, 'sink-pages', 'components', 'buttons.html'), '/styles/dependencies/product_as_scripts.js');
                        assert.fileContent(path.join(webroot, 'sink-pages', 'components', 'buttons.html'), '/icons/dependencies/product_a.svg#stopwatch');
                    });
            });
        });
    });
};

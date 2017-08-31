/* global it */
/* global xit */
/* global describe */
/* global beforeEach */

'use strict';
const assert = require('yeoman-assert'),
gulp = require('./tests-gulp.js'),
        projectPath = './tests/sample_project',
        webroot = `${projectPath}/_site/latest`,
        webrootImages = `${webroot}/images`;

module.exports = function(){
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

    describe('copying random dependencies to a dependencies directory', function(){
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
    });

    describe('copying default dist assets to a dist directory', function(){
        beforeEach(function(){
            return gulp('clean:dist')
                .then(result => gulp('tokens:build:all'))
                .then(result => gulp('styles:build:all'))
                .then(result => gulp('scripts:build:all'))
                .then(result => gulp('icons:build:all'))
                .then(result => gulp('copy:dist'));
        });

        it('should copy compiled css, js, and svg sprite to /dist directory', function() {
            assert.file(`${projectPath}/dist/esds.js`);
            assert.file(`${projectPath}/dist/esds.svg`);
            assert.file(`${projectPath}/dist/doc.css`);
        });
    });
};

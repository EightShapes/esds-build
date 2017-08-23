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
};

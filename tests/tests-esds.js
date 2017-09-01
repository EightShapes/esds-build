/* global it */
/* global xit */
/* global describe */
/* global beforeEach */

'use strict';
const assert = require('yeoman-assert'),
        gulp = require('./tests-gulp.js');

module.exports = function(){
    describe('top-level composite tasks', function(){
        it('should define top level tasks', function(done) {
            gulp(' --tasks')
                .then(result => {
                    const output = result.stdout;
                    assert(output.indexOf('watch:all') !== -1);
                    assert(output.indexOf('watch:markup:all') !== -1);
                    assert(output.indexOf('watch:tokens:all') !== -1);
                    assert(output.indexOf('build:all') !== -1);
                    assert(output.indexOf('clean:webroot') !== -1);
                    assert(output.indexOf('tokens:build:all') !== -1);
                    assert(output.indexOf('copy:all') !== -1);
                    assert(output.indexOf('scripts:build:all') !== -1);
                    assert(output.indexOf('styles:build:all') !== -1);
                    assert(output.indexOf('icons:build:all') !== -1);
                    assert(output.indexOf('markup:concatenate:macros:all') !== -1);
                    assert(output.indexOf('markup:build:all') !== -1);
                    assert(output.indexOf('copy:dist') !== -1);
                    assert(output.indexOf('serve:local-docs') !== -1);
                    done();
                });
        });
    });
};

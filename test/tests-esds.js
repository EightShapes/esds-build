/* global it */
/* global xit */
/* global describe */
/* global beforeEach */

'use strict';
const assert = require('yeoman-assert'),
        gulp = require('./tests-gulp.js'),
        del = require('del'),
        fs = require('fs');

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

        it('allow additional watch tasks to be injected via the build config', function(done) {
            fs.copyFileSync('esds-build-config.js', 'esds-build-config.js.original');
            del('esds-build-config.js');
            const watcherConfig = JSON.stringify({additionalWatchTasks: ["watch:something-special"]});
            fs.writeFileSync('esds-build-config.json', watcherConfig);
            gulp(' --tasks')
                .then(result => {
                    const output = result.stdout;
                    fs.copyFileSync('esds-build-config.js.original', 'esds-build-config.js');
                    del('esds-build-config.js.original');
                    // del('esds-build-config.json');
                    assert(output.indexOf('watch:something-special') !== -1);
                    done();
                });
        });
    });
};

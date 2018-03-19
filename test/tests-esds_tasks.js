/* global it */
/* global xit */
/* global describe */
/* global after */
/* global beforeEach */

'use strict';
const assert = require('yeoman-assert'),
      del = require('del'),
      fs = require('fs'),
      mkdirp = require('mkdirp'),
      path = require('path'),
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
    describe('prebuild task', function(){
      beforeEach(function() {
        return del(scaffoldDir);
      });

      after(function() {
        return del(scaffoldDir);
      });

      it('should allow a defined gulpfile.js task to be run before build:all', function() {

      });
    });
};

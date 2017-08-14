'use strict';

const styleTests = require('./tests-styles.js');
styleTests();

// var assert = require('assert');
// describe('Array', function() {
//   describe('#indexOf()', function() {
//     it('should return -1 when the value is not present', function() {
//       assert.equal(-1, [1,2,3].indexOf(4));
//     });
//   });
// });





// gulp('clean:dist').then(function(){
//   assert.noFile(componentsCssFile);
//   // assert.fileContent(componentsCssFile, '.uds-button {');
//   // assert.fileContent(componentsCssFile, 'background: #00ffff');
// }, handlePromiseRejection).then();





// var Promise = require('bluebird');
// var exec = require('child_process').execFile;

// function promiseFromChildProcess(child) {
//     return new Promise(function (resolve, reject) {
//         child.addListener("error", reject);
//         child.addListener("exit", resolve);
//     });
// }

// var child = exec('ls');

// promiseFromChildProcess(child).then(function (result) {
//     console.log('promise complete: ' + result);
// }, function (err) {
//     console.log('promise rejected: ' + err);
// });

// child.stdout.on('data', function (data) {
//     console.log('stdout: ' + data);
// });
// child.stderr.on('data', function (data) {
//     console.log('stderr: ' + data);
// });
// child.on('close', function (code) {
//     console.log('closing code: ' + code);
// });












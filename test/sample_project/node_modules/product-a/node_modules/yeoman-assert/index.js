/**
 * Collection of test assertions helpers
 *
 * It mixes in the native node.js `assert` module. So you can just use this module as a
 * drop-in replacement.
 *
 * @mixes nodejs/assert
 * @example
 *   var assert = require('yeoman-assert');
 */
'use strict';
const fs = require('fs');
const pathExists = fs.existsSync;

const isFunction = obj => typeof obj === 'function';
const isObject = obj => typeof obj === 'object' && obj !== null && obj !== undefined;

function extractMethods(methods) {
  return Array.isArray(methods) ? methods : Object.keys(methods).filter(method => isFunction(methods[method]));
}

function convertArgs(args) {
  if (args.length > 1) {
    return [Array.from(args)];
  }

  const arg = args[0];
  return Array.isArray(arg) ? arg : [arg];
}

function readFile(filename, json) {
  const file = fs.readFileSync(filename, 'utf8');
  return json ? JSON.parse(file) : file;
}

// Extend the native assert module
const assert = module.exports = require('assert');

/**
 * Assert that a file exists
 * @param {String}       path     - path to a file
 * @example
 * assert.file('templates/user.hbs');
 *
 * @also
 *
 * Assert that each files in the array exists
 * @param {Array}         paths    - an array of paths to files
 * @example
 * assert.file(['templates/user.hbs', 'templates/user/edit.hbs']);
 */

assert.file = function () {
  convertArgs(arguments).forEach(file => {
    const here = pathExists(file);
    assert.ok(here, `${file}, no such file or directory`);
  });
};

/**
 * Assert that a file doesn't exist
 * @param {String}       file     - path to a file
 * @example
 * assert.noFile('templates/user.hbs');
 *
 * @also
 *
 * Assert that each of an array of files doesn't exist
 * @param {Array}         pairs    - an array of paths to files
 * @example
 * assert.noFile(['templates/user.hbs', 'templates/user/edit.hbs']);
 */

assert.noFile = function () {
  convertArgs(arguments).forEach(file => {
    const here = pathExists(file);
    assert.ok(!here, `${file} exists`);
  });
};

/**
 * Assert that a file's content matches a regex or string
 * @param {String}       file     - path to a file
 * @param {Regex|String} reg      - regex / string that will be used to search the file
 * @example
 * assert.fileContent('models/user.js', /App\.User = DS\.Model\.extend/);
 * assert.fileContent('models/user.js', 'App.User = DS.Model.extend');
 *
 * @also
 *
 * Assert that each file in an array of file-regex pairs matches its corresponding regex
 * @param {Array}         pairs    - an array of arrays, where each subarray is a [String, RegExp] pair
 * @example
 * var arg = [
 *   [ 'models/user.js', /App\.User = DS\.Model\.extend/ ],
 *   [ 'controllers/user.js', /App\.UserController = Ember\.ObjectController\.extend/ ]
 * ]
 * assert.fileContent(arg);
 */

assert.fileContent = function () {
  convertArgs(arguments).forEach(pair => {
    const file = pair[0];
    const regex = pair[1];
    assert.file(file);
    const body = readFile(file);

    let match = false;
    if (typeof regex === 'string') {
      match = body.indexOf(regex) !== -1;
    } else {
      match = regex.test(body);
    }

    assert(match, `${file} did not match '${regex}'. Contained:\n\n${body}`);
  });
};

/**
 * Assert that a file's content is the same as the given string
 * @param {String}  file            - path to a file
 * @param {String}  expectedContent - the expected content of the file
 * @example
 * assert.equalsFileContent(
 *   'data.js',
 *   'const greeting = "Hello";\nexport default { greeting }'
 * );
 *
 * @also
 *
 * Assert that each file in an array of file-string pairs equals its corresponding string
 * @param {Array}   pairs           - an array of arrays, where each subarray is a [String, String] pair
 * @example
 * assert.equalsFileContent([
 *   ['data.js', 'const greeting = "Hello";\nexport default { greeting }'],
 *   ['user.js', 'export default {\n  name: 'Coleman',\n  age: 0\n}']
 * ]);
 */

assert.equalsFileContent = function () {
  convertArgs(arguments).forEach(pair => {
    const file = pair[0];
    const expectedContent = pair[1];
    assert.file(file);
    this.textEqual(readFile(file), expectedContent);
  });
};

/**
 * Assert that a file's content does not match a regex / string
 * @param {String}       file     - path to a file
 * @param {Regex|String} reg      - regex / string that will be used to search the file
 * @example
 * assert.noFileContent('models/user.js', /App\.User = DS\.Model\.extend/);
 * assert.noFileContent('models/user.js', 'App.User = DS.Model.extend');
 *
 * @also
 *
 * Assert that each file in an array of file-regex pairs does not match its corresponding regex
 * @param {Array}         pairs    - an array of arrays, where each subarray is a [String, RegExp] pair
 * var arg = [
 *   [ 'models/user.js', /App\.User \ DS\.Model\.extend/ ],
 *   [ 'controllers/user.js', /App\.UserController = Ember\.ObjectController\.extend/ ]
 * ]
 * assert.noFileContent(arg);
 */

assert.noFileContent = function () {
  convertArgs(arguments).forEach(pair => {
    const file = pair[0];
    const regex = pair[1];
    assert.file(file);
    const body = readFile(file);

    if (typeof regex === 'string') {
      assert.ok(body.indexOf(regex) === -1, `${file} matched '${regex}'.`);
      return;
    }

    assert.ok(!regex.test(body), `${file} matched '${regex}'.`);
  });
};

/**
 * Assert that two strings are equal after standardization of newlines
 * @param {String} value    - a string
 * @param {String} expected - the expected value of the string
 * @example
 * assert.textEqual('I have a yellow cat', 'I have a yellow cat');
 */

assert.textEqual = (value, expected) => {
  const eol = str => str.replace(/\r\n/g, '\n');

  assert.equal(eol(value), eol(expected));
};

/**
 * Assert an Object implements an interface
 * @param {Object}       subject - subject implementing the façade
 * @param {Object|Array} methods - a façace, hash or array of keys to be implemented
 */

assert.implement = (subject, methods) => {
  const pass = extractMethods(methods).filter(method => !isFunction(subject[method]));

  assert.ok(pass.length === 0, `expected object to implement methods named: ${pass.join(', ')}`);
};

/**
 * Assert an Object doesn't implements any method of an interface
 * @param {Object}       subject - subject not implementing the methods
 * @param {Object|Array} methods - hash or array of method names to be implemented
 */

assert.notImplement = (subject, methods) => {
  const pass = extractMethods(methods).filter(method => isFunction(subject[method]));

  assert.ok(pass.length === 0, `expected object to not implement any methods named: ${pass.join(', ')}`);
};

/**
 * Assert an object contains the provided keys
 * @param {Object} obj      Object that should match the given pattern
 * @param {Object} content  An object of key/values the object should contains
 */

assert.objectContent = (obj, content) => {
  Object.keys(content).forEach(key => {
    if (isObject(content[key])) {
      assert.objectContent(obj[key], content[key]);
      return;
    }

    assert.equal(obj[key], content[key]);
  });
};

/**
 * Assert an object does not contain the provided keys
 * @param {Object} obj Object that should not match the given pattern
 * @param {Object} content An object of key/values the object should not contain
 */

assert.noObjectContent = (obj, content) => {
  Object.keys(content).forEach(key => {
    if (isObject(content[key])) {
      assert.noObjectContent(obj[key], content[key]);
      return;
    }

    assert.notEqual(obj[key], content[key]);
  });
};

/**
 * Assert a JSON file contains the provided keys
 * @param {String} filename
 * @param {Object} content An object of key/values the file should contains
 */

assert.JSONFileContent = assert.jsonFileContent = (filename, content) => {
  assert.objectContent(readFile(filename, true), content);
};

/**
 * Assert a JSON file does not contain the provided keys
 * @param {String} filename
 * @param {Object} content An object of key/values the file should not contain
 */

assert.noJSONFileContent = assert.noJsonFileContent = (filename, content) => {
  assert.noObjectContent(readFile(filename, true), content);
};

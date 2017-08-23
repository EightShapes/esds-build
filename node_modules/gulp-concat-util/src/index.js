/* jshint node:true */
'use strict';

var util = require('util');
var os = require('os');
var path = require('path');
var gutil = require('gulp-util');
var extend = require('lodash.assign');
var through = require('through2');
var combine = require('stream-combiner2');
var gulpif = require('gulp-if');
var PluginError = gutil.PluginError;
var File = gutil.File;
var Concat = require('concat-with-sourcemaps');

var defaults = {
  sep: os.EOL,
  process: false,
  passthrough: false
};

var concat = module.exports = function(name, config) {

  var options = extend({}, defaults, config || {});
  var concat, firstFile, fileName;

  function parsePath(p) {
    var extname = path.extname(p);
    return {
      dirname: path.dirname(p),
      basename: path.basename(p, extname),
      extname: extname,
      sep: path.sep
    };
  }

  function combineFn(file, encoding, next) {

    // Ignore empty files
    if (file.isNull()) {
      next();
      return;
    }

    // Streams not supported
    if (file.isStream()) {
      /* jshint validthis:true */
      this.emit('error', new PluginError('gulp-concat-util',  'Streaming not supported'));
      next();
      return;
    }

    // Forward support for newLine option from gulp-concat
    if(typeof options.newLine !== 'undefined') {
      options.sep = options.newLine;
    }

    if (!firstFile) {
      firstFile = file;
      if (!name || typeof name === 'string') {
        // Default path to first file basename
        fileName = name || path.basename(file.path);
      } else if (typeof name.path === 'string') {
        // Support path as a function
        fileName = path.basename(name.path);
      } else if(typeof name === 'function') {
        // Support path as a function
        var parsedPath = parsePath(file.path);
        var result = name(parsedPath) || parsedPath;
        fileName = typeof result === 'string' ? result : result.basename + result.extname;
      } else {
        throw new PluginError('gulp-concat-util', 'Missing path');
      }
      // Initialize concat
      concat = new Concat(!!file.sourceMap, fileName, options.sep);
    }

    var contents = file.contents;
    // Support process as a function
    if(typeof options.process === 'function') {
      contents = new Buffer(options.process.call(file, contents.toString(), file.path));
    // Support process as an object fed to gutil.template
    } else if(typeof options.process === 'object')  {
      contents = new Buffer(gutil.template(contents, extend({file: file}, options.process)));
    }

    concat.add(file.relative, contents.toString(), file.sourceMap);
    if(options.passthrough) {
      /* jshint validthis:true */
      this.push(file);
    }

    next();
  }

  function flushFn(next) {
    if (firstFile) {

      var joinedFile = firstFile.clone({contents: false});

      joinedFile.path = path.join(options.cwd || firstFile.base, fileName);
      joinedFile.base = options.base || firstFile.base;
      joinedFile.contents = new Buffer(concat.content);
      joinedFile.__concat = true;

      if (concat.sourceMapping) {
        joinedFile.sourceMap = JSON.parse(concat.sourceMap);
      }

      /* jshint validthis:true */
      this.unshift(joinedFile);
    }
    next();
  }

  return through.obj(combineFn, flushFn);

};

module.exports.header = function(header, locals) {
  return through.obj(function(file, encoding, next) {
    file.contents = Buffer.concat([new Buffer(gutil.template(header, extend({file: file}, locals))), file.contents]);
    next(null, file);
  });
};

module.exports.footer = function(footer, locals) {
  return through.obj(function(file, encoding, next) {
    file.contents = Buffer.concat([file.contents, new Buffer(gutil.template(footer, extend({file: file}, locals)))]);
    next(null, file);
  });
};

function processJsSource(src) {
  /* jshint validthis:true */
  return os.EOL + '// Source: ' + this.relative + os.EOL + src.trim().replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
}

module.exports.scripts = function(name, options) {
  if(!options) options = {};
  options.process = processJsSource;
  return combine.obj(
    concat(name, options),
    gulpif(function(file) { return file.__concat; }, concat.header(['(function(window, document, undefined) {', os.EOL, '\'use strict\';', os.EOL].join(''))),
    gulpif(function(file) { return file.__concat; }, concat.footer([os.EOL, os.EOL, '})(window, document);', os.EOL].join('')))
  );
};


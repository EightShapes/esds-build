# gulp-concat-util [![Build Status](https://secure.travis-ci.org/mgcrea/gulp-concat-util.png?branch=master)](http://travis-ci.org/#!/mgcrea/gulp-concat-util)

> Gulp task to concat, prepend, append or transform files.

This implementation is relatively closes to the original [gulp-concat](https://github.com/wearefractal/gulp-concat) plugin.

However this plugin provides `.header()`, `.footer()` & `.scripts()` helpers, and provides a passthrough option used in complex build worflow.

## Getting Started

This plugin requires Gulp `^3.0.0`

If you haven't used [Gulp](http://gulpjs.com/) before, be sure to check out the [Getting Started](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md) guide, as it explains how to create a [Gulpfile](https://github.com/gulpjs/gulp/blob/master/docs/API.md) as well as install and use Gulp plugins. Once you're familiar with that , you may install this plugin with this command:

```shell
npm install gulp-concat-util --save-dev
```

Once the plugin has been installed, it may be required inside your Gulpfile with this line of JavaScript:

```js
var concat = require('gulp-concat-util');
```


## Usage

```javascript
var concat = require('gulp-concat-util');

gulp.task('concat:dist', function() {
  gulp.src('scripts/{,*/}*.js')
    .pipe(concat('combined.js'))
    .pipe(concat.header('// file: <%= file.path %>\n'))
    .pipe(concat.footer('\n// end\n'))
    .pipe(gulp.dest('dist'));
});
```

Advanced usage example, replacing any 'use strict;' statement found in the files with a single one at the top of the file

```javascript
var concat = require('gulp-concat-util');

gulp.task('concat:dist', function() {
  gulp.src('scripts/{,*/}*.js')
    .pipe(concat(pkg.name + '.js', {process: function(src, filePath) { 
      // if you need the filename, example `myFileJs.js`, path.basename( filePath, '.js' )
      return (src.trim() + '\n').replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1'); 
    }}))
    .pipe(concat.header('(function(window, document, undefined) {\n\'use strict\';\n'))
    .pipe(concat.footer('\n})(window, document);\n'))
    .pipe(gulp.dest('dist'));
});
```

Alternatively, you can use the bundled helper to concatenate scripts

```javascript
var concat = require('gulp-concat-util');

gulp.task('concat:dist', function() {
  gulp.src('scripts/{,*/}*.js')
    .pipe(concat.scripts(pkg.name + '.js'))
    .pipe(gulp.dest('dist'));
});
```


## Options

#### sep (String)

- Separator to use between concatenated files.
- Default: `require('os').EOL`
- Alias: `newLine`

#### passthrough (Boolean)

- `Boolean` - Whether initial files should pass through
- Default: `false`

#### process (Boolean/Function)

- `Boolean` - Whether a file should be processed or skipped.
- `Function` - Process source files using the given function, called once for each file. The returned value will be used as source code.
- Default: `true`


## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality.


## Authors

**Olivier Louvignes**

+ http://olouv.com
+ http://github.com/mgcrea


## Copyright and license

    The MIT License

    Copyright (c) 2014 Olivier Louvignes

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.

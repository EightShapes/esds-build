<p align="center">
  <a href="http://gulpjs.com">
    <img height="257" width="114" src="https://raw.githubusercontent.com/gulpjs/artwork/master/gulp-2x.png">
  </a>
</p>

# undertaker-forward-reference

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![AppVeyor Build Status][appveyor-image]][appveyor-url] [![Coveralls Status][coveralls-image]][coveralls-url] [![Gitter chat][gitter-image]][gitter-url]

Undertaker custom registry supporting forward referenced tasks.

## Why?

The focus of gulp 4.0 is to make the 90% use case extremely easy, but we don't want to
completely unsupport the 10% use cases. We have noticed patterns people use and things
they want to do (and have worked around), like serial execution. However, I believe
forward referenced tasks (as defined in https://github.com/gulpjs/gulp/issues/802) are
an edge case that is better handled with other patterns (coming soon: links to better
patterns). If you must use forward referenced tasks, you can set this as a custom
registry before registering any tasks.

## Example

```js
var gulp = require('gulp');
var FwdRef = require('undertaker-forward-reference');

gulp.registry(FwdRef()); // or gulp.registry(new FwdRef());

gulp.task('default', gulp.series('forward-ref'));

gulp.task('forward-ref', function(cb){
  // do task things
  cb();
});
```

## API

### `ForwardReferenceRegistry()`

Constructor for the registry. Pass an instance of this registry to `gulp.registry`.

## License

MIT

[downloads-image]: http://img.shields.io/npm/dm/undertaker-forward-reference.svg
[npm-url]: https://npmjs.com/package/undertaker-forward-reference
[npm-image]: http://img.shields.io/npm/v/undertaker-forward-reference.svg

[travis-url]: https://travis-ci.org/gulpjs/undertaker-forward-reference
[travis-image]: http://img.shields.io/travis/gulpjs/undertaker-forward-reference.svg?label=travis-ci

[appveyor-url]: https://ci.appveyor.com/project/gulpjs/undertaker-forward-reference
[appveyor-image]: https://img.shields.io/appveyor/ci/gulpjs/undertaker-forward-reference.svg?label=appveyor

[coveralls-url]: https://coveralls.io/r/gulpjs/undertaker-forward-reference
[coveralls-image]: http://img.shields.io/coveralls/gulpjs/undertaker-forward-reference/master.svg

[gitter-url]: https://gitter.im/gulpjs/gulp
[gitter-image]: https://badges.gitter.im/gulpjs/gulp.png

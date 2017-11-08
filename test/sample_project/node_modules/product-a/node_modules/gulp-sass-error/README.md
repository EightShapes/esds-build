# gulp-sass error
By default [gulp-sass](https://www.npmjs.com/package/gulp-sass) never throws a clean error exit code (1). A lot of CI systems require this exit code to fail a build. This package provides a function to do so.

## Installation
`npm install --save gulp-sass-error`

## Usage
Using es2015 modules / typescript:
```javascript
import { gulpSassError } from 'gulp-sass-error';
const throwError = true;

gulp.task('sass', () => {
    return gulp.src('web/css/*.scss')
        .pipe(
            sass()
            /** Instead of sass.logError you use gulpSassError */             
            .on('error', gulpSassError(throwError))
        )
        .pipe(postcss(config.postcss))
        .pipe(gulp.dest('web/css'));
});
```

Using require:
```javascript
const { gulpSassError } = require('gulp-sass-error');
const throwError = true;

gulp.task('sass', () => {
    return gulp.src('web/css/*.scss')
        .pipe(
            sass()
            /** Instead of sass.logError you use gulpSassError */             
            .on('error', gulpSassError(throwError))
        )
        .pipe(postcss(config.postcss))
        .pipe(gulp.dest('web/css'));
});

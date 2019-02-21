const gulp = require('gulp');

const FwdRef = require("undertaker-forward-reference");
gulp.registry(FwdRef());
gulp.task('esds-hook:prebuild:all', function(done){
  console.log("I heard you like prebuild hooks so I put a prebuild hook on your prebuild hook so you can prebuild your hook.");
  done();
});

gulp.task('esds-hook:postbuild:all', function(done){
  console.log("Tidying up, nothing to see here");
  done();
});

gulp.task('esds-hook:pre:markup:concatenate:macros:all', function(done){
  console.log("Do this before concatenating all macros");
  done();
});

gulp.task('foo', function(done){
  console.log("Bar...what did you expect?");
  done();  
});

gulp.task('esds-hook:pre:clean:webroot', function(done){
  console.log('Do this before cleaning up the webroot!');
  done();
});

gulp.task('esds-hook:post:clean:webroot', function(done){
  console.log('A little post webroot cleaning task');
  done();
});

gulp.task('test-wrapper', gulp.series('clean:webroot'));

 module.exports = gulp;
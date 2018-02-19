const gulp = require('./tasks/esds_tasks.js');

gulp.task('esds-hook:prebuild:all', function(done){
  console.log("YO, I heard you like prebuild hooks so I put a prebuild hook on your prebuild hook so you can prebuild your hook.");
  done();
});

gulp.task('esds-hook:postbuild:all', function(done){
  console.log("Tidying up, nothing to see here");
  done();
});

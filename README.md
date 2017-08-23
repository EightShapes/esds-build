# Installation Instructions
  1. Create a new node project:
  
    `npm init`
  
  2. Install required gulp dependencies:  
  
  `npm install gulp-cli --save-dev`
  
  `npm install git+https://github.com/gulpjs/gulp.git#4.0 --save-dev`
  
  3. Install this node module:
  
  `npm install uds-build-tools --save-dev`
  
  4. Create a `gulpfile.js` in the root of your project. Add the following line:
  
  `const gulp = require('uds-build-tasks')`

  5. Generate the project scaffold:
  
  `gulp generate:project-scaffold`

  6. Run the local environment:
  
  `gulp`

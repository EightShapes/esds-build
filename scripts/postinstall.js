'use strict';
const path = require('path'),
        fs = require('fs'),
    { exec } = require('child_process'),
    packageJsonPath = path.join(process.cwd(), 'package.json'),
    packageConfig = require(packageJsonPath);

console.log(packageJsonPath);

exec(`npm install gulp-cli --save-dev`);
exec(`npm install git+https://github.com/gulpjs/gulp.git#4.0 --save-dev`);

packageConfig.scripts.start = 'gulp';
fs.writeFileSync(packageJsonPath, JSON.stringify(packageConfig));

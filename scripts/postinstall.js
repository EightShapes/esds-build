'use strict';
const fs = require('fs'),
        path = require('path'),
        appRoot = require('app-root-path'),
        esdsPackageJson = require('../package.json'),
        gulpfilePath = path.join(appRoot.toString(), 'gulpfile.js');

if (!fs.existsSync(gulpfilePath)) {
    fs.writeFileSync(gulpfilePath, `const gulp = require('${esdsPackageJson.name}');`);
}

const   configFileLocation = './tests/gulp-config.js',
        config = require(configFileLocation),
        gulp = require('gulp'),
        HubRegistry = require('gulp-hub');

module.exports.config = config;
        
/* load some gulpfiles into the registry */
var hub = new HubRegistry(['./tasks/*.js']);

/* tell gulp to use the tasks just loaded */
gulp.registry(hub);

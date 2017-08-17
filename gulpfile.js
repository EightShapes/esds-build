const buildConfig = `./tests/sample_project/build-config.js`;
module.exports.config = require(buildConfig);

const gulp = require('./tasks/uds_tasks.js');

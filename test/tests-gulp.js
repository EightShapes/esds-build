'use strict';

module.exports = function gulp(gulp_command) {
            const { exec } = require('child_process'),
                    opts = {};

            return new Promise(function(resolve, reject){
                exec(`gulp ${gulp_command}`, opts,
                    (err, stdout, stderr) => err ? reject(err) : resolve({
                        stdout: stdout,
                        stderr: stderr
                    }));
            });
        };

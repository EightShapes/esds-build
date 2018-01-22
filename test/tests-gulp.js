'use strict';

module.exports = function gulp(gulp_command, directory) {
            const { exec } = require('child_process'),
                    exec_dir = typeof directory === 'undefined' ? '' : `cd ${directory} && `,
                    opts = {};

            return new Promise(function(resolve, reject){
                console.log(`${exec_dir}gulp ${gulp_command}`);
                exec(`${exec_dir}gulp ${gulp_command}`, opts,
                    (err, stdout, stderr) => err ? reject(err) : resolve({
                        stdout: stdout,
                        stderr: stderr
                    }));
            });
        };

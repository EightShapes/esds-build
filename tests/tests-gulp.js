'use strict';

module.exports = function gulp(gulp_command) {
            const { exec } = require('child_process'),
                    opts = {};


            // child.stdout.on('data', function (data) {
            //     // console.log('stdout: ' + data);
            //     stdout = data;
            // });

            // child.stderr.on('data', function (data) {
            //     console.log('stderr: ' + data);
            // });
            // child.on('close', function (code) {
            //     console.log('closing code: ' + code);
            // });

            return new Promise(function(resolve, reject){
                const child = exec(`gulp ${gulp_command}`, opts,
                    (err, stdout, stderr) => err ? reject(err) : resolve({
                        stdout: stdout,
                        stderr: stderr
                    }));

                // child.addListener("error", reject);
                // child.addListener("exit", resolve);
            });
        };

/*
 * Copyright (c) 2015. Enterprise Architecture Group, EACG
 *
 * SPDX-License-Identifier:	MIT
 */
var GLOBAL_KEYS = ['baseUrl', 'user', 'apiKey', 'requestOptions', 'verbose'];
function extend(target, options, keys) {
    keys.forEach(function(key) {
        !(key in target) && (key in options) && (target[key] = options[key]);
    });
    return target;
}

function printableOptions(options) {
    var printable = {};
    for(var key in options) {
        if(options.hasOwnProperty(key)){
            printable[key] = key === 'apiKey' ? 'xxx-xxx' : options[key];
        }
    }
    return printable;
}

module.exports = function (grunt) {

    grunt.registerTask("ecs-scan", function () {
        this.requiresConfig('ecs-scan.options.user', 'ecs-scan.options.apiKey');

        var options = this.options({
            baseUrl: 'https://ecs-app.eacg.de',
        });

        var scanner = [], Scanner;

        if (options.npm) {
            Scanner = require("./lib/npm-scanner").Scanner;
            scanner.push(new Scanner(extend(options.npm, options, GLOBAL_KEYS)));
        }
        if (options.bower) {
            Scanner = require("./lib/bower-scanner").Scanner;
            scanner.push(new Scanner(extend(options.bower, options, GLOBAL_KEYS)));
        }

        if (!scanner.length) {
            grunt.log.error("ecs-scan: at least one of the two scan-type project names ('npmProject', 'bowerProject') has to be specified");

        } else {
            var tasksToDo = scanner.length;
            var allDone = this.async();
            var allOk = true;

            function scanDone(ok) {
                if(!ok) {
                    allOk = false;
                }
                if(--tasksToDo === 0) {
                    allDone(allOk);
                }
            }

            scanner.forEach(function (scanner) {
                if (options.verbose) {
                    grunt.log.writeln("ecs-scan:" + scanner.name + " starting, params: " + JSON.stringify(printableOptions(scanner.options)));
                } else {
                    grunt.log.writeln("ecs-scan:" + scanner.name + " starting...");
                }

                scanner.scan(function (err, data) {
                    if (err) {
                        grunt.log.error("ecs-scan:" + scanner.name + " error creating scan: " + err.message);
                        scanDone(false);
                    } else {
                        if (options.simulate) {
                            grunt.log.writeln("ecs-scan:" + scanner.name + " simulating, nothing transferred:");
                            scanDone(true);
                        } else {
                            scanner.transfer(data, function (err, data) {
                                if (err) {
                                    grunt.log.error("ecs-scan:" + scanner.name + " error transferring scan:" + JSON.stringify(err));
                                    scanDone(false);
                                } else {
                                    grunt.log.writeln("ecs-scan:" + scanner.name + " successfully transferred scan to server:" + JSON.stringify(data));
                                    scanDone(true);
                                }
                            });
                        }
                    }
                });
            });
        }
    });
};


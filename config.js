"use strict";
/*jshint node: true*/
/*eslint-env node*/

var Promise = require("bluebird"),
    fs = Promise.promisifyAll(require("fs")),
    childProcess = require("child_process"),
    inquirer = require("inquirer"),
    defaultConfig = {
        grunt: {
            httpPort: 8000
        },
        host: {
            wscript: false
        },
        selenium: {}
    };

fs.readFileAsync("tmp/config.json")
    .then(function (configJSON) {
        return JSON.parse(configJSON);
    }, function () {
        console.log("No configuration file found");
        return defaultConfig;
    })
    .then(function (config) {
        inquirer.prompt([{
            type: "confirm",
            name: "confirmed",
            message: "You are about to configure the GPF-JS development framework"
        }])
            .then(function (answers) {
                if (!answers.confirmed) {
                    throw new Error("aborted");
                }
                return inquirer.prompt([{
                    type: "input",
                    name: "port",
                    message: "Enter the http port used by grunt",
                    default: config.grunt.httpPort
                }]);
            })
            .then(function (answers) {
                config.grunt.httpPort = answers.port;
                return inquirer.prompt([{
                    type: "list",
                    name: "wscript",
                    message: "Is cscript installed?",
                    choices: ["Autodetect", "Yes", "No"]
                }]);
            })
            .then(function (answers) {
                var result = answers.wscript;
                if ("Yes" === result) {
                    return Promise.resolve(true);
                }
                if ("No" === result) {
                    return Promise.resolve(false);
                }
                return new Promise(function (resolve) {
                    var process = childProcess.spawn("cscript.exe", ["/E:JScript", "build/gpf.js"]),
                        ok = true;
                    process.stdout.on("data", function (buffer) {
                        var text = buffer.toString();
                        console.log(text);
                        if (text.indexOf("Can't find script engine") !== -1) {
                            ok = false;
                        }
                    });
                    process.on("error", function () {
                        console.error("Not found");
                        resolve(false);
                    });
                    process.on("close", function () {
                        resolve(ok);
                    });
                });
            })
            .then(function (wscriptInstalled) {
                config.host.wscript = wscriptInstalled;
            })
            .then(function () {
                console.log(JSON.stringify(config));
            })
            ["catch"](function (reason) {
                console.error(reason.message);
            });
    });



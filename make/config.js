"use strict";
/*jshint node: true*/
/*eslint-env node*/

const
    fs = require("bluebird").promisifyAll(require("fs")),
    inquirer = require("inquirer"),

    defaultConfig = {
        grunt: {
            httpPort: 8000
        },
        host: {
            wscript: false
        },
        selenium: {},
        metrics: {
            coverage: {
                statements: 90,
                functions: 90,
                branches: 90,
                lines: 90
            },
            maintainability: 65
        }
    },

    spawnProcess = (command, params) => {
        return new Promise(function (resolve, reject) {
            let process = require("child_process").spawn(command, params),
                output = [];
            process.stdout.on("data", buffer => output.push(buffer.toString()));
            process.on("error", reject);
            process.on("close", () => {
                console.log(output.join(""));
                resolve(output.join(""));
            });
        });

    },

    detectWScript = () => spawnProcess("cscript.exe", ["/Nologo", "/E:JScript", "build/gpf.js"])
            .then(output => output.indexOf("Can't find script engine") === -1, () => false);

fs.readFileAsync("tmp/config.json")

    .then(configJSON => {

        inquirer.prompt([{
            type: "confirm",
            name: "confirmed",
            message: "Do you want to change configuration"
        }])
            .then(answers => {
                if (!answers.confirmed) {
                    throw new Error("aborted");
                }
                return JSON.parse(configJSON);
            });

    }, () => {
        console.log("No configuration file found");
        return defaultConfig;
    })

    .then(config =>

        inquirer.prompt([{
            type: "input",
            name: "port",
            message: "Enter the http port used by grunt",
            "default": config.grunt.httpPort
        }])
            .then(answers => {
                config.grunt.httpPort = answers.port;
                return inquirer.prompt([{
                    type: "list",
                    name: "wscript",
                    message: "Is cscript installed?",
                    choices: ["Autodetect", "Yes", "No"]
                }]);
            })
            .then(answers => "Autodetect" === answers.wscript ? detectWScript() : "Yes" === answers.wscript)
            .then(wscriptInstalled => {
                config.host.wscript = wscriptInstalled;
            })
            .then(() => console.log(JSON.stringify(config)))

    )["catch"](reason => console.error(reason.message));

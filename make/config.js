"use strict";
/*jshint node: true*/
/*eslint-env node*/

const
    fs = require("bluebird").promisifyAll(require("fs")),
    inquirer = require("inquirer"),

    defaultConfig = {
        serve: {
            httpPort: 8000
        },
        host: {
            wscript: false
        },
        selenium: {
            browsers: []
        },
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
            process.stderr.on("data", buffer => output.push(buffer.toString()));
            process.on("error", reject);
            process.on("close", () => resolve(output.join("")));
        });

    },

    detectWScript = () => spawnProcess("cscript.exe", ["/Nologo", "/E:JScript", "build/gpf.js"])
            .then(output => output.indexOf("Can't find script engine") === -1, () => false),

    askForQualityMetrics = config => inquirer.prompt([{
        type: "confirm",
        name: "confirmed",
        message: "Do you want to update the quality metrics",
        "default": false
    }])
        .then(answers => {
            if (!answers.confirmed) {
                return Promise.resolve();
            }
            return inquirer.prompt([{
                type: "input",
                name: "statements",
                message: "Miminum coverage for statements",
                "default": config.metrics.coverage.statements
            }, {
                type: "input",
                name: "functions",
                message: "Miminum coverage for functions",
                "default": config.metrics.coverage.functions
            }, {
                type: "input",
                name: "branches",
                message: "Miminum coverage for branches",
                "default": config.metrics.coverage.branches
            }, {
                type: "input",
                name: "lines",
                message: "Miminum coverage for lines",
                "default": config.metrics.coverage.lines
            }, {
                type: "input",
                name: "maintainability",
                message: "Miminum maintainability ratio",
                "default": config.metrics.maintainability
            }]);
        }),

    askForSelenium = config => {
        let confirmation;
        if (0 === config.selenium.browsers.length) {
            confirmation = Promise.resolve({confirmed: true});
            console.log("Detecting browsers compatible with selenium");
        } else {
            confirmation = inquirer.prompt([{
                type: "confirm",
                name: "confirmed",
                message: "Do you want to detect browsers compatible with selenium"
            }]);
        }
        return confirmation.then(answers => answers.confirmed
            ? spawnProcess("node", ["test/host/selenium/detect"])
                .then(() => fs.readFileAsync("tmp/selenium.json"))
                .then(buffer => {
                    config.selenium.browsers = JSON.parse(buffer.toString());
                })
            : Promise.resolve()
        );
    };

fs.readFileAsync("tmp/config.json")

    .then(configJSON => {

        return inquirer.prompt([{
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
            "default": config.serve.httpPort
        }])
            .then(answers => {
                config.serve.httpPort = answers.port;
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
            .then(() => askForQualityMetrics(config))
            .then(() => askForSelenium(config))
            .then(() => fs.mkdirAsync("tmp"))
            .then(undefined, () => {}) // ignore mkdir error
            .then(() => fs.writeFileAsync("tmp/config.json", JSON.stringify(config)))

    )["catch"](reason => console.error(reason.message));

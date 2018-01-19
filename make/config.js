"use strict";
/*jshint node: true*/
/*eslint-env node*/

const
    inquirer = require("inquirer"),
    ConfigFile = require("./configFile.js"),
    config = new ConfigFile(),

    spawnProcess = (command, params) => new Promise(function (resolve, reject) {
        let process = require("child_process").spawn(command, params),
            output = [];
        process.stdout.on("data", buffer => output.push(buffer.toString()));
        process.stderr.on("data", buffer => output.push(buffer.toString()));
        process.on("error", reject);
        process.on("close", () => resolve(output.join("")));
    }),

    askIfHostInstalledOrDetect = label => inquirer.prompt([{
        type: "list",
        name: "choice",
        message: `Is ${label} installed?`,
        choices: ["Autodetect", "Yes", "No"]
    }]),

    detectWScript = () => spawnProcess("cscript.exe", ["/Nologo", "/E:JScript", "build/gpf.js"])
            .then(output => output.indexOf("Can't find script engine") === -1, () => false),

    detectJava = () => spawnProcess("java", ["-version"]).then(() => true, () => false),

    askForQualityMetrics = () => inquirer.prompt([{
        type: "confirm",
        name: "confirmed",
        message: "Do you want to update the quality metrics",
        "default": false
    }])
        .then(answers => answers.confirmed
            ? inquirer.prompt([{
                type: "input",
                name: "statements",
                message: "Miminum coverage for statements",
                "default": config.content.metrics.coverage.statements
            }, {
                type: "input",
                name: "functions",
                message: "Miminum coverage for functions",
                "default": config.content.metrics.coverage.functions
            }, {
                type: "input",
                name: "branches",
                message: "Miminum coverage for branches",
                "default": config.content.metrics.coverage.branches
            }, {
                type: "input",
                name: "lines",
                message: "Miminum coverage for lines",
                "default": config.content.metrics.coverage.lines
            }, {
                type: "input",
                name: "maintainability",
                message: "Miminum maintainability ratio",
                "default": config.content.metrics.maintainability
            }])
                .then(metrics => {
                    config.content.metrics.coverage.statements = metrics.statements;
                    config.content.metrics.coverage.functions = metrics.functions;
                    config.content.metrics.coverage.branches = metrics.branches;
                    config.content.metrics.coverage.lines = metrics.lines;
                    config.content.metrics.maintainability = metrics.maintainability;
                })
            : Promise.resolve()
        ),

    quietMode = process.argv.some(arg => arg === "-quiet"),

    askForSelenium = () => {
        let confirmation;
        if (0 === Object.keys(config.content.browsers).length) {
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
            : Promise.resolve()
        );
    };

Promise.resolve()

    .then(()=> config.isNew()
        ? (console.log("No configuration file found"), config)
        : inquirer.prompt([{
            type: "confirm",
            name: "confirmed",
            message: "Do you want to change configuration"
        }])
            .then(answers => {
                if (!answers.confirmed) {
                    throw new Error("aborted");
                }
                return config;
            })
    )
    .then(() => quietMode

        ? detectJava()
        : inquirer.prompt([{
            type: "input",
            name: "port",
            message: "Enter the http port used by grunt",
            "default": config.content.serve.httpPort
        }])
            .then(answers => {
                config.content.serve.httpPort = answers.port;
                return askIfHostInstalledOrDetect("cscript");
            })
            .then(answers => "Autodetect" === answers.choice ? detectWScript() : "Yes" === answers.choice)
            .then(wscriptInstalled => {
                config.content.host.wscript = wscriptInstalled;
                return askIfHostInstalledOrDetect("java");
            })
            .then(answers => "Autodetect" === answers.choice ? detectJava() : "Yes" === answers.choice)
    )
    .then(javaInstalled => {
        config.content.host.java = javaInstalled;
        if (!quietMode) {
            return askForQualityMetrics(config);
        }
    })
    .then(() => config.save()) // Save before checking Selenium (which updates the configuration file)
    .then(() => askForSelenium()
    )["catch"](reason => console.error(reason.message));

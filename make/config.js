"use strict";
/*jshint node: true*/
/*eslint-env node*/
/*eslint-disable no-process-env*/ // Required for host specific testing

const
    fs = require("fs"),
    path = require("path"),
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

    quietMode = process.argv.some(arg => arg === "quiet"),

    askIfHostInstalledOrDetect = label => quietMode
        ? Promise.resolve({choice: "Autodetect"})
        : inquirer.prompt([{
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

    askForSelenium = () => {
        let confirmation;
        if (quietMode || 0 === Object.keys(config.content.browsers).length) {
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
    },

    checkCmdLineSafari = (isWindows) => {
        if (!config.content.browsers.safari && isWindows) {
            console.log("Checking safari for windows...");
            let safariBin = path.join(process.env.ProgramFiles, "safari\\safari.exe");
            if (!fs.existsSync(safariBin)) {
                safariBin = path.join(process.env["ProgramFiles(x86)"], "safari\\safari.exe");
            }
            if (!fs.existsSync(safariBin)) {
                safariBin = undefined;
            }
            if (safariBin) {
                console.log(`Safari: ${safariBin}`);
                config.content.browsers.safari = {
                    type: "spawn",
                    bin: safariBin
                };
                return true;
            }
        }
        return false;
    },

    checkCmdLineBrowsers = () => {
        // Re-read config file because selenium detection might rewrite it
        config.read();
        const isWindows = (/^win/).test(process.platform);
        let configChanged = checkCmdLineSafari(isWindows),
            promise;
        if (config.content.browsers.chrome || isWindows) {
            promise = Promise.resolve();
        } else {
            console.log("Checking chrome for non windows...");
            promise = spawnProcess("google-chrome-stable", ["--product-version"])
                .then(function () {
                    console.log("Chrome: google-chrome-stable");
                    config.content.browsers.chrome = {
                        type: "spawn",
                        bin: "google-chrome-stable",
                        args: ["--no-sandbox", "--headless", "--disable-gpu", "--remote-debugging-port=9222"]
                    };
                    configChanged = true;
                });
        }
        return promise.then(() => configChanged ? config.save() : 0);
    },

    askForCmdLineBrowsers = () => {
        let confirmation;
        if (quietMode || 0 === Object.keys(config.content.browsers).length) {
            confirmation = Promise.resolve({confirmed: true});
            console.log("Detecting browsers compatible with command line use");
        } else {
            confirmation = inquirer.prompt([{
                type: "confirm",
                name: "confirmed",
                message: "Do you want to detect browsers compatible with command line use"
            }]);
        }
        return confirmation.then(answers => answers.confirmed
            ? checkCmdLineBrowsers()
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
        ? detectWScript()
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
    )
    .then(wscriptInstalled => {
        config.content.host.wscript = wscriptInstalled;
        return askIfHostInstalledOrDetect("java");
    })
    .then(answers => "Autodetect" === answers.choice ? detectJava() : "Yes" === answers.choice)
    .then(javaInstalled => {
        config.content.host.java = javaInstalled;
        if (!quietMode) {
            return askForQualityMetrics(config);
        }
    })
    .then(() => config.save()) // Save before checking Selenium (which updates the configuration file)
    .then(() => askForSelenium())
    .then(() => askForCmdLineBrowsers()
    )["catch"](reason => console.error(reason.message));

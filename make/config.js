"use strict";
/*jshint node: true*/
/*eslint-env node*/
/*eslint-disable no-process-env*/ // Required for host specific testing

require("colors");

const
    fs = require("fs"),
    path = require("path"),
    inquirer = require("inquirer"),
    tools = require("../res/tools.js"),
    ConfigFile = require("./configFile.js"),
    config = new ConfigFile(),
    isWindows = tools.isWindows,

    spawnProcess = (command, params) => new Promise(function (resolve, reject) {
        let process = require("child_process").spawn(command, params),
            output = [],
            log = buffer => console.log(buffer.grey),
            err = buffer => console.error(buffer.red),
            out = method => {
                return rawBuffer => {
                    const buffer = rawBuffer.toString();
                    buffer.split("\n").forEach(method);
                    output.push(buffer);
                };
            };
        process.stdout.on("data", out(log));
        process.stderr.on("data", out(err));
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

    detectWScript = () => spawnProcess("cscript.exe", ["/E:JScript", "build/gpf.js"])
        .then(output => {
            if (output.indexOf("Can't find script engine") === -1) {
                console.log("\tWScript detected".cyan);
            } else {
                console.log("\tWScript detected *but* JScript engine missing".magenta);
            }
        }, () => {
            console.log("\tWScript *not* detected".magenta);
            return false;
        }),

    detectJava = () => spawnProcess("java", ["-version"])
        .then(() => {
            console.log("\tJAVA detected".cyan);
            return true;
        }, () => {
            console.log("\tJAVA *not* detected".magenta);
            return false;
        }),

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
            console.log("Detecting browsers compatible with selenium".gray);
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

    checkCmdLineSafari = () => {
        if (!config.content.browsers.safari && isWindows) {
            console.log("Checking safari for windows...".gray);
            let safariBin = path.join(process.env.ProgramFiles, "safari\\safari.exe");
            if (!fs.existsSync(safariBin)) {
                safariBin = path.join(process.env["ProgramFiles(x86)"], "safari\\safari.exe");
            }
            if (!fs.existsSync(safariBin)) {
                safariBin = undefined;
            }
            if (safariBin) {
                console.log(`\tSafari: ${safariBin}`.cyan);
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
        let configChanged = checkCmdLineSafari(),
            promise;
        if (config.content.browsers.chrome || isWindows) {
            promise = Promise.resolve();
        } else {
            console.log("Checking chrome for non windows...".gray);
            promise = spawnProcess("google-chrome-stable", ["--product-version"])
                .then(function () {
                    console.log("\tChrome: google-chrome-stable".cyan);
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
            console.log("Detecting browsers compatible with command line use".gray);
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
        ? console.log("No configuration file found")
        : inquirer.prompt([{
            type: "confirm",
            name: "confirmed",
            message: "Do you want to change configuration"
        }])
            .then(answers => {
                if (!answers.confirmed) {
                    throw new Error("aborted");
                }
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
        if (javaInstalled) {
            if (process.env.JAVA_HOME) {
                const jjsPath = path.join(process.env.JAVA_HOME, `bin${path.sep}jjs` + (isWindows ? ".exe" : ""));
                if (fs.existsSync(jjsPath)) {
                    console.log(`\tNashorn: ${jjsPath}`.cyan);
                    config.content.host.nashorn = jjsPath;
                } else {
                    console.log("\tNashorn *not* detected".magenta);
                }
            } else {
                console.log("\tMissing JAVA_HOME, Nashorn can't be configured".magenta);
            }
        }
        if (!quietMode) {
            return askForQualityMetrics();
        }
    })
    .then(() => config.save()) // Save before checking Selenium (which updates the configuration file)
    .then(() => askForSelenium())
    .then(() => askForCmdLineBrowsers()
    )["catch"](reason => console.error(reason.message));

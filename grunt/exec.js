"use strict";

/*global configuration*/

var CSCRIPT_CMD = "cscript.exe /D /E:JScript test\\host\\cscript.js",
    RHINO_CMD = "java -jar node_modules\\rhino-1_7r5-bin\\rhino1_7R5\\js.jar test\\host\\rhino.js",
    PLATO_CMD = "node node_modules\\plato\\bin\\plato",
    SELENIUM_CMD = "node test\\host\\selenium.js";

// Custom command lines
module.exports = {
    buildDebug: {
        command: "node make.js debug",
        cwd: "make",
        stdout: false,
        stderr: false,
        exitCode: 0
    },
    buildRelease: {
        command: "node make.js release",
        cwd: "make",
        stdout: false,
        stderr: false,
        exitCode: 0
    },
    plato: {
        command: PLATO_CMD + " -l .jshintrc -t GPF-JS -d tmp\\plato " + configuration.srcFiles.join(" "),
        stdout: true,
        stderr: true
    },
    metrics: {
        command: "node make\\metrics.js",
        stdout: false,
        stderr: true,
        exitCode: 0
    },
    globals: {
        command: "node make\\globals.js",
        stdout: false,
        stderr: false,
        exitCode: 0
    },
    version: {
        command: "node make\\version.js",
        stdout: false,
        stderr: false,
        exitCode: 0
    }
};

function _buildTestConfig (name, command) {
    module.exports["test" + name] = {
        command: command,
        stdout: false,
        stderr: false,
        exitCode: 0
    };
    module.exports["test" + name + "Verbose"] = {
        command: command + " -debugger",
        stdout: true,
        stderr: true,
        exitCode: 0
    };
    module.exports["test" + name + "Debug"] = {
        command: command + " -debug",
        stdout: false,
        stderr: false,
        exitCode: 0
    };
    module.exports["test" + name + "Release"] = {
        command: command + " -release",
        stdout: false,
        stderr: false,
        exitCode: 0
    };
}

_buildTestConfig("Wscript", CSCRIPT_CMD);
_buildTestConfig("Rhino", RHINO_CMD);
if (configuration.isSeleniumDriverInstalled("chrome")) {
    _buildTestConfig("Chrome", SELENIUM_CMD + " chrome");
}
if (configuration.isSeleniumDriverInstalled("firefox")) {
    _buildTestConfig("Firefox", SELENIUM_CMD + " firefox");
}

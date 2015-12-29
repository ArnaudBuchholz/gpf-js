"use strict";
/*jshint node: true*/
/*eslint-env node*/
/*global configuration*/

var CSCRIPT_CMD = "cscript.exe /D /E:JScript test\\host\\cscript.js",
    RHINO_CMD = "java -jar node_modules\\rhino-1_7r5-bin\\rhino1_7R5\\js.jar test\\host\\rhino.js",
    PLATO_CMD = "node node_modules\\plato\\bin\\plato";

// Custom command lines
module.exports = {
    testRhino: {
        command: RHINO_CMD,
        stdout: false,
        stderr: false,
        exitCode: 0
    },
    testRhinoVerbose: {
        command: RHINO_CMD,
        stdout: true,
        stderr: true,
        exitCode: 0
    },
    testWscript: {
        command: CSCRIPT_CMD,
        stdout: false,
        stderr: false,
        exitCode: 0
    },
    testWscriptVerbose: {
        command: CSCRIPT_CMD + " -debugger",
        stdout: true,
        stderr: true,
        exitCode: 0
    },
    testWscriptDebug: {
        command: CSCRIPT_CMD + " -debug",
        stdout: false,
        stderr: false,
        exitCode: 0
    },
    testWscriptRelease: {
        command: CSCRIPT_CMD + " -release",
        stdout: false,
        stderr: false,
        exitCode: 0
    },
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

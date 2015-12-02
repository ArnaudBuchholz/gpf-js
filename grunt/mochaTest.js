"use strict";
/*jshint node: true*/
/*eslint-env node*/
/*global configuration*/

// Test automation inside NodeJS
module.exports = {
    source: {
        options: {
            reporter: "dot",
            quiet: false,
            clearRequireCache: true,
            require: [
                function () {
                    global.gpfSourcesPath = "src/";
                },
                "./src/boot.js",
                function () {
                    require("../test/host/console.js");
                    global.assert = require("assert");
                }
            ]
        },
        src: configuration.testFiles
    },
    verbose: {
        options: {
            reporter: "spec",
            quiet: false,
            clearRequireCache: true,
            require: [
                function () {
                    global.gpfSourcesPath = "src/";
                },
                "./src/boot.js",
                function () {
                    global.assert = require("assert");
                }
            ]
        },
        src: configuration.testFiles
    },
    coverage: {
        options: {
            reporter: "json",
            captureFile: "./tmp/coverage/mochaTest.json",
            quiet: true,
            require: [
                function () {
                    global.gpfSourcesPath = "tmp/coverage/instrument/src/";
                },
                "./tmp/coverage/instrument/src/boot.js",
                function () {
                    require("../test/host/console.js");
                    global.assert = require("assert");
                }
            ]
        },
        src: configuration.testFiles
    },
    debug: {
        options: {
            reporter: "dot",
            quiet: false,
            clearRequireCache: true,
            require: [
                function () {
                    global.gpf = require("../build/gpf-debug.js");
                    require("../test/host/console.js");
                    global.assert = require("assert");
                }
            ]
        },
        src: configuration.testFiles
    },
    release: {
        options: {
            reporter: "dot",
            quiet: false,
            clearRequireCache: true,
            require: [
                function () {
                    global.gpf = require("../build/gpf.js");
                    require("../test/host/console.js");
                    global.assert = require("assert");
                }
            ]
        },
        src: configuration.testFiles
    }
};

"use strict";

function clearRequireCache () {
    for (var key in require.cache) {
        if (require.cache.hasOwnProperty(key)) {
            delete require.cache[key];
        }
    }
}

// Test automation inside NodeJS
module.exports = {
    source: {
        options: {
            reporter: "dot",
            quiet: false,
            require: [
                function () {
                    clearRequireCache();
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
            require: [
                function () {
                    clearRequireCache();
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
                    clearRequireCache();
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
            require: [
                function () {
                    clearRequireCache();
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
            require: [
                function () {
                    clearRequireCache();
                    global.gpf = require("../build/gpf.js");
                    require("../test/host/console.js");
                    global.assert = require("assert");
                }
            ]
        },
        src: configuration.testFiles
    }
};

"use strict";
/*jshint node: true*/
/*global process, global*/

var
    options = {
        release: false,
        debug: false,
        verbose: false
    },
    verbose,
    args;

// Define a debug function that outputs when verbose is set
if (options.verbose) {
    verbose = (function () {
        var _console = console;
        return function (text) {
            _console.log(text);
        };
    }());
} else {
    verbose = function () {};
}

// Simple parameter parsing
if ("undefined" !== typeof process) {
    // nodejs
    args = process.argv;
} else if ("undefined" !== typeof phantom) {
    // phantomjs
    args = require("system").args;
} else {
    args = [];
}

if (args.length > 2) {
    args.forEach(function (val/*, index, array*/) {
        if (val.charAt(0) === "-") {
            val = val.substr(1);
            if (val in options) {
                if ("boolean" === typeof options[val]) {
                    options[val] = !options[val]; // Simple switch
                }
            }
        }
    });
}

try {
    global.gpfSourcesPath =
        require("path").resolve(__dirname, "../../src/") + "/";
} catch (e) {
    global.gpfSourcesPath = "../../src/";
}

if (options.release) {
    verbose("Using release version");
    global.gpf = require("../../build/gpf.js");
} else if (options.debug) {
    verbose("Using debug version");
    global.gpf = require("../../build/gpf-debug.js");
    // Sources are included
} else {
    verbose("Using source version");
    require("../../src/boot.js");
}

if (undefined === gpf.sources) {
    require("../../src/sources.js");
}

// Backward compatibility management
gpf.declareTests = function () {
    console.warn("Test file must be transformed into BDD syntax");
};

require("./console.js");

/**
 * Load all tests
 *
 * @param {Function} readFile
 */
module.exports = function loadTests(readFile) {
    var
        sources = gpf.sources().split(","),
        len = sources.length,
        sourceIdx,
        source,
        content;
    for (sourceIdx = 0; sourceIdx < len; ++sourceIdx) {
        source = sources[sourceIdx];
        if (!source) {
            break;
        }
        content = readFile("../" + source + ".js");
        if (undefined !== content) {
            /*jslint evil: true*/
            eval(content);
            /*jslint evil: false*/
        }
    }
}
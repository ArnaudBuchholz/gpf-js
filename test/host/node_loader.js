"use strict";
/*jshint node: true*/
/*jshint phantom: true*/
/*eslint-env node, phantomjs*/
/*global window*/ // missing from phantomjs

var
    options = {
        release: false,
        debug: false,
        verbose: false
    },
    verbose,
    args,
    path,
    testPath;

// Simple parameter parsing
if ("undefined" !== typeof process) {
    // nodejs
    args = process.argv;
    path = require("path");
} else if ("undefined" !== typeof phantom) {
    // phantomjs
    args = require("system").args;
    // https://groups.google.com/forum/#!msg/phantomjs/OswbWiKrLYI/ndoXvK13OrIJ
    window.__dirname = phantom.libraryPath;
} else {
    args = [];
}
if (!path) {
    (function () {
        var separator = require("fs").separator;
        path = {
            resolve: function (base, relative) {
                if (base.charAt(base.length - 1) !== separator) {
                    base = base + separator;
                }
                return base + relative;
            }
        };
    }());
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

global.gpfSourcesPath = path.resolve(__dirname, "../../src/");

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

testPath = path.resolve(__dirname, "../../test/");

require(path.resolve(testPath, "host/console.js"));

/**
 * Load all tests
 *
 * @param {Function} readFile
 */
module.exports = function loadTests(readFile) {
    var
        sources = gpf.sources(),
        len = sources.length,
        sourceIdx,
        source,
        content;
    for (sourceIdx = 0; sourceIdx < len; ++sourceIdx) {
        source = sources[sourceIdx];
        if (!source) {
            break;
        }
        content = readFile(path.resolve(testPath, source + ".js"));
        if (undefined !== content) {
            /*jslint evil: true*/
            eval(content); //eslint-disable-line no-eval
            /*jslint evil: false*/
        }
    }
};

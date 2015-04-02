(function () {
    "use strict";
    /*jshint node: true*/
    /*global process, global*/

    // Simple parameter parsing
    var
        options = {
            release: false,
            debug: false,
            verbose: false
        };

    var args;
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
        console.log("Using release version");
        global.gpf = require("../../build/gpf.js");
    } else if (options.debug) {
        console.log("Using debug version");
        global.gpf = require("../../build/gpf-debug.js");
        // Sources are included
    } else {
        console.log("Using source version");
        require("../../src/boot.js");
    }

    if (undefined === gpf.sources) {
        require("../../src/sources.js");
    }

    // Backward compatibility management
    gpf.declareTests = function () {
        console.warn("Test file must be transformed into BDD syntax");
    };

}());
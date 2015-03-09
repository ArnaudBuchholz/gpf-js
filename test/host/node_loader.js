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
        },
        path = require("path");

    if (process.argv.length > 2) {
        process.argv.forEach(function (val/*, index, array*/) {
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

    global.gpfSourcesPath = path.resolve(__dirname, "../../src/") + "/";
    if ("release" === global.version) {
        global.gpf = require("../../build/gpf.js");
    } else if ("debug" === global.version) {
        global.gpf = require("../../build/gpf-debug.js");
        // Sources are included
    } else {
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
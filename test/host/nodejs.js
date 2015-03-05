/*global process, require*/
// Simple parameter parsing
var
    options = {
        release: false,
        debug: false,
        verbose: false
    };

if (process.argv.length > 2) {
    process.argv.forEach(function (val/*, index, array*/) {
        "use strict";
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

function verbose(text) {
    "use strict";
    if (options.verbose) {
        console.log(text);
    }
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
    require("../../boot.js");
}
if (undefined === gpf.sources) {
    require("../../sources.js");
}
require("../manager.js");

function callback(event) {
    "use strict";
    if ("error" === event.type()) {
        console.error("\x1B[31m" + event.get("message") + "\x1B[39m");
    } else if ("warning" === event.type()) {
        console.warn("\x1B[33m" + event.get("message") + "\x1B[39m");
    } else if ("info" === event.type()) {
        console.log("\x1B[36m" + event.get("message") + "\x1B[39m");
    } else if ("log" === event.type()) {
        console.log(event.get("message"));
    } else if ("success" === event.type()) {
        console.log("\x1B[32mOK\x1B[39m \x1B[1m" + event.get("name")
            + "\x1B[22m");
    } else if ("failure" === event.type()) {
        console.error("\x1B[31mKO\x1B[39m \x1B[1m" + event.get("name")
            + "\x1B[22m");
        gpf.testReport(event.get("name"), callback);
    }
}

gpf.runTests(callback);


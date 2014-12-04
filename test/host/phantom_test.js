/*global require, phantom*/
// Simple parameter parsing
var
    options = {
        release: false,
        debug: false,
        verbose: false
    },
    system = require("system");

if (system.args.length > 1) {
    system.args.forEach(function (val/*, index, array*/) {
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
    require("../../build/gpf.js");
} else if (options.debug) {
    verbose("Using debug version");
    require("../../build/gpf-debug.js");
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
        console.error(event.get("message"));
    } else if ("warning" === event.type()) {
        console.warn(event.get("message"));
    } else if ("info" === event.type()) {
        console.log(event.get("message"));
    } else if ("log" === event.type()) {
        console.log(event.get("message"));
    } else if ("success" === event.type()) {
        console.log("OK " + event.get("name"));
    } else if ("failure" === event.type()) {
        console.error("KO " + event.get("name"));
        gpf.testReport(event.get("name"), callback);
    } else if ("end" === event.type()) {
        phantom.exit(0);
    }
}

gpf.runTests(callback);



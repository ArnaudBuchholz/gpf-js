"use strict";
/*jshint wsh: true*/
/*global run*/

var
    options = {
        release: false,
        debug: false,
        verbose: false
    },
    len,
    idx,
    param,
    verbose,
    gpfSourcesPath = "..\\..\\src\\",
    fso = new ActiveXObject("Scripting.FileSystemObject"),
    include = function (path) {
        /*jslint evil: true*/
        eval(fso.OpenTextFile(path, 1/*forReading*/, false, 0).ReadAll());
        /*jslint evil: false*/
    },
    sources,
    src;

// Simple parameter parsing
len = WScript.Arguments.length;
for (idx = 0; idx < len; ++idx) {
    param = WScript.Arguments(idx);
    if (param.charAt(0) === "-") {
        param = param.substr(1);
        if (param in options) {
            if ("boolean" === typeof options[param]) {
                options[param] = !options[param]; // Simple switch
            }
        }
    }
}

// Define a debug function that outputs when verbose is set
if (options.verbose) {
    verbose = function (text) {
        WScript.Echo(text);
    };
} else {
    verbose = function () {};
}

if (options.release) {
    verbose("Using release version");
    include("..\\..\\build\\gpf.js");
} else if (options.debug) {
    verbose("Using debug version");
    include("..\\..\\build\\gpf-debug.js");
} else {
    verbose("Using source version");
    include(gpfSourcesPath + "boot.js");
}

if (!gpf.sources) {
    include(gpfSourcesPath + "sources.js");
}

verbose("Loading BDD");
include("bdd.js");

verbose("Loading console override");
var module = {};
include("console.js");
module.exports(true);

verbose("Loading test cases");

// Backward compatibility management
gpf.declareTests = function () {
    WScript.Echo("Test file '" + src + ".js' must be transformed to BDD");
};

sources = gpf.sources().split(",");
len = sources.length;
for (idx = 0; idx < len; ++idx) {
    src = sources[idx];
    if (!src) {
        break;
    }
    verbose("\t" + src);
    include("..\\" + src + ".js");
}

verbose("Running BDD");
run();
gpf.runAsyncQueue();
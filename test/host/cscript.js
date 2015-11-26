"use strict";
/*jshint wsh: true*/
/*eslint-env wsh*/
/*global run*/

/*eslint-disable new-cap, no-debugger*/
/*jshint -W087*/

var
    options = {
        release: false,
        debug: false,
        verbose: false,
        "debugger": false
    },
    len,
    idx,
    param,
    verbose,
    scriptPath = WScript.ScriptFullName,
    gpfSourcesPath,
    testPath,
    fso = new ActiveXObject("Scripting.FileSystemObject"),
    sources,
    src;

function include (path) {
    try {
        /*jslint evil: true*/
        eval(fso.OpenTextFile(path, 1/*forReading*/, false, 0).ReadAll()); //eslint-disable-line no-eval
        /*jslint evil: false*/
    } catch (e) {
        WScript.Echo("An error occurred while evaluating: " + path + "\r\n" + e.message);
    }
}

// Compute gpfSourcesPath relatively to the current script path
src = scriptPath.split("\\");
src.pop(); // Remove name
src.pop(); // Remove host folder
testPath = src.join("\\") + "\\";
src.pop(); // Remove test folder
gpfSourcesPath = src.concat("src").join("\\") + "\\";

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
    include("build\\gpf.js");
} else if (options.debug) {
    verbose("Using debug version");
    include("build\\gpf-debug.js");
} else {
    verbose("Using source version");
    include(gpfSourcesPath + "boot.js");
}

/*exported assert*/
function assert (condition) {
    if (!condition) {
        if (options["debugger"]) {
            debugger;
        }
        throw new Error("ASSERTION failed");
    }
}

if ("undefined" === typeof gpf) {
    WScript.Echo("GPF was not loaded");
    WScript.Quit(-1);
}

if (!gpf.sources) {
    include(gpfSourcesPath + "sources.js");
}

verbose("Loading BDD");
include(testPath + "host\\bdd.js");

verbose("Loading console override");
include(testPath + "host\\console.js");

verbose("Loading test cases");

sources = gpf.sources();
len = sources.length;
for (idx = 0; idx < len; ++idx) {
    src = sources[idx];
    if (!src) {
        break;
    }
    verbose("\t" + src);
    include(testPath + src + ".js");
}

verbose("Running BDD");
run();
gpf.handleTimeout();

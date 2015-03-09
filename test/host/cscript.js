"use strict";
/*jshint wsh: true*/
/*global run*/

var
    DEBUG = false,
    gpfSourcesPath = "..\\..\\src\\",
    fso = new ActiveXObject("Scripting.FileSystemObject"),
    include = function (path) {
        /*jslint evil: true*/
        eval(fso.OpenTextFile(path, 1/*forReading*/, false, 0).ReadAll());
        /*jslint evil: false*/
    },
    version,
    sources,
    len,
    idx,
    src;

if (WScript.Arguments.length > 0) {
    version = WScript.Arguments(0);
}
if ("release" === version) {
    include("..\\..\\build\\gpf.js");
} else if ("debug" === version) {
    include("..\\..\\build\\gpf-debug.js");
} else {
    version = "source";
    include(gpfSourcesPath + "boot.js");
}
if (DEBUG) {
    WScript.Echo("Using " + version + " version");
}

if (!gpf.sources) {
    include(gpfSourcesPath + "sources.js");
}

if (DEBUG) {
    WScript.Echo("Loading BDD");
}
include("bdd.js");

if (DEBUG) {
    WScript.Echo("Loading test cases");
}

// Backward compatibility management
gpf.declareTests = function () {
    WScript.Echo("Test file must be transformed into BDD syntax");
};

sources = gpf.sources().split(",");
len = sources.length;
for (idx = 0; idx < len; ++idx) {
    src = sources[idx];
    if (!src) {
        break;
    }
    if (DEBUG) {
        WScript.Echo("\t" + src);
    }
    include("..\\" + src + ".js");
}

if (DEBUG) {
    WScript.Echo("Running BDD");
}
run();

// gpf.runAsyncQueue();
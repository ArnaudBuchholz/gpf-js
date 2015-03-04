"use strict";
global.assert = require("assert");

var Mocha = require("mocha"),
    mocha = new Mocha({ui: "bdd"}),
    version;

global.gpfSourcesPath = "../../../src/";
if ("release" === version) {
    global.gpf = require("../../../build/gpf.js");
} else if ("debug" === version) {
    global.gpf = require("../../../build/gpf-debug.js");
    // Sources are included
} else {
    require("../../../src/boot.js");
}
if (undefined === gpf.sources) {
    require("../../src/sources.js");
}

// Add test sources to mocha
var
    sources = gpf.sources().split(","),
    len = sources.length,
    sourceIdx,
    source;
for (sourceIdx = 0; sourceIdx < len; ++sourceIdx) {
    source = sources[sourceIdx];
    if (!source) {
        break;
    }
    mocha.addFile("../../" + source + ".js");
}

// Backward compatibility management
gpf.declareTests = function () {
    console.warn("Test file must be transformed into BDD syntax");
};

// Now, you can run the tests.
mocha.run(function(failures){
    process.on("exit", function () {
        process.exit(failures);
    });
});
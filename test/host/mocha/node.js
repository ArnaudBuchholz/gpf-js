"use strict";
global.assert = require("assert");

require("./mocha.js");
var mocha = new Mocha({ui: "bdd"}),
    version;

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
    length = sources.length,
    sourceIdx,
    source;
for (sourceIdx = 0; sourceIdx < length; ++sourceIdx) {
    source = sources[sourceIdx];
    if (!source) {
        break;
    }
    mocha.addFile("../../" + source + ".js");
}

// Now, you can run the tests.
mocha.run(function(failures){
    process.on("exit", function () {
        process.exit(failures);
    });
});
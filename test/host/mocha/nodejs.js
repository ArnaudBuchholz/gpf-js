"use strict";
/*jshint node: true*/

global.assert = require("assert");

var Mocha = require("mocha"),
    mocha = new Mocha({ui: "bdd"});

require("../node_loader.js");

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

// Now, you can run the tests.
mocha.run(function(failures){
    process.on("exit", function () {
        process.exit(failures);
    });
});
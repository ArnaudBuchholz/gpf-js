"use strict";
/*jshint node: true*/
/*global run*/

require("./node_loader.js");
require("./bdd.js");

// Add test sources
var
    fs = require("fs"),
    sources = gpf.sources().split(","),
    len = sources.length,
    sourceIdx,
    source;
for (sourceIdx = 0; sourceIdx < len; ++sourceIdx) {
    source = sources[sourceIdx];
    if (!source) {
        break;
    }
    /*jslint evil: true*/
    eval(fs.read("../" + source + ".js"));
    /*jslint evil: false*/
}

run();
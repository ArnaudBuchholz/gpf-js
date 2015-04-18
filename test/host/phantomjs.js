"use strict";
/*jshint node: true*/
var fs = require("fs"),
    loadTests = require("./node_loader.js");
require("./bdd.js"); /*global run*/
loadTests(function (path) {
    return fs.read(path);
});
run();
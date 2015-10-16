"use strict";
/*jshint phantom: true*/
/*eslint-env phantomjs*/
var fs = require("fs"),
    loadTests = require("./node_loader.js");
require("./bdd.js"); /*global run*/
loadTests(function (path) {
    return fs.read(path);
});
run();

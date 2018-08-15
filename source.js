/*jshint node: true*/
/*eslint-env node*/
"use strict";

// allows require("gpf-js/source")

const
    path = require("path"),
    fs = require("fs"),
    gpfSourcesPath = path.join(__dirname, "../../../gpf-js/src");

let
    stats;

try {
    stats = fs.statSync(gpfSourcesPath);
} catch (e) {}

if (stats && stats.isDirectory()) {
    global.gpfSourcesPath = gpfSourcesPath + path.sep;
    require(gpfSourcesPath + "/boot.js"); // defines global.gpf
    module.exports = gpf;
} else {
    module.exports = require("./build/gpf.js");
}

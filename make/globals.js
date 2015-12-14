/*jshint node: true*/
/*eslint-env node*/
/*eslint-disable no-sync*/
"use strict";

var fs = require("fs");

// Get gpf library source
require("../src/sources.js");
var sources = gpf.sources();
sources.unshift("boot"); // Also include boot

console.log("Building the maps of imports/exports...");
var imports = {},
    exports = {},
    symbols = {};
sources.every(function (source) {
    if (source === "") {
        return false;
    }
    console.log("\t" + source);
    var lines = fs.readFileSync("./src/" + source + ".js").toString().split("\n"),
        sourceImports = imports[source] = [],
        sourceExports = exports[source] = {};
    lines.forEach(function (line) {
        var name,
            description;
        if (0 === line.indexOf("/*global ")) {
            name = line.split("*/")[0].substr(9).trim();
            sourceImports.push(name);

        } else if (0 === line.indexOf("/*exported ")) {
            name = line.split("*/")[0].substr(11).trim();
            description = line.split("// ")[1] || "";
            sourceExports[name] = description;
            symbols[name] = source;
        }
    });
    return true;
});

// Build constants.js part
sources.every(function (source) {
    if (source === "") {
        return false;
    }
    console.log("//region " + source);
    var sourceExports = exports[source],
        names = Object.keys(sourceExports).sort();
    names.forEach(function (name) {
        console.log("/*global " + name + "*/");
    });
    console.log("//endregion " + source);
    return true;
});

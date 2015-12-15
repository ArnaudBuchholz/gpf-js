/*jshint node: true*/
/*eslint-env node*/
/*eslint-disable no-sync*/
"use strict";

var fs = require("fs");

// Get gpf library source
require("../src/sources.js");
var sources = gpf.sources();
sources.unshift("boot"); // Also include boot

var modules = {},
    globalsOrigin = {};

function analyzeLine (module, line, lineIndex) {
    var name,
        description;
    if (0 === lineIndex) {
        // first line *must* be /*#ifndef(UMD)*/
        if (line !== "/*#ifndef(UMD)*/") {
            console.error("[" + module.name + "] missing /*#ifndef(UMD)*/");
            return false;
        }
        return true;
    }
    if (1 === lineIndex) {
        // second line *must* be "use strict";
        if (line !== "\"use strict\";") {
            console.error("[" + module.name + "] missing \"use strict\";");
            return false;
        }
        return true;
    }
    if (line === "/*#endif*/") {
        return false;
    }
    if (0 === line.indexOf("/*global ")) {
        name = line.split("*/")[0].substr(9).trim();
        module.imports.push(name);

    } else if (0 === line.indexOf("/*exported ")) {
        name = line.split("*/")[0].substr(11).trim();
        description = line.split("// ")[1] || "";
        if (!description) {
            console.error("[" + module.name + "] no description for " + name);
        }
        module.exports[name] = description;
        globalsOrigin[name] = module.name;

    } else if (-1 < line.indexOf("eslint") || -1 < line.indexOf("jshint")) {
        // ignore
        return true;

    } else {
        console.error("[" + module.name + "] line " + (lineIndex + 1) + " not recognized");
        return false;
    }
    module.filteredLines.push(lineIndex);
    return true;
}

function analyze (name) {
    var module = modules[name] = {};
    module.name = name;
    module.lines = fs.readFileSync("./src/" + name + ".js").toString().split("\n");
    module.imports = [];
    module.exports = {};
    module.filteredLines = [];
    module.lines.every(analyzeLine.bind(null, module));
}

sources.every(function (source) {
    if (source === "") {
        return false;
    }
    analyze(source);
    return true;
});

// Build former constants.js part
sources.every(function (source) {
    if (source === "") {
        return false;
    }
    var module = modules[source],
        regionLines = [
            "//region " + source
        ],
        moduleExports = module.exports,
        names = Object.keys(moduleExports).sort(),
        origin,
        description,
        global;
    names.forEach(function (name) {
        global = "/*global " + name + "*/";
        description = module.exports[name];
        if (description) {
            global += " // " + description;
        }
        regionLines.push(global);
    });
    if (1 < regionLines.length) {
        regionLines.push("//endregion " + source);
        // console.log(regionLines.join("\n"));
    }
    return true;
});

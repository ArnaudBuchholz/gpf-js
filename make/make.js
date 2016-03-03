"use strict";

var fs = require("fs"),
    build = require("./build.js"),
    version = "debug",
    debug,
    parameters,
    debugParameters,
    sources = {},
    result;

debug = function () {};

// Cheap parameter parsing
process.argv.slice(2).forEach(function (value) {
    if ("-verbose" === value) {
        debug = function () {
            console.log.apply(console, arguments);
        };
    } else {
        version = value;
    }
});

console.log("Generating version '" + version + "'");
debug("\tReading parameters...");
try {
    debugParameters = JSON.parse(fs.readFileSync("debug.json").toString());
    if ("debug" === version) {
        parameters = debugParameters;
    } else {
        parameters = JSON.parse(fs.readFileSync(version + ".json").toString());
    }
    parameters.debugRewriteOptions = debugParameters.rewriteOptions;
} catch (e) {
    console.error("Unknown or invalid version", e);
    process.exit();
}

// Get the list of sources
debug("\tGetting the list of sources...");
require("../src/sources.js");

// Read sources
gpf.sources().every(function (name) {
    if (!name) {
        // end marker
        return false;
    }
    debug("\tReading " + name + "...");
    sources[name] = fs.readFileSync("../src/" + name + ".js").toString();
    return true;
});
debug("\tReading UMD...");
sources.UMD = fs.readFileSync("UMD.js").toString();
debug("\tReading boot...");
sources.boot = fs.readFileSync("../src/boot.js").toString();

function mkDir (path) {
    var parentPath;
    if (!fs.existsSync(path)) {
        parentPath = path.split("/");
        parentPath.pop();
        parentPath = parentPath.join("/");
        if (parentPath) {
            mkDir(parentPath);
        }
        fs.mkdirSync(path);
    }
}

debug("\tCreating working folder...");
parameters.temporaryPath = "../tmp/build/" + version;
mkDir(parameters.temporaryPath);

//Go over sources to create other temporary folders
gpf.sources().every(function (name) {
    if (!name) {
        // end marker
        return false;
    }
    if (name.indexOf("/")) {
        // remove file name
        name = name.split("/");
        name.pop();
        mkDir(parameters.temporaryPath + "/" + name.join("/"));
    }
    return true;
});


try {
    result = build(sources, parameters, debug);
} catch (e) {
    console.error(e.message);
    if (e.step) {
        console.error("Step: " + e.step);
    }
    if (e.sourceName) {
        console.error("Source name: " + e.sourceName);
    }
    process.exit();
}

debug("\tCreating output folder...");
mkDir("../build");
fs.writeFileSync("../build/gpf-" + version + ".js", result);

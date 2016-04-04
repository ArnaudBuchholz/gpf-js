"use strict";

var fs = require("fs"),
    build = require("./build.js"),
    version = "debug",
    debug,
    parameters,
    debugParameters,
    sources,
    sourcesDict = {},
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
sources = JSON.parse(fs.readFileSync("../src/sources.json"))
    .filter(function (source) {
        return source.load !== false;
    })
    .map(function (source) {
        return source.name;
    });

// Read sources
sources.forEach(function (name) {
    debug("\tReading " + name + "...");
    sourcesDict[name] = fs.readFileSync("../src/" + name + ".js").toString();
});
debug("\tReading UMD...");
sourcesDict.UMD = fs.readFileSync("UMD.js").toString();
debug("\tReading boot...");
sourcesDict.boot = fs.readFileSync("../src/boot.js").toString();

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
sources.forEach(function (name) {
    if (name.indexOf("/")) {
        // remove file name
        name = name.split("/");
        name.pop();
        mkDir(parameters.temporaryPath + "/" + name.join("/"));
    }
});

try {
    result = build(sourcesDict, parameters, debug);
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

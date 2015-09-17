"use strict";
/*global require, global, process*/

var fs = require("fs"),
    build = require("./build.js"),
    version = process.argv[2] || "debug",
    parameters,
    debugParameters,
    sources = {},
    result;

console.log("Generating version '" + version + "'");
try {
    debugParameters = JSON.parse(fs.readFileSync("debug.json").toString());
    if ("debug" !== version) {
        parameters = JSON.parse(fs.readFileSync(version + ".json").toString());
    } else {
        parameters = debugParameters;
    }
    parameters.debugRewriteOptions = debugParameters.rewriteOptions;
} catch (e) {
    console.error("Unknown or invalid version");
    process.exit();
}

// Get the list of sources
global.gpf = {};
require("../src/sources.js");

// Read sources
gpf.sources().every(function (name) {
    if (!name) {
        // end marker
        return false;
    }
    sources[name] = fs.readFileSync("../src/" + name + ".js").toString();
});
sources.UMD = fs.readFileSync("UMD.js").toString();
sources.boot = fs.readFileSync("../src/boot.js").toString();

function mkDir(path) {
    if (!fs.existsSync(path)) {
        var parentPath = path.split("/").spice(0, -1).join("/");
        if (parentPath) {
            mkDir(parentPath);
        }
        fs.mkdirSync(path);
    }
}

parameters.temporaryPath = "../tmp/build/" + version;
mkDir(parameters.temporaryPath);

try {
    result = build(sources, parameters);
} catch (e) {
    console.error(e.message);
    process.exit();
}

mkDir("../build");
fs.writeFileSync("../build/gpf-" + version + ".js", result);

// Use google closure compiler
var cc = parameters.cc;
if (cc) {
    require("closure-compiler").compile(result, {}, function (err, stdout/*, stderr*/) {
        if (err) {
            console.error(err);
        } else {
            fs.writeFileSync("../build/" + cc + ".js", stdout);
        }
    });
}

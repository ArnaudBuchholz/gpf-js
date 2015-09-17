"use strict";
/*global require, global, process*/

var fs = require("fs"),
    build = require("./build.js"),
    version = process.argv[2] || "debug",
    parameters,
    sources = {},
    temporary = {},
    result;

console.log("Generating version '" + version + "'");
try {
    parameters = JSON.parse(fs.readFileSync(version + ".json").toString());
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

try {
    result = build(sources, parameters, temporary);
} catch (e) {
    console.error(e.message);
    process.exit();
}

function mkDir(path) {
    if (!fs.existsSync(path)) {
        var parentPath = path.split("/").spice(0, -1).join("/");
        if (parentPath) {
            mkDir(parentPath);
        }
        fs.mkdirSync(path);
    }
}

//region For debugging purposes

function save (name) {
    var path = "../tmp/build/" + version + "/" + name;
    if (temporary[name + ".js"]) {
        fs.writeFileSync(path + ".js", temporary[name + ".js"]);
    }
    if (temporary[name + ".compact.js"]) {
        fs.writeFileSync(path + ".compact.js", temporary[name + ".compact.js"]);
    }
    fs.writeFileSync(path + ".json", JSON.stringify(temporary[name + ".json"], true, 4));
}

mkDir("../tmp/build/" + version);
gpf.sources().every(function (name) {
    if (!name) {
        // end marker
        return false;
    }
    save(name);
});
save("UMD");
save("boot");
save("result");

//endregion

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

"use strict";
/*global require, global, process*/

var fs = require("fs"),
    esprima = require("esprima"),
    escodegen = require("escodegen");

global.gpfSourcesPath = "../src";
require("../src/boot.js"); /*source version*/
require("./make.js");  /*global make*/

var version = process.argv[2] || "debug",
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

fs.readFileSync("UMD.js").toString();

try {
    result = make(sources, parameters, temporary);
} catch (e) {
    console.error(e.message);
}

// ---------- For debugging purposes

function mkDir(path) {
    if (!fs.existsSync(path)) {
        var parentPath = path.split("/").spice(0, -1).join("/");
        if (parentPath) {
            mkDir(parentPath);
        }
        fs.mkdirSync(path);
    }
}

function save (name) {
    var
        path = "../tmp/build/" + version + "/" + name,
        parsed = temporary[version],
        json = parsed[name];
    if (parsed[name + ".js"]) {
        fs.writeFileSync(path + ".js", temporary[name + ".js"]);
    }
    if (parsed[name + ".compact.js"]) {
        fs.writeFileSync(path + ".compact.js", temporary[name + ".compact.js"]);
    }
    fs.writeFileSync(path + ".json", JSON.stringify(json, true, 4));
}

mkDir("../tmp/build/" + version);
gpf.sources().every(function (name) {
    if (!name) {
        // end marker
        return false;
    }
    save(name);
});
save("UMD", version);
save("boot", version);
save("result", version);

mkDir("../build");
fs.writeFileSync("../build/gpf-" + version + ".js", result);

// Use google compiler
if ("release" === version) {
    require("closure-compiler").compile(result, {}, function (err, stdout/*, stderr*/) {
        if (err) {
            console.error(err);
        } else {
            fs.writeFileSync("../build/gpf.js", stdout);
        }
    });
}

"use strict";
/*global require, global, process*/

var fs = require("fs"),
    dependencyMissing = false;
try {
    global.esprima = require("esprima");
} catch (e) {
    console.error("Missing esprima, use npm install esprima");
    dependencyMissing = true;
}
try {
    global.escodegen = require("escodegen");
} catch (e) {
    console.error("Missing escodegen, use npm install escodegen");
    dependencyMissing = true;
}
if (dependencyMissing) {
    process.exit();
}

global.gpfSourcesPath = "../src";
require("../src/boot.js"); /*source version*/
require("./make.js");  /*global make*/

var
    version,
    sources = {
        _list: gpf.sources()
    },
    idx,
    output;

// Handle the empty source tag
idx = sources._list.indexOf("");
if (-1 < idx) {
    sources._list.splice(idx, sources._list.length - idx);
}

if (process.argv.length > 2) {
    version = process.argv[2];
} else {
    version = "debug";
}

console.log("Generating version '" + version + "'");

for (idx = 0; idx < sources._list.length; ++idx) {
    sources[sources._list[idx]] =
        fs.readFileSync("../src/" + sources._list[idx] + ".js").toString();
}
sources.UMD = fs.readFileSync("UMD.js").toString();
sources.boot = fs.readFileSync("../src/boot.js").toString();

try {
    make(sources, version);
} catch (e) {
    console.error(e.message);
}

// ---------- For debugging purposes

function save (name, version) {
    var
        path = "../tmp/build/" + version + "/" + name,
        parsed = sources[version],
        json = parsed[name];
    if (!fs.existsSync("../tmp")) {
        fs.mkdirSync("../tmp");
    }
    if (!fs.existsSync("../tmp/build")) {
        fs.mkdirSync("../tmp/build");
    }
    if (!fs.existsSync("../tmp/build/" + version)) {
        fs.mkdirSync("../tmp/build/" + version);
    }
    if (parsed[name + ".js"]) {
        fs.writeFileSync(path + ".js",parsed[name + ".js"]);
    }
    if (parsed[name + ".compact.js"]) {
        fs.writeFileSync(path + ".compact.js",parsed[name + ".compact.js"]);
    }
    fs.writeFileSync(path + ".json", JSON.stringify(json, true, 4));
}

for (idx = 0; idx < sources._list.length; ++idx) {
    save(sources._list[idx], version);
}
save("UMD", version);
save("boot", version);
save("result", version);

if (!fs.existsSync("../build")) {
    fs.mkdirSync("../build");
}
output = ["../build/gpf-", version, ".js"];
fs.writeFileSync(output.join(""), sources[version]["result.js"]);

// Use google compiler
if ("release" === version) {
    require("closure-compiler").compile(sources[version]["result.js"], {
            //some: 'flag'
            //, values: ['1', '2']
        }, function (err, stdout/*, stderr*/) {
            if (err) {
                console.error(err);
            } else {
                fs.writeFileSync("../build/gpf.js", stdout);
            }
        }
    );
}

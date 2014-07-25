"use strict";

var fs = require("fs");
try {
    global.esprima = require("esprima");
} catch (e) {
    console.error("Missing esprima, use npm install esprima");
}
try {
    global.escodegen = require("escodegen");
} catch (e) {
    console.error("Missing escodegen, use npm install escodegen");
}
require("../boot.js"); /*source version*/
require("./make.js");  /*global make*/

var
    version,
    sources = {
        _list: gpf.sources().split(",")
    },
    idx,
    output;

if (process.argv.length > 2) {
    version = process.argv[2];
} else {
    version = "debug";
}

console.log("Generating version '" + version + "'");

for (idx = 0; idx < sources._list.length; ++idx) {
    sources[sources._list[idx]] =
        fs.readFileSync("../" + sources._list[idx] + ".js").toString();
}
sources.UMD = fs.readFileSync("UMD.js").toString();
sources.boot = fs.readFileSync("../boot.js").toString();

try {
    make(sources, version);
} catch (e) {
    console.error(e.message);
}

// ---------- For debugging purposes

function toXml(json) {
    var
        stream = gpf.stringToStream(),
        contentHandler = new gpf.xml.Writer(stream),
        node = new gpf.xml.ConstNode(json);
    node.toXml(contentHandler);
    return gpf.stringFromStream(stream);
}

function save (name, version) {
    var
        path = "tmp/" + version + "/" + name,
        parsed = sources[version],
        json = parsed[name];
    if (!fs.existsSync("tmp")) {
        fs.mkdirSync("tmp");
    }
    if (!fs.existsSync("tmp/" + version)) {
        fs.mkdirSync("tmp/" + version);
    }
    if (parsed[name + ".js"]) {
        fs.writeFileSync(path + ".js",parsed[name + ".js"]);
    }
    if (parsed[name + ".compact.js"]) {
        fs.writeFileSync(path + ".compact.js",parsed[name + ".compact.js"]);
    }
    fs.writeFileSync(path + ".json", JSON.stringify(json, true, 4));
//    fs.writeFileSync(path + ".xml", toXml(json));
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
output = ["../build/gpf"];
if (version !== "release") {
    output.push("-", version);
}
output.push(".js");
fs.writeFileSync(output.join(""), sources[version]["result.js"]);

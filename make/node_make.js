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
    sources = {
        _list: gpf.sources().split(",")
    },
    idx;

for (idx = 0; idx < sources._list.length; ++idx) {
    sources[sources._list[idx]] =
        fs.readFileSync("../" + sources._list[idx] + ".js").toString();
}
sources.UMD = fs.readFileSync("UMD.js").toString();
sources.boot = fs.readFileSync("../boot.js").toString();

try {
    console.log(make(sources, "debug"));
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

function save (name, version, parsed) {
    var
        path = "tmp/" + version + "/" + name,
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
    fs.writeFileSync(path + ".json", JSON.stringify(json, true, 4));
    fs.writeFileSync(path + ".xml", toXml(json));
}

for (idx = 0; idx < sources._list.length; ++idx) {
    save(sources._list[idx], "debug", sources.debug);
}
save("UMD", "debug", sources.debug);
save("boot", "debug", sources.debug);
save("result", "debug", sources.debug);


// fs.writeFileSync("gpf_debug.js", make(sources, "debug"));
// fs.writeFileSync('gpf.js', make(sources, 'release'));
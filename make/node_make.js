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
require("../boot.js");
require("./make.js"); /*global make*/

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

console.log(make(sources, "debug"));

// ---------- For debugging purposes

function toXml(json) {
    var
        stream = gpf.stringToStream(),
        contentHandler = new gpf.xml.Writer(stream),
        node = new gpf.xml.ConstNode(json);
    node.toXml(contentHandler);
    return gpf.stringFromStream(stream);
}

function save (name, json) {
    fs.writeFileSync("tmp/" + name + ".json", JSON.stringify(json, true, 4));
    fs.writeFileSync("tmp/" + name + ".xml", toXml(json));
}

if (!fs.existsSync("tmp")) {
    fs.mkdirSync("tmp");
}
for (idx = 0; idx < sources._list.length; ++idx) {
    save(sources._list[idx], sources.parsed[sources._list[idx]]);
}
save("UMD", sources.parsed.UMD);
save("boot", sources.parsed.boot);

// fs.writeFileSync("gpf_debug.js", make(sources, "debug"));
// fs.writeFileSync('gpf.js', make(sources, 'release'));
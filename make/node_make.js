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

console.log(make(sources, "debug"));

if (!fs.existsSync("tmp")) {
    fs.mkdirSync("tmp");
}
for (idx = 0; idx < sources._list.length; ++idx) {
    fs.writeFileSync("tmp/" + sources._list[idx] + ".json",
        JSON.stringify(sources.parsed[sources._list[idx]], true, 4));
}
fs.writeFileSync("tmp/UMD.json", JSON.stringify(sources.parsed.UMD, true, 4));
// fs.writeFileSync("gpf_debug.js", make(sources, "debug"));
// fs.writeFileSync('gpf.js', make(sources, 'release'));
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
require("./make.js");

var
    sources = {
        _list: gpf.sources().split(",")
    },
    idx;

for (idx = 0; idx < sources._list.length; ++idx) {
    sources[sources._list[idx]] =
        fs.readFileSync("../" + sources._list[idx] + ".js").toString();
}
sources["UMD"] = fs.readFileSync("UMD.js").toString();

console.log(make(sources, "debug"));
// fs.writeFileSync("gpf_debug.js", make(sources, "debug"));
// fs.writeFileSync('gpf.js', make(sources, 'release'));
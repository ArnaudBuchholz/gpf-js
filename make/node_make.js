var
    fs = require("fs"),
    esprima = require("../lib/esprima.js");

require("../boot.js");
require("./make.js");

var
    sources = {
        _list: gpf.sources().split(",")
    },
    idx;

for (idx = 0; idx < sources._list.length; ++idx) {
    sources[sources._list[idx]] =
        fs.readFileSync('../' + sources._list[idx] + '.js').toString();
    console.log(sources[sources._list[idx]]);
}

fs.writeFileSync('debug.js', make(sources, 'debug'));
fs.writeFileSync('release.js', make(sources, 'release'));




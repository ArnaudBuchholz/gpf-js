/*jshint node: true*/
/*eslint-env node*/
"use strict";

// allows require("gpf-js/source")

const
    path = require("path"),
    fs = require("fs"),
    gpfSourcesPath = path.join(__dirname, "../../../gpf-js/src"),
    backupOfGpfSourcePath = global.gpfSourcesPath,
    backupOfGpf = global.gpf,

    restoreGlobal = (name, value) => {
        if (undefined === value) {
            delete global[name];
        } else {
            global[name] = value;
        }
    };

let
    stats;

try {
    stats = fs.statSync(gpfSourcesPath);
} catch (e) {}

if (stats && stats.isDirectory()) {
    global.gpfSourcesPath = gpfSourcesPath + path.sep;
    require(gpfSourcesPath + "/boot.js");
    restoreGlobal("gpfSourcesPath", backupOfGpfSourcePath);
    module.exports = gpf;
    restoreGlobal("gpf", backupOfGpf);
} else {
    module.exports = require("./build/gpf.js");
}

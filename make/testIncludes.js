"use strict";

const
    fs = require("fs"),
    path = require("path"),
    ConfigFile = require("./configFile.js"),
    configFile = new ConfigFile(true),
    outPath = path.join(__dirname, "../tmp/build/testIncludes.js");

let
    testIncludes = "";

fs.writeFileSync(outPath, testIncludes);

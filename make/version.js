"use strict";

var fs = require("fs");

var packageJson = JSON.parse(fs.readFileSync("package.json").toString()),
    packageVersion = packageJson.version,
    bootSrc = fs.readFileSync("src/boot.js").toString(),
    bootVersionMatch = (/_gpfVersion += +\"(.*)\"/).exec(bootSrc),
    bootVersion = bootVersionMatch[1];

if (bootVersion !== packageVersion) {
    console.log("Package version: " + packageJson.version);
    console.log("Boot version   : " + bootVersion);
    bootSrc = bootSrc.replace(bootVersionMatch[0], "_gpfVersion = \"" + packageVersion + "\"");
    fs.writeFileSync("src/boot.js", bootSrc);
    console.log("src/boot.js updated" + bootVersion);
}

"use strict";

const
    fs = require("fs"),
    build = require("./build.js"),
    flavor = require("./flavor.js"),
    sources = JSON.parse(fs.readFileSync("../src/sources.json")),
    dependencies = JSON.parse(fs.readFileSync("../build/dependencies.json")),
    sourcesDict = {};
let
    debug = () => {},
    version = "debug",
    flavorSettings,
    flavorFilter,
    outputName,
    parametersType,
    parameters,
    debugParameters,
    sourcesToProcess,
    result;

// Cheap parameter parsing
process.argv.slice(2).forEach(value => {
    if ("-verbose" === value) {
        debug = function () {
            console.log.apply(console, arguments);
        };
    } else {
        version = value;
    }
});

if (version && 0 === version.indexOf("flavor/")) {
    flavorSettings = JSON.parse(fs.readFileSync(version + ".json").toString());
    outputName = "flavor-" + version.substr(7);
    flavorFilter = flavor(sources, dependencies, flavorSettings.flavor);
    parametersType = "release";
} else {
    outputName = version;
    parametersType = version;
}

console.log(`Generating version '${version}'`);
debug("\tReading generation parameters...");
try {
    debugParameters = JSON.parse(fs.readFileSync("debug.json").toString());
    if ("debug" === version) {
        parameters = debugParameters;
    } else {
        parameters = JSON.parse(fs.readFileSync(parametersType + ".json").toString());
    }
    parameters.debugRewriteOptions = debugParameters.rewriteOptions;
} catch (e) {
    console.error("Unknown or invalid version", e);
    process.exit();
}

// Get the list of sources
debug("\tGetting the list of sources to process...");
sourcesToProcess = sources
    .filter((source, index) => !flavorFilter || flavorFilter[index])
    .filter(source => source.load !== false)
    .map(source => source.name);

// Read sources
sourcesToProcess.forEach(name => {
    debug(`\tReading ${name}...`);
    sourcesDict[name] = fs.readFileSync(`../src/${name}.js`).toString();
});
debug("\tReading UMD...");
sourcesDict.UMD = fs.readFileSync("UMD.js").toString();
debug("\tReading boot...");
sourcesDict.boot = fs.readFileSync("../src/boot.js").toString();

function mkDir (path) {
    let parentPath;
    if (!fs.existsSync(path)) {
        parentPath = path.split("/");
        parentPath.pop();
        parentPath = parentPath.join("/");
        if (parentPath) {
            mkDir(parentPath);
        }
        fs.mkdirSync(path);
    }
}

debug("\tCreating working folder...");
parameters.temporaryPath = `../tmp/build/${version}`;
mkDir(parameters.temporaryPath);

//Go over sources to create other temporary folders
sourcesToProcess.forEach(name => {
    if (name.indexOf("/")) {
        // remove file name
        name = name.split("/");
        name.pop();
        mkDir(`${parameters.temporaryPath}/${name.join("/")}`);
    }
});

try {
    result = build(sourcesDict, parameters, debug);
} catch (e) {
    console.error(e.message);
    if (e.step) {
        console.error(`Step: ${e.step}`);
    }
    if (e.sourceName) {
        console.error(`Source name: ${e.sourceName}`);
    }
    process.exit();
}

debug("\tCreating output folder...");
mkDir("../build");
fs.writeFileSync(`../build/gpf-${outputName}.js`, result);

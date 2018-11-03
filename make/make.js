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
    flavorParameters,
    flavorFilter,
    output,
    generationParametersType,
    generationParameters,
    debugGenerationParameters,
    sourcesToProcess,
    result;

// Cheap parameter parsing
const AFTER_COMMAND = 2;
process.argv.slice(AFTER_COMMAND).forEach(value => {
    if (value === "-verbose") {
        debug = function () {
            console.log.apply(console, arguments);
        };
    } else {
        version = value;
    }
});

const flavorPrefix = "flavor/";
if (version && version.indexOf(flavorPrefix) === 0) {
    flavorParameters = JSON.parse(fs.readFileSync(version + ".json").toString());
    output = "gpf-" + version.substr(flavorPrefix.length);
    flavorFilter = flavor(sources, dependencies, flavorParameters.flavor);
    generationParametersType = "release";
} else {
    generationParametersType = version;
}

console.log(`Generating version '${version}'`);
debug("\tReading generation parameters...");
try {
    debugGenerationParameters = JSON.parse(fs.readFileSync("debug.json").toString());
    if (version === "debug") {
        generationParameters = debugGenerationParameters;
    } else {
        generationParameters = JSON.parse(fs.readFileSync(generationParametersType + ".json").toString());
    }
    generationParameters.debugRewriteOptions = debugGenerationParameters.rewriteOptions;
} catch (e) {
    console.error("Unknown or invalid version", e);
    process.exit();
}
if (!output) {
    output = generationParameters.output;
}
if (generationParameters.uglify) {
    output = `../tmp/build/${output}.js`;
} else {
    output = `../build/${output}.js`;
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
generationParameters.temporaryPath = `../tmp/build/${version}`;
mkDir(generationParameters.temporaryPath);

//Go over sources to create other temporary folders
sourcesToProcess.forEach(name => {
    if (name.indexOf("/")) {
        // remove file name
        let arrayOfNames = name.split("/");
        arrayOfNames.pop();
        mkDir(`${generationParameters.temporaryPath}/${arrayOfNames.join("/")}`);
    }
});

try {
    result = build(sourcesDict, generationParameters, debug);
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
fs.writeFileSync(output, result);

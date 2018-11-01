"use strict";

/*jshint rhino:true*/
/*eslint-env rhino*/

function getEnv (name) {
    return String(java.lang.System.getProperty(name));
}

var commandLineParameters,
    gpfPath = getEnv("user.dir"),
    pathSeparator = getEnv("file.separator"),
    readApi;

/* jshint ignore:start */
commandLineParameters = arguments;
/* jshint ignore:end */

if (typeof readFile === "undefined") {
    // Nashorn
    readApi = function (path) {
        return [].join.call(java.nio.file.Files.readAllLines(java.nio.file.Paths.get(path)), "\n");
    };
} else {
    // Rhino
    readApi = readFile;
}

load([
    gpfPath,
    "test",
    "host",
    "loader.js"
].join(pathSeparator));

/*global loadGpfAndTests*/

loadGpfAndTests({
    parameters: commandLineParameters,
    gpfPath: gpfPath,
    pathSeparator: pathSeparator,
    log: function (text) {
        print(text);
    },
    exit: function (code) {
        java.lang.System.exit(code);
    },
    read: readApi
});

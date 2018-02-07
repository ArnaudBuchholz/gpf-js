"use strict";

/*jshint rhino:true*/
/*eslint-env rhino*/

function getEnv (name) {
    return String(java.lang.System.getProperty(name));
}

var gpfPath = getEnv("user.dir"),
    pathSeparator = getEnv("file.separator"),
    readApi;

if ("undefined" === typeof readFile) {
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
    parameters: (function () {
        return arguments; //eslint-disable-line dot-notation, no-invalid-this
    }()),
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

 // no "use strict" to be able to set global context
/*jshint strict:false */
/*jshint rhino:true*/
/*eslint strict:0*/
/*eslint-env rhino*/
/*exported global*/

var global = (function () { //eslint-disable-line no-unused-vars
    return this;
}());

function getEnv (name) {
    return String(java.lang.System.getProperty(name));
}

var gpfPath = getEnv("user.dir"),
    pathSeparator = getEnv("file.separator"),
    readApi;

if ("undefined" === typeof readFile) {
    readApi = function (path) {
        return [].join.call(java.nio.file.Files.readAllLines(java.nio.file.Paths.get(path)), "\n");
    };
} else {
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
        return this["arguments"]; //eslint-disable-line dot-notation, no-invalid-this
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

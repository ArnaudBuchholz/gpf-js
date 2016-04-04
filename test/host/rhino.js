"use strict";
/*jshint rhino:true*/
/*eslint-env rhino*/
/*global environment*/

var gpfPath = environment["user.dir"];

load(gpfPath + "\\test\\host\\loader.js"); /*global loadGpfAndTests*/

loadGpfAndTests({
    parameters: (function () {
        return this["arguments"]; //eslint-disable-line dot-notation, no-invalid-this
    }()),
    gpfPath: gpfPath,
    pathSeparator: environment["file.separator"],
    log: function (text) {
        print(text);
    },
    exit: function (code) {
        java.lang.System.exit(code);
    },
    read: readFile
});

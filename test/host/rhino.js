"use strict";
/*jshint rhino:true*/
/*eslint-env rhino*/
/*global environment*/

/*jshint -W079*/

var gpfPath = environment["user.dir"],
    global = (function () {
        return this; //eslint-disable-line no-invalid-this
    }());

load(gpfPath + "\\test\\host\\loader.js"); /*global loadGpfAndTests*/

loadGpfAndTests({
    global: global,
    parameters: global["arguments"], //eslint-disable-line dot-notation
    gpfPath: gpfPath,
    pathSeparator: environment["file.separator"],
    log: function (text) {
        print(text);
    },
    exit: function (code) {
        java.lang.System.exit(code);
    },
    load: load
});

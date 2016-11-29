"use strict";
/*jshint wsh: true*/
/*eslint-env wsh*/
/*eslint-disable new-cap*/
/*jshint -W087*/

var fso = new ActiveXObject("Scripting.FileSystemObject"),
    len = WScript.Arguments.length,
    idx,
    parameters = [],
    gpfPath = WScript.ScriptFullName.split("\\").slice(0, -3).join("\\");
for (idx = 0; idx < len; ++idx) {
    parameters.push(WScript.Arguments(idx));
}

function read (path) {
    return fso.OpenTextFile(path, 1/*forReading*/, false, 0).ReadAll();
}

function load (path) {
    try {
        /*jslint evil: true*/
        eval(read(path)); //eslint-disable-line no-eval
        /*jslint evil: false*/
    } catch (e) {
        WScript.Echo("An error occurred while evaluating: " + path + "\r\n" + e.message);
        WScript.Quit(-1);
    }
}

load(gpfPath + "\\test\\host\\loader.js"); /*global loadGpfAndTests*/

loadGpfAndTests({
    parameters: parameters,
    gpfPath: gpfPath,
    pathSeparator: "\\",
    log: function (text) {
        WScript.Echo(text);
    },
    exit: function (code) {
        WScript.Quit(code);
    },
    read: read
});

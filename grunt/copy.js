"use strict";
/*jshint node: true*/
/*eslint-env node*/
/*global configuration*/

/*eslint-disable no-sync*/

var IO_PATH = "../ArnaudBuchholz.github.io/",
    fs = require("fs"),
    copy = {
        getPlatoHistory: {},
        setVersionPlato: {},
        publishVersion: {}
    };

if (fs.existsSync(IO_PATH)) {
    copy.getPlatoHistory = {
        expand: true,
        flatten: true,
        src: IO_PATH + "plato/gpf-js/report.history.*",
        dest: "./tmp/plato/"
    };
    copy.setVersionPlato = {
        expand: true,
        cwd: "./tmp/plato/",
        src: "**/*.*",
        dest: IO_PATH + "gpf/" + configuration.pkg.version + "/plato/"
    };
    copy.publishVersion = {
        expand: true,
        cwd: "./build/",
        src: ["gpf.js", "gpf-debug.js"],
        dest: IO_PATH + "gpf/" + configuration.pkg.version + "/"
    };
}

module.exports = copy;

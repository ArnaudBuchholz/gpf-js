"use strict";

var IO_PATH = "../ArnaudBuchholz.github.io/",
    fs = require("fs"),
    copy = {
        getPlatoHistory: {},
        publishVersionPlato: {},
        publishVersion: {},
        publishVersionDoc: {},
        publishTest: {},
        instrumentSourcesJson: {
            expand: true,
            cwd: "./src/",
            src: "**/*.json",
            dest: "./tmp/coverage/instrument/src/"
        }
    };

if (fs.existsSync(IO_PATH)) {
    copy.getPlatoHistory = {
        expand: true,
        flatten: true,
        src: IO_PATH + "plato/gpf-js/report.history.*",
        dest: "./tmp/plato/"
    };
    copy.publishVersionPlato = {
        expand: true,
        cwd: "./tmp/plato/",
        src: "**/*.*",
        dest: IO_PATH + "gpf/" + configuration.pkg.version + "/plato/"
    };
    copy.publishVersion = {
        expand: true,
        cwd: "./build/",
        src: ["gpf.js", "gpf-debug.js", "tests.js"],
        dest: IO_PATH + "gpf/" + configuration.pkg.version + "/"
    };
    copy.publishVersionDoc = {
        expand: true,
        cwd: "./tmp/doc/public",
        src: "**/*.*",
        dest: IO_PATH + "gpf/" + configuration.pkg.version + "/doc/"
    };
    copy.publishTest = {
        expand: true,
        cwd: "./test/host/",
        src: ["test.html", "bdd.js"],
        dest: IO_PATH + "gpf/"
    };
}

module.exports = copy;

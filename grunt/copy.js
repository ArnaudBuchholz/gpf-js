"use strict";

const
    IO_PATH = "../ArnaudBuchholz.github.io/",
    fs = require("fs"),
    copy = {
        getPlatoHistory: {
            expand: true,
            flatten: true,
            src: "./build/report.history.*",
            dest: "./tmp/plato/"
        },
        releasePlatoHistory: {
            expand: true,
            flatten: true,
            src: "./tmp/plato/report.history.*",
            dest: "./build/"
        },
        publishVersionPlato: {},
        publishVersion: {},
        publishVersionDoc: {},
        publishTest: {},
        publishTestRequire: {},
        instrumentSourcesJson: {
            expand: true,
            cwd: "./src/",
            src: "**/*.json",
            dest: "./tmp/coverage/instrument/src/"
        }
    };

if (fs.existsSync(IO_PATH)) {
    Object.assign(copy, {
        publishVersionPlato: {
            expand: true,
            cwd: "./tmp/plato/",
            src: "**/*.*",
            dest: IO_PATH + "gpf/" + configuration.pkg.version + "/plato/"
        },
        publishVersion: {
            expand: true,
            cwd: "./build/",
            src: ["gpf.js", "gpf-debug.js", "tests.js"],
            dest: IO_PATH + "gpf/" + configuration.pkg.version + "/"
        },
        publishVersionDoc: {
            expand: true,
            cwd: "./tmp/doc/public",
            src: "**/*.*",
            dest: IO_PATH + "gpf/" + configuration.pkg.version + "/doc/"
        },
        publishTest: {
            expand: true,
            cwd: "./test/host/",
            src: ["test.html", "bdd.js"],
            dest: IO_PATH + "gpf/"
        },
        publishTestRequire: {
            expand: true,
            cwd: "./test/require/",
            src: "**/*.*",
            dest: IO_PATH + "gpf/test-resources/require"
        }
    });
}

module.exports = copy;

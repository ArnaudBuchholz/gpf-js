"use strict";

const PUBLISH_PATH = "tmp/publish/";

module.exports = {
    publishVersionPlato: {
        expand: true,
        cwd: "./tmp/plato/",
        src: "**/*.*",
        dest: PUBLISH_PATH + "gpf/plato/"
    },
    publishVersion: {
        expand: true,
        cwd: "./build/",
        src: ["gpf.js", "gpf-debug.js", "tests.js"]
            .concat(Object.keys(configuration.files.flavors).map(flavor => `gpf-${flavor}.js`)),
        dest: PUBLISH_PATH + "gpf/" + configuration.pkg.version + "/"
    },
    publishVersionDoc: {
        expand: true,
        cwd: "./tmp/doc/public",
        src: "**/*.*",
        dest: PUBLISH_PATH + "gpf/doc/"
    },
    publishTest: {
        expand: true,
        cwd: "./test/host/",
        src: ["test.html", "bdd.js", "features.js"],
        dest: PUBLISH_PATH + "gpf/"
    },
    publishTestRequire: {
        expand: true,
        cwd: "./test/require/",
        src: "**/*.*",
        dest: PUBLISH_PATH + "gpf/test-resources/require"
    },
    publishTestData: {
        expand: true,
        cwd: "./test/data/",
        src: "**/*.*",
        dest: PUBLISH_PATH + "gpf/test-resources/data"
    },
    instrumentSourcesJson: {
        expand: true,
        cwd: "./src/",
        src: "**/*.json",
        dest: "./tmp/coverage/instrument/src/"
    }
};

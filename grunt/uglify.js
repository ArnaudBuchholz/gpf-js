"use strict";

module.exports = {
    buildTests: {
        files: {
            "build/tests.js": ["test/host/bdd.js", configuration.testFiles]
        }
    }
};

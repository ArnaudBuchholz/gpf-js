"use strict";

module.exports = {
    buildTests: {
        files: {
            "build/tests.js": ["test/host/bdd.js", configuration.testFiles]
        }
    },
    buildRelease: {
        files: {
            "build/gpf.js": ["build/gpf-release.js"]
        }
    }
};

"use strict";

module.exports = {
    options: {
        beautify: {
            keep_quoted_props: true //eslint-disable-line camelcase
        }
    },
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

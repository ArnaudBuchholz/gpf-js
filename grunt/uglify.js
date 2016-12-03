"use strict";

/*jshint camelcase: false */
/*eslint-disable camelcase*/

module.exports = {
    options: {
        beautify: {
            keep_quoted_props: true,
            ascii_only: true
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

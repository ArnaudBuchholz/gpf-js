"use strict";

/*jshint camelcase: false */
/*eslint-disable camelcase*/

module.exports = {
    options: {
        beautify: {
            keep_quoted_props: true,
            beautify: false
        },
        ie8: true,
        output: {
            ascii_only: true
        }
    },
    buildTests: {
        files: {
            "build/tests.js": configuration.files.test
        }
    },
    buildRelease: {
        files: {
            "build/gpf.js": ["build/gpf-release.js"]
        }
    }
};

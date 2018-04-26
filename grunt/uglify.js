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
    tests: {
        files: {
            "build/tests.js": configuration.files.test
        }
    },
    release: {
        files: {
            "build/gpf.js": ["build/gpf-release.js"]
        }
    },
    flavor: {
        files: {
            "build/gpf-<%= grunt.task.current.args[0] %>.js": ["build/gpf-flavor-<%= grunt.task.current.args[0] %>.js"]
        }
    }
};

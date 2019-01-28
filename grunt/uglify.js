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
            "build/tests.js": ["tmp/build/testIncludes.js"].concat(configuration.files.test)
        }
    },
    release: {
        files: {
            "build/gpf.js": ["tmp/build/gpf.js"]
        }
    },
    flavor: {
        files: {
            "build/gpf-<%= grunt.task.current.args[0] %>.js": ["tmp/build/gpf-<%= grunt.task.current.args[0] %>.js"]
        }
    }
};

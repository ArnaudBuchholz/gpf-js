"use strict";
/*jshint node: true*/
/*eslint-env node*/
/*global configuration*/

module.exports = {
    buildTests: {
        files: {
            "build/tests.js": ["test/host/bdd.js", configuration.testFiles]
        }
    }
};

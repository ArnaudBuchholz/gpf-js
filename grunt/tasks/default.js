"use strict";
/*jshint node: true*/
/*eslint-env node*/

module.exports = function (grunt) {
    grunt.registerTask("default", [
        "exec:globals",
        "jshint",
        "eslint",
        "istanbul",
        "coverage",
        "copy:getPlatoHistory",
        "plato",
        "exec:metrics"
    ]);
};

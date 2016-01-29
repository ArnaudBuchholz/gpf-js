"use strict";

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

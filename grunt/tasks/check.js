"use strict";

module.exports = function (grunt) {
    grunt.registerTask("check", [
        "exec:globals",
        "jshint",
        "eslint",
        "plato",
        "istanbul",
        "exec:metrics",
        "jsdoc:public",
        "connectIf",
        "exec:checkDoc"
    ]);
};

"use strict";

module.exports = function (grunt) {
    grunt.registerTask("check", [
        "exec:globals",
        "concurrent:linters",
        "concurrent:quality",
        "exec:metrics",
        "exec:buildLintingDoc",
        "jsdoc:public",
        "connectIf",
        "exec:checkDoc"
    ]);
};

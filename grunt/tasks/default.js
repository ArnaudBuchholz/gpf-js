"use strict";

module.exports = function (grunt) {
    grunt.registerTask("default", [
        "exec:globals",
        "concurrent:linters",
        "concurrent:quality",
        "exec:metrics"
    ]);
};

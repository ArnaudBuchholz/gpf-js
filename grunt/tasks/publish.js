"use strict";

module.exports = function (grunt) {
    grunt.registerTask("publish", [
        "copy:publishVersionPlato",
        "copy:publishVersion",
        "copy:publishTest",
        "copy:publishTestRequire",
        "copy:publishTestData"
    ]);
};

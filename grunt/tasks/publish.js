"use strict";

module.exports = function (grunt) {
    grunt.registerTask("publish", [
        "copy:publishVersionPlato",
        "copy:publishVersion",
        "copy:publishVersionDoc",
        "copy:publishTest",
        "copy:publishTestRequire",
        "copy:publishTestData"
    ]);
};

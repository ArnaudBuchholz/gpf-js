"use strict";

module.exports = function (grunt) {
    grunt.registerTask("make", [].concat([
        "exec:version",
        "check",
        "connect:server",
        "concurrent:source",
        "exec:buildDebug",
        "exec:buildRelease",
        "uglify:buildRelease",
        "concurrent:debug",
        "concurrent:release",
        "uglify:buildTests",
        "copy:publishVersionPlato",
        "copy:publishVersion",
        "copy:publishTest"
    ]));
};

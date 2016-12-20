"use strict";

module.exports = function (grunt) {
    grunt.registerTask("make", [
        "exec:version",
        "check",
        "jsdoc:public",
        "connectIf",
        "concurrent:source",
        "exec:buildDebug",
        "exec:buildRelease",
        "uglify:buildRelease",
        "concurrent:debug",
        "concurrent:release",
        "uglify:buildTests",
        "exec:fixUglify",
        "copy:publishVersionPlato",
        "copy:publishVersion",
        "copy:publishVersionDoc",
        "copy:publishTest"
    ]);
};

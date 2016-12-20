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
        "exec:fixUglify:gpf",
        "concurrent:debug",
        "concurrent:release",
        "uglify:buildTests",
        "exec:fixUglify:tests",
        "copy:publishVersionPlato",
        "copy:publishVersion",
        "copy:publishVersionDoc",
        "copy:publishTest"
    ]);
};

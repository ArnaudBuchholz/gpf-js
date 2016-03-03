"use strict";

module.exports = function (grunt) {
    grunt.registerTask("make", [
        "exec:version",
        "default",
        "mocha:source",
        "exec:testWscript",
        "exec:testRhino",
        "exec:buildDebug",
        "exec:buildRelease",
        "uglify:buildRelease",
        "mocha:debug",
        "mochaTest:debug",
        "restoreConsole",
        "exec:testWscriptDebug",
        "exec:testRhinoDebug",
        "mocha:release",
        "mochaTest:release",
        "restoreConsole",
        "exec:testWscriptRelease",
        "exec:testRhinoRelease",
        "uglify:buildTests",
        "copy:publishVersionPlato",
        "copy:publishVersion",
        "copy:publishTest"
    ]);
};

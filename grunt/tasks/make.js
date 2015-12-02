"use strict";
/*jshint node: true*/
/*eslint-env node*/

module.exports = function (grunt) {
    grunt.registerTask("make", [
        "exec:version",
        "default",
        "mocha:source",
        "exec:testWscript",
        "exec:testRhino",
        "exec:buildDebug",
        "exec:buildRelease",
        "mocha:debug",
        "mochaTest:debug",
        "exec:testWscriptDebug",
        "mocha:release",
        "mochaTest:release",
        "exec:testWscriptRelease",
        "copy:setVersionPlato",
        "copy:publishVersion"
    ]);
};

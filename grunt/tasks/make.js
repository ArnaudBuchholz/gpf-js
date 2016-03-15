"use strict";

module.exports = function (grunt) {
    var testTasks = [
        "exec:testWscript",
        "exec:testRhino"
    ];
    configuration.selenium.forEach(function (browser) {
        testTasks.push("exec:test" + browser.charAt(0).toUpperCase() + browser.substr(1));
    });
    grunt.registerTask("make", [].concat([
        "exec:version",
        "default",
        "mocha:source"
    ], testTasks, [
        "exec:buildDebug",
        "exec:buildRelease",
        "uglify:buildRelease",
        "mocha:debug",
        "mochaTest:debug",
        "restoreConsole"
    ], testTasks.map(function (name) {
        return name + "Debug";
    }), [
        "mocha:release",
        "mochaTest:release",
        "restoreConsole"
    ], testTasks.map(function (name) {
        return name + "Release";
    }), [
        "uglify:buildTests",
        "copy:publishVersionPlato",
        "copy:publishVersion",
        "copy:publishTest"
    ]));
};

"use strict";
/*jshint node: true*/
/*eslint-env node*/

module.exports = function (grunt) {

    require("time-grunt")(grunt);

    // Build the list of valid source and test files based on sources.json
    var sources = grunt.file.readJSON("src/sources.json"),
        srcFiles = ["src/boot.js"],
        testFiles = [];
    sources.forEach(function (source) {
        var name = source.name;
        if (source.load !== false) {
            srcFiles.push("src/" + name + ".js");
            if (source.test !== false) {
                testFiles.push("test/" + name + ".js");
            }
        }
    });

    // Since the tasks are split using load-grunt-config, I need a global object containing the configuration
    global.configuration = {
        pkg: grunt.file.readJSON("./package.json"),
        selenium: (function () {
            try {
                return grunt.file.readJSON("./tmp/selenium.json");
            } catch (e) {
                console.warn("Tested selenium driver list is missing, use node detectSelenium");
            }
            return [];
        }()),
        srcFiles: srcFiles,
        testFiles: testFiles,
        jsLintedFiles: [
            "Gruntfile.js",
            "grunt/**/*.js",
            "statistics.js",
            ".eslintrules/*.js",
            "make/*.js",
            "test/host/**/*.js",
            "res/*.js"
        ]
            .concat(srcFiles)
            .concat(testFiles)
    };

    require("load-grunt-config")(grunt);
    grunt.task.loadTasks("grunt/tasks");

};

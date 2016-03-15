"use strict";
/*jshint node: true*/
/*eslint-env node*/

module.exports = function (grunt) {

    require("time-grunt")(grunt);

    // Build the list of valid source and test files based on sources.js
    var srcFiles = ["src/boot.js", "src/sources.js"],
        testFiles = [];
    require("./src/sources.js");
    gpf.sources().every(function (name) {
        if (name) {
            srcFiles.push("src/" + name + ".js");
            testFiles.push("test/" + name + ".js");
            return true;
        }
        return false;
    });

    function _isSeleniumDriverInstalled (name) {
        if (!_isSeleniumDriverInstalled.list) {
            try {
                _isSeleniumDriverInstalled.list = grunt.file.readJSON("tmp/selenium.json");
            } catch (e) {
                _isSeleniumDriverInstalled.list = 0;
            }
        }
        if (!_isSeleniumDriverInstalled.list) {
            var list = _isSeleniumDriverInstalled.list = [];
            console.log("Building tmp/selenium.json");
            grunt.file.mkdir("tmp");
            _isSeleniumDriverInstalled.list = [];
            var webDriver = require("selenium-webdriver");
            [
                "chrome",
                "firefox",
                "ie"
            ].forEach(function (browser) {
                try {
                    var driver = new webDriver.Builder()
                        .forBrowser(browser)
                        .build();
                    console.log("Adding " + browser);
                    list.push(browser);
                    driver.quit();
                } catch (e) {
                    console.log(browser + " not detected");
                }
            });
            grunt.file.write("tmp/selenium.json", JSON.stringify(list));
        }
        return -1 < _isSeleniumDriverInstalled.list.indexOf(name);
    }

    // Since the tasks are split using load-grunt-config, I need a global object containing the configuration
    global.configuration = {
        pkg: grunt.file.readJSON("./package.json"),
        isSeleniumDriverInstalled: _isSeleniumDriverInstalled,
        srcFiles: srcFiles,
        testFiles: testFiles,
        jsLintedFiles: [
            "Gruntfile.js",
            "grunt/*.js",
            "statistics.js",
            ".eslintrules/*.js",
            "make/*.js",
            "test/host/*.js",
            "test/host/mocha/nodejs.js",
            "res/*.js"
        ]
            .concat(srcFiles)
            .concat(testFiles)
    };

    require("load-grunt-config")(grunt);
    grunt.task.loadTasks("grunt/tasks");

};

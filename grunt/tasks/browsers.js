"use strict";

module.exports = function (grunt) {
    configuration.selenium.browsers.forEach(function (browser) {
        grunt.registerTask(browser, [
            "connectIf",
            "exec:test" + browser.charAt(0).toUpperCase() + browser.substr(1) + "Verbose"
        ]);
    });
};

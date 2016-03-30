"use strict";

module.exports = function (grunt) {
    configuration.selenium.forEach(function (browser) {
        grunt.registerTask(browser, [
            "connect:server",
            "exec:test" + browser.charAt(0).toUpperCase() + browser.substr(1) + "Verbose"
        ]);
    });
};

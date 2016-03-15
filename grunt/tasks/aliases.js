"use strict";

module.exports = function (grunt) {
    grunt.registerTask("plato", "exec:plato");
    grunt.registerTask("wscript", "exec:testWscriptVerbose");
    grunt.registerTask("rhino", "exec:testRhinoVerbose");
    configuration.selenium.forEach(function (browser) {
        grunt.registerTask(browser, "exec:test" + browser.charAt(0).toUpperCase() + browser.substr(1) + "Verbose");
    });
};

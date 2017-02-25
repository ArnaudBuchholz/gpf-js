"use strict";

module.exports = function (grunt) {
    Object.keys(configuration.browsers).forEach(function (browserName) {
        grunt.registerTask(browserName, [
            "connectIf",
            "exec:test" + browserName.charAt(0).toUpperCase() + browserName.substr(1) + "Verbose"
        ]);
    });
};

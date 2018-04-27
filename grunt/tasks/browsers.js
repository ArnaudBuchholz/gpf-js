"use strict";

const
    tools = require("../../res/tools.js");

module.exports = function (grunt) {
    Object.keys(configuration.browsers).forEach(browserName => {
        grunt.registerTask(browserName, [
            "connectIf",
            `exec:test${tools.capitalize(browserName)}Verbose`
        ]);
    });
};

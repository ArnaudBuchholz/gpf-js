"use strict";

const
    openURL = require("opn");

module.exports = function (grunt) {
    grunt.registerTask("open_tiles", () => {
        openURL("http://localhost:" + configuration.serve.httpPort);
    });
};

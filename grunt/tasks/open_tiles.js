"use strict";

const
    open = require("opn");

module.exports = function (grunt) {
    grunt.registerTask("open_tiles", () => {
        open("http://localhost:" + configuration.serve.httpPort);
    });
};

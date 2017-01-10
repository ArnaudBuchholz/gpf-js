"use strict";

module.exports = function (grunt) {
    grunt.registerTask("config", function () {
        grunt.util.spawn({
            cmd: "node",
            args: ["make/config"],
            opts: {
                stdio: "inherit"
            }
        }, this.async()); //eslint-disable-line no-invalid-this
    });
};

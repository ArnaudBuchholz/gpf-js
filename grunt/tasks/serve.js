"use strict";

module.exports = function (grunt) {
    grunt.registerTask("serve", [
        "connect:server",
        "watch"
    ]);
};

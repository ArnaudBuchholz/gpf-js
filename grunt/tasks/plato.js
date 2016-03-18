"use strict";

module.exports = function (grunt) {
    grunt.registerTask("plato", [
        "copy:getPlatoHistory",
        "exec:plato"
    ]);
};

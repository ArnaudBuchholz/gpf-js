"use strict";

module.exports = function (grunt) {
    grunt.registerTask("plato", [
        "clean:plato",
        "copy:getPlatoHistory",
        "exec:plato"
    ]);
};

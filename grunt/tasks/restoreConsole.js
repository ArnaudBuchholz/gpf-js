"use strict";

module.exports = function (grunt) {
    grunt.registerTask("restoreConsole", function () {
        if (undefined !== console.restore) {
            console.restore();
        }
    });
};

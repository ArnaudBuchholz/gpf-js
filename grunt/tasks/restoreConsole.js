"use strict";
/*jshint node: true*/
/*eslint-env node*/

module.exports = function (grunt) {
    grunt.registerTask("restoreConsole", function () {
        if (undefined !== console.restore) {
            console.restore();
        }
    });
};

"use strict";
/*jshint node: true*/
/*eslint-env node*/

module.exports = function (grunt) {
    grunt.registerTask("istanbul", [
        "instrument",
        "fixInstrument",
        "mochaTest:coverage",
        "storeCoverage",
        "makeReport"
    ]);
};

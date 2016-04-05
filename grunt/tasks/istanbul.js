"use strict";

module.exports = function (grunt) {
    grunt.registerTask("istanbul", [
        "instrument",
        "fixInstrument",
        "copy:sourcesJson",
        "mochaTest:coverage",
        "storeCoverage",
        "makeReport",
        "coverage"
    ]);
};

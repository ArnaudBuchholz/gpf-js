"use strict";

module.exports = function (grunt) {
    grunt.registerTask("istanbul", [
        "instrument",
        "fixInstrument",
        "mochaTest:coverage",
        "storeCoverage",
        "makeReport",
        "coverage"
    ]);
};

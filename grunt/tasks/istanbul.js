"use strict";

module.exports = function (grunt) {

    grunt.registerTask("fixInstrument", function () {
        // Because code generation uses templates that are instrumented, the __cov_XXX variables must be global
        var fs = require("fs");
        configuration.srcFiles.forEach(function (fileName) {
            var srcPath = "tmp/coverage/instrument/" + fileName,
                instrumentedLines = fs
                    .readFileSync(srcPath)
                    .toString()
                    .split("\n"),
            // Assuming the __cov_ variable is on the second line
                secondLine = instrumentedLines[1];
            if (0 === secondLine.indexOf("var ")) {
                instrumentedLines[1] = "global." + secondLine.substr(4);
                fs.writeFileSync(srcPath, instrumentedLines.join("\n"));
                console.log(fileName + " updated");
            }
        });
    });

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

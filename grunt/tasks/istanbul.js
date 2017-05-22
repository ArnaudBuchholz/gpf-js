"use strict";

module.exports = function (grunt) {

    grunt.registerTask("fixInstrument", () => {
        // Because code generation uses templates that are instrumented, the __cov_XXX variables must be global
        const fs = require("fs");
        configuration.files.src.forEach(fileName => {
            let srcPath = `tmp/coverage/instrument/${fileName}`,
                instrumentedLines = fs
                    .readFileSync(srcPath)
                    .toString()
                    .split("\n"),
            // Assuming the __cov_ variable is on the second line
                secondLine = instrumentedLines[1];
            if (0 === secondLine.indexOf("var ")) {
                instrumentedLines[1] = `global.${secondLine.substr(4)}`;
                fs.writeFileSync(srcPath, instrumentedLines.join("\n"));
                console.log(`${fileName} updated`);
            }
        });
    });


    let coverageTasks = [
        "instrument",
        "fixInstrument",
        "copy:instrumentSourcesJson",
        "connectIf",
        "mochaTest:coverage",
        "storeCoverage",
        "exec:testPhantomCoverage"
    ];

    if (configuration.host.java) {
        coverageTasks.push("exec:testRhinoCoverage");
    }

    if (configuration.host.wscript) {
        coverageTasks.push("exec:testWscriptCoverage");
    }

    // Prefer chrome if possible
    if (configuration.browsers.chrome) {
        coverageTasks.push("exec:testChromeCoverage");
    } else {
        let browser = Object.keys(configuration.browsers)[0];
        if (browser) {
            coverageTasks.push(`exec:test${browser.charAt(0).toUpperCase() + browser.substr(1)}Coverage`);
        } else {
            grunt.fail.warn("No browser configured");
        }
    }

    coverageTasks.push("makeReport", "coverage");

    grunt.registerTask("istanbul", coverageTasks);
};

"use strict";

/*eslint-disable max-nested-callbacks*/

const
    fs = require("fs"),

    mergeCounts = (dest, src) => Object.keys(src).forEach(key => {
        if (dest[key]) {
            dest[key] += src[key];
        } else {
            dest[key] = src[key];
        }
    }),

    mergeBranches = (dest, src) => Object.keys(src).forEach(key => {
        if (dest[key]) {
            dest[key][0] += src[key][0];
            dest[key][1] += src[key][1];
        } else {
            dest[key] = src[key];
        }
    }),

    mergeCoverageData = (dst, src, fileName) => {
        let dstCoverageData = dst[fileName],
            srcCoverageData = src[fileName];
        if (dstCoverageData) {
            // Assuming the maps are properly generated
            mergeCounts(dstCoverageData.s, srcCoverageData.s);
            mergeCounts(dstCoverageData.f, srcCoverageData.f);
            mergeBranches(dstCoverageData.b, srcCoverageData.b);
        } else {
            dst[fileName] = srcCoverageData;
        }
    };

module.exports = function (grunt) {

    grunt.registerTask("mergeCoverage", () => {
        let coverage = fs.readFileSync("tmp/coverage/reports/coverage.json");
        [
            "browser",
            "phantomjs",
            "rhino",
            "wscript"
        ].forEach(host => {
            let hostCoverage = fs.readFileSync(`tmp/coverage/reports/coverage.${host}.json`);
            Object.keys(hostCoverage).forEach(mergeCoverageData.bind(null, coverage, hostCoverage));
        });
        fs.writeFileSync("tmp/coverage/reports/coverage.json", JSON.stringify(coverage));
    });

    grunt.registerTask("fixInstrument", () => {
        // Because code generation uses templates that are instrumented, the __cov_XXX variables must be global
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

    coverageTasks.push(/*"mergeCoverage", */ "makeReport", "coverage");

    grunt.registerTask("istanbul", coverageTasks);
};

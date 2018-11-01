"use strict";

/*eslint-disable max-nested-callbacks*/

const
    tools = require("../../res/tools.js"),
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
    },

    mergeCoverage = (dst, src) => {
        Object.keys(src).forEach(fileName => {
            mergeCoverageData(dst, src, fileName);
        });
    },

    ConfigFile = require("../../make/configFile.js"),

    getHosts = () => {
        const
            configFile = new ConfigFile(),
            hosts = ["phantomjs"];
        if (Object.keys(configFile.content.browsers).length !== 0) {
            hosts.push("browser");
        }
        if (configFile.content.host.java) {
            hosts.push("rhino");
        }
        if (configFile.content.host.nashorn) {
            hosts.push("nashorn");
        }
        if (configFile.content.host.wscript) {
            hosts.push("wscript");
        } else {
            hosts.push("nodewscript");
        }
        return hosts;
    };


module.exports = function (grunt) {

    grunt.registerTask("mergeCoverage", () => {
        let coverage = grunt.file.readJSON("tmp/coverage/reports/coverage.json");
        getHosts()
            .map(host => host === "nodewscript" ? "wscript" : host)
            .forEach(host => {
                try {
                    let hostCoverage = grunt.file.readJSON(`tmp/coverage/reports/coverage.${host}.json`);
                    mergeCoverage(coverage, hostCoverage);
                } catch (e) {
                    grunt.fail.warn(`Missing coverage information for ${host}: ${e.toString()}`);
                }
            });
        fs.writeFileSync("tmp/coverage/reports/coverage.json", JSON.stringify(coverage));
    });

    grunt.registerTask("fixInstrument", () => {
        // Because code generation uses templates that are instrumented, the __cov_XXX variables must be global
        configuration.files.src.forEach(fileName => {
            let srcPath = `tmp/coverage/instrument/${fileName}`,
                instrumentedLines = fs.readFileSync(srcPath).toString().split("\n"),
                // Assuming the __cov_ variable is on the second line
                secondLine = instrumentedLines[1];
            if (secondLine.indexOf("var ") === 0) {
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
        "storeCoverage"

    ].concat(getHosts()
        .filter(host => host !== "browser")
        .map(host => host === "phantomjs" ? "phantom" : host)
        .map(host => `exec:test${tools.capitalize(host)}Coverage`)
    );

    // Prefer chrome if possible
    if (configuration.browsers.chrome) {
        coverageTasks.push("exec:testChromeCoverage");
    } else {
        let browser = Object.keys(configuration.browsers)[0];
        if (browser) {
            coverageTasks.push(`exec:test${tools.capitalize(browser)}Coverage`);
        }
    }

    coverageTasks.push("mergeCoverage", "makeReport", "coverage");

    grunt.registerTask("istanbul", coverageTasks);
};

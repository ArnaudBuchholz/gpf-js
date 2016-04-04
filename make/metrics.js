"use strict";

var fs = require("fs");

// Use gpf library (source version)
global.gpfSourcesPath = "./src/";
require("../src/boot.js");
var sources = JSON.parse(fs.readFileSync("./src/sources.json"))
    .filter(function (source) {
        return source.load !== false;
    })
    .map(function (source) {
        return source.name;
    });
sources.unshift("boot"); // Also include boot

//region Istanbul coverage

function computeItemCoverage (itemData, itemId) {
    /*jshint validthis:true*/ // See below
    var me = this, //eslint-disable-line no-invalid-this
        itemMap = me.map[itemId];
    ++me.count;
    if (0 < itemData) {
        ++me.tested;
    } else if (itemMap.skip) {
        ++me.ignored;
    }
}

function computeBranchCoverage (itemData, itemId) {
    /*jshint validthis:true*/ // See below
    var me = this, //eslint-disable-line no-invalid-this
        itemMap = me.map[itemId];
    me.count += 2;
    if (0 < itemData[0]) {
        ++me.tested;
    } else if (itemMap.locations[0].skip) {
        ++me.ignored;
    }
    if (0 < itemData[1]) {
        ++me.tested;
    } else if (itemMap.locations[1].skip) {
        ++me.ignored;
    }
}

var coverageData = JSON.parse(fs.readFileSync("tmp/coverage/reports/coverage.json")),
    coverageParts = {
        statements: {
            data: "s",
            map: "statementMap",
            handler: computeItemCoverage
        },
        functions: {
            data: "f",
            map: "fnMap",
            handler: computeItemCoverage
        },
        branches: {
            data: "b",
            map: "branchMap",
            handler: computeBranchCoverage
        }
    };

function computeCoverage (data)     {
    var result = {};
    gpf.forEach(coverageParts, function (coveragePart, partName) {
        var statistics = {
            count: 0,
            tested: 0,
            ignored: 0,
            map: data[coveragePart.map]
        };
        gpf.forEach(data[coveragePart.data], coveragePart.handler, statistics);
        result[partName] = {
            count: statistics.count,
            tested: statistics.tested,
            ignored: statistics.ignored
        };
    });
    return result;
}

function sumPartCoverage (globalPartCoverage, filePartCoverage) {
    globalPartCoverage.count += filePartCoverage.count;
    globalPartCoverage.tested +=  filePartCoverage.tested;
    globalPartCoverage.ignored += filePartCoverage.ignored;
}

function computeCoverageRatio (coverageItem, part) {
    var count = coverageItem[part].count;
    if (0 === count) {
        return 100;
    }
    return Math.floor(100 * (coverageItem[part].tested + coverageItem[part].ignored) / count);
}

var globalCoverage,
    hasCoverageError = false;
gpf.forEach(coverageData, function (fileCoverageData, fileName) {
    var fileCoverage = computeCoverage(fileCoverageData),
        fileTrace = [fileName, "                                        ".substr(fileName.length)],
        fileIsKO = false;
    if (globalCoverage) {
        // Sum everything
        gpf.forEach(coverageParts, function (coveragePart, partName) {
            sumPartCoverage(globalCoverage[partName], fileCoverage[partName]);
        });
    } else {
        globalCoverage = fileCoverage;
    }
    // Check individual coverage
    gpf.forEach(coverageParts, function (coveragePart, partName) {
        var ratio = computeCoverageRatio(fileCoverage, partName);
        if (ratio === 100) {
            ratio = "   ";
        } else if (ratio < 90) {
            ratio = "KO ";
            fileIsKO = true;
        } else {
            ratio += "%";
        }
        fileTrace.push(partName, ": ", ratio, " ");
    });
    if (fileIsKO) {
        console.error(fileTrace.join(""));
        hasCoverageError = true;
    } else {
        console.log(fileTrace.join(""));
    }
});

if (hasCoverageError) {
    process.exit(-1); // Coverage error
}

function getGlobalCoverage (part) {
    return computeCoverageRatio(globalCoverage, part);
}

function getGlobalIgnore (part) {
    return Math.floor(100 * globalCoverage[part].ignored / globalCoverage[part].count);
}

var statementsCoverage = getGlobalCoverage("statements"),
    statementsIgnored = getGlobalIgnore("statements"),
    functionsCoverage = getGlobalCoverage("functions"),
    functionsIgnored = getGlobalIgnore("functions"),
    branchesCoverage = getGlobalCoverage("branches"),
    branchesIgnored = getGlobalIgnore("branches");

//gpf.forEach(coverageParts, function (coveragePart, partName) {
//    console.log(partName + ": " + getGlobalCoverage(partName) + "% (ignored " + getGlobalIgnore(partName) + "%)");
//});

//endregion

//region Plato info

var platoData = JSON.parse(fs.readFileSync("tmp/plato/report.json")),
    platoSummary = platoData.summary,
    averageMaintainability = platoSummary.average.maintainability,
    linesOfCode = platoSummary.total.sloc,
    averageLinesOfCode = platoSummary.average.sloc;

// console.log("Average maintainability: " + averageMaintainability);
// console.log("Lines of code: " + linesOfCode);
// console.log("Average per module: " + averageLinesOfCode);

//endregion

//region mochaTest output

var mochaTestData = JSON.parse(fs.readFileSync("tmp/coverage/mochaTest.json")),
    numberOfTests = mochaTestData.stats.tests,
    pendingTests = mochaTestData.stats.pending,
    testDuration = mochaTestData.stats.duration;

// console.log("Number of tests: " + numberOfTests);
// console.log("Number of pending tests: " + pendingTests);
// console.log("Time to execute the tests: " + testDuration + "ms");

//endregion

var numberOfSources = sources.length;

// console.log("Number of modules: " + numberOfSources);

var SEPARATOR = "----- | ----- | -----",
    readme = fs.readFileSync("README.md").toString(),
    readmeSections = readme.split("##"),
    metricsSectionIndex;
readmeSections.every(function (section, index) {
    if (0 === section.indexOf(" Metrics")) {
        metricsSectionIndex = index;
        return false;
    }
    return true;
});
var metricsSectionHeader = readmeSections[metricsSectionIndex].split(SEPARATOR)[0],
    metrics = [
        "\r\nStatements coverage|", statementsCoverage, "%|*", statementsIgnored, "% ignored*",
        "\r\nBranches coverage|", branchesCoverage, "%|*", branchesIgnored, "% ignored*",
        "\r\nFunctions coverage|", functionsCoverage, "%|*", functionsIgnored, "% ignored*",
        "\r\nAverage maintainability|", averageMaintainability, "|",
        "\r\nNumber of tests|", numberOfTests, "|*pending: ", pendingTests, ", duration: ", testDuration, "ms*",
        "\r\nNumber of sources|", numberOfSources, "|",
        "\r\nLines of Code|", linesOfCode, "|*Average per source: ", averageLinesOfCode, "*",
        "\r\n\r\n"
    ];
readmeSections[metricsSectionIndex] = metricsSectionHeader + SEPARATOR + metrics.join("");
fs.writeFileSync("README.md", readmeSections.join("##"));

process.exit(0); // OK

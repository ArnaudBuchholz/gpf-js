"use strict";

var fs = require("fs"),
    CoverageReport = require("./coverage");

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

var metrics = JSON.parse(fs.readFileSync("tmp/config.json")).metrics;

//region Istanbul coverage

var coverageReport = new CoverageReport(JSON.parse(fs.readFileSync("tmp/coverage/reports/coverage.json"))),
    globalCoverage = coverageReport.getGlobal(),
    hasCoverageError = false,
    coverageParts = ["statements", "functions", "branches"];

sources.forEach(function (sourceName) {
    var fileCoverage = coverageReport.get(sourceName),
        fileTrace = [sourceName, "                                  ".substr(sourceName.length)],
        fileIsKO = false;
    if (fileCoverage) {
        coverageParts.forEach(function (coveragePart) {
            var ratio = fileCoverage[coveragePart].getCoverageRatio(true);
            if (ratio < metrics.coverage[coveragePart]) {
                fileIsKO = true;
            }
            if (ratio === 100) {
                ratio = "   ";
            } else {
                ratio += "%";
            }
            fileTrace.push(coveragePart, ": ", ratio, " ");
        });
    } else {
        fileTrace.push(" - ignored -");
    }
    if (fileIsKO) {
        console.error(fileTrace.join(""));
        hasCoverageError = true;
    } else {
        console.log(fileTrace.join(""));
    }
});

var statementsCoverage = globalCoverage.statements.getCoverageRatio(),
    statementsIgnored = globalCoverage.statements.getIgnoredRatio(),
    functionsCoverage = globalCoverage.functions.getCoverageRatio(),
    functionsIgnored = globalCoverage.functions.getIgnoredRatio(),
    branchesCoverage = globalCoverage.branches.getCoverageRatio(),
    branchesIgnored = globalCoverage.branches.getIgnoredRatio();

coverageParts.forEach(function (coveragePart) {
    console.log(coveragePart + ":" + "                          ".substr(coveragePart.length)
        + globalCoverage[coveragePart].getCoverageRatio(true) + "% (ignored "
        + globalCoverage[coveragePart].getIgnoredRatio(true) + "%)");
});

//endregion

//region Plato info

var platoData = JSON.parse(fs.readFileSync("tmp/plato/report.json")),
    platoSummary = platoData.summary,
    averageMaintainability = platoSummary.average.maintainability,
    linesOfCode = platoSummary.total.sloc,
    averageLinesOfCode = platoSummary.average.sloc,
    hasMaintainabilityError = false;

platoData.reports.forEach(function (reportData) {
    var fileName = reportData.info.file,
        sourceName = fileName.substr(4, fileName.length - 7),
        fileTrace = [sourceName, "                                  ".substr(sourceName.length)],
        maintainability = reportData.complexity.maintainability,
        fileIsKO = false;
    fileTrace.push("maintainability: ", Math.floor(100 * maintainability) / 100);
    if (maintainability < metrics.maintainability) {
        fileIsKO = true;
    }
    if (fileIsKO) {
        console.error(fileTrace.join(""));
        hasMaintainabilityError = true;
    } else {
        console.log(fileTrace.join(""));
    }
});

console.log("Average maintainability:   " + averageMaintainability);
console.log("Lines of code:             " + linesOfCode);
console.log("Average per module:        " + averageLinesOfCode);

if (hasCoverageError || hasMaintainabilityError) {
    process.exit(-1); // Coverage error
}

//endregion

//region mochaTest output

var mochaTestData = JSON.parse(fs.readFileSync("tmp/coverage/mochaTest.json")),
    numberOfTests = mochaTestData.stats.tests,
    pendingTests = mochaTestData.stats.pending,
    testDuration = mochaTestData.stats.duration;

console.log("Number of tests:           " + numberOfTests);
console.log("Number of pending tests:   " + pendingTests);
console.log("Time to execute the tests: " + testDuration + "ms");

//endregion

var numberOfSources = sources.length;

console.log("Number of modules:         " + numberOfSources);

var SEPARATOR = "------ | ----- | ----- | ----- | -----",
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
    metricsSection = [
        "\r\nStatements coverage|", statementsCoverage, "%||", metrics.coverage.statements, "%|*",
        statementsIgnored, "% ignored*",
        "\r\nBranches coverage|", branchesCoverage, "%||", metrics.coverage.branches, "%|*",
        branchesIgnored, "% ignored*",
        "\r\nFunctions coverage|", functionsCoverage, "%||", metrics.coverage.functions, "%|*",
        functionsIgnored, "% ignored*",
        "\r\nMaintainability|", averageMaintainability, "||", metrics.maintainability, "|",
        "\r\nNumber of tests||", numberOfTests, "||*pending: ", pendingTests, ", duration: ", testDuration, "ms*",
        "\r\nNumber of sources||", numberOfSources, "||",
        "\r\nLines of code|", averageLinesOfCode, "|", linesOfCode, "||",
        "\r\n\r\n"
    ];
readmeSections[metricsSectionIndex] = metricsSectionHeader + SEPARATOR + metricsSection.join("");
fs.writeFileSync("README.md", readmeSections.join("##"));

process.exit(0); // OK

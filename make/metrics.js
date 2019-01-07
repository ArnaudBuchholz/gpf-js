"use strict";

// Use gpf library (source version)
global.gpfSourcesPath = "./src/";
require("../src/boot.js");

const
    OK = 0,
    KO = -1,
    fs = require("fs"),
    CoverageReport = require("./coverage"),
    sources = ["boot"].concat(
        JSON.parse(fs.readFileSync("./src/sources.json"))
            .filter(source => source.load !== false)
            .map(source => source.name)
    ),
    configuredMetrics = JSON.parse(fs.readFileSync("tmp/config.json")).metrics,
    releaseMetrics = {},

    safeCoverage = process.argv.some(arg => arg === "safeCoverage");

//region Istanbul coverage

const
    SOURCE_PADDING = 34,
    COVERAGE_PADDING = 27,
    coverageReport = new CoverageReport(JSON.parse(fs.readFileSync("tmp/coverage/reports/coverage.json"))),
    globalCoverage = coverageReport.getGlobal(),
    coverageParts = ["statements", "functions", "branches"];
let
    hasCoverageError = false;

sources.forEach(sourceName => {
    const
        PERFECT_RATIO = 100,
        fileCoverage = coverageReport.get(sourceName),
        fileTrace = [sourceName.padEnd(SOURCE_PADDING, " ")];
    let
        fileIsKO = false;
    if (fileCoverage) {
        coverageParts.forEach(coveragePart => {
            let ratio = fileCoverage[coveragePart].getCoverageRatio(true);
            if (ratio < configuredMetrics.coverage[coveragePart]) {
                fileIsKO = true && !safeCoverage;
            }
            if (ratio === PERFECT_RATIO) {
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

releaseMetrics.coverage = {
    statements: {
        total: globalCoverage.statements.getCoverageRatio(),
        ignored: globalCoverage.statements.getIgnoredRatio()
    },
    functions: {
        total: globalCoverage.functions.getCoverageRatio(),
        ignored: globalCoverage.functions.getIgnoredRatio()
    },
    branches: {
        total: globalCoverage.branches.getCoverageRatio(),
        ignored: globalCoverage.branches.getIgnoredRatio()
    }
};

coverageParts.forEach(coveragePart => {
    console.log(`${(coveragePart + ":").padEnd(COVERAGE_PADDING, " ")}`
        + `${globalCoverage[coveragePart].getCoverageRatio(true)}%`
        + ` (ignored ${globalCoverage[coveragePart].getIgnoredRatio(true)}%)`);
});

//endregion

//region Plato info

const
    platoData = JSON.parse(fs.readFileSync("tmp/plato/report.json")),
    platoSummary = platoData.summary;
let
    hasMaintainabilityError = false;

releaseMetrics.maintainability = parseFloat(platoSummary.average.maintainability);
releaseMetrics.lines = {total: platoSummary.total.sloc, average: platoSummary.average.sloc};

platoData.reports.forEach(reportData => {
    const
        SKIP_SRC = 4,
        SKIP_EXT = 4,
        DIGITS = 2,
        fileName = reportData.info.file,
        sourceName = fileName.substring(SKIP_SRC, fileName.length - SKIP_EXT),
        fileTrace = [sourceName.padEnd(SOURCE_PADDING, " ")],
        maintainability = reportData.complexity.maintainability;
    let
        fileIsKO = false;
    fileTrace.push("maintainability: ", maintainability.toFixed(DIGITS));
    if (maintainability < configuredMetrics.maintainability) {
        fileIsKO = true;
    }
    if (fileIsKO) {
        console.error(fileTrace.join(""));
        hasMaintainabilityError = true;
    } else {
        console.log(fileTrace.join(""));
    }
});

console.log(`Average maintainability:   ${releaseMetrics.maintainability}`);
console.log(`Lines of code:             ${releaseMetrics.lines.total}`);
console.log(`Average per module:        ${releaseMetrics.lines.average}`);

if (hasCoverageError || hasMaintainabilityError) {
    process.exit(KO); // Coverage error
}

//endregion

//region mochaTest output

const
    mochaTestData = JSON.parse(fs.readFileSync("tmp/coverage/mochaTest.json")),
    pendingTests = mochaTestData.stats.pending,
    testDuration = mochaTestData.stats.duration;

releaseMetrics.tests = mochaTestData.stats.tests;

console.log(`Number of tests:           ${releaseMetrics.tests}`);
console.log(`Number of pending tests:   ${pendingTests}`);
console.log(`Time to execute the tests: ${testDuration}ms`);

//endregion

releaseMetrics.sources = sources.length;

console.log(`Number of modules:         ${releaseMetrics.sources}`);

const
    SEPARATOR = "------ | ----- | ----- | ----- | -----",
    readme = fs.readFileSync("README.md").toString(),
    readmeSections = readme.split("##");
let
    metricsSectionIndex,
    metricsSectionHeader,
    metricsSection;

readmeSections.every((section, index) => {
    if (section.startsWith(" Metrics")) {
        metricsSectionIndex = index;
        return false;
    }
    return true;
});

metricsSectionHeader = readmeSections[metricsSectionIndex].split(SEPARATOR).shift();
metricsSection = [
    `\r\nStatements coverage|${releaseMetrics.coverage.statements.total}%||${configuredMetrics.coverage.statements}%|*`,
    `${releaseMetrics.coverage.statements.ignored}% ignored*`,
    `\r\nBranches coverage|${releaseMetrics.coverage.branches.total}%||${configuredMetrics.coverage.branches}%|*`,
    `${releaseMetrics.coverage.branches.ignored}% ignored*`,
    `\r\nFunctions coverage|${releaseMetrics.coverage.functions.total}%||${configuredMetrics.coverage.functions}%|*`,
    `${releaseMetrics.coverage.functions.ignored}% ignored*`,
    `\r\nMaintainability|${releaseMetrics.maintainability}||${configuredMetrics.maintainability}|`,
    `\r\nNumber of tests||${releaseMetrics.tests}||*pending: ${pendingTests}, duration: ${testDuration}ms*`,
    `\r\nNumber of sources||${releaseMetrics.sources}||`,
    `\r\nLines of code|${releaseMetrics.lines.average}|${releaseMetrics.lines.total}||`,
    "\r\n\r\n"
];
readmeSections[metricsSectionIndex] = metricsSectionHeader + SEPARATOR + metricsSection.join("");
fs.writeFileSync("README.md", readmeSections.join("##"));

fs.writeFileSync("tmp/releaseMetrics.json", JSON.stringify(releaseMetrics));

process.exit(OK);

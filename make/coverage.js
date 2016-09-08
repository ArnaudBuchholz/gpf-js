(function () {
    "use strict";

    /**
     * Process the coverage data and generate a consolidated report
     *
     * @param {Object} coverageData Data produced by istanbul
     * @constructor
     * @class CoverageReport
     */
    function CoverageReport (converageData) {
    }

    //region Part (Statement, Function, Branch) Statistics structure

    /**
     * Part (Statement, Function, Branch) statistics
     *
     * @constructor
     * @class CoverageReport.PartStatistics
     */
    CoverageReport.PartStatistics = function () {
    };

    CoverageReport.PartStatistics.prototype = {

        // @property {Number} number of instances for this part
        count: 0,

        // @property {Number} number of tested instances
        tested: 0,

        // @property {Number} number of ignored instances
        ignored: 0
    };

    //endregion

    //region Region File statistics structure

    /**
     * File statistics
     *
     * @param {String} name
     * @constructor
     */
    CoverageReport.File = function (name) {
        this.name = name;
        this.statements = new CoverageReport.Statistics();
        this.functions = new CoverageReport.Statistics();
        this.branches = new CoverageReport.Statistics();
    };

    CoverageReport.File.prototype = {

        // @property {String} file name
        name: "",

        // @property {CoverageReport.PartStatistics} statements statistics
        statements: null,

        // @property {CoverageReport.PartStatistics} functions statistics
        functions: null,

        // @property {CoverageReport.PartStatistics} branches statistics
        branches: null
    };

    //endregion

    /**
     * Statement or functions coverage processing
     *
     * @param {Number} numberOfCall
     * @param {Object} info
     * @this {Object} consolidated statistics
     * - {Number} count
     * - {Number} tested
     * - {Number} ignored
     * - {Object} map dictionary translating id to statement or function info
     */
    CoverageReport._handleStatementOrFunctionCoverage = function (numberOfCall, info) {
        var me = this,
             = me.map[itemId];
        ++me.count;
        if (0 < itemData) {
            ++me.tested;
        } else if (info.skip) {
            ++me.ignored;
        }
    };

    /**
     * Statement or functions coverage processing
     *
     * @param {Number[]} numberOfCalls
     * - numberOfCalls[0] number of calls for then part
     * - numberOfCalls[1] number of calls for else part
     * @param {String} id
     * @this {Object} consolidated statistics
     * - {Number} count
     * - {Number} tested
     * - {Number} ignored
     * - {Object} map dictionary translating id to statement or function info
     */
    CoverageReport._handleBranchCoverage = function (numberOfCalls, id) {
        var me = this,
            info = me.map[itemId];
        me.count += 2;
        if (0 < numberOfCalls[0]) {
            ++me.tested;
        } else if (info.locations[0].skip) {
            ++me.ignored;
        }
        if (0 < numberOfCalls[1]) {
            ++me.tested;
        } else if (info.locations[1].skip) {
            ++me.ignored;
        }
    };

    CoverageReport._parts = {
        statements: {
            data: "s",
            map: "statementMap",
            handler: CoverageReport._handleStatementOrFunctionCoverage
        },
        functions: {
            data: "f",
            map: "fnMap",
            handler: CoverageReport._handleStatementOrFunctionCoverage
        },
        branches: {
            data: "b",
            map: "branchMap",
            handler: CoverageReport._handleBranchCoverage
        }
    };

    CoverageReport.prototype = {



    };

    if ("undefined" !== typeof window) {
        // Browser export
        window.CoverageReport = CoverageReport;
    }
    else if ("undefined" !== typeof module) {
        // NodeJS export
        module.exports = CoverageReport;
    }

}());

    function computeCoverage (data) {
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
            sourceName = fileName.substr(4, fileName.length - 7),
            fileTrace = [sourceName, "                                  ".substr(sourceName.length)],
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
            }
            ratio += "%";
            fileTrace.push(partName, ": ", ratio, " ");
        });
        if (fileIsKO) {
            console.error(fileTrace.join(""));
            hasCoverageError = true;
        } else {
            console.log(fileTrace.join(""));
        }
    });

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

    gpf.forEach(coverageParts, function (coveragePart, partName) {
        console.log(partName + ":" + "                          ".substr(partName.length)
            + getGlobalCoverage(partName) + "% (ignored " + getGlobalIgnore(partName) + "%)");
    });

};

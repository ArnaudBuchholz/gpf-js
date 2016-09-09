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
        ignored: 0,

        /**
         * Increase tested or ignored count accordingly to what happened
         *
         * @param {Number} numberOfCall
         * @param {Object} partDefinition
         * Only skip (Boolean) is tested
         */
        _testedOrIgnored: function (numberOfCall, partDefinition) {
            if (0 < numberOfCall) {
                ++this.tested;
            } else if (partDefinition.skip) {
                ++this.ignored;
            }
        },

        /**
         * Common coverage processing
         *
         * @param {Number} numberOfCall
         * @param {Object} partDefinition
         */
        processCoverage: function (numberOfCall, partDefinition) {
            ++this.count;
            this._testedOrIgnored(numberOfCall, partDefinition);
        }

    };

    /**
     * Statement statistics
     *
     * @constructor
     * @class CoverageReport.StatementStatistics
     */
    CoverageReport.StatementStatistics = function () {
        CoverageReport.PartStatistics.apply(this, arguments);
    };

    CoverageReport.StatementStatistics.prototype = new CoverageReport.PartStatistics();

    /**
     * Function statistics
     *
     * @constructor
     * @class CoverageReport.FunctionStatistics
     */
    CoverageReport.FunctionStatistics = function () {
        CoverageReport.PartStatistics.apply(this, arguments);
    };

    CoverageReport.FunctionStatistics.prototype = new CoverageReport.PartStatistics();

    /**
     * Branch statistics
     *
     * @constructor
     * @class CoverageReport.BranchStatistics
     */
    CoverageReport.BranchStatistics = function () {
        CoverageReport.PartStatistics.apply(this, arguments);
    };

    CoverageReport.BranchStatistics.prototype = new CoverageReport.PartStatistics();

    /**
     * Branch-specific coverage processing
     *
     * @param {Number[]} numberOfCalls
     * @param {Object} branchDefinition
     * locations array will used to fetch skip property of each branch
     */
    CoverageReport.BranchStatistics.prototype.processCoverage = function (numberOfCalls, branchDefinition) {
        this.count += 2;
        this._testedOrIgnored(numberOfCall[0], branchDefinition.locations[0]);
        this._testedOrIgnored(numberOfCall[1], branchDefinition.locations[1]);
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
        this.statements = new CoverageReport.StatementStatistics();
        this.functions = new CoverageReport.FunctionStatistics();
        this.branches = new CoverageReport.BranchStatistics();
    };

    CoverageReport.File.prototype = {

        // @property {String} file name
        name: "",

        // @property {CoverageReport.StatementStatistics} statements statistics
        statements: null,

        // @property {CoverageReport.FunctionStatistics} functions statistics
        functions: null,

        // @property {CoverageReport.BranchStatistics} branches statistics
        branches: null
    };

    //endregion

    CoverageReport._parts = [{
        type: "statements",
        data: "s",
        map: "statementMap"
    }, {
        type: "functions",
        data: "f",
        map: "fnMap"
    }, {
        type: "branches",
        data: "b",
        map: "branchMap"
    }];

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

    function computeFileCoverage (fileData, fileName) {
        var result = new CoverageReport.File(fileName)

        CoverageReport._parts.forEach(function (part) {
            var map = fileData[part.map],
                data = fileData[part.data];

        });

        Object.keys()

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
        var fileCoverage = computeFileCoverage(fileCoverageData),
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

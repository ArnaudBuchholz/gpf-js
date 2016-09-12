(function () {
    "use strict";

    /**
     * Process the coverage data and generate a consolidated report
     *
     * @param {Object} coverageData Data produced by istanbul
     * @constructor
     * @class CoverageReport
     */
    function CoverageReport (coverageData) {
        this._data = coverageData;
        this._compute();
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
        },

        /**
         * Adds information from another part statistics
         *
         * @param {CoverageReport.PartStatistics} partStatistics
         */
        add: function (partStatistics) {
            this.count += partStatistics.count;
            this.tested += partStatistics.tested;
            this.ignored += partStatistics.ignored;
        },

        /**
         * Returns coverage ratio in percent
         *
         * @return {number}
         */
        getCoverageRatio: function () {
            if (0 === this.count) {
                return 100;
            }
            return Math.floor(100 * (this.tested + this.ignored) / this.count);
        },

        /**
         * Returns ignored ratio in percent
         *
         * @return {number}
         */
        getIgnoredRatio: function () {
            if (0 === this.count) {
                return 0;
            }
            return Math.floor(100 * this.ignored / this.count);
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

        // @property {Object} coverage data
        _data: null,

        // @property {Object} dictionary of coverage per file
        _files: null,

        // @property {CoverageReport.File} global coverage
        _global: null,

        /**
         * Compute coverage for one file
         *
         * @param {String} fileName file name
         * @return {CoverageReport.File}
         */
        _computeFileCoverage: function (fileName) {
            var result = new CoverageReport.File(fileName),
                fileData = this._data[fileName];
            CoverageReport._parts.forEach(function (part) {
                var map = fileData[part.map],
                    data = fileData[part.data],
                    statistics = result[part.type];
                data.forEach(function (numberOfCall, partId) {
                    statistics.processCoverage(numberOfCall, map[partId]);
                });
            });
            return result;
        },

        /**
         * Compute all coverages
         */
        _compute: function () {
            this._files = {};
            this._global = new CoverageReport.File();
            Object.keys(this._data).forEach(function (fileName) {
                var fileCoverage = this._computeFileCoverage(fileName);
                this._files[fileName] = fileCoverage;
                this._global .statements.add(fileCoverage.statements);
                this._global .functions.add(fileCoverage.functions);
                this._global .branches.add(fileCoverage.branches);
            }, this);
        },

        getGlobal: function () {
            return this._global;
        }
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

/*eslint strict: [2, "function"]*/
/*jshint browser: true*/
/*eslint-disable no-invalid-this*/ // Because of the 'simple' class generation relying on lamda functions
/*eslint-env browser*/
(function () {
    "use strict";

    // Simple class helper
    function _class (Constructor, members, Base) {
        var ResultConstructor;
        if (!Constructor) {
            Constructor = function () {};
        }
        if (Base) {
            ResultConstructor = function () {
                Base.apply(this, arguments);
                Constructor.apply(this, arguments);
            };
            ResultConstructor.prototype = new Base();
        } else {
            ResultConstructor = function () {
                Constructor.apply(this, arguments);
            };
        }
        if (members) {
            Object.keys(members).forEach(function (memberName) {
                ResultConstructor.prototype[memberName] = members[memberName];
            });
        }
        return ResultConstructor;
    }

    /**
     * Part (Statement, Function, Branch) statistics
     *
     * @constructor
     * @class CoverageReport.PartStatistics
     */
    var _PartStatistics = _class(null, {

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

        _toPercent: function (count, total, rounded) {
            if (rounded) {
                return Math.floor(100 * count / total);
            }
            return Math.floor(10000 * count / total) / 100;
        },

        /**
         * Returns coverage ratio in percent
         *
         * @param {Boolean} rounded Truncate decimals when true
         * @return {Number}
         */
        getCoverageRatio: function (rounded) {
            if (0 === this.count) {
                return 100;
            }
            return this._toPercent(this.tested + this.ignored, this.count, rounded);
        },

        /**
         * Returns ignored ratio in percent
         *
         * @param {Boolean} rounded Truncate decimals when true
         * @return {Number}
         */
        getIgnoredRatio: function (rounded) {
            if (0 === this.count) {
                return 0;
            }
            return this._toPercent(this.ignored, this.count, rounded);
        }

    });

    /**
     * Statement statistics
     *
     * @constructor
     * @class CoverageReport.StatementStatistics
     */
    var _StatementStatistics = _class(null, null, _PartStatistics);

    /**
     * Function statistics
     *
     * @constructor
     * @class CoverageReport.FunctionStatistics
     */
    var _FunctionStatistics = _class(null, null, _PartStatistics);

    /**
     * Branch statistics
     *
     * @constructor
     * @class CoverageReport.BranchStatistics
     */
    var _BranchStatistics = _class(null, {

        /**
         * Branch-specific coverage processing
         *
         * @param {Number[]} numberOfCalls
         * @param {Object} branchDefinition
         * locations array will used to fetch skip property of each branch
         */
        processCoverage: function (numberOfCalls, branchDefinition) {
            this.count += 2;
            this._testedOrIgnored(numberOfCalls[0], branchDefinition.locations[0]);
            this._testedOrIgnored(numberOfCalls[1], branchDefinition.locations[1]);
        }

    }, _PartStatistics);

    //region Region File statistics structure

    /**
     * File statistics
     *
     * @param {String} name
     * @constructor
     */
    var _File = _class(function (name) {
        if (name) {
            if (-1 !== name.indexOf("\\")) {
                name = name.replace(/\\/g, "/");
            }
            this.name = name.split("src/")[1].split(".js")[0];
        }
        this.statements = new _StatementStatistics();
        this.functions = new _FunctionStatistics();
        this.branches = new _BranchStatistics();
    }, {

        // @property {String} file name
        name: "",

        // @property {CoverageReport.StatementStatistics} statements statistics
        statements: null,

        // @property {CoverageReport.FunctionStatistics} functions statistics
        functions: null,

        // @property {CoverageReport.BranchStatistics} branches statistics
        branches: null

    });

    /**
     * Process the coverage data and generate a consolidated report
     *
     * @param {Object} coverageData Data produced by istanbul
     * @constructor
     * @class CoverageReport
     */
    var CoverageReport = _class(function (coverageData) {
        this._data = coverageData;
        this._compute();
    }, {

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
            var result = new _File(fileName),
                fileData = this._data[fileName];
            [{
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
            }].forEach(function (part) {
                var map = fileData[part.map],
                    data = fileData[part.data],
                    statistics = result[part.type],
                    index = 1;
                while (undefined !== data[index]) {
                    statistics.processCoverage(data[index], map[index]);
                    ++index;
                }
            });
            return result;
        },

        /**
         * Compute all coverages
         */
        _compute: function () {
            this._files = {};
            this._global = new _File();
            Object.keys(this._data).forEach(function (fileName) {
                var fileCoverage = this._computeFileCoverage(fileName);
                this._files[fileCoverage.name] = fileCoverage;
                this._global.statements.add(fileCoverage.statements);
                this._global.functions.add(fileCoverage.functions);
                this._global.branches.add(fileCoverage.branches);
            }, this);
        },

        /**
         * Get file coverage information
         *
         * @param {String} fileName Name of the file to obtain
         * @return {_File|undefined} Coverage information
         */
        get: function (fileName) {
            return this._files[fileName];
        },

        /**
         * Get consolidated coverage information
         *
         * @return {_File} Coverage information
         */
        getGlobal: function () {
            return this._global;
        }

    });

    if ("undefined" !== typeof window) {
        // Browser export
        window.CoverageReport = CoverageReport;

    } else if ("undefined" !== typeof module) {
        // NodeJS export
        module.exports = CoverageReport;
    }

}());

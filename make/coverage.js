/*eslint strict: [2, "function"]*/
/*jshint browser: true*/
/*eslint-disable no-invalid-this*/ // Because of the 'simple' class generation relying on lamda functions
/*eslint-env browser*/
(function () {
    "use strict";

    /**
     * Simple class helper
     *
     * @param {Function} Constructor Constructor function
     * @param {Object} members Members dictionary
     * @param {Function} [Base] Base class
     * @return {Function} New class constructor
     * @private
     */
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

        /** number of instances for this part */
        count: 0,

        /** number of tested instances */
        tested: 0,

        /** number of ignored instances */
        ignored: 0,

        /**
         * Increase tested or ignored count accordingly to what happened
         *
         * @param {Number} numberOfCall Number of calls extracted from the coverage report
         * @param {Object} partDefinition Part definition
         * Only skip (Boolean) is tested
         * @return {undefined}
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
         * @param {Number} numberOfCall Number of calls extracted from the coverage report
         * @param {Object} partDefinition Part definition
         * @return {undefined}
         */
        processCoverage: function (numberOfCall, partDefinition) {
            ++this.count;
            this._testedOrIgnored(numberOfCall, partDefinition);
        },

        /**
         * Adds information from another part statistics
         *
         * @param {CoverageReport.PartStatistics} partStatistics Statistics to add
         * @return {undefined}
         */
        add: function (partStatistics) {
            this.count += partStatistics.count;
            this.tested += partStatistics.tested;
            this.ignored += partStatistics.ignored;
        },

        // Generates percent value
        _toPercent: function (count, total, rounded) {
            if (rounded) {
                return Math.floor(100 * count / total);
            }
            return Math.floor(10000 * count / total) / 100;
        },

        /**
         * @param {Boolean} rounded Truncate decimals when true
         * @return {Number} Coverage ratio in percent
         */
        getCoverageRatio: function (rounded) {
            if (0 === this.count) {
                return 100;
            }
            return this._toPercent(this.tested + this.ignored, this.count, rounded);
        },

        /**
         * @param {Boolean} rounded Truncate decimals when true
         * @return {Number} Ignored ratio in percent
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
         * @param {Number[]} numberOfCalls Number of calls extracted from the coverage report (one per branch)
         * @param {Object} branchDefinition Branch definition
         * locations array will used to fetch skip property of each branch
         * @return {undefined}
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

        /** file name */
        name: "",

        /**
         * Statements statistics
         *
         * @type {CoverageReport.StatementStatistics}
         */
        statements: null,

        /**
         * Functions statistics
         *
         * @type {CoverageReport.FunctionStatistics}
         */
        functions: null,

        /**
         * Branches statistics
         *
         * @type {CoverageReport.BranchStatistics}
         */
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

        /** coverage data */
        _data: null,

        /** dictionary of coverage per file */
        _files: null,

        /**
         * Global coverage
         *
         * @type {CoverageReport.File}
         */
        _global: null,

        /**
         * Compute coverage for one file
         *
         * @param {String} fileName File name
         * @return {CoverageReport.File} Coverage for one file
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
         *
         * @return {undefined}
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

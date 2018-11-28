"use strict";
/*eslint-disable no-invalid-this*/ // Because of the 'simple' class generation relying on lamda functions
/* MUST NOT BE MIGRATED TO ES6 BECAUSE USED IN A BROWSER */

function _noop () {}

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
var _PartStatistics = _class(_noop, {

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
     */
    _testedOrIgnored: function (numberOfCall, partDefinition) {
        if (numberOfCall) {
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
     */
    processCoverage: function (numberOfCall, partDefinition) {
        ++this.count;
        this._testedOrIgnored(numberOfCall, partDefinition);
    },

    /**
     * Adds information from another part statistics
     *
     * @param {CoverageReport.PartStatistics} partStatistics Statistics to add
     */
    add: function (partStatistics) {
        this.count += partStatistics.count;
        this.tested += partStatistics.tested;
        this.ignored += partStatistics.ignored;
    },

    _precision: 10000,
    _2digitsScale: 100,
    _0digitsScale: 10000,

    // Generates percent value
    _toPercent: function (count, total, rounded) {
        var scale;
        if (rounded) {
            scale = this._0digitsScale;
        } else {
            scale = this._2digitsScale;
        }
        return Math.floor(this._precision * count / total) / scale;
    },

    _coverageWhenNothing: 100,

    /**
     * @param {Boolean} [rounded] Truncate decimals when true
     * @return {Number} Coverage ratio in percent
     */
    getCoverageRatio: function (rounded) {
        if (this.count) {
            return this._toPercent(this.tested + this.ignored, this.count, rounded);
        }
        return this._coverageWhenNothing;
    },

    /**
     * @param {Boolean} [rounded] Truncate decimals when true
     * @return {Number} Ignored ratio in percent
     */
    getIgnoredRatio: function (rounded) {
        if (!this.count) {
            return this.count;
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
var _StatementStatistics = _class(_noop, null, _PartStatistics);

/**
 * Function statistics
 *
 * @constructor
 * @class CoverageReport.FunctionStatistics
 */
var _FunctionStatistics = _class(_noop, null, _PartStatistics);

/**
 * Branch statistics
 *
 * @constructor
 * @class CoverageReport.BranchStatistics
 */
var _BranchStatistics = _class(_noop, {

    /**
     * Branch-specific coverage processing
     *
     * @param {Number[]} numberOfCalls Number of calls extracted from the coverage report (one per branch)
     * @param {Object} branchDefinition Branch definition
     * locations array will used to fetch skip property of each branch
     */
    processCoverage: function (numberOfCalls, branchDefinition) {
        ["if", "else"].forEach(function (label, index) {
            ++this.count;
            this._testedOrIgnored(numberOfCalls[index], branchDefinition.locations[index]);
        }, this);
    }

}, _PartStatistics);

//region Region File statistics structure

/**
 * File statistics
 *
 * @param {String} name
 * @constructor
 */
var _File = _class(function (optionalName) {
    if (optionalName) {
        var match = optionalName.replace(/\\/g, "/").match(/src\/(.*)\.js$/),
            NAME = 1;
        this.name = match[NAME];
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

    /** Compute all coverages */
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

module.exports = CoverageReport;

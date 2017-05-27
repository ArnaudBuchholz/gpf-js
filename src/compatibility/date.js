/**
 * @file Date methods polyfill
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfInstallCompatibility*/ // Define and install compatible methods
/*global _gpfMainContext*/ // Main context object
/*global _gpfNewApply*/ // Apply new operator with an array of parameters
/*exported _gpfIsISO8601String*/ // Check if the string is an ISO 8601 representation of a date
/*#endif*/

function _pad (number) {
    if (10 > number) {
        return "0" + number;
    }
    return number;
}

_gpfInstallCompatibility("Date", {
    on: Date,

    methods: {

        // Introduced with JavaScript 1.8
        toISOString: function () {
            return this.getUTCFullYear()
                + "-"
                + _pad(this.getUTCMonth() + 1)
                + "-"
                + _pad(this.getUTCDate())
                + "T"
                + _pad(this.getUTCHours())
                + ":"
                + _pad(this.getUTCMinutes())
                + ":"
                + _pad(this.getUTCSeconds())
                + "."
                + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5)
                + "Z";
        }

    }

});

//region Date override

var _gpfISO8601RegExp = new RegExp("^([0-9][0-9][0-9][0-9])\\-([0-9][0-9])\\-([0-9][0-9])"
    + "(?:T([0-9][0-9])\\:([0-9][0-9])\\:([0-9][0-9])(?:\\.([0-9][0-9][0-9])Z)?)?$");

function _gpfCheckDateArray (dateArray) {
    if (dateArray[1] < 12
        && dateArray[2] < 32
        && dateArray[3] < 24
        && dateArray[4] < 60
        && dateArray[5] < 60) {
        return dateArray;
    }
}

function _gpfAddDatePartToArray (dateArray, datePart) {
    if (datePart) {
        dateArray.push(parseInt(datePart, 10));
    } else {
        dateArray.push(0);
    }
}

function _gpfToDateArray (matchResult) {
    var dateArray = [],
        len = matchResult.length, // 0 is the recognized string
        idx;
    for (idx = 1; idx < len; ++idx) {
        _gpfAddDatePartToArray(dateArray, matchResult[idx]);
    }
    return dateArray;
}

function _gpfProcessISO8601MatchResult (matchResult) {
    var dateArray;
    if (matchResult) {
        dateArray = _gpfToDateArray(matchResult);
        // Month must be corrected (0-based)
        --dateArray[1];
        // Some validation
        return _gpfCheckDateArray(dateArray);
    }

}

/**
 * Check if the value is a string respecting the ISO 8601 representation of a date. If so, the string is parsed and the
 * date details is returned.
 *
 * The function supports supports long and short syntax.
 *
 * @param {*} value Value to test
 * @return {Number[]|undefined} 7 numbers composing the date (Month is 0-based). undefined if not matching.
 * @since 0.1.5
 */
function _gpfIsISO8601String (value) {
    if ("string" === typeof value) {
        _gpfISO8601RegExp.lastIndex = 0;
        return _gpfProcessISO8601MatchResult(_gpfISO8601RegExp.exec(value));
    }
}

// Backup original Date constructor
var _GpfGenuineDate = _gpfMainContext.Date;

/**
 * Date constructor supporting ISO 8601 format
 *
 * @constructor
 * @since 0.1.5
 */
function _GpfDate () {
    var firstArgument = arguments[0],
        values = _gpfIsISO8601String(firstArgument);
    if (values) {
        return new _GpfGenuineDate(_GpfGenuineDate.UTC.apply(_GpfGenuineDate.UTC, values));
    }
    return _gpfNewApply(_GpfGenuineDate, arguments);
}

function _gpfCopyDateStatics () {
    var members = [
            "prototype", // Ensure instanceof
            "UTC",
            "parse",
            "now"
        ],
        len = members.length,
        idx,
        member;
    for (idx = 0; idx < len; ++idx) {
        member = members[idx];
        _GpfDate[member] = _GpfGenuineDate[member];
    }
}

function _gpfInstallCompatibleDate () {
    _gpfCopyDateStatics();
    // Test if ISO 8601 format variations are supported
    var supported = false;
    try {
        var longDate = new Date("2003-01-22T22:45:34.075Z"),
            shortDate = new Date("2003-01-22");
        supported = 2003 === longDate.getUTCFullYear()
            && 0 === longDate.getUTCMonth()
            && 22 === longDate.getUTCDate()
            && 22 === longDate.getUTCHours()
            && 45 === longDate.getUTCMinutes()
            && 34 === longDate.getUTCSeconds()
            && 75 === longDate.getUTCMilliseconds()
            && 2003 === shortDate.getUTCFullYear()
            && 0 === shortDate.getUTCMonth()
            && 22 === shortDate.getUTCDate();
    } catch (e) {} //eslint-disable-line no-empty
    if (!supported) {
        // Replace constructor with new one
        _gpfMainContext.Date = _GpfDate;
    }
}

_gpfInstallCompatibleDate();

//endregion

/*#ifndef(UMD)*/

gpf.internals._gpfIsISO8601String = _gpfIsISO8601String;
gpf.internals._GpfDate = _GpfDate;

/*#endif*/

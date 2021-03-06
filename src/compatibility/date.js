/**
 * @file Date methods polyfill
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_START*/ // 0
/*global _gpfArrayForEach*/ // Almost like [].forEach (undefined are also enumerated)
/*global _gpfCompatibilityInstallMethods*/ // Define and install compatible methods on standard objects
/*global _gpfMainContext*/ // Main context object
/*global _gpfNewApply*/ // Apply new operator with an array of parameters
/*exported _gpfIsISO8601String*/ // Check if the string is an ISO 8601 representation of a date
/*#endif*/

var _GPF_COMPATIBILITY_DATE_MONTH_OFFSET = 1,
    _GPF_COMPATIBILITY_DATE_2_DIGITS = 2,
    _GPF_COMPATIBILITY_DATE_3_DIGITS = 3;

function _gpfDatePad (value, count) {
    return value.toString().padStart(count, "0");
}

function _gpfDateToISOString (date) {
    return date.getUTCFullYear()
        + "-"
        + _gpfDatePad(date.getUTCMonth() + _GPF_COMPATIBILITY_DATE_MONTH_OFFSET, _GPF_COMPATIBILITY_DATE_2_DIGITS)
        + "-"
        + _gpfDatePad(date.getUTCDate(), _GPF_COMPATIBILITY_DATE_2_DIGITS)
        + "T"
        + _gpfDatePad(date.getUTCHours(), _GPF_COMPATIBILITY_DATE_2_DIGITS)
        + ":"
        + _gpfDatePad(date.getUTCMinutes(), _GPF_COMPATIBILITY_DATE_2_DIGITS)
        + ":"
        + _gpfDatePad(date.getUTCSeconds(), _GPF_COMPATIBILITY_DATE_2_DIGITS)
        + "."
        + _gpfDatePad(date.getUTCMilliseconds(), _GPF_COMPATIBILITY_DATE_3_DIGITS)
        + "Z";
}

_gpfCompatibilityInstallMethods("Date", {
    on: Date,

    methods: {

        // Introduced with JavaScript 1.8
        toISOString: function () {
            return _gpfDateToISOString(this);
        }

    },

    statics: {

        now: function () {
            return new Date().getTime();
        }

    }

});

//region Date override

var _gpfISO8601RegExp = new RegExp("^([0-9][0-9][0-9][0-9])\\-([0-9][0-9])\\-([0-9][0-9])"
    + "(?:T([0-9][0-9])\\:([0-9][0-9])\\:([0-9][0-9])(?:\\.([0-9][0-9][0-9])Z)?)?$"),
    _GPF_COMPATIBILITY_DATE_MONTH_PART = 1,
    _GPF_COMPATIBILITY_DATE_MAX_MONTH = 11,
    _GPF_COMPATIBILITY_DATE_DATE_PART = 2,
    _GPF_COMPATIBILITY_DATE_MAX_DATE = 31,
    _GPF_COMPATIBILITY_DATE_HOURS_PART = 3,
    _GPF_COMPATIBILITY_DATE_MAX_HOURS = 23,
    _GPF_COMPATIBILITY_DATE_MINUTES_PART = 4,
    _GPF_COMPATIBILITY_DATE_MAX_MINUTES = 59,
    _GPF_COMPATIBILITY_DATE_SECONDS_PART = 5,
    _GPF_COMPATIBILITY_DATE_MAX_SECONDS = 59;

function _gpfIsValidDateInDateArray (dateArray) {
    return dateArray[_GPF_COMPATIBILITY_DATE_MONTH_PART] <= _GPF_COMPATIBILITY_DATE_MAX_MONTH
        && dateArray[_GPF_COMPATIBILITY_DATE_DATE_PART] <= _GPF_COMPATIBILITY_DATE_MAX_DATE;
}

function _gpfIsValidTimeInDateArray (dateArray) {
    return dateArray[_GPF_COMPATIBILITY_DATE_HOURS_PART] <= _GPF_COMPATIBILITY_DATE_MAX_HOURS
        && dateArray[_GPF_COMPATIBILITY_DATE_MINUTES_PART] <= _GPF_COMPATIBILITY_DATE_MAX_MINUTES
        && dateArray[_GPF_COMPATIBILITY_DATE_SECONDS_PART] <= _GPF_COMPATIBILITY_DATE_MAX_SECONDS;
}

function _gpfCheckDateArray (dateArray) {
    if (_gpfIsValidDateInDateArray(dateArray) && _gpfIsValidTimeInDateArray(dateArray)) {
        return dateArray;
    }
}

var _GPF_COMPATIBILITY_DATE_PART_NOT_SET = 0;

function _gpfAddDatePartToArray (dateArray, datePart) {
    if (datePart) {
        dateArray.push(parseInt(datePart, 10));
    } else {
        dateArray.push(_GPF_COMPATIBILITY_DATE_PART_NOT_SET);
    }
}

function _gpfToDateArray (matchResult) {
    var dateArray = [],
        len = matchResult.length, // 0 is the recognized string
        idx = 1;
    for (; idx < len; ++idx) {
        _gpfAddDatePartToArray(dateArray, matchResult[idx]);
    }
    return dateArray;
}

var _GPF_COMPATIBILITY_DATE_MONTH_INDEX = 1;

function _gpfProcessISO8601MatchResult (matchResult) {
    var dateArray;
    if (matchResult) {
        dateArray = _gpfToDateArray(matchResult);
        // Month must be corrected (0-based)
        --dateArray[_GPF_COMPATIBILITY_DATE_MONTH_INDEX];
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
    if (typeof value === "string") {
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
    var firstArgument = arguments[_GPF_START],
        values = _gpfIsISO8601String(firstArgument);
    if (values) {
        return new _GpfGenuineDate(_GpfGenuineDate.UTC.apply(_GpfGenuineDate.UTC, values));
    }
    return _gpfNewApply(_GpfGenuineDate, arguments);
}

function _gpfCopyDateStatics () {
    _gpfArrayForEach([
        "prototype", // Ensure instanceof
        "UTC",
        "parse",
        "now"
    ], function (member) {
        _GpfDate[member] = _GpfGenuineDate[member];
    });
}

var _GPF_COMPATIBILITY_DATE_ISO_TEST = "2003-01-22T22:45:34.075Z",
    _GPF_COMPATIBILITY_DATE_SHORT_TEST = "2003-01-22";

function _gpfInstallCompatibleDate () {
    _gpfCopyDateStatics();
    // Test if ISO 8601 format variations are supported
    var longDateAsString,
        shortDateAsString;
    try {
        longDateAsString = _gpfDateToISOString(new Date(_GPF_COMPATIBILITY_DATE_ISO_TEST));
        shortDateAsString = _gpfDateToISOString(new Date(_GPF_COMPATIBILITY_DATE_SHORT_TEST));
    } catch (e) {} //eslint-disable-line no-empty
    if (longDateAsString !== _GPF_COMPATIBILITY_DATE_ISO_TEST
        || shortDateAsString !== _GPF_COMPATIBILITY_DATE_SHORT_TEST + "T00:00:00.000Z") {
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

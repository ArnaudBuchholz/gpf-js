/*#ifndef(UMD)*/
"use strict";
/*global _gpfGenericFactory*/ // Create any class by passing the right number of parameters
/*global _gpfInstallCompatibility*/ // Define and install compatible methods
/*global _gpfMainContext*/ // Main context object
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
            return [
                this.getUTCFullYear(),
                "-",
                _pad(this.getUTCMonth() + 1),
                "-",
                _pad(this.getUTCDate()),
                "T",
                _pad(this.getUTCHours()),
                ":",
                _pad(this.getUTCMinutes()),
                ":",
                _pad(this.getUTCSeconds()),
                ".",
                (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5),
                "Z"
            ].join("");
        }

    }

});

//region Date override

var _gpfISO8601RegExp = new RegExp([
    "^([0-9][0-9][0-9][0-9])",
    "\\-",
    "([0-9][0-9])",
    "\\-",
    "([0-9][0-9])",
    "(?:T",
    "([0-9][0-9])",
    "\\:",
    "([0-9][0-9])",
    "\\:",
    "([0-9][0-9])",
    "(?:\\.",
    "([0-9][0-9][0-9])",
    "Z)?)?$"
].join(""));

/**
 * Check if the string is an ISO 8601 representation of a date
 * Supports long and short syntax.
 *
 * @param {String} value
 * @returns {Number[]} 7 numbers composing the date (Month is 0-based)
 */
function _gpfIsISO8601String (value) {
    var matchResult,
        matchedDigits,
        result,
        len,
        idx;
    if ("string" === typeof value) {
        _gpfISO8601RegExp.lastIndex = 0;
        matchResult = _gpfISO8601RegExp.exec(value);
        if (matchResult) {
            result = [];
            len = matchResult.length - 1; // 0 is the recognized string
            for (idx = 0; idx < len; ++idx) {
                matchedDigits = matchResult[idx + 1];
                if (matchedDigits) {
                    result.push(parseInt(matchResult[idx + 1], 10));
                } else {
                    result.push(0);
                }
            }
            // Month must be corrected (0-based)
            --result[1];
            // Some validation
            if (result[1] < 12
                && result[2] < 32
                && result[3] < 24
                && result[4] < 60
                && result[5] < 60) {
                return result;
            }
        }
    }
}

// Backup original Date constructor
var _GpfGenuineDate = _gpfMainContext.Date;

/**
 * Date constructor supporting ISO 8601 format
 *
 * @returns {Date}
 */
function _GpfDate () {
    var firstArgument = arguments[0],
        values = _gpfIsISO8601String(firstArgument);
    if (values) {
        return new _GpfGenuineDate(_GpfGenuineDate.UTC.apply(_GpfGenuineDate.UTC, values));
    }
    return _gpfGenericFactory.apply(_GpfGenuineDate, arguments);
}

(function () {
    // Copy members
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
    /* istanbul ignore if */ // NodeJS environment supports ISO 8601 format
    if (!supported) {
        // Replace constructor with new one
        _gpfMainContext.Date = _GpfDate;
    }

}());

//endregion

/*#ifndef(UMD)*/

gpf.internals._gpfIsISO8601String = _gpfIsISO8601String;
gpf.internals._GpfDate = _GpfDate;

/*#endif*/

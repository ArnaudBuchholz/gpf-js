/**
 * @file String methods polyfill
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_NOT_FOUND*/ // -1
/*global _GPF_START*/ // 0
/*global _gpfCompatibilityInstallMethods*/ // Define and install compatible methods on standard objects
/*#endif*/

var _GPF_COMPATIBILITY_STRING_OPTIONAL_PARAM_INDEX = 1;

function _gpfStringGetOptionalParam (args, defaultValue) {
    var value = args[_GPF_COMPATIBILITY_STRING_OPTIONAL_PARAM_INDEX];
    if (!value) {
        return defaultValue;
    }
    return value;
}

var _GPF_COMPATIBILITY_STRING_ARRAY_LENGTH_OFFSET = 1;

function _gpfStringBuildPaddingString (length, targetLength, padString) {
    if (length < targetLength) {
        return new Array(targetLength - length + _GPF_COMPATIBILITY_STRING_ARRAY_LENGTH_OFFSET).join(padString);
    }
    return "";
}

_gpfCompatibilityInstallMethods("String", {
    on: String,

    methods: {

        // Introduced with ECMAScript 2015
        endsWith: function (search) {
            var len = Math.min(_gpfStringGetOptionalParam(arguments, this.length), this.length);
            return this.substring(len - search.length, len) === search;
        },

        // Introduced with ECMAScript 2015
        includes: function (search) {
            var position = _gpfStringGetOptionalParam(arguments, _GPF_START);
            return this.indexOf(search, position) !== _GPF_NOT_FOUND;
        },

        padEnd: function (targetLength) {
            var padString = _gpfStringGetOptionalParam(arguments, " "),
                padding = _gpfStringBuildPaddingString(this.length, targetLength, padString);
            return this + padding;
        },

        padStart: function (targetLength) {
            var padString = _gpfStringGetOptionalParam(arguments, " "),
                padding = _gpfStringBuildPaddingString(this.length, targetLength, padString);
            return padding + this;
        },

        // Introduced with ECMAScript 2015
        startsWith: function (search) {
            var position = _gpfStringGetOptionalParam(arguments, _GPF_START);
            return this.substring(position, position + search.length) === search;
        },

        // Introduced with JavaScript 1.8.1
        trim: (function () {
            var rtrim = new RegExp("^[\\s\uFEFF\xA0]+|[\\s\uFEFF\xA0]+$", "g");
            return function () {
                return this.replace(rtrim, "");
            };
        }())

    }

});

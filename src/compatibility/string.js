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

_gpfCompatibilityInstallMethods("String", {
    on: String,

    methods: {

        // Introduced with ECMAScript 2015
        endsWith: function (search) {
            var len = Math.min(arguments[_GPF_COMPATIBILITY_STRING_OPTIONAL_PARAM_INDEX] || this.length, this.length);
            return this.substring(len - search.length, len) === search;
        },

        // Introduced with ECMAScript 2015
        includes: function (search) {
            var position = arguments[_GPF_COMPATIBILITY_STRING_OPTIONAL_PARAM_INDEX] || _GPF_START;
            return this.indexOf(search, position) !== _GPF_NOT_FOUND;
        },

        // Introduced with ECMAScript 2015
        startsWith: function (search) {
            var position = arguments[_GPF_COMPATIBILITY_STRING_OPTIONAL_PARAM_INDEX] || _GPF_START;
            return this.substr(position, search.length) === search;
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

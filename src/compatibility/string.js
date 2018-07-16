/**
 * @file String methods polyfill
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfCompatibilityInstallMethods*/ // Define and install compatible methods on standard objects
/*#endif*/

_gpfCompatibilityInstallMethods("String", {
    on: String,

    methods: {

        // Introduced with ECMAScript 2015
        endsWith: function (search) {
            var len = Math.min(arguments[1] || this.length, this.length);
            return this.substring(len - search.length, len) === search;
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

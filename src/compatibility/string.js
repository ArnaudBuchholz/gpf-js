/**
 * @file String methods polyfill
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfInstallCompatibility*/ // Define and install compatible methods
/*#endif*/

_gpfInstallCompatibility("String", {
    on: String,

    methods: {

        // Introduced with JavaScript 1.8.1
        trim: (function () {
            var rtrim = new RegExp("^[\\s\uFEFF\xA0]+|[\\s\uFEFF\xA0]+$", "g");
            return function () {
                return this.replace(rtrim, "");
            };
        }())

    }

});

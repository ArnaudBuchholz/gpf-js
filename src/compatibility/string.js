/*#ifndef(UMD)*/
"use strict";
/*global _gpfCompatibility*/ // Polyfills for missing 'standard' methods
/*#endif*/

_gpfCompatibility.String = {
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

};

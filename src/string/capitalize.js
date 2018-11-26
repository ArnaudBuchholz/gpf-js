/**
 * @file Helper to capitalize strings
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_START*/ // 0
/*exported _gpfStringCapitalize*/ // Capitalize the string
/*#endif*/

/**
 * Capitalize the string by applying toUpperCase on its first character
 *
 * @param {String} that String to capitalize
 * @return {String} Capitalized string
 * @since 0.1.5
 */
function _gpfStringCapitalize (that) {
    var REMAINDER = 1;
    return that.charAt(_GPF_START).toUpperCase() + that.substring(REMAINDER);
}

/*#ifndef(UMD)*/

gpf.internals._gpfStringCapitalize = _gpfStringCapitalize;

/*#endif*/

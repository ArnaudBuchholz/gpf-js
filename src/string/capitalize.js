/**
 * @file Helper to capitalize strings
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
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
    return that.charAt(0).toUpperCase() + that.substr(1);
}

/*#ifndef(UMD)*/

gpf.internals._gpfStringCapitalize = _gpfStringCapitalize;

/*#endif*/

/**
 * @file Helper to capitalize strings
 */
/*#ifndef(UMD)*/
"use strict";
/*exported _gpfStringCapitalize*/ // Capitalize the string
/*#endif*/

/**
 * Capitalize the string
 *
 * @param {String} that
 * @return {String}
 */
function _gpfStringCapitalize (that) {
    return that.charAt(0).toUpperCase() + that.substr(1);
}

/*#ifndef(UMD)*/

gpf.internals._gpfStringCapitalize = _gpfStringCapitalize;

/*#endif*/

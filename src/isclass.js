/**
 * @file Class detection helper
 * @since 0.2.9
 */
/*#ifndef(UMD)*/
"use strict";
/*exported _gpfIsClass*/ // Check if the parameter is an ES6 class
/*#endif*/

function _gpfIsClassFunction (value) {
    return value.toString().startsWith("class");
}

/**
 * Check if the parameter is an ES6 class
 *
 * @param {*} value Value to test
 * @return {Boolean} true if the parameter is an ES6 class
 * @since 0.2.9
 */
function _gpfIsClass (value) {
    if (typeof value === "function") {
        return _gpfIsClassFunction(value);
    }
    return false;
}

/**
 * @gpf:sameas _gpfIsClass
 * @since 0.2.9
 */
gpf.isClass = _gpfIsClass;

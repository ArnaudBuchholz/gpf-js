/**
 * @file Literal objects
 * @since 0.2.1
 */
/*#ifndef(UMD)*/
"use strict";
/*#endif*/

var _gpfObjectToString = Object.prototype.toString;

/**
 * Check if the value is a literal object
 *
 * @param {*} value Value to check
 * @return {Boolean} True if the value is a literal object
 * @since 0.2.1
 */
function _gpfIsLiteralObject (value) {
    return value instanceof Object
            && _gpfObjectToString.call(value) === "[object Object]"
            && Object.getPrototypeOf(value) === Object.getPrototypeOf({});
}

/** @gpf:sameas _gpfIsLiteralObject */
gpf.isLiteralObject = _gpfIsLiteralObject;

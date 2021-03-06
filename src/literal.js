/**
 * @file Literal objects
 * @since 0.2.1
 */
/*#ifndef(UMD)*/
"use strict";
/*exported _gpfIsLiteralObject*/ // Check if the parameter is a literal object
/*#endif*/

var _gpfObjectToString = Object.prototype.toString;

/**
 * Check if the parameter is a literal object
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

/**
 * @gpf:sameas _gpfIsLiteralObject
 * @since 0.2.1
 */
gpf.isLiteralObject = _gpfIsLiteralObject;

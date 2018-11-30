/**
 * @file Array detection
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*exported _gpfArraySlice*/ // [].slice.call
/*exported _gpfArrayTail*/ // [].slice.call(,1)
/*exported _gpfIsArray*/ // Return true if the parameter is an array
/*exported _gpfIsArrayLike*/ // Return true if the parameter looks like an array
/*#endif*/

function _gpfArraySlice (array, from, to) {
    return Array.prototype.slice.call(array, from, to || array.length);
}

var _GPF_ARRAYLIKE_TAIL_FROMINDEX = 1;

function _gpfArrayTail (array) {
    return _gpfArraySlice(array, _GPF_ARRAYLIKE_TAIL_FROMINDEX);
}

/**
 * Return true if the parameter is an array
 *
 * @param {*} value Value to test
 * @return {Boolean} True if the value is an array
 * @since 0.2.1
 */
var _gpfIsArray = Array.isArray;

function _gpfArrayHasValidLengthProperty (obj) {
    if (obj) {
        return Math.floor(obj.length) === obj.length;
    }
    return false;
}

/**
 * Return true if the parameter looks like an array, meaning a property length is available and members can be
 * accessed through the [] operator. The length property does not have to be writable.
 *
 * @param {Object} obj Object to test
 * @return {Boolean} True if array-like
 * @since 0.1.5
 */
function _gpfIsArrayLike (obj) {
    return _gpfIsArray(obj) || _gpfArrayHasValidLengthProperty(obj);
}

/**
 * @gpf:sameas _gpfIsArrayLike
 * @since 0.1.5
 */
gpf.isArrayLike = _gpfIsArrayLike;

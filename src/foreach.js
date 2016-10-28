/**
 * @file Object enumerator
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfIsArrayLike*/ // Return true if the parameter looks like an array
/*exported _gpfArrayForEach*/ // Almost like [].forEach (undefined are also enumerated)
/*exported _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*#endif*/

/**
 * Callback function executed on each array / dictionary item
 *
 * @callback gpfCallbackForEach
 *
 * @param {*} value The current item
 * @param {String} index The index of the current item
 * @param {Object} container The container currently being enumerated (array or dictionary)
 * @return {undefined} No return expected
 */

/**
 * Similar to [].forEach but for array-like
 *
 * @param {Array} array Array-like object
 * @param {gpfForEachCallback} callback Callback function executed on each array item
 * @param {*} [thisArg] thisArg Value to use as this when executing callback
 */
function _gpfArrayForEach (array, callback, thisArg) {
    var index,
        length = array.length;
    for (index = 0; index < length; ++index) {
        callback.call(thisArg, array[index], index, array);
    }
}

/**
 * Similar to [].forEach but for objects
 *
 * @param {Object} object Object
 * @param {gpfForEachCallback} callback Callback function executed on each own property
 * @param {*} [thisArg] thisArg Value to use as this when executing callback
 */
function _gpfObjectForEach (object, callback, thisArg) {
    for (var property in object) {
        /* istanbul ignore else */
        if (object.hasOwnProperty(property)) {
            callback.call(thisArg, object[property], property, object);
        }
    }
}

/**
 * Executes a provided function once per structure element.
 * NOTE: unlike [].forEach, non own properties are also enumerated
 *
 * @param {Array|Object} container Container to enumerate
 * @param {gpfForEachCallback} callback Callback function executed on each item or own property
 * @param {*} [thisArg=undefined] thisArg Value to use as this when executing callback
 */
gpf.forEach = function (container, callback, thisArg) {
    if (_gpfIsArrayLike(container)) {
        _gpfArrayForEach(container, callback, thisArg);
        return;
    }
    _gpfObjectForEach(container, callback, thisArg); /*gpf:inline(object)*/
};

/*#ifndef(UMD)*/

gpf.internals._gpfObjectForEach = _gpfObjectForEach;

/*#endif*/

/*#ifndef(UMD)*/
"use strict";
/*exported _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*#endif*/

/**
 * Similar to [].forEach but works on array-like
 *
 * @param {Array} array
 * @param {Function} callback Function to execute for each own property, taking three arguments:
 * - {*} currentValue The current element being processed
 * - {String} property The current index being processed
 * - {Object} array The array currently being processed
 * @param {*} [thisArg=undefined] thisArg Value to use as this when executing callback.
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
 * @param {Object} object
 * @param {Function} callback Function to execute for each own property, taking three arguments:
 * - {*} currentValue The current element being processed
 * - {String} property The name of the current property being processed
 * - {Object} object The object currently being processed
 * @param {*} [thisArg=undefined] thisArg Value to use as this when executing callback.
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
 *
 * @param {Array|Object} structure
 * @param {Function} callback Function to execute for each element, taking three arguments:
 * - {*} currentValue The current element being processed
 * - {String} property The name of the current property or the index being processed
 * - {Array|Object} structure The structure currently being processed
 * @param {*} [thisArg=undefined] thisArg Value to use as this when executing callback.
 */
gpf.forEach = function (structure, callback, thisArg) {
    if (_gpfIsArrayLike(structure)) {
        _gpfArrayForEach(structure, callback, thisArg);
        return;
    }
    _gpfObjectForEach(structure, callback, thisArg); /*gpf:inline(object)*/
};

/*#ifndef(UMD)*/

gpf.internals._gpfObjectForEach = _gpfObjectForEach;

/*#endif*/

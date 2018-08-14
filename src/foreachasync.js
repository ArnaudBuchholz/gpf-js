/**
 * @file Asynchronous object enumerator
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfIsArrayLike*/ // Return true if the parameter looks like an array
/*global _gpfPromisify*/ // Converts any value into a Promise
/*exported _gpfArrayForEachAsync*/ // Almost like [].forEach (undefined are also enumerated) with async handling
/*#endif*/

/**
 * Similar to [].forEach but for array-like and asynchronous
 *
 * @param {Array} array Array-like object
 * @param {gpf.typedef.forEachCallback} callback Callback function executed on each array item,
 * may return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
 * @param {*} [thisArg] thisArg Value to use as this when executing callback
 * @return {Promise} Resolved when the iteration is done
 */
function _gpfArrayForEachAsync (array, callback, thisArg) {
    var index = 0,
        length = array.length;
    function next () {
        if (index === length) {
            return Promise.resolve();
        }
        var current = index++;
        try {
            return _gpfPromisify(callback.call(thisArg, array[current], current, array)).then(next);
        } catch (e) {
            return Promise.reject(e);
        }
    }
    return next();
}

/**
 * Executes a provided function once per structure element.
 * NOTE: unlike [].forEach, non own properties are also enumerated
 *
 * @param {Array} container Container to enumerate
 * @param {gpf.typedef.forEachCallback} callback Callback function executed on each item or own property,
 * may return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
 * If so, waits for the promise to be resolved before iterating over the next item.
 * @param {*} [thisArg=undefined] thisArg Value to use as this when executing callback
 * @return {Promise} Resolved when the iteration is done
 * @throws {gpf.Error.InvalidParameter}
 */
gpf.forEachAsync = function (container, callback, thisArg) {
    if (_gpfIsArrayLike(container)) {
        return _gpfArrayForEachAsync(container, callback, thisArg);
    }
    gpf.Error.invalidParameter();
};

/**
 * @file Object enumerator
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfHost*/ // Host type
/*global _gpfIsArrayLike*/ // Return true if the parameter looks like an array
/*exported _gpfArrayForEach*/ // Almost like [].forEach (undefined are also enumerated)
/*exported _gpfArrayForEachFalsy*/ // _gpfArrayForEach that returns first truthy value computed by the callback
/*exported _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*#endif*/

/**
 * Callback function executed on each array / dictionary item
 *
 * @callback gpf.typedef.forEachCallback
 *
 * @param {*} value The current item
 * @param {String} index The index of the current item
 * @param {Object} container The container currently being enumerated (array or dictionary)
 * @return {*} returned value
 * @since 0.1.5
 */

/**
 * Similar to [].forEach but for array-like
 *
 * @param {Array} array Array-like object
 * @param {gpf.typedef.forEachCallback} callback Callback function executed on each array item
 * @param {*} [thisArg] thisArg Value to use as this when executing callback
 * @since 0.1.5
 */
function _gpfArrayForEach (array, callback, thisArg) {
    var index = 0,
        length = array.length;
    for (; index < length; ++index) {
        callback.call(thisArg, array[index], index, array);
    }
}

function _gpfObjectForEachOwnProperty (object, callback, thisArg) {
    for (var property in object) {
        /* istanbul ignore else */ // hasOwnProperty.1
        if (Object.prototype.hasOwnProperty.call(object, property)) {
            callback.call(thisArg, object[property], property, object);
        }
    }
}

function _gpfObjectForEachOwnPropertyWScript (object, callback, thisArg) {
    _gpfObjectForEachOwnProperty(object, callback, thisArg);
    ["constructor", "toString"].forEach(function (property) {
        if (Object.prototype.hasOwnProperty.call(object, property)) {
            callback.call(thisArg, object[property], property, object);
        }
    });
}

/**
 * _gpfArrayForEach that returns first truthy value computed by the callback
 *
 * @param {Array} array Array-like object
 * @param {gpf.typedef.forEachCallback} callback Callback function executed on each array item
 * @param {*} [thisArg] thisArg Value to use as this when executing callback
 * @return {*} first truthy value returned by the callback or undefined after all items were enumerated
 * @since 0.2.2
 */
function _gpfArrayForEachFalsy (array, callback, thisArg) {
    var result,
        index = 0,
        length = array.length;
    for (; index < length && !result; ++index) {
        result = callback.call(thisArg, array[index], index, array);
    }
    return result;
}

/**
 * Similar to [].forEach but for objects
 *
 * @param {Object} object Object
 * @param {gpf.typedef.forEachCallback} callback Callback function executed on each own property
 * @param {*} [thisArg] thisArg Value to use as this when executing callback
 * @since 0.1.5
 */
var _gpfObjectForEach;
if (_GPF_HOST.WSCRIPT === _gpfHost) {
    _gpfObjectForEach = _gpfObjectForEachOwnPropertyWScript;
} else {
    _gpfObjectForEach = _gpfObjectForEachOwnProperty;
}

/**
 * Executes a provided function once per structure element.
 * NOTE:
 * - For arrays: unlike [].forEach, non own properties are also enumerated.
 *   For instance: `gpf.forEach(new Array(3), callback)` will trigger the callback three times but
 *   `(new Array(3)).forEach(callback)` won't trigger any call
 * - For objects: only the [own
 *   properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty)
 *   are enumerated.
 *
 * @param {Array|Object} container Container to enumerate
 * @param {gpf.typedef.forEachCallback} callback Callback function executed on each item or own property
 * @param {*} [thisArg=undefined] thisArg Value to use as this when executing callback
 * @since 0.1.5
 */
gpf.forEach = function (container, callback, thisArg) {
    if (_gpfIsArrayLike(container)) {
        _gpfArrayForEach(container, callback, thisArg);
        return;
    }
    _gpfObjectForEach(container, callback, thisArg);
};

/*#ifndef(UMD)*/

gpf.internals._gpfObjectForEach = _gpfObjectForEach;
gpf.internals._gpfArrayForEachFalsy = _gpfArrayForEachFalsy;

/*#endif*/

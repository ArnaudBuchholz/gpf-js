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
    var index,
        length = array.length;
    for (index = 0; index < length; ++index) {
        callback.call(thisArg, array[index], index, array);
    }
}

function _gpfObjectForEachOwnProperty (object, callback, thisArg) {
    for (var property in object) {
        /* istanbul ignore else */
        if (object.hasOwnProperty(property)) {
            callback.call(thisArg, object[property], property, object);
        }
    }
}

/* istanbul ignore next */ // Microsoft cscript / wscript specific version
function _gpfObjectForEachOwnPropertyWScript (object, callback, thisArg) {
    _gpfObjectForEachOwnProperty(object, callback, thisArg);
    ["constructor", "toString"].forEach(function (property) {
        if (object.hasOwnProperty(property)) {
            callback.call(thisArg, object[property], property, object);
        }
    });
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
/* istanbul ignore if */ // Microsoft cscript / wscript specific version
if (_GPF_HOST.WSCRIPT === _gpfHost) {
    _gpfObjectForEach = _gpfObjectForEachOwnPropertyWScript;
} else {
    _gpfObjectForEach = _gpfObjectForEachOwnProperty;
}

/**
 * Executes a provided function once per structure element.
 * NOTE: unlike [].forEach, non own properties are also enumerated
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

/*#endif*/

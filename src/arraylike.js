/**
 * @file Array detection
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST_BROWSER*/ // gpf.HOST_BROWSER
/*global _gpfHost*/ // Host type
/*global _gpfWebWindow*/ // Browser window object
/*exported _gpfIsArrayLike*/ // Return true if the parameter looks like an array
/*#endif*/

/**
 * Return true if the parameter looks like an array
 *
 * @param {Object} obj
 * @return {Boolean} True if array-like
 */
var _gpfIsArrayLike  = function (obj) { //eslint-disable-line func-style
    return Array.isArray(obj);
};

/* istanbul ignore next */ // Not tested with NodeJS
if (_GPF_HOST_BROWSER === _gpfHost && (_gpfWebWindow.HTMLCollection || _gpfWebWindow.NodeList)) {
    _gpfIsArrayLike = function (obj) {
        return Array.isArray(obj)
            || obj instanceof _gpfWebWindow.HTMLCollection
            || obj instanceof _gpfWebWindow.NodeList;
    };
}

/**
 * Return true if the provided parameter looks like an array (i.e. it has a property length and each item can be
 * accessed with [])
 *
 * @param {Object} obj
 * @return {Boolean} True if array-like
 */
gpf.isArrayLike = _gpfIsArrayLike;

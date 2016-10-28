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
 * Return true if the parameter looks like an array, meaning a property length is available and members can be
 * accessed through the [] operator.
 *
 * **NOTE**: when running in a browser, this includes
 * [HTMLCollection](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection)
 * and [NodeList](https://developer.mozilla.org/en-US/docs/Web/API/NodeList) types
 *
 * @param {Object} obj Object to test
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

/** @reveal _gpfIsArrayLike */
gpf.isArrayLike = _gpfIsArrayLike;

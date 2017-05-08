/**
 * @file Array detection
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfHost*/ // Host type
/*global _gpfWebWindow*/ // Browser window object
/*exported _gpfIsArray*/ // Return true if the paramater is an array
/*exported _gpfIsArrayLike*/ // Return true if the parameter looks like an array
/*#endif*/

/**
 * Return true if the paramater is an array
 *
 * @param {*} value Value to test
 * @return {Boolean} True if the value is an array
 */
var _gpfIsArray = Array.isArray;

/**
 * Return true if the parameter looks like an array, meaning a property length is available and members can be
 * accessed through the [] operator. The length property does not have to be writable.
 *
 * **NOTE**: when running in a browser, this includes
 * [HTMLCollection](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection)
 * and [NodeList](https://developer.mozilla.org/en-US/docs/Web/API/NodeList) types
 *
 * @param {Object} obj Object to test
 * @return {Boolean} True if array-like
 * @since 0.1.5
 */
var _gpfIsArrayLike  = function (obj) { //eslint-disable-line func-style
    return _gpfIsArray(obj);
};

/* istanbul ignore next */ // Not tested with NodeJS
if (_GPF_HOST.BROWSER === _gpfHost && (_gpfWebWindow.HTMLCollection || _gpfWebWindow.NodeList)) {
    _gpfIsArrayLike = function (obj) {
        return _gpfIsArray(obj)
            || obj instanceof _gpfWebWindow.HTMLCollection
            || obj instanceof _gpfWebWindow.NodeList;
    };
}

/**
 * @gpf:sameas _gpfIsArrayLike
 * @since 0.1.5
 */
gpf.isArrayLike = _gpfIsArrayLike;

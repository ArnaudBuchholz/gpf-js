/**
 * @file IThenable interface
 * @since 0.2.2
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefineInterface*/ // Internal interface definition helper
/*global _gpfSyncReadSourceJSON*/ // Reads a source json file (only in source mode)
/*exported _gpfIThenable*/ // gpf.interfaces.IThenable
/*exported _gpfPromisify*/ // Converts any value into a Promise
/*exported _gpfPromisifyDefined*/ // Converts any value but undefined into a Promise
/*#endif*/

/**
 * The Thenable interface helps identifying Promise object through the
 * [then](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then) method
 *
 * @interface gpf.interfaces.IThenable
 * @since 0.2.2
 */

/**
 * The then() method returns a Promise. It takes up to two arguments: callback functions for the success and failure
 * cases of the Promise
 *
 * @method gpf.interfaces.IThenable#then
 * @param {Function} onFulfilled called if the Promise is fulfilled
 * @param {Function} [onRejected] called if the Promise is rejected
 * @return {Promise} Promise
 * @since 0.2.2
 */

/**
 * IThenable interface specifier
 *
 * @type {gpf.interfaces.IThenable}
 * @since 0.2.2
 */
var _gpfIThenable = _gpfDefineInterface("Thenable",
    _gpfSyncReadSourceJSON("interfaces/thenable.json"));

/**
 * Converts any value into a promise.
 * If the value implements {@link gpf.interfaces.IThenable}, it is considered as a promise.
 *
 * @param {*} value Value to convert
 * @return {Promise<*>} Promisified version of the value
 * @since 0.2.2
 */
function _gpfPromisify (value) {
    if (gpf.interfaces.isImplementedBy(gpf.interfaces.IThenable, value)) {
        return value;
    }
    return Promise.resolve(value);
}

/**
 * Converts value into a promise if not undefined.
 * If the value implements {@link gpf.interfaces.IThenable}, it is considered as a promise.
 *
 * @param {*} value Value to convert
 * @return {Promise<*>|undefined} Promisified version of the value or undefined
 * @since 0.2.2
 */
function _gpfPromisifyDefined (value) {
    if (undefined !== value) {
        return _gpfPromisify(value);
    }
}

/**
 * @gpf:sameas _gpfPromisify
 * @since 0.2.2
 * @deprecated since version 0.2.6, use
 * [Promise.resolve](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve)
 * instead
 */
gpf.promisify = _gpfPromisify;

/**
 * @gpf:sameas _gpfPromisifyDefined
 * @since 0.2.2
 * @deprecated since version 0.2.6, use
 * [Promise.resolve](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve)
 * combined with a condition instead
 */
gpf.promisifyDefined = _gpfPromisifyDefined;

/**
 * @file IThenable interface
 * @since 0.2.2
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefineInterface*/ // Internal interface definition helper
/*global _gpfSyncReadSourceJSON*/ // Reads a source json file (only in source mode)
/*exported _gpfIThenable*/ // gpf.interfaces.IThenable
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

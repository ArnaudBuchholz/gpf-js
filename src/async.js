/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST_BROWSER*/ // gpf.HOST_BROWSER
/*global _GPF_HOST_WSCRIPT*/ // gpf.HOST_WSCRIPT
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfHost*/ // Host type
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfIsArrayLike*/ // Return true if the parameter looks like an array
/*global _gpfResolveScope*/ // Translate the parameter into a valid scope
/*exported _gpfDefer*/
/*#endif*/

var
    /**
     * Creates a function that wraps the callback, the scope and its
     * arguments
     *
     * @param {Function|String} callback
     * @param {Object} [scope=null] scope
     * @param {Array} [args=[]] args
     * @return {Function}
     * @closure
     */
    _gpfAsyncCallback = function (callback, scope, args) {
        if ("string" === typeof callback) {
            callback = _gpfFunc(callback);
        }
        if (!_gpfIsArrayLike(args)) {
            args = [];
        }
        return function (){
            callback.apply(_gpfResolveScope(scope), args);
        };
    },

    /**
     * If used, it contains the list of asynchronous callbacks
     *
     * @type {Array}
     * @private
     */
    _gpfAsyncQueue = [],

    /**
     * Sorting function used to reorder the async queue
     *
     * @param {Object} a
     * @param {Object} b
     * @return {Number}
     * @private
     */
    _gpfSortOnDt = function (a, b) {
        return a._dt - b._dt;
    },

    /*exported _gpfDefer*/
    /**
     * Defer the execution of the callback
     *
     * @param {Function} callback
     * @param {Number} [timeout=0] timeout
     * @param {Object} [scope=null] scope
     * @param {Array} [args=[]] args
     */
    _gpfDefer;

/**
 * Run the asynchronous queue (mandatory for some environments)
 */
gpf.runAsyncQueue = _gpfEmptyFunc;

if (_GPF_HOST_BROWSER === _gpfHost) {
    // Leverage the use of setTimeout(func, delay, [param1, param2, ...])
    // as it avoids creating closures

    /**
     * Same as the initial documentation but does not require any closure
     * @param parameters
     *
     * @private
     */
    _gpfAsyncCallback = function (parameters) {
        parameters[0].apply(_gpfResolveScope(parameters[1]), parameters[2]);
    };

    _gpfDefer = function (callback, timeout, scope, args) {
        if ("string" === typeof callback) {
            callback = _gpfFunc(callback);
        }
        if (!timeout) {
            timeout = 0;
        }
        setTimeout(_gpfAsyncCallback, timeout, [callback, scope, args]);
    };

} else if("undefined" !== typeof setTimeout) {
    // Consider the use of setTimeout(func, delay)

    _gpfDefer = function (callback, timeout, scope, args) {
        if (!timeout) {
            timeout = 0;
        }
        setTimeout(_gpfAsyncCallback(callback, scope, args), timeout);
    };

} else if (_GPF_HOST_WSCRIPT === _gpfHost) {
    // Custom mechanism

    _gpfDefer = function (callback, timeout, scope, args) {
        var item = _gpfAsyncCallback(callback, scope, args);
        if (!timeout) {
            timeout = 0;
        }
        item._dt = new Date(new Date() - (-timeout));
        _gpfAsyncQueue.push(item);
        _gpfAsyncQueue.sort(_gpfSortOnDt);
    };

    gpf.runAsyncQueue = function () {
        var
            queue = _gpfAsyncQueue,
            callback;
        while (queue.length) {
            callback = queue.shift();
            if (callback._dt > new Date()) {
                WScript.Sleep(callback._dt - new Date());
            }
            callback();
        }
    };

} else {

    console.warn("No implementation for gpf.defer");
    _gpfDefer = function (callback, timeout, scope, args) {
        _gpfIgnore(timeout);
        _gpfAsyncCallback(callback, scope, args)();
    };

}

/**
 * Defer the execution of the callback
 *
 * @param {Function} callback
 * @param {Number} [timeout=0] timeout
 * @param {Object} [scope=null] scope
 * @param {Array} [args=[]] args
 */
gpf.defer = _gpfDefer;
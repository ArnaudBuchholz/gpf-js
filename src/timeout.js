/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST_WSCRIPT*/ // gpf.HOST_WSCRIPT
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfHost*/ // Host type
/*global _gpfMainContext*/ // Main context object
/*#endif*/

var
    // When used, it contains the list of pending callbacks
    _gpfTimeoutQueue = [];

/**
 * Sorting function used to reorder the async queue
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Number}
 * @private
 */
function _gpfSortOnDt(a, b) {
    return a._dt - b._dt;
}

// Handle timeouts (mandatory for some environments)
gpf.handleTimeout = _gpfEmptyFunc;

if (_GPF_HOST_WSCRIPT === _gpfHost) {

    _gpfMainContext.setTimeout = function (callback, timeout) {
        if (!timeout) {
            timeout = 0;
        }
        callback._dt = new Date(new Date() - (-timeout));
        _gpfTimeoutQueue.push(callback);
        _gpfTimeoutQueue.sort(_gpfSortOnDt);
    };

    gpf.handleTimeout = function () {
        var
            queue = _gpfTimeoutQueue,
            callback,
            now;
        while (queue.length) {
            callback = queue.shift();
            now = new Date();
            if (callback._dt > now) {
                WScript.Sleep(callback._dt - now);
            }
            callback();
        }
    };

} else if("undefined" === typeof setTimeout) {

    console.warn("No implementation for setTimeout");

}

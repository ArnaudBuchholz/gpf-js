/**
 * @file setTimeout polyfill
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfAssert*/ // Assertion method
/*global _gpfCompatibilityInstallGlobal*/ // Install compatible global if missing
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfHost*/ // Host type
/*#endif*/

/*jshint wsh: true*/
/*eslint-env wsh*/
/*jshint rhino: true*/
/*eslint-env rhino*/

var _gpfTimeoutImpl = {};

_gpfTimeoutImpl[_GPF_HOST.WSCRIPT] = function (t) {
    WScript.Sleep(t); //eslint-disable-line new-cap
};

function _gpfTimeoutJavaImpl (t) {
    java.lang.Thread.sleep(t);
}

_gpfTimeoutImpl[_GPF_HOST.RHINO] = _gpfTimeoutJavaImpl;
_gpfTimeoutImpl[_GPF_HOST.NASHORN] = _gpfTimeoutJavaImpl;

var
    // List of pending callbacks (sorted by execution time)
    _gpfTimeoutQueue = [],
    // Last allocated timeoutID
    _gpfTimeoutID = 0,
    // Sleep function
    _gpfSleep = _gpfTimeoutImpl[_gpfHost] || _gpfEmptyFunc;

// Sorting function used to reorder the async queue
function _gpfSortOnDt (a, b) {
    if (a.dt === b.dt) {
        return a.id - b.id;
    }
    return a.dt - b.dt;
}

function _gpSetTimeoutPolyfill (callback, timeout) {
    _gpfAssert(typeof timeout === "number", "Timeout is required");
    var timeoutItem = {
        id: ++_gpfTimeoutID,
        dt: new Date().getTime() + timeout,
        cb: callback
    };
    _gpfTimeoutQueue.push(timeoutItem);
    _gpfTimeoutQueue.sort(_gpfSortOnDt);
    return _gpfTimeoutID;
}

function _gpfClearTimeoutPolyfill (timeoutId) {
    _gpfTimeoutQueue = _gpfTimeoutQueue.filter(function (timeoutItem) {
        return timeoutItem.id !== timeoutId;
    });
}

/**
 * For WSCRIPT, RHINO and NASHORN environments, this function must be used to process the timeout queue when using
 * [setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setTimeout).
 * For the other environments, this function has no effect.
 * @since 0.1.5
 */
function _gpfHandleTimeout () {
    var queue = _gpfTimeoutQueue,
        timeoutItem,
        now;
    while (queue.length) {
        timeoutItem = queue.shift();
        now = new Date().getTime();
        while (timeoutItem.dt > now) {
            _gpfSleep(timeoutItem.dt - now);
            now = new Date().getTime();
        }
        timeoutItem.cb();
    }
}

/**
 * @gpf:sameas _gpfHandleTimeout
 * @since 0.1.5
 */
gpf.handleTimeout = _gpfHandleTimeout;

_gpfCompatibilityInstallGlobal("setTimeout", _gpSetTimeoutPolyfill);
_gpfCompatibilityInstallGlobal("clearTimeout", _gpfClearTimeoutPolyfill);

/*#ifndef(UMD)*/

gpf.internals._gpSetTimeoutPolyfill = _gpSetTimeoutPolyfill;
gpf.internals._gpfClearTimeoutPolyfill = _gpfClearTimeoutPolyfill;
gpf.internals._gpfHandleTimeout = _gpfHandleTimeout;

/*#endif*/

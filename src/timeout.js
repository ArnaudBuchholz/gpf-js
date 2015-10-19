/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST_RHINO*/ // gpf.HOST_RHINO
/*global _GPF_HOST_WSCRIPT*/ // gpf.HOST_WSCRIPT
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfHost*/ // Host type
/*global _gpfMainContext*/ // Main context object
/*#endif*/

var
    // List of pending callbacks (sorted by execution time)
    _gpfTimeoutQueue,
    // Last allocated timeoutID
    _gpfTimeoutID,
    // Sleep function
    _gpfSleep;

/**
 * Sorting function used to reorder the async queue
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Number}
 * @private
 */
function _gpfSortOnDt(a, b) {
    return a.dt - b.dt;
}

// Handle timeouts (mandatory for some environments)
gpf.handleTimeout = _gpfEmptyFunc;

if ("undefined" === typeof setTimeout) {

    /*jshint wsh: true*/
    /*eslint-env wsh*/
    /*jshint rhino: true*/
    /*eslint-env rhino*/

    _gpfTimeoutQueue = [];
    _gpfTimeoutID = 0;

    if (_GPF_HOST_WSCRIPT === _gpfHost) {
        _gpfSleep =  function (t) {
            WScript.Sleep(t); //eslint-disable-line new-cap
        };
    } else if (_GPF_HOST_RHINO === _gpfHost) {
        _gpfSleep = java.lang.Thread.sleep;
    } else {
        console.warn("No implementation for setTimeout");
    }

    _gpfMainContext.setTimeout = function (callback, timeout) {
        if (!timeout) {
            timeout = 0;
        }
        var timeoutItem = {
            id: ++_gpfTimeoutID,
            dt: new Date(new Date().getTime() + timeout),
            cb: callback
        };
        _gpfTimeoutQueue.push(timeoutItem);
        _gpfTimeoutQueue.sort(_gpfSortOnDt);
        return _gpfTimeoutID;
    };

    _gpfMainContext.clearTimeout = function (timeoutId) {
        var pos;
        /*gpf:inline(array)*/ if (!_gpfTimeoutQueue.every(function (timeoutItem, index) {
            if (timeoutItem.id === timeoutId) {
                pos = index;
                return false;
            }
            return true;
        })) {
            _gpfTimeoutQueue.splice(pos, 1);
        }
    };

    gpf.handleTimeout = function () {
        var queue = _gpfTimeoutQueue,
            timeoutItem,
            now;
        while (queue.length) {
            timeoutItem = queue.shift();
            now = new Date();
            if (timeoutItem.dt > now) {
                _gpfSleep(timeoutItem.dt - now);
            }
            timeoutItem.cb();
        }
    };

}

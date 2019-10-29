/**
 * @file Promise polyfill
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAssert*/ // Assertion method
/*global _gpfCompatibilityInstallGlobal*/ // Install compatible global if missing
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*#endif*/

// Ensure the functions are called only once
function _gpfPromiseSafeResolve (fn, onFulfilled, onRejected) {
    var safe = true;
    function makeSafe (callback) {
        return function (value) {
            if (safe) {
                safe = false;
                callback(value);
            }
        };
    }
    try {
        fn(makeSafe(onFulfilled), makeSafe(onRejected));
    } catch (e) {
        /* istanbul ignore else */ // compability.promise.1
        if (safe) {
            safe = false;
            onRejected(e);
        }
    }
}

function _gpfPromiseFinale () {
    /*jshint validthis:true*/
    var me = this; //eslint-disable-line no-invalid-this
    me._handlers.forEach(function (handler) {
        handler.process(me);
    });
    me._handlers = []; // Reset list
}

function _gpfPromiseReject (newValue) {
    /*jshint validthis:true*/
    var me = this; //eslint-disable-line no-invalid-this
    me._state = false;
    me._value = newValue;
    _gpfPromiseFinale.call(me);
}

var _gpfPromiseResolve;

function _gpfPromiseResolveChainIfFunction (newValue, then) {
    /*jshint validthis:true*/
    var me = this; //eslint-disable-line no-invalid-this
    if (typeof then === "function") {
        _gpfPromiseSafeResolve(then.bind(newValue), _gpfPromiseResolve.bind(me), _gpfPromiseReject.bind(me));
        return true;
    }
}

function _gpfPromiseResolveChain (newValue) {
    /*jshint validthis:true*/
    var me = this; //eslint-disable-line no-invalid-this
    if (newValue && ["object", "function"].includes(typeof newValue)) {
        return _gpfPromiseResolveChainIfFunction.call(me, newValue, newValue.then);
    }
}

//Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
_gpfPromiseResolve = function (newValue) {
    /*jshint validthis:true*/
    var me = this; //eslint-disable-line no-invalid-this
    try {
        _gpfAssert(newValue !== me, "A promise cannot be resolved with itself.");
        if (_gpfPromiseResolveChain.call(me, newValue)) {
            return;
        }
        me._state = true;
        me._value = newValue;
        _gpfPromiseFinale.call(me);
    } catch (e) {
        /* istanbul ignore next */ // compability.promise.1
        _gpfPromiseReject.call(me, e);
    }
};

var _GpfPromise = gpf.Promise = function (fn) {
    this._handlers = [];
    _gpfPromiseSafeResolve(fn, _gpfPromiseResolve.bind(this), _gpfPromiseReject.bind(this));
};

function _gpfPromiseHandler () {
}

function _gpfPromiseGetCallbackFromState (handler, promise) {
    if (promise._state) {
        return handler.onFulfilled;
    }
    return handler.onRejected;
}

function _gpfPromiseSettleFromState (handler, promise) {
    if (promise._state) {
        handler.resolve(promise._value);
    } else {
        handler.reject(promise._value);
    }
}

function _gpfPromiseAsyncProcess (promise) {
    /*jshint validthis:true*/
    var me = this; //eslint-disable-line no-invalid-this
    var callback = _gpfPromiseGetCallbackFromState(me, promise),
        result;
    if (callback === null) {
        return _gpfPromiseSettleFromState(me, promise);
    }
    try {
        result = callback(promise._value);
    } catch (e) {
        me.reject(e);
        return;
    }
    me.resolve(result);
}

var _GPF_COMPATIBILITY_PROMISE_NODELAY = 0;

var _gpfPromiseHandlersToProcess = [];

function _gpfPromiseProcessHandlers () {
    while (_gpfPromiseHandlersToProcess.length) {
        var me = _gpfPromiseHandlersToProcess.shift(),
            promise = _gpfPromiseHandlersToProcess.shift();
        _gpfPromiseAsyncProcess.call(me, promise);
    }
}

_gpfPromiseHandler.prototype = {

    onFulfilled: null,

    onRejected: null,

    resolve: null,

    reject: null,

    process: function (promise) {
        /*jshint validthis:true*/
        var me = this; //eslint-disable-line no-invalid-this
        if (promise._state === null) {
            promise._handlers.push(me);
            return;
        }
        if (!_gpfPromiseHandlersToProcess.length) {
            setTimeout(_gpfPromiseProcessHandlers, _GPF_COMPATIBILITY_PROMISE_NODELAY);
        }
        _gpfPromiseHandlersToProcess.push(me, promise);
    }

};

_GpfPromise.prototype = {

    // @property {Boolean|null} state of the promise
    _state: null,

    // @property {*} fufilment value
    _value: null,

    // @property {Handler[]} list of handlers
    _handlers: [],

    then: function (onFulfilled, onRejected) {
        var me = this;
        return new _GpfPromise(function (resolve, reject) {
            var handler = new _gpfPromiseHandler();
            if (undefined !== onFulfilled) {
                handler.onFulfilled = onFulfilled;
            }
            if (undefined !== onRejected) {
                handler.onRejected = onRejected;
            }
            handler.resolve = resolve;
            handler.reject = reject;
            handler.process(me);
        });
    },

    "catch": function (onRejected) {
        return this.then(null, onRejected);
    }

};

_GpfPromise.resolve = function (value) {
    return new _GpfPromise(function (resolve) {
        resolve(value);
    });
};

_GpfPromise.reject = function (value) {
    return new _GpfPromise(function (resolve, reject) {
        _gpfIgnore(resolve);
        reject(value);
    });
};

function _gpfPromiseAllAssign (state, index, result) {
    state.promises[index] = result;
    if (!--state.remaining) {
        state.resolve(state.promises);
    }
}

function _gpfPromiseAllHandle (result, index) {
    /*jshint validthis:true*/
    var me = this; //eslint-disable-line no-invalid-this
    try {
        if (result instanceof _GpfPromise) {
            result.then(function (value) {
                _gpfPromiseAllHandle.call(me, value, index);
            }, me.reject);
            return;
        }
        _gpfPromiseAllAssign(me, index, result);
    } catch (e) {
        /* istanbul ignore next */ // compability.promise.1
        me.reject(e);
    }
}

_GpfPromise.all = function (promises) {
    if (!promises.length) {
        return _GpfPromise.resolve([]);
    }
    return new _GpfPromise(function (resolve, reject) {
        promises.forEach(_gpfPromiseAllHandle.bind({
            resolve: resolve,
            reject: reject,
            remaining: promises.length,
            promises: promises
        }));
    });
};

_GpfPromise.race = function (promises) {
    return new _GpfPromise(function (resolve, reject) {
        promises.forEach(function (promise) {
            promise.then(resolve, reject);
        });
    });
};

_gpfCompatibilityInstallGlobal("Promise", _GpfPromise);

/*#ifndef(UMD)*/

gpf.internals._GpfPromise = _GpfPromise;

/*#endif*/

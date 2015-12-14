/*#ifndef(UMD)*/
"use strict";
/*global _gpfAssert*/ // Assertion method
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfMainContext*/ // Main context object
/*exported _GpfDeferredPromise*/ // Deferred promise
/*#endif*/

// Ensure the functions are called only once
function safeResolve (fn, onFulfilled, onRejected) {
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
        if (safe) {
            safe = false;
            onRejected(e);
        }
    }
}

function finale () {
    /*jshint validthis:true*/
    var me = this; //eslint-disable-line no-invalid-this
    /*gpf:inline(array)*/ me._handlers.forEach(function (handler) {
        handler.process(me);
    });
    me._handlers = []; // Reset list
}

function _gpfPromiseReject (newValue) {
    /*jshint validthis:true*/
    var me = this; //eslint-disable-line no-invalid-this
    me._state = false;
    me._value = newValue;
    finale.call(me);
}

//Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
function _gpfPromiseResolve (newValue) {
    /*jshint validthis:true*/
    var me = this; //eslint-disable-line no-invalid-this
    try {
        _gpfAssert(newValue !== me, "A promise cannot be resolved with itself.");
        if (newValue && (typeof newValue === "object" || typeof newValue === "function")) {
            var then = newValue.then;
            if ("function" === typeof then) {
                safeResolve(then.bind(newValue), _gpfPromiseResolve.bind(me), _gpfPromiseReject.bind(me));
                return;
            }
        }
        me._state = true;
        me._value = newValue;
        finale.call(me);
    } catch (e) {
        _gpfPromiseReject.apply(me, [e]);
    }
}

var _GpfPromise = gpf.Promise = function (fn) {
    safeResolve(fn, _gpfPromiseResolve.bind(this), _gpfPromiseReject.bind(this));
};

function _gpfPromiseHandler () {
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
            /* istanbul ignore else */ // Not sure when it would happen
            if (!promise.hasOwnProperty("_handlers")) {
                promise._handlers = [];
            }
            promise._handlers.push(me);
            return;
        }
        setTimeout(function () {
            var callback,
                result;
            if (promise._state) {
                callback = me.onFulfilled;
            } else {
                callback = me.onRejected;
            }
            if (null === callback) {
                if (promise._state) {
                    me.resolve(promise._value);
                } else {
                    me.reject(promise._value);
                }
                return;
            }
            try {
                result = callback(promise._value);
            }  catch (e) {
                me.reject(e);
                return;
            }
            me.resolve(result);
        }, 0);
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

_GpfPromise.all = function (promises) {
    if (0 === promises.length) {
        return _GpfPromise.resolve([]);
    }
    return new _GpfPromise(function (resolve, reject) {
        var remaining = promises.length;
        function handle (result, index) {
            try {
                if (result && result instanceof _GpfPromise) {
                    result.then(function (value) {
                        handle(value, index);
                    }, reject);
                    return;
                }
                promises[index] = result;
                if (--remaining === 0) {
                    resolve(promises);
                }
            } catch (e) {
                reject(e);
            }
        }
        /*gpf:inline(array)*/ promises.forEach(handle);
    });
};

_GpfPromise.race = function (promises) {
    return new _GpfPromise(function (resolve, reject) {
        /*gpf:inline(array)*/ promises.forEach(function (promise) {
            promise.then(resolve, reject);
        });
    });
};

/* istanbul ignore next */ // Promise exists now in NodeJS
if (undefined === _gpfMainContext.Promise) {
    _gpfMainContext.Promise = _GpfPromise;
}

function _GpfDeferredPromise () {
    /*jshint validthis:true*/ // constructor
    var me = this;
    me.promise = new Promise(function (resolve, reject) {
        me.resolve = resolve;
        me.reject = reject;
    });
}

_GpfDeferredPromise.prototype = {
    resolve: null,
    reject: null,
    promise: null
};

gpf.DeferredPromise = _GpfDeferredPromise;

/*#ifndef(UMD)*/

gpf.internals._GpfPromise = _GpfPromise;

/*#endif*/

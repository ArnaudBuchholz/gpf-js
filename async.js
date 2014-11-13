/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
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
        _callback = function (callback, scope, args) {
            if ("string" === typeof callback) {
                callback = gpf._func(callback);
            }
            if (!scope) {
                scope = null;
            }
            if (!args) {
                args = [];
            }
            return function (){
                callback.apply(gpf.Callback.resolveScope(scope), args);
            };
        },

        _sortOnDt;

    /**
     * Run the asynchronous queue (mandatory for some environments)
     */
    gpf.runAsyncQueue = gpf._func();

/*#ifdef(DEBUG)*/
    /**
     * Defer the execution of the callback
     *
     * @param {Function} callback
     * @param {Number} [timeout=0] timeout
     * @param {Object} [scope=null] scope
     * @param {Array} [args=[]] args
     */
    gpf.defer = gpf._func();
/*#endif*/

    if ("browser" === gpf.host()) {
        // Leverage the use of setTimeout(func, delay, [param1, param2, ...])
        // as it avoids creating closures

        _callback = function (parameters) {
            parameters[0].apply(gpf.Callback.resolveScope(parameters[1]),
                parameters[2]);
        };

        gpf.defer = function (callback, timeout, scope, args) {
            if ("string" === typeof callback) {
                callback = gpf._func(callback);
            }
            if (!timeout) {
                timeout = 0;
            }
            setTimeout(_callback, timeout, [callback, scope, args]);
        };

    } else if("undefined" !== typeof setTimeout) {
        // Consider the use of setTimeout(func, delay)

        gpf.defer = function (callback, timeout, scope, args) {
            if (!timeout) {
                timeout = 0;
            }
            setTimeout(_callback(callback, scope, args), timeout);
        };

    } else {
        // Custom mechanism

        gpf._asyncQueue = [];

        _sortOnDt = function (a, b) {
            return a._dt - b._dt;
        };

        gpf.defer = function (callback, timeout, scope, args) {
            var item = _callback(callback, scope, args);
            if (!timeout) {
                timeout = 0;
            }
            item._dt = new Date(new Date() - (-timeout));
            gpf._asyncQueue.push(item);
            gpf._asyncQueue.sort(_sortOnDt);
        };

        gpf.runAsyncQueue = function () {
            var
                queue = gpf._asyncQueue,
                callback;
            while (queue.length) {
                callback = queue.shift();
                if (callback._dt > new Date()) {
                    WScript.Sleep(callback._dt - new Date());
                }
                callback();
            }
        };

    }

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/

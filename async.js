/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    var
        /**
         * Defer the execution of the callback
         *
         * @param {Function} callback
         * @param {Object} [scope=null] scope
         * @param {Array} [args=[]] args
         * @return {Function}
         * @closure
         */
        _callback = function (callback, scope, args) {
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

    if ("wscript" === gpf.host()) {

        gpf._asyncQueue = [];

        _sortOnDt = function (a, b) {
            return b._dt - a._dt;
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

    } else {

        /**
         * Defer the execution of the callback
         *
         * @param {Function} callback
         * @param {Number} [timeout=0] timeout
         * @param {Object} [scope=null] scope
         * @param {Array} [args=[]] args
         */
        gpf.defer = function (callback, timeout, scope, args) {
            if (!timeout) {
                timeout = 0;
            }
            setTimeout(_callback(callback, scope, args), timeout);
        };

        /**
         * Run the asynchronous queue (mandatory for some environments)
         */
        gpf.runAsyncQueue = function () {
            // Nothing to do
        };
    }

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/

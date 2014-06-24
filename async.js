/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    var
        _queue = [],

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
        };

    if ("wscript" === gpf.host()) {

        gpf.defer = function (callback, timeout, scope, args) {
            // TODO sort queue according to timeout
            gpf.interfaces.ignoreParameter(timeout);
            _queue.push(_callback(callback, scope, args));
        };

        gpf.runAsyncQueue = function () {
            var
                callback;
            while (_queue.length) {
                callback = _queue.shift();
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

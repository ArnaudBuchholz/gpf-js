/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
    /*global _gpfDefine*/ // Shortcut for gpf.define
/*#endif*/

    var
        gpfFireEvent = gpf.events.fire,

        /**
         * Async implementation of resolve
         *
         * @param {Object} params
         * @private
         */
        _resolve = function (params) {
            var
                next;
            if (this._list.length) {
                next = this._list.shift();
                this._pos = 0;
                gpfFireEvent.apply(this, [gpf.Promise.THEN, params, next]);
            }
        },

        /**
         * Async implementation of reject
         *
         * @param {Object} params
         * @private
         */
        _reject = function (params) {
            var
                next,
                event;
            while (this._list.length) {
                next = this._list.shift();
                if (undefined === event) {
                    event = gpfFireEvent.apply(this, [gpf.Promise.FAIL,
                        params, next]);
                } else {
                    gpfFireEvent.apply(this, [event, next]);
                }
                if (event._propagationStopped) {
                    break;
                }
            }
        };

    /**
     * Basic promise implementation
     *
     * @class gpf.Promise
     */
    _gpfDefine("gpf.Promise", Object, {

        "-": {

            /**
             * @type {gpf.events.Handler[]}
             * @private
             */
            _list: [],

            /**
             * @type {Number}
             * @private
             */
            _pos: 0
        },

        "+": {

            /**
             * @constructor
             */
            constructor: function () {
                this._list = [];
            },

            /**
             * THEN
             *
             * @param {gpf.events.Handler} eventsHandler
             * @return {gpf.Promise}
             */
            then: function (eventsHandler) {
                this._list.splice(this._pos, 0, eventsHandler);
                ++this._pos;
                return this;
            },

            /**
             * RESOLVE
             *
             * @param {Object} [params=undefined] params
             */
            resolve: function (params) {
                setTimeout(_resolve.bind(this, params), 0);
            },

            /**
             * REJECT
             *
             * @param {Object} [params=undefined] params
             */
            reject: function (params) {
                setTimeout(_reject.bind(this, params), 0);
            }

        },

        "~": {
            THEN: "then",
            REJECT: "reject"
        }

    });

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/

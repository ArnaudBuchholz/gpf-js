/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    var
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
                gpf.events.fire.apply(this, [gpf.Promise.THEN, params, next]);
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
                    event = gpf.events.fire.apply(this, [gpf.Promise.FAIL,
                        params, next]);
                } else {
                    gpf.events.fire.apply(this, [event, next]);
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
    gpf.define("gpf.Promise", {

        private: {

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

        public: {

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
                gpf.defer(_resolve, 0, this, [params]);
            },

            /**
             * REJECT
             *
             * @param {Object} [params=undefined] params
             */
            reject: function (params) {
                gpf.defer(_reject, 0, this, [params]);
            }

        },

        static: {
            THEN: "then",
            REJECT: "reject"
        }

    });

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/
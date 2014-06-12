/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    var
        /**
         * Event broadcaster
         *
         * @param {String[]} [events=undefined] events
         * @constructor
         * @class gpf.Broadcaster
         */
        _Broadcaster = function (events) {
            var idx, eventName;
            this._listeners = {};
            if (undefined !== events) {
                this._events = events;
                for (idx = 0; idx < events.length; ++idx) {
                    eventName = events[idx];
                    this["on" + eventName.charAt(0).toUpperCase()
                        + eventName.substr(1)] = this._onEVENT(idx);
                    this._listeners[eventName] = [];
                }
            } else {
                // Used inside a dynamically created closure... so
                this._events = null;
            }
        },

        /**
         * Generate a closure capable of handling addEventListener on a given
         * event
         *
         * @param {Number} eventIndex
         * @returns {Function}
         * @closure
         * @private
         */
        _genOnEventClosure = function (eventIndex) {
            return function() {
                var
                    args = this._events[eventIndex],
                    len = arguments.length,
                    idx;
                for (idx = 0; idx < len; ++idx) {
                    args.push(arguments[idx]);
                }
                return this.addEventListener.apply(this, args);
            };
        },

        /**
         * Event
         *
         * @param {String} type
         * @param {Object} params
         * @param {Boolean} cancelable
         * @param {Object} that
         * @constructor
         * @class gpf.Event
         */
        _Event = function (type, params, cancelable, that) {
            this._type = type;
            if (undefined === params) {
                params = {};
            }
            this._params = params;
            this._cancelable = cancelable ? true : false;
//            this._timeStamp = new Date();
//            this._returnValue = undefined;
            this._propagationStopped = false;
            this._defaultPrevented = false;
            if (undefined !== that ) {
                this._that = that;
            } else {
                this._that = that;
            }
        };

    /**
     * Event broadcaster, keep track of listeners and dispatch events when fired
     *
     * @class gpf.events.Broadcaster
     */
    gpf.extend(_Broadcaster.prototype, {

        /**
         * To avoid an extensive use of closures, functions are created with an
         * index that points to the list of 'declared' events (this._events).
         * function _onEVENT(callback,useCapture) {
         *     this.addEventListener(this._events[IDX],callback,useCapture);
         * }
         * 
         * @param {Number} idx index of the method to create
         * @internal
         */
        _onEVENT: function (idx) {
            var
                closures = _Broadcaster.prototype._onEVENT.closures,
                jdx;
            if (!closures) {
                closures = _Broadcaster.prototype._onEVENT.closures = [];
            }
            gpf.ASSERT(closures.length >= idx, "calls must be sequential");
            while (closures.length <= idx) {
                jdx = closures.length;
                closures.push(_genOnEventClosure(jdx));
            }
            return closures[idx];
        },

        /**
         * Add an event listener to the channel
         *
         * @param {String} event name
         * @param {Function|gpf.Callback} callback
         * @param {Object|Boolean} scope scope of callback or useCapture
         * parameter. NOTE: if a gpf.Callback object is used and a scope
         * specified, a new gpf.Callback object is created.
         * @param {Boolean} [useCapture=false] useCapture push it on top of the
         * triggering queue
         * @return {gpf.Broadcaster} this
         * @chainable
         */
        addEventListener: function (event, callback, scope, useCapture) {
            var
                listeners = this._listeners;
            if ("boolean" === typeof scope) {
                useCapture = scope;
                scope = undefined;
            } else {
                if (!scope) {
                    scope = null;
                }
                if (!useCapture) {
                    useCapture = false;
                }
            }
            if (callback instanceof gpf.Callback) {
                if (scope && scope !== callback.scope()) {
                    callback = callback.handler();
                }
            }
            if (!(callback instanceof gpf.Callback)) {
                callback = new gpf.Callback(callback, scope);
            }
            if (undefined === listeners[event]) {
                listeners[event] = [];
            }
            if (useCapture) {
                listeners[event].unshift(callback);
            } else {
                listeners[event].push(callback);
            }
            return this;
        },

        /**
         * Remove an event listener to the channel
         *
         * @param {String} event name
         * @param {Function|gpf.Callback} callback
         * @param {Object} [scope=undefined] scope scope of callback
         * @return {gpf.Broadcaster}
         * @chainable
         */
        removeEventListener: function (event, callback, scope) {
            var
                listener = this._listeners[event],
                registeredCallback,
                idx;
            if (undefined !== listener) {
                if (callback instanceof gpf.Callback) {
                    if (!scope) {
                        scope = callback.scope();
                    }
                    callback = callback.handler();
                }
                idx = listener.length;
                while (idx > 0) {
                    registeredCallback = listener[--idx];
                    if (registeredCallback.handler() === callback
                        && registeredCallback.scope() === scope) {
                        listener.splice(idx, 1);
                        break;
                    }
                }
            }
            return this;
        },

        /**
         * Broadcast the event
         * @param {String|gpf.events.Event} event name or object
         * @param {Object} [params={}] event parameters
         * @return {Object} this
         * @chainable
         */
        broadcastEvent: function (event, params) {
            var
                idx,
                type,
                listeners;
            if (event instanceof _Event) {
                type = event.type();
            } else {
                type = event;
            }
            listeners = this._listeners[type];
            if (undefined === listeners) {
                return this; // Nothing to do
            }
            if (event instanceof _Event) {
                // 'Advanced' version
                for (idx = 0; idx < listeners.length; ++idx) {
                    listeners[idx].apply(event._that, [event]);
                    if (event._propagationStopped) {
                        break;
                    }
                }
            } else {
                // 'Simple' version with no event management
                for (idx = 0; idx < listeners.length; ++idx) {
                    listeners[idx].apply(null, [event, params]);
                }
            }
            return this;
        }

    });

    /**
     * Event object
     *
     * @class gpf.events.Event
     */
    gpf.extend(_Event.prototype, {

        /**
         * Event type
         *
         * @return {String}
         */
        type: function () {
            return this._type;
        },

        /**
         * Event can be cancelled
         *
         * @return {Boolean}
         */
        cancelable: function () {
            return this._cancelable;
        },

        /**
         * Cancel the event if it is cancelable, meaning that any default
         * action normally taken by the implementation as a result of the event
         * will not occur
         */
        preventDefault: function () {
            this._defaultPrevented = true;
        },

        /**
         * Returns true if preventDefault has been called at least once
         *
         * @return {Boolean}
         */
        defaultPrevented: function () {
            return this._defaultPrevented;
        },

        /**
         * To prevent further propagation of an event during event flow
         */
        stopPropagation: function () {
            this._propagationStopped = true;
        },

        /**
         * Get any additional event information
         * 
         * @param {String} name parameter name
         * @return {*} value of parameter
         */
        get: function (name) {
            return this._params[name];
        },

        /**
         * Fire the event on the provided eventsHandler
         * 
         * @param {Object/function} eventsHandler broadcaster or callback
         *        function
         * @return {gpf.events.Event} this
         */
        fire: function (eventsHandler) {
            return gpf.events.fire(this, eventsHandler);
        }

    });

    gpf.events = {
        Broadcaster: _Broadcaster,
        Event: _Event,

        /**
         * If necessary, build an event object and use the provided media
         * (broadcaster or callback function) to throw it.
         * 
         * NOTE: this is transmitted through the call
         * 
         * @param {String/gpf.events.Event} event string or event object to fire
         * @param {Object} [params={}] params parameter of the event
         *                 (when type is a string)
         * @param {Object/function} eventsHandler broadcaster or callback
         *        function
         * @return {gpf.events.Event} the event object
         */
        fire: function (event, params, eventsHandler) {
            if (event instanceof _Event) {
                // Already an event, no params
                eventsHandler = params;
            } else {
                event = new gpf.events.Event(event, params, true, this);
            }
            if (eventsHandler instanceof _Broadcaster) {
                eventsHandler.broadcastEvent(event);
            } else if (event._that) {
                eventsHandler.apply(event._that, [event]);
            } else {
                eventsHandler(event);
            }
            return event;
        }
    };

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/
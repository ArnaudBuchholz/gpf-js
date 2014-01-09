(function () { /* Begin of privacy scope */
    "use strict";
    /*global document,window,console*/
    /*global process,require,exports,global*/
    /*global gpf*/
    /*jslint continue: true, nomen: true, plusplus: true*/

    var
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
                this._events = null;
            }
        },

        _Event = function (type, params, cancelable, that) {
            this._type = type;
            if (undefined === params) {
                params = {};
            }
            this._params = params;
            if (cancelable) {
                this._cancelable = true;
            } else {
                this._cancelable = false;
            }
//            this._timeStamp = new Date();
//            this._returnValue = undefined;
            this._propagationStopped = false;
            this._defaultPrevented = false;
            if (undefined !== that ) {
                this._that = that;
            } else {
                this._that = that;
            }
        },

        // https://github.com/jshint/jshint/issues/525
        Fn = Function;

    gpf.extend(_Broadcaster.prototype, {

        /**
         * To avoid an extensive use of closures, functions are created with an
         * index that points to the list of 'declared' events (this._events).
         * function _onEVENT(callback,useCapture) {
         *     this.addEventListener(this._events[IDX],callback,useCapture);
         * }
         * 
         * @param {number} idx index of the method to create
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
                closures.push(new Fn(
                    "return this.addEventListener(this._events["
                        + jdx
                        + "],arguments[0],arguments[1]);"
                ));
            }
            return closures[idx];
        },

        /**
         * Add an event listener to the channel
         *
         * @param {string} event name
         * @param {function} callback
         * @param {boolean} useCapture push it on top of the triggering queue
         * @returns {object} this
         * @chainable
         */
        addEventListener: function (event, callback, useCapture) {
            var listeners = this._listeners;
            if (!useCapture) {
                useCapture = false;
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
         * @param {string} event name
         * @param {function} callback
         * @returns {undefined}
         * @chainable
         */
        removeEventListener: function (event, callback) {
            if (undefined !== this._listeners[event]) {
                gpf.clear(this._listeners[event], callback);
            }
        },

        /**
         * Broadcast the event
         * @param {string|gpf.events.Event} event name or object
         * @param {object} [params={}] event parameters
         * @returns {object} this
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

    gpf.extend(_Event.prototype, {

        type: function () {
            return this._type;
        },

        cancelable: function () {
            return this._cancelable;
        },

        /**
         * To cancel the event if it is cancelable, meaning that any default
         * action normally taken by the implementation as a result of the event
         * will not occur
         * 
         * @return {undefined}
         */
        preventDefault: function () {
            this._defaultPrevented = true;
        },

        /**
         * Returns true if preventDefault has been called at least once
         *
         * @returns {boolean}
         */
        defaultPrevented: function () {
            return this._defaultPrevented;
        },

        /**
         * To prevent further propagation of an event during event flow
         * 
         * @return {undefined}
         */
        stopPropagation: function () {
            this._propagationStopped = true;
        },

        /**
         * Get any additional event information
         * 
         * @param {string} name parameter name
         * @returns {*} value of parameter
         */
        get: function (name) {
            return this._params[name];
        },

        /**
         * Fire the event on the provided eventsHandler
         * 
         * @param {object/function} eventsHandler broadcaster or callback
         *        function
         * @returns {gpf.events.Event} this
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
         * @param {string/gpf.events.Event} event string or event object to fire
         * @param {object} [params={}] params parameter of the event
         *                 (when type is a string)
         * @param {object/function} eventsHandler broadcaster or callback
         *        function
         * @returns {gpf.events.Event} the event object
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

}()); /* End of privacy scope */

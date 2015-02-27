/*#ifndef(UMD)*/
"use strict";
/*#endif*/

//TODO redesign

/*
 * Choice between eventHandler last parameter and gpf.events.Target interface
 * - Both must be used when asynchronous action takes place and the caller
 *   must wait for the call to finish
 * - The callback is always receiving a gpf.events.Event
 * - If the event might be thrown several times or several listeners might need
 *   it, use gpf.events.Target
 * - Otherwise, use the eventHandler last parameter
 *
 * NOTE: none of these class are using the gpf.define syntax as they are
 * considered primitive.
 */

var
    /**
     * Event Target
     * keep track of listeners and exposes a protected method to dispatch
     * events when fired
     *
     * @param {String[]} [events=undefined] events
     * @constructor
     * @class gpf.events.Target
     */
    Target = function (events) {
        var idx, len, eventName;
        this._listeners = {};
        if (undefined !== events) {
            this._events = events;
            len = events.length;
            for (idx = 0; idx < len; ++idx) {
                eventName = events[idx];
                this["on" + eventName.charAt(0).toUpperCase()
                + eventName.substr(1)] = this._onEVENT(idx);
                this._listeners[eventName] = [];
            }
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
                args = [this._events[eventIndex]],
                len = arguments.length,
                idx;
            for (idx = 0; idx < len; ++idx) {
                args.push(arguments[idx]);
            }
            return this.addEventListener.apply(this, args);
        };
    },

    /**
     * Event broadcaster
     *
     * @param {String[]} [events=undefined] events
     * @constructor
     * @class gpf.events.Broadcaster
     */
    Broadcaster = function (/*events*/) {
        Target.apply(this, arguments);
    };

gpf.extend(Target.prototype, {

    /**
     * @type {Object} Map of event name to the list of callbacks
     * @private
     */
    _listeners: {},

    /**
     * @type {String[]} List of predefined event names
     * @private
     */
    _events: null,

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
            closures = Broadcaster.prototype._onEVENT.closures,
            jdx;
        if (!closures) {
            closures = Broadcaster.prototype._onEVENT.closures = [];
        }
        gpf.ASSERT(closures.length >= idx, "calls must be sequential");
        while (closures.length <= idx) {
            jdx = closures.length;
            closures.push(_genOnEventClosure(jdx));
        }
        return closures[idx];
    },

    /**
     * Add an event listener to the target
     *
     * @param {String} event name
     * @param {gpf.events.Handler} eventsHandler
     * @param {Boolean} [useCapture=false] useCapture push it on top of the
     * triggering queue
     * @return {gpf.events.Target}
     * @chainable
     */
    addEventListener: function (event, eventsHandler, useCapture) {
        var
            listeners = this._listeners;
        if (!useCapture) {
            useCapture = false;
        }
        if (undefined === listeners[event]) {
            listeners[event] = [];
        }
        if (useCapture) {
            listeners[event].unshift(eventsHandler);
        } else {
            listeners[event].push(eventsHandler);
        }
        return this;
    },

    /**
     * Remove an event listener to the target
     *
     * @param {String} event name
     * @param {gpf.events.Handler} eventsHandler
     * @return {gpf.events.Target}
     * @chainable
     */
    removeEventListener: function (event, eventsHandler) {
        var
            eventsHandlers = this._listeners[event],
            idx;
        if (undefined !== eventsHandlers) {
            idx = eventsHandlers.indexOf(eventsHandler);
            if (-1 !== idx) {
                eventsHandlers.splice(idx, 1);
            }
        }
        return this;
    },

    /**
     * Broadcast the event
     *
     * @param {String|gpf.events.Event} event name or object
     * @param {Object} [params={}] event parameters
     * @return {gpf.events.Target}
     * @protected
     * @chainable
     */
    _dispatchEvent: function (event, params) {
        var
            idx,
            type,
            listeners;
        if (event instanceof Event) {
            type = event.type();
        } else {
            type = event;
        }
        listeners = this._listeners[type];
        if (undefined === listeners) {
            return this; // Nothing to do
        }
        if (!(event instanceof Event)) {
            event = new gpf.events.Event(event, params, true, this);
        }
        for (idx = 0; idx < listeners.length; ++idx) {
            gpf.events.fire.apply(this, [event, listeners[idx]]);
            // TODO see how it complies with asynchronous processing
            if (event._propagationStopped) {
                break;
            }
        }
        return this;
    }

});

Broadcaster.prototype = new Target();
gpf.extend(Broadcaster.prototype, {

    /**
     * Broadcast the event
     *
     * @param {String|gpf.events.Event} event name or object
     * @param {Object} [params={}] event parameters
     * @return {gpf.events.Target}
     * @chainable
     */
    dispatchEvent: function (/*event, params*/) {
        return this._dispatchEvent.apply(this, arguments);
    }

});

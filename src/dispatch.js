/*#ifndef(UMD)*/
"use strict";
/*#endif*/

/**
 * Abstract implementation of an event dispatcher.
 * A typical use would be:
 *   gpf.extend(YourClass.prototype, gpf.events.EventDispatcherImpl)
 *
 * @type {Object}
 */
gpf.events.EventDispatcherImpl = {

    /**
     * @type {Object} Dictionary of event name to the list of callbacks
     * @private
     */
    _eventDispatcherListeners: null,

    /**
     * Add an event listener to the target
     *
     * @param {String} event name
     * @param {gpf.events.Handler} eventsHandler
     * @param {Boolean} [useCapture=false] useCapture push it on top of the
     * triggering queue
     * @return {Object}
     * @chainable
     */
    addEventListener: function (event, eventsHandler, useCapture) {
        var
            listeners = this._eventDispatcherListeners;
        if (!listeners) {
            listeners = this._eventDispatcherListeners = {};
        }
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
     * @return {Object}
     * @chainable
     */
    removeEventListener: function (event, eventsHandler) {
        var
            listeners = this._eventDispatcherListeners,
            eventListeners,
            idx;
        if (listeners) {
            eventListeners = listeners[event];
            if (undefined !== eventListeners) {
                idx = eventListeners.indexOf(eventsHandler);
                if (-1 !== idx) {
                    eventListeners.splice(idx, 1);
                }
            }
        }
        return this;
    },

    /**
     * Broadcast the event
     *
     * @param {String|gpf.events.Event} event name or object
     * @param {Object} [params={}] event parameters
     * @return {Object}
     * @protected
     * @chainable
     */
    _dispatchEvent: function (event, params) {
        var
            listeners = this._eventDispatcherListeners,
            eventObj,
            type,
            eventListeners,
            len,
            idx;
        if (!listeners) {
            return this; // No listeners at all
        }
        if (event instanceof gpf.events.Event) {
            eventObj = event;
            type = event.type;
        } else {
            type = event;
        }
        eventListeners = this._eventDispatcherListeners[type];
        if (undefined === eventListeners) {
            return this; // Nothing listeners for this event
        }
        if (!eventObj) {
            eventObj = new gpf.events.Event(type, params, this);
        }
        len = eventListeners.length;
        for (idx = 0; idx < len; ++idx) {
            gpf.events.fire.apply(this, [eventObj, eventListeners[idx]]);
        }
        return this;
    }

};
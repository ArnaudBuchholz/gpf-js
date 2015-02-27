/*#ifndef(UMD)*/
"use strict";
/*#endif*/

var
    /**
     * GPF Event class
     *
     * @param {String} type
     * @param {Object} [params={}] params
     * @param {Boolean} [cancelable=false] cancelable
     * @param {Object} [scope=undefined] scope
     * @constructor
     * @class _Event
     * @alias gpf.events.Event
     */
    _Event = function (type, params, cancelable, scope) {
        gpf.setReadOnlyProperty(this, "type", type);
        if (undefined !== params) {
            this._params = params;
        }
        if (cancelable) {
            this._cancelable = true;
        }
//            this._timeStamp = new Date();
//            this._returnValue = undefined;
        if (scope) {
            this._scope = scope;
        }
    },

    /**
     * Count the number of gpf.events.fire calls
     *
     * @type {number}
     * @private
     */
    _firing = 0,

    /**
     * Fire the event onto the eventsHandler
     *
     * @param {gpf.events.Event} event event object to fire
     * @param {Object} scope scope of the event
     * @param {gpf.events.Handler} eventsHandler
     */
    _fire = function (event, scope, eventsHandler) {
        var eventHandler,
            overriddenScope;
        gpf.ASSERT(eventsHandler, "Expected eventsHandler");

        // Event dispatcher expected interface
        if (eventsHandler._dispatchEvent) {
            eventsHandler._dispatchEvent(event);

        // Basic function handler
        } else if ("function" === typeof eventsHandler
            || eventsHandler instanceof gpf.Callback) {
            // Compatible with Function & gpf.Callback
            eventsHandler.apply(scope, [event]);

        // Composite with a specific event handler
        } else {
            eventHandler = eventsHandler[event.type()];
            if (undefined === eventHandler) {
                // Try with a default handler
                eventHandler = eventsHandler["*"];
            }
            if (undefined !== eventHandler) {
                overriddenScope = eventsHandler.scope;
                if (undefined !== overriddenScope) {
                    scope = overriddenScope;
                }
                eventHandler.apply(scope, [event]);
            }
        }
    };

// _Event interface
gpf.extend(_Event.prototype, {

    /**
     * Event type
     *
     * @type {String}
     * @read-only
     */
    type: "",

    /**
     * Event parameters
     *
     * @type {Object} Map of key to value
     * @private
     */
    _params: {},

    /**
     * Event can be cancelled
     *
     * @type {Boolean}
     * @private
     */
    _cancelable: false,

    /**
     * Event propagation was stopped
     *
     * @type {Boolean}
     * @private
     */
    _propagationStopped: false,

    /**
     * Event default handling is prevented
     *
     * @type {Boolean}
     * @private
     */
    _defaultPrevented: false,

    /**
     * Event scope
     *
     * @type {Object|null}
     * @private
     */
    _scope: null,

    /**
     * Event scope
     *
     * @return {Object}
     */
    scope: function () {
        return gpf.Callback.resolveScope(this._scope);
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
     * @param {gpf.events.Broadcaster/gpf.Callback/Function} eventsHandler
     * @return {gpf.events.Event} this
     */
    fire: function (eventsHandler) {
        return gpf.events.fire(this, eventsHandler);
    }

});

gpf.events = {

    Event: _Event,

    /**
     * Event Handler,
     * - gpf.events.Broadcaster: broadcastEvent(event)
     * - gpf.Callback|Function: apply(scope, [event])
     * - Object: consider a map between event type and callback function
     * @type {gpf.events.Target|gpf.Callback|Function|Object}
     * @alias {gpf.events.Handler}
     */

    /**
     * If necessary, build an event object and use the provided media
     * (broadcaster or callback function) to throw it.
     *
     * NOTE: this is transmitted through the call
     *
     * @param {String/gpf.events.Event} event string or event object to fire
     * @param {Object} [params={}] params parameter of the event
     *                 (when type is a string)
     * @param {gpf.events.Handler} eventsHandler
     * @return {gpf.events.Event} the event object
     */
    fire: function (event, params, eventsHandler) {
        var scope;
        if (undefined === eventsHandler) {
            // no last param: shift parameters
            eventsHandler = params;
            params = undefined;
        }
        if (!(event instanceof Event)) {
            event = new gpf.events.Event(event, params, true, this);
        }
        scope = gpf.Callback.resolveScope(this);
        /**
         * This is used both to limit the number of recursion and increase
         * the efficiency of the algorithm.
         */
        if (++_firing > 10) {
            // Too much recursion
            gpf.defer(_fire,  0, null, [event, scope, eventsHandler]);
        } else {
            _fire(event, scope, eventsHandler);
        }
        --_firing;
        return event;
    }
};
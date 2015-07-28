/*#ifndef(UMD)*/
"use strict";
/*global _GPF_EVENT_ANY*/ // gpf.events.EVENT_ANY
/*global _GPF_EVENT_CONTINUE*/ // gpf.events.EVENT_CONTINUE
/*global _GPF_EVENT_DATA*/ // gpf.events.EVENT_DATA
/*global _GPF_EVENT_END_OF_DATA*/ // gpf.events.EVENT_END_OF_DATA
/*global _GPF_EVENT_ERROR*/ // gpf.events.EVENT_ERROR
/*global _GPF_EVENT_READY*/ // gpf.events.EVENT_READY
/*global _GPF_EVENT_STOP*/ // gpf.events.EVENT_STOP
/*global _GPF_EVENT_STOPPED*/ // gpf.events.EVENT_STOPPED
/*global _gpfArraySlice*/ // Shortcut on Array.prototype.slice
/*global _gpfResolveScope*/ // Translate the parameter into a valid scope
/*global _gpfSetReadOnlyProperty*/ // gpf.setReadOnlyProperty
/*exported _gpfEventsFire*/
/*#endif*/

gpf.events = {
    /**
     * Event Handler,
     * - gpf.events.Broadcaster: broadcastEvent(event)
     * - gpf.Callback|Function: apply(scope, [event])
     * - Object: consider a map between event type and callback function
     * @type {gpf.events.Target|gpf.Callback|Function|Object}
     * @alias {gpf.events.Handler}
     */
};

// Create events constants
(function () {
    var gpfEvents = gpf.events,
        mappings = {
            EVENT_ANY: _GPF_EVENT_ANY,
            EVENT_ERROR: _GPF_EVENT_ERROR,
            EVENT_READY: _GPF_EVENT_READY,
            EVENT_DATA: _GPF_EVENT_DATA,
            EVENT_END_OF_DATA: _GPF_EVENT_END_OF_DATA,
            EVENT_CONTINUE: _GPF_EVENT_CONTINUE,
            EVENT_STOP: _GPF_EVENT_STOP,
            EVENT_STOPPED: _GPF_EVENT_STOPPED
        },
        key;
    for (key in mappings) {
        if (mappings.hasOwnProperty(key)) {
            _gpfSetReadOnlyProperty(gpfEvents, key, mappings[key]);
        }
    }

}());

var
    /**
     * GPF Event class
     * Simple implementation: type is a read-only member
     *
     * @param {String} type
     * @param {Object} [params={}] params
     * @param {Boolean} [cancelable=false] cancelable
     * @param {Object} [scope=undefined] scope
     * @constructor
     * @class _GpfEvent
     * @alias gpf.events.Event
     */
    _GpfEvent = gpf.events.Event = function (type, params, scope) {
        gpf.setReadOnlyProperty(this, "type", type);
        gpf.setReadOnlyProperty(this, "scope", _gpfResolveScope(scope));
        if (undefined !== params) {
            this._params = params;
        }
    },

    /**
     * Count the number of gpf.events.fire calls
     *
     * @type {number}
     * @private
     */
    _gpfEventsFiring = 0,

    /**
     * Fire the event by calling the eventsHandler
     *
     * @param {gpf.events.Event} event event object to fire
     * @param {gpf.events.Handler} eventsHandler
     */
    _gpfEventsFireCall = function (event, eventsHandler) {
        var scope = event.scope,
            eventHandler;
        gpf.ASSERT(eventsHandler, "Expected eventsHandler");
        if ("function" === typeof eventsHandler._dispatchEvent) {
            // Event dispatcher expected interface
            eventsHandler._dispatchEvent(event);

        } else if ("function" === typeof eventsHandler.apply) {
            // Basic Function handler or gpf.Callback
            eventsHandler.apply(scope, [event]);

        } else {
            // Composite with a specific event handler
            eventHandler = eventsHandler[event.type];
            if (undefined === eventHandler) {
                // Try with a default handler
                eventHandler = eventsHandler["*"];
            }
            if (undefined !== eventHandler) {
                eventHandler.apply(eventsHandler.scope || eventsHandler,
                    [event]);
            }
        }
    },

    /**
     * gpf.events.fire implementation
     *
     * @param {String/gpf.events.Event} event event name or event object to fire
     * @param {Object} params dictionary of parameters for the event object
     * creation, they are ignored if an event object is specified
     * @param {gpf.events.Handler} eventsHandler
     * @return {gpf.events.Event} the event object
     */
    _gpfEventsFire = function (event, params, eventsHandler) {
        var scope = _gpfResolveScope(this);
        if (!(event instanceof _GpfEvent)) {
            event = new gpf.events.Event(event, params, scope);
        }
        /**
         * This is used both to limit the number of recursion and increase
         * the efficiency of the algorithm.
         */
        if (++_gpfEventsFiring > 10) {
            // Too much recursion
            gpf.defer(_gpfEventsFireCall,  0, null, [event, eventsHandler]);
        } else {
            _gpfEventsFireCall(event, eventsHandler);
        }
        --_gpfEventsFiring;
        return event;
    },

    /**
     * Check parameters array and re-assign default values considering that:
     * the eventsHandler parameter is *always* the last one provided
     * all other parameters are optional and can be defaulted provided the
     * defaultArgs array
     *
     * @param {arguments} thatArgs Function arguments
     * @param {Array} defaultArgs List of default values for all expected
     * arguments *but* the eventsHandler
     * @param {Array} defaultArgs List of default values for all expected
     * arguments *but* the eventsHandler
     * @param {Function} callback
     * @return {*} the return of the callback
     * @forwardThis
     * @private
     */
    _gpfLookForEventsHandler = function (thatArgs, defaultArgs, callback) {
        var
            lastExpectedIdx = defaultArgs.length, // eventsHandler not included
            argIdx = thatArgs.length - 1;
        if (argIdx !== lastExpectedIdx) {
            // Need to transform the arguments
            thatArgs = _gpfArraySlice.apply(thatArgs, [0]);
            // The last argument is *always* the eventsHandler
            thatArgs[lastExpectedIdx] = thatArgs[argIdx];
            // Then apply missing defaults
            --argIdx;
            --lastExpectedIdx;
            while (lastExpectedIdx > argIdx) {
                thatArgs[lastExpectedIdx] = defaultArgs[lastExpectedIdx];
                --lastExpectedIdx;
            }
        }
        return callback.apply(this, thatArgs);
    };

// _GpfEvent interface
_GpfEvent.prototype = {

    constructor: _GpfEvent,

    /**
     * Event type
     *
     * @type {String}
     * @read-only
     */
    type: "",

    /**
     * Event scope
     *
     * @return {Object}
     * @read-only
     */
    scope: null,

    /**
     * Event parameters
     *
     * @type {Object} Map of key to value
     * @private
     */
    _params: {},

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

};

/**
 * Use the provided events handler to fire an event
 *
 * NOTE: if the event parameter is a string, an event object will be built
 * using the parameters and the scope of the call as the scope of the event.
 *
 * @param {String/gpf.events.Event} event string or event object to fire
 * @param {Object} [params={}] params parameter of the event (when type is a
 * string)
 * @param {gpf.events.Handler} eventsHandler
 * @return {gpf.events.Event} the event object
 */
gpf.events.fire = function (/*event, params, eventsHandler*/) {
    var scope = this;
    if (scope === gpf.events) {
        // Will be adjusted inside _gpfEventsFire
        scope = undefined;
    }
    return _gpfLookForEventsHandler.apply(scope, [
        arguments,
        [0, {}],
        _gpfEventsFire
    ]);
};

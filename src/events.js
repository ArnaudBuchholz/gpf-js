/*#ifndef(UMD)*/
"use strict";
/*global _gpfContext*/ // Main context object
/*#endif*/

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
     * @class _Event
     * @alias gpf.events.Event
     */
    _Event = function (type, params, scope) {
        gpf.setReadOnlyProperty(this, "type", type);
        gpf.setReadOnlyProperty(this, "scope", scope || _gpfContext);
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

        // Basic function handler or gpf.Callback
        } else if ("function" === eventsHandler.apply) {
            eventsHandler.apply(scope, [event]);
            // Compatible with Function & gpf.Callback

        // Composite with a specific event handler
        } else {
            eventHandler = eventsHandler[event.type];
            if (undefined === eventHandler) {
                // Try with a default handler
                eventHandler = eventsHandler["*"];
            }
            if (undefined !== eventHandler) {
                overriddenScope = eventsHandler.scope;
                if (overriddenScope) {
                    scope = overriddenScope;
                }
                eventHandler.apply(scope, [event]);
            }
        }
    },

    /**
     * Check parameters array and re-assign default values considering that:
     * the eventsHandler parameter is *always* the last one provided
     * all other parameters are optional and can be defaulted provided the
     * defaultArgs array
     *
     * Sample usage:
     *
     *  function fire (event, params, synchronous, eventsHandler) {
     *      _gpfLookForEventsHandler(arguments, ['', {}, false]);
     *
     *
     * @param {arguments} thatArgs Function arguments
     * @param {Array} defaultArgs List of default values for all expected
     * arguments *but* the eventsHandler
     * @private
     */
    _gpfLookForEventsHandler = function (thatArgs, defaultArgs) {
        var
            lastExpectedIdx = defaultArgs.length, // eventsHandler not included
            argIdx = thatArgs.lenth - 1;
        if (argIdx !== lastExpectedIdx) {
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
        _gpfLookForEventsHandler(arguments, [0, {}]);
        if (!(event instanceof _Event)) {
            event = new gpf.events.Event(event, params, this);
        }
        scope = this || _gpfContext;
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
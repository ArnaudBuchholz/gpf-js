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
/*global _gpfCreateConstants*/
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfResolveScope*/ // Translate the parameter into a valid scope
/*global _gpfSetConstant*/ // If possible, defines a constant (i.e. read-only property)
/*exported _gpfEventsFire*/
/*exported _GpfEvent*/
/*#endif*/

/**
 * GPF Event class
 * Simple implementation: type is a read-only member
 *
 * @param {String} type
 * @param {Object} [params={}] params
 * @param {Boolean} [cancelable=false] cancelable
 * @param {Object} [scope=undefined] scope
 * @constructor
 */
function _GpfEvent (type, params, scope) {
    /*jshint validthis:true*/ // constructor
    _gpfSetConstant(this, {
        name: "type",
        value: type
    });
    _gpfSetConstant(this, {
        name: "scope",
        value: _gpfResolveScope(scope)
    });
    if (undefined !== params) {
        this._params = params;
    }
}

// _GpfEvent interface
_GpfEvent.prototype = {

    constructor: _GpfEvent,

    /**
     * Event type
     * @read-only
     */
    type: "",

    /**
     * Event scope
     * @read-only
     */
    scope: null,

    // Event parameters
    _params: {},

    /**
     * Get any additional event information
     *
     * @param {String} name parameter name
     * @return {*} value of parameter
     */
    get: function (name) {
        return this._params[name];
    }

};

/**
 * Fire the event by triggering the eventsHandler
 *
 * @param {gpf.events.Event} event event object to fire
 * @param {gpf.events.Handler} eventsHandler
 */
function _gpfEventsTriggerHandler (event, eventsHandler) {
    var scope = event.scope,
        eventHandler;
    gpf.ASSERT(eventsHandler, "Expected eventsHandler");
    if ("function" === typeof eventsHandler.dispatchEvent) {
        // Event dispatcher expected interface
        eventsHandler.dispatchEvent(event);

    } else if ("function" === typeof eventsHandler.apply) {
        // Basic Function handler
        eventsHandler.apply(scope, [event]);

    } else {
        // Composite with a specific event handler
        eventHandler = eventsHandler[event.type];
        if (undefined === eventHandler) {
            // Try with a default handler
            eventHandler = eventsHandler["*"];
        }
        if (undefined !== eventHandler) {
            eventHandler.apply(eventsHandler.scope || eventsHandler, [event]);
        }
    }
}

var
// Count the number of gpf.events.fire calls
    _gpfEventsFiring = 0;

/**
 * gpf.events.fire implementation
 *
 * @param {String/gpf.events.Event} event event name or event object to fire
 * @param {Object} params dictionary of parameters for the event object
 * creation, they are ignored if an event object is specified
 * @param {gpf.events.Handler} eventsHandler
 * @return {gpf.events.Event} the event object
 */
function _gpfEventsFire (event, params, eventsHandler) {
    /*jshint validthis:true*/ // will be invoked with apply
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
        gpf.defer(_gpfEventsTriggerHandler,  0, null, [event, eventsHandler]);
    } else {
        _gpfEventsTriggerHandler(event, eventsHandler);
    }
    --_gpfEventsFiring;
    return event;
}

/**
 * Fire the event on the provided eventsHandler
 *
 * @param {gpf.events.Handler} eventsHandler
 * @return {gpf.events.Event} this
 */
_GpfEvent.prototype.fire = function (eventsHandler) {
    return _gpfEventsFire.apply(this, [this, {}, eventsHandler]);
};

gpf.events = {

    /**
     * Event Handler
     * - Function: apply(scope, [event])
     * - Object with a dispatchEvent method
     * - Object used as dictionary associating type to callback functions
     * @type {Function|Object}
     * @alias {gpf.events.Handler}
     */

    // @inheritdoc _GpfEvent
    Event: _GpfEvent,

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
    fire: function (event, params, eventsHandler) {
        _gpfIgnore(event, params, eventsHandler);
        var scope = this;
        if (scope === gpf.events) {
            // Will be adjusted inside _gpfEventsFire
            scope = undefined;
        }
        if (undefined === eventsHandler) {
            eventsHandler = params;
            params = {};
        }
        _gpfEventsFire.apply(this, [event, params, eventsHandler]);
    }
};

_gpfCreateConstants(gpf.events, {
    EVENT_ANY: _GPF_EVENT_ANY,
    EVENT_ERROR: _GPF_EVENT_ERROR,
    EVENT_READY: _GPF_EVENT_READY,
    EVENT_DATA: _GPF_EVENT_DATA,
    EVENT_END_OF_DATA: _GPF_EVENT_END_OF_DATA,
    EVENT_CONTINUE: _GPF_EVENT_CONTINUE,
    EVENT_STOP: _GPF_EVENT_STOP,
    EVENT_STOPPED: _GPF_EVENT_STOPPED
});

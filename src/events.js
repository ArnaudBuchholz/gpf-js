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
/*global _GpfDeferredPromise*/ // Deferred promise
/*global _gpfAssert*/ // Assertion method
/*global _gpfCreateConstants*/ // Automate constants creation
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfResolveScope*/ // Translate the parameter into a valid scope
/*exported _GpfEvent*/ // gpf.Events.Event
/*exported _GpfEventsIsValidHandler*/ // Check event handler validity
/*exported _gpfEventGetPromiseHandler*/ // Event handler wrapper for Promises
/*exported _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*#endif*/

/**
 * Check if the provided parameter is a valid Handler
 *
 * @param {*} eventHandler
 * @return {Boolean}
 */
function _GpfEventsIsValidHandler (eventHandler) {
    var type = typeof eventHandler,
        dispatchEvent;
    if ("function" === type) {
        return 1 === eventHandler.length;
    }
    if ("object" !== type) {
        return false;
    }
    dispatchEvent = eventHandler.dispatchEvent;
    if ("function" === typeof dispatchEvent) {
        return 1 === dispatchEvent.length;
    }
    // Assuming there will be an handler for the event (we can't know in advance)
    // TODO does it make sense to ignore an event? I may need to check that at least one event handler is available
    return true;
}

gpf.events = {

    /**
     * Event Handler
     * - Function: apply(scope, [event])
     * - Object with a dispatchEvent method
     * - Object used as dictionary associating type to callback functions
     * @type {Function|Object}
     * @alias {gpf.events.Handler}
     */

    // @inheritdoc _GpfEventsIsValidHandler
    isValidHandler: _GpfEventsIsValidHandler
};

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
var _GpfEvent = gpf.events.Event = function (type, params, scope) {
    /*jshint validthis:true*/ // constructor
    /*gpf:constant*/ this.type = type;
    /*gpf:constant*/ this.scope = _gpfResolveScope(scope);
    if (undefined !== params) {
        this._params = params;
    }
};

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

// Returns the function to call (bound with the correct scope)
function _getEventHandler (event, eventsHandler) {
    var scope = event.scope,
        eventHandler;
    if ("function" === typeof eventsHandler.dispatchEvent) {
        // Event dispatcher expected interface
        return eventsHandler.dispatchEvent.bind(eventsHandler);
    }
    if ("function" === typeof eventsHandler) {
        return eventsHandler.bind(scope);
    }
    // Composite with a specific event handler
    eventHandler = eventsHandler[event.type] || eventsHandler["*"] || _gpfEmptyFunc;
    return eventHandler.bind(eventsHandler.scope || eventsHandler);
}

/**
 * Fire the event by triggering the eventsHandler
 *
 * @param {gpf.events.Event} event event object to fire
 * @param {gpf.events.Handler} eventsHandler
 * @param {Function} [resolvePromise=undefined] resolvePromise Promise resolver
 */
function _gpfEventsTriggerHandler (event, eventsHandler, resolvePromise) {
    var eventHandler = _getEventHandler(event, eventsHandler);
    eventHandler(event);
    if (undefined !== resolvePromise) {
        resolvePromise(event);
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
 * @return {Promise<gpf.events.Event>} fulfilled when the event has been fired
 */
function _gpfEventsFire (event, params, eventsHandler) {
    /*jshint validthis:true*/ // will be invoked with apply
    var scope = _gpfResolveScope(this);
    _gpfAssert(_GpfEventsIsValidHandler(eventsHandler), "Expected a valid event handler");
    if (!(event instanceof _GpfEvent)) {
        event = new gpf.events.Event(event, params, scope);
    }
    return new Promise(function (resolve, reject) {
        // This is used both to limit the number of recursion and increase the efficiency of the algorithm.
        if (++_gpfEventsFiring > 10) {
            // Too much recursion, use setTimeout to free some space on the stack
            setTimeout(_gpfEventsTriggerHandler.bind(null, event, eventsHandler, resolve), 0);
        } else {
            _gpfEventsTriggerHandler(event, eventsHandler);
            resolve(event);
        }
        --_gpfEventsFiring;
    });
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
 * @return {Promise<gpf.events.Event>} fulfilled when the event has been fired
 */
gpf.events.fire = function (event, params, eventsHandler) {
    _gpfIgnore(event, params, eventsHandler);
    var me = this,
        scope;
    if (this !== gpf.events) {
        scope = me;
    } // Else it will be adjusted inside _gpfEventsFire
    if (undefined === eventsHandler) {
        eventsHandler = params;
        params = {};
    }
    return _gpfEventsFire.apply(scope, [event, params, eventsHandler]);
};

/**
 * Wraps a function that signals events so that it can be used with promises (by letting the eventHandler parameter
 * undefined).
 *
 * @param {Function} eventHandlingMethod encapsulates the call to the event handling function, receives a parameter
 * that must be passed as an event handler.
 * @return {Promise<gpf.events.Event>}
 */
function _gpfEventGetPromiseHandler (eventHandlingMethod) {
    return new Promise(function (resolve, reject) {
        eventHandlingMethod(function (event) {
            if (_GPF_EVENT_ERROR === event.type) {
                reject(event.get("error"));
            } else {
                resolve(event);
            }
        });
    });
}

// @inheritdoc _gpfEventGetPromiseHandler
gpf.events.getPromiseHandler = _gpfEventGetPromiseHandler;

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

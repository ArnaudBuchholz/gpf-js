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
/*global _gpfArraySlice*/ // Slice an array-like object
/*global _gpfAssert*/ // Assertion method
/*global _gpfCreateConstants*/
/*global _GpfDeferredPromise*/ // Deferred promise
/*global _GpfDeferredPromise*/ // Deferred promise
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfGetTemplateBody*/ // Function templating helper
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfResolveScope*/ // Translate the parameter into a valid scope
/*exported _gpfEventsFire*/
/*exported _GpfEvent*/
/*#endif*/

gpf.events = {

    /**
     * Event Handler
     * - Function: apply(scope, [event])
     * - Object with a dispatchEvent method
     * - Object used as dictionary associating type to callback functions
     * @type {Function|Object}
     * @alias {gpf.events.Handler}
     */

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
    _gpfAssert(eventsHandler, "Expected eventsHandler");
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
 * @param {gpf.DeferredPromise} [deferredPromise=undefined] deferredPromise promise to resolve on completion
 */
function _gpfEventsTriggerHandler (event, eventsHandler, deferredPromise) {
    var eventHandler = _getEventHandler(event, eventsHandler);
    eventHandler(event);
    if (undefined !== deferredPromise) {
        deferredPromise.resolve(event);
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
    var scope = _gpfResolveScope(this),
        result;
    if (!(event instanceof _GpfEvent)) {
        event = new gpf.events.Event(event, params, scope);
    }
    /**
     * This is used both to limit the number of recursion and increase
     * the efficiency of the algorithm.
     */
    if (++_gpfEventsFiring > 10) {
        // Too much recursion, use setTimeout to free some space on the stack
        result = new _GpfDeferredPromise();
        setTimeout(_gpfEventsTriggerHandler.bind(null, event, eventsHandler, result), 0);
    } else {
        _gpfEventsTriggerHandler(event, eventsHandler);
        result = Promise.resolve(event);
    }
    --_gpfEventsFiring;
    return result;
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

/*global __LAST_PARAM_INDEX__*/
function _gpfEventsPromiseWrapper () {
    /*jshint validthis: true*/
    var method = arguments[0];
    return function __NAME__ (__PARAM_LIST__) {
        _gpfIgnore(__PARAM_LIST__);
        var args = _gpfArraySlice(arguments),
            deferred;
        if (undefined === args[__LAST_PARAM_INDEX__]) {
            deferred = new _GpfDeferredPromise();
            args[__LAST_PARAM_INDEX__] = function (event) {
                if (_GPF_EVENT_ERROR === event.type) {
                    deferred.reject(event);
                } else {
                    deferred.resolve(event);
                }
            };
        }
        method.apply(this, args);
        if (deferred) {
            return deferred.promise;
        }
    };
}

/**
 * Wraps a function that signals events so that it can be used with promises (by letting the eventHandler parameter
 * undefined).
 *
 * @param {Function} eventHandlingMethod last parameter of this function must be an eventHandler
 * @return {Function} with the same name and signature
 */
function _gpfEventsWrap (eventHandlingMethod) {
    // To ensure interfaces compatibility, we need to create a method that mimics the wrapped one properties
    return _gpfFunc(_gpfGetTemplateBody(_gpfEventsPromiseWrapper, eventHandlingMethod))(eventHandlingMethod);
}

// @inheritdoc _gpfEventsWrap
gpf.events.wrap = _gpfEventsWrap;

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

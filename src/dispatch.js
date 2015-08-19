/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _GpfEvent*/ // gpf.Events.Event
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _gpfExtend*/ // gpf.extend
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*#endif*/

_gpfErrorDeclare("dispatch", {
    "DispatcherMemberConflict":
        "Can't override an existing dispatcher member"
});

// Retrieve or allocate the _eventDispatcherListeners member
function _gpfAllocateEventDispatcherListeners(object) {
    var listeners = object._eventDispatcherListeners;
    if (!listeners) {
        listeners = object._eventDispatcherListeners = {};
    }
    return listeners;
}

/**
 * Add an event listener to the dispatcher
 *
 * @param {String} event name
 * @param {gpf.events.Handler} eventsHandler
 * @return {Object}
 * @chainable
 */
function _gpfAddEventListener (event, eventsHandler) {
    /*jshint validthis:true*/ // will be invoked as an object method
    var listeners = _gpfAllocateEventDispatcherListeners(this);
    if (undefined === listeners[event]) {
        listeners[event] = [];
    }
    listeners[event].push(eventsHandler);
    return this;
}

/**
 * Remove an event listener from the dispatcher
 *
 * @param {String} event name
 * @param {gpf.events.Handler} eventsHandler
 * @return {Object}
 * @chainable
 */
function _gpfRemoveEventListener (event, eventsHandler) {
    /*jshint validthis:true*/ // will be invoked as an object method
    var listeners = this._eventDispatcherListeners,
        eventListeners,
        index;
    if (listeners) {
        eventListeners = listeners[event];
        if (undefined !== eventListeners) {
            index = eventListeners.indexOf(eventsHandler);
            if (-1 !== index) {
                eventListeners.splice(index, 1);
            }
        }
    }
    return this;
}

/**
 * Execute the listeners
 *
 * @param {gpf.events.Event} eventObj
 * @param {gpf.events.Handler[]} eventListeners
 */
function _gpfTriggerListeners (eventObj, eventListeners) {
    var index,
        length = eventListeners.length;
    for (index = 0; index < length; ++index) {
        _gpfEventsFire.apply(eventObj.scope, [eventObj, {}, eventListeners[index]]);
    }
}

/**
 * Broadcast the event
 *
 * @param {String|gpf.events.Event} event name or object
 * @param {Object} [params={}] event parameters
 * @return {Object}
 * @protected
 * @chainable
 */
function _gpfDispatchEvent(event, params) {
    /*jshint validthis:true*/ // will be invoked as an object method
    var listeners = this._eventDispatcherListeners,
        eventObj,
        type,
        eventListeners;
    if (!listeners) {
        return this; // No listeners at all
    }
    if (event instanceof _GpfEvent) {
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
        eventObj = new _GpfEvent(type, params, this);
    }
    _gpfTriggerListeners(eventObj, eventListeners);
    return this;
}

var
    _gpfDispatcherMethods = {
        addEventListener: _gpfAddEventListener,
        removeEventListener: _gpfRemoveEventListener,
        dispatchEvent: _gpfDispatchEvent
    };

/**
 * Transform the object into an event dispatcher (that can be passed to gpf.events.fire).
 * NOTE: the method will fail if any of the created member conflict with existing one.
 *
 * Added members are:
 * - {Object} _eventDispatcherListeners
 * - {Function} addEventListener
 *   - {String} event
 *   - {gpf.events.Handler} handler
 * - {Function} removeEventListener
 *   - {String} event
 *   - {gpf.events.Handler} handler
 * - {Function} dispatchEvent
 *   - {gpf.events.Event} event
 *
 * @param {Object} object
 * @return {Object}
 * @chainable
 */
gpf.events.addDispatcherMethods = function (object) {
    // First pass, verify no conflict
    _gpfObjectForEach(_gpfDispatcherMethods, function (member) {
        if (undefined !== object[member]) {
            throw gpf.Error.DispatcherMemberConflict();
        }
    });
    // Then assign
    _gpfExtend(object, _gpfDispatcherMethods);
};
/**
 * @file Event dispatcher mixin
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfEvent*/ // gpf.Events.Event
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*#endif*/

// Retrieve or allocate the _eventDispatcherListeners member
function _gpfAllocateEventDispatcherListeners (object) {
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
 * @gpf:chainable
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
 * @gpf:chainable
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
        _gpfEventsFire.call(eventObj.scope, eventObj, {}, eventListeners[index]);
    }
}

/**
 * Broadcast the event
 *
 * @param {String|gpf.events.Event} event name or object
 * @param {Object} [params={}] event parameters
 * @return {gpf.events.Event}
 */
function _gpfDispatchEvent (event, params) {
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
    return eventObj;
}

gpf.mixins = {

    /**
     * Event dispatcher mixin
     */
    EventDispatcher: {

        // @inheritdoc _gpfAddEventListener
        addEventListener: _gpfAddEventListener,

        // @inheritdoc _gpfRemoveEventListener
        removeEventListener: _gpfRemoveEventListener,

        // @inheritdoc _gpfDispatchEvent
        dispatchEvent: _gpfDispatchEvent
    }

};


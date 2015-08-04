/*#ifndef(UMD)*/
"use strict";
/*jshint browser: true*/
/*global _GPF_EVENT_ERROR*/ // gpf.events.EVENT_ERROR
/*global _GPF_EVENT_READY*/ // gpf.events.EVENT_READY
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _gpfInBrowser*/ // The current host is a browser like
/*global _gpfWebDocument*/ // Browser document object
/*global _gpfWebHead*/ // Browser head tag
/*#endif*/

/**
 * Context of an include
 *
 * @constructor
 * @param {String} src
 * @param {gpf.events.Handler} eventsHandler
 * @class _GpfWebIncludeContext
 */
function _GpfWebIncludeContext (src, eventsHandler) {
    /*jshint validthis:true*/
    if (undefined === _GpfWebIncludeContext.id) {
        // Unique IDs for each include
        _GpfWebIncludeContext.id = 0;
        // Dictionary of contexts associated to the includes
        _GpfWebIncludeContext.map = {};
    }
    this.id = ++_GpfWebIncludeContext.id;
    this.src = src;
    this.eventsHandler = eventsHandler;
    _GpfWebIncludeContext.map[this.id] = this;
}

/**
 * Use insertBefore instead of appendChild  to avoid an IE6 bug.
 * This arises when a base node is used (#2709 and #4378).
 *
 * @param {Object} domScript
 */
function _gpfWebIncludeInsert (domScript) {
    _gpfWebHead.insertBefore(domScript, _gpfWebHead.firstChild);
}

/**
 * @inheritdoc gpf.web#include
 * Implementation of gpf.web.include
 *
 * Inspired from http://stackoverflow.com/questions/4845762/
 */
 function _gpfWebInclude (src, eventsHandler) {
    var context = new _GpfWebIncludeContext(src, eventsHandler),
        domScript = _gpfWebDocument.createElement("script");
    // Configure script tag
    domScript.language = "javascript";
    domScript.src = src;
    domScript.id = context.id;
    // Attach handlers for all browsers
    domScript.onload = domScript.onreadystatechange = _GpfWebIncludeContext.onLoad;
    domScript.onerror = _GpfWebIncludeContext.onError;
    // Use async when supported
    if (undefined !== domScript.async) {
        domScript.async = true;
    }
    // Bug in IE10 that loads & triggers immediately, use timeout
    setTimeout(_gpfWebIncludeInsert, 0, domScript);
}

_GpfWebIncludeContext.prototype = {

    // Unique ID of this context
    id: 0,

    // Included source
    src: "",

     // @property {gpf.events.Handler} Events handler
    eventsHandler: null,

    /**
     * Clean the include context
     *
     * @param {Object} domScript The script element
     */
    clean: function (domScript) {
        var parent = domScript.parentNode;
        domScript.onerror = domScript.onload = domScript.onreadystatechange = null;
        if (parent) {
            parent.removeChild(domScript);
        }
        // Destroy context mapping
        delete _GpfWebIncludeContext.map[this.id];
    },

    /**
     * The script may be loaded
     *
     * @param {Object} domScript The script element
     */
    check: function (domScript) {
        var readyState = domScript.readyState;
        if (!readyState || -1 < ["loaded", "complete"].indexOf(readyState)) {
            this.clean(domScript);
            // IE10: the event is triggered *before* the source is evaluated
            setTimeout(_gpfEventsFire, 0, _GPF_EVENT_READY, {url: this.src}, this.eventsHandler);
        }
    },

    /**
     * The script loading failed
     *
     * @param {Object} domScript The script element
     */
    failed: function (domScript) {
        this.clean(domScript);
        setTimeout(_gpfEventsFire, 0, _GPF_EVENT_ERROR, {url: this.src}, this.eventsHandler);
    }

};

/**
 * Wrapper for the load event
 */
_GpfWebIncludeContext.onLoad = function () {
    // 'this' is the script element
    var context = _GpfWebIncludeContext.map[this.id];
    if (context) {
        context.check(this);
    }
};

/**
 * Wrapper for the error event
 */
_GpfWebIncludeContext.onError = function () {
    // 'this' is the script element
    var context = _GpfWebIncludeContext.map[this.id];
    if (context) {
        context.failed(this);
    }
};

if (_gpfInBrowser) {

    /**
     * Loads dynamically any script
     * Waits for the script to be loaded and calls a eventsHandler when done
     * The following is an easy way to handle eventsHandlers whenever the
     * process is asychronous (window.setTimeout, onload eventsHandler).
     * The function returns an object that can be overridden with our own
     * loaded handler (if needed)
     *
     * @param {String} src
     * @param {gpf.events.Handler} eventsHandler
     *
     * @eventParam {string} url URL of the included resource
     *
     * @event gpf.events.EVENT_READY
     * The resource has been successfully loaded
     *
     * @event gpf.events.EVENT_ERROR
     * An error occurred when loading the resource
     */
    gpf.web.include = _gpfWebInclude;

}

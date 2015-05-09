/*#ifndef(UMD)*/
"use strict";
/*jshint browser: true*/
/*global _gpfInBrowser*/ // The current host is a browser like
/*global _gpfContext*/ // Main context object
/*global _gpfWebDocument*/ // Browser document object
/*global _gpfWebHead*/ // Browser head tag
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _GPF_EVENT_ERROR*/ // gpf.events.EVENT_ERROR
/*global _GPF_EVENT_READY*/ // gpf.events.EVENT_READY
/*#endif*/

var
    /**
     * Context of an include
     *
     * @constructor
     * @param {String} src
     * @param {gpf.events.Handler} eventsHandler
     * @class _GpfIncludeContext
     * @private
     */
    _GpfIncludeContext = function (src, eventsHandler) {
        this.id = ++_GpfIncludeContext.id;
        this.src = src;
        this.eventsHandler =  eventsHandler;
        _GpfIncludeContext.map[this.id] = this;
    },

    /**
     * Use insertBefore instead of appendChild  to avoid an IE6 bug.
     * This arises when a base node is used (#2709 and #4378).
     * Also found a bug in IE10 that loads & triggers immediately
     * script, use timeout
     *
     * @param {Object} domScript
     * @private
     */
    _gpfWebIncludeInsert = function (domScript) {
        _gpfWebHead.insertBefore(domScript, _gpfWebHead.firstChild);
    },

    /**
     * The loading result is notified asynchronously using a setTimeout.
     * This function is the callback that forward the parameters to the
     * gpf.events.fire function
     *
     * @param {Array} parameters
     * @private
     */
    _gpfWebIncludeAsyncResult = function (parameters) {
        _gpfEventsFire.apply(_gpfContext, parameters);
    },

    /**
     * @inheritdoc gpf.web:include
     * Implementation of gpf.web.include
     *
     * Inspired from http://stackoverflow.com/questions/4845762/
     */
    _gpfWebInclude = function (src, eventsHandler) {
        var
            context = new _GpfIncludeContext(src, eventsHandler),
            domScript = _gpfWebDocument.createElement("script");
        // Configure script tag
        domScript.language = "javascript";
        domScript.src = src;
        domScript.id = context.id;
        // Attach handlers for all browsers
        domScript.onload
            = domScript.onreadystatechange
            = _GpfIncludeContext.onLoad;
        domScript.onerror
            = _GpfIncludeContext.onError;
        // Use async when supported
        if (undefined !== domScript.async) {
            domScript.async = true;
        }
        /*
         * Use insertBefore instead of appendChild  to avoid an IE6 bug.
         * This arises when a base node is used (#2709 and #4378).
         * Also found a bug in IE10 that loads & triggers immediately
         * script, use timeout
         */
        setTimeout(_gpfWebIncludeInsert, 0, domScript);
    };

_GpfIncludeContext.prototype = {

    /**
     * Unique ID of this context
     *
     * @type {Number}
     * @read-only
     */
    id: 0,

    /**
     * Included source
     *
     * @type {String}
     * @read-only
     */
    src: "",

    /**
     * Events handler
     *
     * @type {gpf.events.Handler}
     * @read-only
     */
    eventsHandler: null,

    /**
     * Clean the include context
     *
     * @param {Object} domScript The script element
     */
    clean: function (domScript) {
        var parent = domScript.parentNode;
        domScript.onerror
            = domScript.onload
            = domScript.onreadystatechange
            = null;
        if (parent) {
            parent.removeChild(domScript);
        }
        // Destroy context mapping
        delete _GpfIncludeContext.map[this.id];
    },

    /**
     * The script was loaded
     *
     * @param {Object} domScript The script element
     */
    check: function (domScript) {
        var readyState = domScript.readyState;
        if (!readyState || -1 < ["loaded", "complete"].indexOf(readyState)) {
            this.clean(domScript);
            // IE10: the event is triggered *before* the source is evaluated
            setTimeout(_gpfWebIncludeAsyncResult, 0, [
                _GPF_EVENT_READY, {url: this.src}, this.eventsHandler
            ]);
        }

    },

    /**
     * The script loading failed
     *
     * @param {Object} domScript The script element
     */
    failed: function (domScript) {
        this.clean(domScript);
        setTimeout(_gpfWebIncludeAsyncResult, 0, [
            _GPF_EVENT_ERROR, {url: this.src}, this.eventsHandler
        ]);
    }

};

/**
 * Unique IDs used for include tags
 *
 * @type {number}
 * @static
 */
_GpfIncludeContext.id = 0;

/**
 * Dictionary of contexts associated to the includes
 *
 * @type {Object}
 * @static
 */
_GpfIncludeContext.map = {};

/**
 * Wrapper for the load event
 */
_GpfIncludeContext.onLoad = function () {
    // 'this' is the script element
    var context = _GpfIncludeContext.map[this.id];
    if (context) {
        context.check(this);
    }
};

/**
 * Wrapper for the error event
 */
_GpfIncludeContext.onError = function () {
    // 'this' is the script element
    var context = _GpfIncludeContext.map[this.id];
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

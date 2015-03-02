/*#ifndef(UMD)*/
"use strict";
/*jshint browser: true*/
/*global _gpfContext*/ // Main context object
/*global _gpfWebDocument*/ // Browser document object
/*global _gpfWebHead*/ // Browser head tag
/*#endif*/

var
    /**
     * Context of an include
     *
     * @constructor
     * @param {String} src
     * @param {gpf.events.Handler} eventsHandler
     * @class _IncludeContext
     * @private
     */
    _IncludeContext = function (src, eventsHandler) {
        this.id = ++_IncludeContext.id;
        this.src = src;
        this.eventsHandler =  eventsHandler;
        _IncludeContext.map[this.id] = this;
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
    _gpfHttpIncludeInsert = function (domScript) {
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
    _gpfHttpIncludeAsyncResult = function (parameters) {
        gpf.events.fire.apply(_gpfContext, parameters);
    };

// _IncludeContext prototype
_IncludeContext.prototype = {

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
        delete _IncludeContext.map[this.id];
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
            setTimeout(_gpfHttpIncludeAsyncResult, 0, [
                "load", {url: this.src}, this.eventsHandler
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
        setTimeout(_gpfHttpIncludeAsyncResult, 0, [
            "error", {url: this.src}, this.eventsHandler
        ]);
    }

};

/**
 * Unique IDs used for include tags
 *
 * @type {number}
 * @static
 */
_IncludeContext.id = 0;

/**
 * Dictionary of contexts associated to the includes
 *
 * @type {Object}
 * @static
 */
_IncludeContext.map = {};

/**
 * Wrapper for the load event
 */
_IncludeContext.onLoad = function () {
    // 'this' is the script element
    var context = _IncludeContext.map[this.id];
    if (context) {
        context.check(this);
    }
};

/**
 * Wrapper for the error event
 */
_IncludeContext.onError = function () {
    // 'this' is the script element
    var context = _IncludeContext.map[this.id];
    if (context) {
        context.failed(this);
    }
};

gpf.http = {

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
     * @event load The resource has been successfully loaded
     *
     * @event error An error occurred when loading the resource
     *
     * Inspired from http://stackoverflow.com/questions/4845762/
     */
    include: function (src, eventsHandler) {
        var
            context = new _IncludeContext(src, eventsHandler),
            domScript = _gpfWebDocument.createElement("script");
        // Configure script tag
        domScript.language = "javascript";
        domScript.src = src;
        domScript.id = context.id;
        // Attach handlers for all browsers
        domScript.onload
            = domScript.onreadystatechange
            = _IncludeContext.onLoad;
        domScript.onerror
            = _IncludeContext.onError;
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
        setTimeout(_gpfHttpIncludeInsert, 0, domScript);
    }

};
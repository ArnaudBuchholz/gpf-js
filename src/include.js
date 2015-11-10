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

/* istanbul ignore next */ // Not testable with NodeJS
if (_gpfInBrowser) {

    /**
     * Dynamically loads a script in the browser, wait until the script is loaded to fire the eventsHandler when done.
     *
     * @param {String} url
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
    gpf.web.include = (function () {
        // This is a private context, hence the naming rules are not mandatory here

        var INCLUDE_ID_PREFIX = "gpf-include-",
            // Unique IDs for each include
            lastIncludeId = 0,
            // Dictionary of contexts associated to the includes
            includeMap = {};

        /**
         * Context of an include
         *
         * @param {String} url
         * @param {gpf.events.Handler} eventsHandler
         * @class IncludeContext
         * @constructor
         */
        function IncludeContext (url, eventsHandler) {
            /*jshint validthis:true*/
            this.id = ++lastIncludeId;
            this.url = url;
            this.eventsHandler = eventsHandler;
            includeMap[this.id] = this;
        }

        IncludeContext.prototype = {

            // Unique ID of this context
            id: 0,

            // Include URL
            url: "",

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
                delete includeMap[this.id];
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
                    setTimeout(_gpfEventsFire, 0, _GPF_EVENT_READY, {url: this.url}, this.eventsHandler);
                }
            },

            /**
             * The script loading failed
             *
             * @param {Object} domScript The script element
             */
            failed: function (domScript) {
                this.clean(domScript);
                setTimeout(_gpfEventsFire, 0, _GPF_EVENT_ERROR, {url: this.url}, this.eventsHandler);
            }

        };

        function getIncludeContextFromId (id) {
            return includeMap[id.substr(INCLUDE_ID_PREFIX.length)];
        }

        // Wrapper for the load event
        function onLoad () {
            /*jshint validthis:true*/ // 'this' is the script element
            var me = this; //eslint-disable-line no-invalid-this
            var context = getIncludeContextFromId(me.id);
            if (context) {
                context.check(me);
            }
        }

        // Wrapper for the error event
        function onError () {
            /*jshint validthis:true*/ // 'this' is the script element
            var me = this; //eslint-disable-line no-invalid-this
            var context = getIncludeContextFromId(me.id);
            if (context) {
                context.failed(me);
            }
        }

        /**
         * Use insertBefore instead of appendChild  to avoid an IE6 bug.
         * This arises when a base node is used (#2709 and #4378).
         *
         * @param {Object} domScript
         */
        function insert (domScript) {
            _gpfWebHead.insertBefore(domScript, _gpfWebHead.firstChild);
        }

        /**
         * @inheritdoc gpf.web#include
         * Implementation of gpf.web.include
         *
         * Inspired from http://stackoverflow.com/questions/4845762/
         */
        return function (url, eventsHandler) {
            var context = new IncludeContext(url, eventsHandler),
                domScript = _gpfWebDocument.createElement("script");
            // Configure script tag
            domScript.language = "javascript";
            domScript.src = url;
            domScript.id = INCLUDE_ID_PREFIX + context.id;
            // Attach handlers for all browsers
            domScript.onload = domScript.onreadystatechange = onLoad;
            domScript.onerror = onError;
            // Use async when supported
            if (undefined !== domScript.async) {
                domScript.async = true;
            }
            // Bug in IE10 that loads & triggers immediately, use timeout
            setTimeout(insert, 0, domScript);
        };

    }());

}

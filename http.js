/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

/*
FIXME: IE10 does not detect when the script does not exist.
    One workaround would be to use XHR to load the script source and add
    a script tag inside the head (and finally remove it).
    Must evaluate the impacts before implementing (knowing that we rarely need
    to load a script that does not exist).
 */

    var
        _id = 0,
        _includeContexts = {},

        _detachInclude = function (context) {
            // Handle memory leak in IE
            var
                scriptTag = context.scriptTag,
                headTag = context.headTag;
            scriptTag.onerror
                = scriptTag.onload
                = scriptTag.onreadystatechange
                = null;
            if (headTag && scriptTag.parentNode) {
                headTag.removeChild(scriptTag);
            }
            // Destroy context
            delete _includeContexts[context.id];
        },

        _includeOnLoad = function () {
            // 'this' is the script element
            var context = _includeContexts[this.id];
            if (!context.done
                    && (!this.readyState || this.readyState === "loaded"
                     || this.readyState === "complete")) {
                // IE10: the event is triggered *before* the source is evaluated
                setTimeout(function() {
                    context.done = true;
                    gpf.events.fire("load", {url: context.src},
                        context.eventsHandler);
                }, 0);
                _detachInclude(context);
            }
        },

        _includeOnError = function () {
            // 'this' is the script element
            var context = _includeContexts[this.id];
            // TODO: implement a verbose mode
            if (!context.done) {
                // TODO: provide error reason
                context.done = true;
                gpf.events.fire("error", {url: context.src},
                    context.eventsHandler);
                _detachInclude(context);
            }
        };

    gpf.http = {

        /**
         * Loads dynamically any script
         * Waits for the script to be loaded and calls a eventsHandler when done
         * The following is an easy way to handle eventsHandlers whenever the
         * process is asychronous (window.setTimeout, onload eventsHandler).
         * The function returns an object that can be overriden with our own
         * loaded handler (if needed)
         * 
         * @param {String} src
         * @param {Object/function} [eventsHandler=new gpf.events.Broadcaster]
         *        eventsHandler
         * @return {Object/function} the provided eventsHandler
         *          
         * @eventParam {string} url URL of the included resource
         * 
         * @event load The resource has been successfully loaded
         * 
         * @event error An error occured when loading the resource
         * 
         * Inspired from http://stackoverflow.com/questions/4845762/
         * 
         */
        include: function (src, eventsHandler) {
            var
                context = {
                    src: src,
                    id: "__gpf_http_" + (++_id),
                    headTag: document.getElementsByTagName("head")[0]
                        || document.documentElement,
                    scriptTag: document.createElement("script"),
                    done: false
                },
                scriptTag;
            // Handler
            if (undefined === eventsHandler) {
                eventsHandler = new gpf.events.Broadcaster(["load", "error"]);
            }
            context.eventsHandler = eventsHandler;
            // Declare global context
            _includeContexts[context.id] = context;
            // Configure script tag
            scriptTag = context.scriptTag;
            scriptTag.language = "javascript";
            scriptTag.src = src;
            scriptTag.id = context.id;
            // Attach handlers for all browsers
            scriptTag.onload = scriptTag.onreadystatechange = _includeOnLoad;
            scriptTag.onerror = _includeOnError;
            if (undefined !== scriptTag.async) {
                scriptTag.async = true;
            }
            /*
             * Use insertBefore instead of appendChild  to avoid an IE6 bug.
             * This arises when a base node is used (#2709 and #4378).
             * Also found a bug in IE10 that loads & triggers immediately
             * script, use timeout
             */
            setTimeout(function () {
                context.headTag.insertBefore(scriptTag,
                    context.headTag.firstChild);
            }, 0);
            return eventsHandler;
        }

    };

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/
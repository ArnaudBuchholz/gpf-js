/*global define, exports*/
/*jshint maxlen:false*/
(function (root, factory) {
    "use strict";
    /**
     * Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
     * Rhino, and plain browser loading.
     *
     * 2014-12-04 ABZ Extended for PhantomJS
     */
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else if (typeof module !== "undefined" && module.exports) {
        factory(module.exports);
    } else {
        factory(root.gpf = {});
    }
}(this, function (gpf) {
    "use strict";
    var
        /**
     * GPF version
     *
     * @type {string}
     * @private
     */
        _gpfVersion = "0.1",
        /**
     * Host type
     *
     * - wscript: Microsoft cscript / wscript
     * - phantomjs: PhantomJS
     * - nodejs: NodeJS
     * - browser: Browser
     * - unknown: Unknown
     *
     * @type {String}
     * @private
     */
        _gpfHost,
        /**
     * Indicates that paths are DOS-like (i.e. case insensitive with /)
     *
     * @type {Boolean}
     * @private
     */
        _gpfDosPath = false,
        /**
     * Main context object
     *
     * @type {Object}
     * @private
     */
        _gpfContext,
        /**
     * Exit function
     *
     * @param {Number} code
     * @private
     */
        _gpfExit,
        /*exported _gpfResolveScope*/
        /**
     * Translate the parameter into a valid scope
     *
     * @param {*} scope
     * @private
     */
        _gpfResolveScope = function (scope) {
            if (null === scope    // || undefined === scope
|| "object" !== typeof scope) {
                return _gpfContext;
            }
            return scope;
        },
        /**
     * The current host is a nodeJS like
     *
     * @type {Boolean}
     * @private
     */
        _gpfInNode = false,
        /**
     * The current host is a browser like
     *
     * @type {boolean}
     * @private
     */
        _gpfInBrowser = false,
        /**
     * Browser window object
     *
     * @type {Object}
     * @private
     */
        _gpfWebWindow,
        /**
     * Browser document object
     *
     * @type {Object}
     * @private
     */
        _gpfWebDocument,
        /**
     * Browser head tag
     *
     * @type {Object}
     * @private
     */
        _gpfWebHead,
        /**
     * Scripting.FileSystemObject activeX
     *
     * @type {Object}
     * @private
     */
        _gpfMsFSO,
        /**
     * Node FS module
     *
     * @type {Object}
     * @private
     */
        _gpfNodeFS,
        /**
     * An empty function
     *
     * @private
     */
        _gpfEmptyFunc = function () {
        };
    _gpfVersion += "d";
    // Microsoft cscript / wscript
    if ("undefined" !== typeof WScript) {
        _gpfHost = "wscript";
        _gpfDosPath = true;
        _gpfContext = function () {
            return this;
        }.apply(null, []);
        _gpfExit = function (code) {
            WScript.Quit(code);
        };
        // Define console APIs
        _gpfContext.console = {
            log: function (t) {
                WScript.Echo("    " + t);
            },
            info: function (t) {
                WScript.Echo("[?] " + t);
            },
            warn: function (t) {
                WScript.Echo("/!\\ " + t);
            },
            error: function (t) {
                WScript.Echo("(X) " + t);
            }
        };    // PhantomJS
              /*global phantom:true*/
    } else if ("undefined" !== typeof phantom && phantom.version) {
        _gpfHost = "phantomjs";
        _gpfDosPath = require("fs").separator === "\\";
        _gpfContext = window;
        _gpfInNode = true;
        _gpfInBrowser = true;
        _gpfExit = phantom.exit;    // Nodejs
                                    /*global module:true*/
    } else if ("undefined" !== typeof module && module.exports) {
        _gpfHost = "nodejs";
        _gpfDosPath = require("path").sep === "\\";
        _gpfContext = global;
        _gpfInNode = true;
        _gpfExit = process.exit;    // Browser
    } else if ("undefined" !== typeof window) {
        _gpfHost = "browser";
        _gpfContext = window;
        _gpfInBrowser = true;
        _gpfExit = _gpfEmptyFunc;    // Default: unknown
                                     /*jshint -W040*/
    } else {
        _gpfHost = "unknown";
        _gpfContext = this;
        _gpfExit = _gpfEmptyFunc;
    }
    /*jshint +W040*/
    // Install host specifics (if any)
    if (_gpfInNode) {
        gpf.node = {};
    }
    // Some web-related tools will be configured even if not in a browser
    gpf.web = {};
    if (_gpfInBrowser) {
        _gpfWebWindow = window;
        _gpfWebDocument = document;
        _gpfWebHead = _gpfWebDocument.getElementsByTagName("head")[0] || _gpfWebDocument.documentElement;
    }
    /**
 * Returns the current version
 *
 * @return {string}
 */
    gpf.version = function () {
        return _gpfVersion;
    };
    /**
 * Returns a string identifying the detected host
 *
 * @return {String}
 * <ul>
 *      <li>"wscript" for cscript and wscript
 *      <li>"nodejs" for nodejs
 *      <li>"phantomjs" for phantomjs
 *      <li>"browser" for any browser
 *      <li>"unknown" if not detected
 * </ul>
 */
    gpf.host = function () {
        return _gpfHost;
    };
    /**
 * Get parent member named name. If missing and the constructor is specified,
 * it is allocated.
 *
 * @param {Object} parent
 * @param {String} name
 * @param {Boolean} createMissingParts
 * @return {Object|undefined}
 * @private
 */
    function _getOrCreateChild(parent, name, createMissingParts) {
        var result = parent[name];
        if (undefined === result && createMissingParts) {
            result = parent[name] = {};
        }
        return result;
    }
    /**
 * Resolve the provided evaluation path and returns the result
 *
 * @param {String|string[]} [path=undefined] path Dot separated list of
 * identifiers (or identifier array)
 * @param {Boolean} [createMissingParts=false] createMissingParts if the path
 * leads to undefined parts and createMissingParts is true, it allocates it
 *
 * @return {*|undefined}
 * - when path is empty, it returns the current host higher object
 * - when path is "gpf" it returns the GPF object
 */
    gpf.context = function (path, createMissingParts) {
        var len, idx, result;
        if (undefined === path) {
            return _gpfContext;
        } else {
            if ("string" === typeof path) {
                path = path.split(".");
            }
            len = path.length;
            idx = 0;
            if (path[0] === "gpf") {
                result = gpf;
                ++idx;
            } else {
                result = _gpfContext;
            }
            for (; result && idx < len; ++idx) {
                result = _getOrCreateChild(result, path[idx], true === createMissingParts);
            }
            return result;
        }
    };
    gpf.loaded = function (callback) {
        if (callback) {
            callback();
        }
        return true;
    };
    /*
 * Handling external options
 * TODO: provide ways to turn on/off features by adding options
 */
    // DEBUG specifics
    /**
 * Assertion helper
 *
 * @param {Boolean} condition May be a truthy value
 * @param {String} message Assertion message (to explain the violation if it
 * fails)
 */
    gpf.ASSERT = function (condition, message) {
        if (undefined === message) {
            message = "gpf.ASSERT with no message";
            condition = false;
        }
        if (!condition) {
            console.warn("ASSERTION FAILED: " + message);
            throw gpf.Error.AssertionFailed({ message: message });
        }
    };
    if (!gpf.ASSERT) {
    }
    var
    /**
     * Shortcut on Array.prototype.slice
     *
     * @type {Function}
     * @private
     */
    _gpfArraySlice = Array.prototype.slice;
    if (undefined === Array.prototype.every) {
        // Introduced with JavaScript 1.6
        Array.prototype.every = function (callback, thisArg) {
            var len = this.length, idx;
            for (idx = 0; idx < len; ++idx) {
                if (!callback.apply(thisArg, [
                        this[idx],
                        idx,
                        this
                    ])) {
                    return false;
                }
            }
            return true;
        };
    }
    if (undefined === Array.prototype.forEach) {
        // Introduced with JavaScript 1.6
        Array.prototype.forEach = function (callback, thisArg) {
            var len = this.length, idx;
            for (idx = 0; idx < len; ++idx) {
                callback.apply(thisArg, [
                    this[idx],
                    idx,
                    this
                ]);
            }
        };
    }
    if (undefined === Array.prototype.indexOf) {
        // Introduced with JavaScript 1.5
        Array.prototype.indexOf = function (searchElement, fromIndex) {
            var idx, len = this.length;
            if (undefined !== fromIndex) {
                idx = fromIndex;
            } else {
                idx = 0;
            }
            while (idx < len) {
                if (this[idx] === searchElement) {
                    return idx;
                }
                ++idx;
            }
            return -1;
        };
    }
    if (undefined === Array.prototype.map) {
        // Introduced with JavaScript 1.6
        Array.prototype.map = function (callback, thisArg) {
            var len = this.length, result = new Array(len), idx;
            for (idx = 0; idx < len; ++idx) {
                result[idx] = callback.apply(thisArg, [
                    this[idx],
                    idx,
                    this
                ]);
            }
            return result;
        };
    }
    if (undefined === Function.prototype.bind) {
        // Introduced with JavaScript 1.8.5
        Function.prototype.bind = function (thisArg) {
            var thisFn = this, prependArgs = _gpfArraySlice.apply(arguments, [1]);
            return function () {
                var args = _gpfArraySlice.apply(arguments, [0]);
                thisFn.apply(thisArg, prependArgs.concat(args));
            };
        };
    }
    // Handling function name properly
    if (function () {
            function functionName() {
            }
            if (functionName.name !== "functionName") {
                return true;
            } else {
                return false;
            }
        }()) {
        (function () {
            var comments = new RegExp("//.*$|/\\*.*\\*/", "g");
            Function.prototype.compatibleName = function () {
                // Use simple parsing as a first step
                // TODO leverage JS parser to implement this properly
                var src = "" + this, pos = src.indexOf("function"), paramList = src.indexOf("(", pos);
                return src.substr(pos + 9, paramList - pos - 9).replace(comments, "")    // remove comments
.trim();
            };
        }());
    } else {
        /**
     * Return function name
     *
     * @return {String}
     */
        Function.prototype.compatibleName = function () {
            return this.name;
        };
    }
    if (undefined === Object.defineProperty) {
        /**
     * If possible, defines a read-only property
     *
     * @param {Object} obj
     * @param {String} name
     * @param {*} value
     * @return {Object}
     * @chainable
     */
        gpf.setReadOnlyProperty = function (obj, name, value) {
            obj[name] = value;
            return obj;
        };
    } else {
        gpf.setReadOnlyProperty = function (obj, name, value) {
            Object.defineProperty(obj, name, {
                enumerable: true,
                configurable: false,
                writable: false,
                value: value
            });
            return obj;
        };
    }
    if (undefined === String.prototype.trim) {
        // Introduced with JavaScript 1.8.1
        (function () {
            var rtrim = new RegExp("^[\\s\uFEFF\xA0]+|[\\s\uFEFF\xA0]+$", "g");
            String.prototype.trim = function () {
                return this.replace(rtrim, "");
            };
        }());
    }
    var
        //region Events
        _GPF_EVENT_ERROR = "error", _GPF_EVENT_READY = "ready", _GPF_EVENT_DATA = "data", _GPF_EVENT_END_OF_DATA = "endOfData", _GPF_EVENT_CONTINUE = "continue", _GPF_EVENT_STOP = "stop", _GPF_EVENT_STOPPED = "stopped",
        //endregion
        /**
     * @inheritdoc gpf#setReadOnlyProperty
     */
        _gpfSetReadOnlyProperty = gpf.setReadOnlyProperty,
        // https://github.com/jshint/jshint/issues/525
        _GpfFunc = Function,
        // avoid JSHint error
        /**
     * Helper to ignore unused parameter
     *
     * @param {*} param
     * @private
     */
        _gpfIgnore = _gpfEmptyFunc,
        /**
     * An empty function returning false
     *
     * @result {Boolean} False
     * @private
     */
        _gpfFalseFunc = function () {
            return false;
        },
        /**
     * Create a new function using the source
     * In DEBUG mode, it catches any error to signal the problem
     *
     * @param {String[]} [params=undefined] params Parameter names list
     * @param {String} source
     * @return {Function}
     * @private
     */
        _gpfFunc = function (params, source) {
            var args;
            if (undefined === source) {
                source = params;
                params = [];
            }
            gpf.ASSERT("string" === typeof source && source.length, "Source expected (or use _gpfEmptyFunc)");
            try {
                if (0 === params.length) {
                    return _GpfFunc(source);
                } else {
                    args = [].concat(params);
                    args.push(source);
                    return _GpfFunc.apply(null, args);
                }
            } catch (e) {
                console.error("An exception occurred compiling:\r\n" + source);
                return null;
            }
        },
        /**
     * Letters (lowercase)
     *
     * @type {String}
     * @private
     */
        _gpfAlpha = "abcdefghijklmnopqrstuvwxyz",
        /**
     * Letters (uppercase)
     *
     * @type {String}
     * @private
     */
        _gpfALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        /**
     * Digits
     *
     * @type {String}
     * @private
     */
        _gpfDigit = "0123456789",
        /**
     * List of allowed first char in an identifier
     *
     * @type {String}
     * @private
     */
        _gpfIdentifierFirstChar = _gpfAlpha + _gpfALPHA + "_$",
        /**
     * List of allowed other chars in an identifier
     *
     * @type {String}
     * @private
     */
        _gpfIdentifierOtherChars = _gpfAlpha + _gpfALPHA + _gpfDigit + "_$",
        /**
     * List of JavaScript keywords
     *
     * @type {String[]}
     * @private
     */
        _gpfJsKeywords = ("break,case,catch,continue,debugger,default,delete,do," + "else,finally,for,function,if,in,instanceof,new,return,switch," + "this,throw,try,typeof,var,void,while,with").split(",");
    gpf.events = {};
    // Create events constants
    (function () {
        var gpfEvents = gpf.events, mappings = {
                EVENT_ERROR: _GPF_EVENT_ERROR,
                EVENT_READY: _GPF_EVENT_READY,
                EVENT_DATA: _GPF_EVENT_DATA,
                EVENT_END_OF_DATA: _GPF_EVENT_END_OF_DATA,
                EVENT_CONTINUE: _GPF_EVENT_CONTINUE,
                EVENT_STOP: _GPF_EVENT_STOP,
                EVENT_STOPPED: _GPF_EVENT_STOPPED
            }, key;
        for (key in mappings) {
            if (mappings.hasOwnProperty(key)) {
                _gpfSetReadOnlyProperty(gpfEvents, key, mappings[key]);
            }
        }
    }());
    var
        /**
     * GPF Event class
     * Simple implementation: type is a read-only member
     *
     * @param {String} type
     * @param {Object} [params={}] params
     * @param {Boolean} [cancelable=false] cancelable
     * @param {Object} [scope=undefined] scope
     * @constructor
     * @class _GpfEvent
     * @alias gpf.events.Event
     */
        _GpfEvent = gpf.events.Event = function (type, params, scope) {
            gpf.setReadOnlyProperty(this, "type", type);
            gpf.setReadOnlyProperty(this, "scope", _gpfResolveScope(scope));
            if (undefined !== params) {
                this._params = params;
            }
        },
        /**
     * Count the number of gpf.events.fire calls
     *
     * @type {number}
     * @private
     */
        _gpfEventsFiring = 0,
        /**
     * Fire the event by calling the eventsHandler
     *
     * @param {gpf.events.Event} event event object to fire
     * @param {gpf.events.Handler} eventsHandler
     */
        _gpfEventsFireCall = function (event, eventsHandler) {
            var scope = event.scope, eventHandler;
            gpf.ASSERT(eventsHandler, "Expected eventsHandler");
            if ("function" === typeof eventsHandler._dispatchEvent) {
                // Event dispatcher expected interface
                eventsHandler._dispatchEvent(event);
            } else if ("function" === typeof eventsHandler.apply) {
                // Basic Function handler or gpf.Callback
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
        },
        /**
     * gpf.events.fire implementation
     *
     * @param {String/gpf.events.Event} event string or event object to fire
     * @param {Object} [params={}] params parameter of the event
     *                 (when type is a string)
     * @param {gpf.events.Handler} eventsHandler
     * @return {gpf.events.Event} the event object
     */
        _gpfEventsFire = function (event, params, eventsHandler) {
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
                gpf.defer(_gpfEventsFireCall, 0, null, [
                    event,
                    eventsHandler
                ]);
            } else {
                _gpfEventsFireCall(event, eventsHandler);
            }
            --_gpfEventsFiring;
            return event;
        },
        /**
     * Check parameters array and re-assign default values considering that:
     * the eventsHandler parameter is *always* the last one provided
     * all other parameters are optional and can be defaulted provided the
     * defaultArgs array
     *
     * @param {arguments} thatArgs Function arguments
     * @param {Array} defaultArgs List of default values for all expected
     * arguments *but* the eventsHandler
     * @param {Array} defaultArgs List of default values for all expected
     * arguments *but* the eventsHandler
     * @param {Function} callback
     * @return {*} the return of the callback
     * @forwardThis
     * @private
     */
        _gpfLookForEventsHandler = function (thatArgs, defaultArgs, callback) {
            var lastExpectedIdx = defaultArgs.length,
                // eventsHandler not included
                argIdx = thatArgs.length - 1;
            if (argIdx !== lastExpectedIdx) {
                // Need to transform the arguments
                thatArgs = _gpfArraySlice.apply(thatArgs, [0]);
                // The last argument is *always* the eventsHandler
                thatArgs[lastExpectedIdx] = thatArgs[argIdx];
                // Then apply missing defaults
                --argIdx;
                --lastExpectedIdx;
                while (lastExpectedIdx > argIdx) {
                    thatArgs[lastExpectedIdx] = defaultArgs[lastExpectedIdx];
                    --lastExpectedIdx;
                }
            }
            return callback.apply(this, thatArgs);
        };
    // _GpfEvent interface
    _GpfEvent.prototype = {
        constructor: _GpfEvent,
        /**
     * Event type
     *
     * @type {String}
     * @read-only
     */
        type: "",
        /**
     * Event scope
     *
     * @return {Object}
     * @read-only
     */
        scope: null,
        /**
     * Event parameters
     *
     * @type {Object} Map of key to value
     * @private
     */
        _params: {},
        /**
     * Get any additional event information
     *
     * @param {String} name parameter name
     * @return {*} value of parameter
     */
        get: function (name) {
            return this._params[name];
        },
        /**
     * Fire the event on the provided eventsHandler
     *
     * @param {gpf.events.Broadcaster/gpf.Callback/Function} eventsHandler
     * @return {gpf.events.Event} this
     */
        fire: function (eventsHandler) {
            return gpf.events.fire(this, eventsHandler);
        }
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
 * @return {gpf.events.Event} the event object
 */
    gpf.events.fire = function () {
        var scope = this;
        if (scope === gpf.events) {
            // Will be adjusted inside _gpfEventsFire
            scope = undefined;
        }
        return _gpfLookForEventsHandler.apply(scope, [
            arguments,
            [
                0,
                {}
            ],
            _gpfEventsFire
        ]);
    };
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
            this.eventsHandler = eventsHandler;
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
            var context = new _GpfIncludeContext(src, eventsHandler), domScript = _gpfWebDocument.createElement("script");
            // Configure script tag
            domScript.language = "javascript";
            domScript.src = src;
            domScript.id = context.id;
            // Attach handlers for all browsers
            domScript.onload = domScript.onreadystatechange = _GpfIncludeContext.onLoad;
            domScript.onerror = _GpfIncludeContext.onError;
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
            domScript.onerror = domScript.onload = domScript.onreadystatechange = null;
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
            if (!readyState || -1 < [
                    "loaded",
                    "complete"
                ].indexOf(readyState)) {
                this.clean(domScript);
                // IE10: the event is triggered *before* the source is evaluated
                setTimeout(_gpfWebIncludeAsyncResult, 0, [
                    _GPF_EVENT_READY,
                    { url: this.src },
                    this.eventsHandler
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
                _GPF_EVENT_ERROR,
                { url: this.src },
                this.eventsHandler
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
    var
        /**
     * gpf.each implementation on array
     *
     * @param {Array} array
     * @param {Function} memberCallback
     * @param {*} defaultResult
     * @private
     */
        _gpfArrayEachWithResult = function (array, memberCallback, defaultResult) {
            var result, len = array.length, idx;
            for (idx = 0; idx < len; ++idx) {
                result = memberCallback.apply(this, [
                    idx,
                    array[idx],
                    len
                ]);
                if (undefined !== result) {
                    return result;
                }
            }
            return defaultResult;
        },
        /**
     * gpf.each implementation on array without default result
     *
     * @param {Array} array
     * @param {Function} memberCallback
     * @private
     */
        _gpfArrayEach = function (array, memberCallback) {
            var len = array.length, idx;
            for (idx = 0; idx < len; ++idx) {
                memberCallback.apply(this, [
                    idx,
                    array[idx],
                    len
                ]);
            }
        },
        /**
    * Provides a common way to code functions that returns either an array
    * of results or a given item inside the array using an optional index
    * parameter (such as for IXmlConstNode:children)
    *
    * @param {[]} array Array to grab items from
    * @param {Number} [idx=undefined] idx Index of the item to get.
    *        When not specified, a copy of the array is returned (to avoid
    *        source modifications). When specified:
    *        if -1, returns the last element of the array or undefined
    *        if positive, returns the Nth element of the array or undefined
    *        otherwise, returns undefined
    * @return {*}
    */
        _gpfArrayOrItem = function (array, idx) {
            if (undefined === idx) {
                // To avoid result modifications altering source, clone
                // TODO may not work with IE < 9
                return Array.prototype.slice.call(array, 0);
            } else if (0 === array.length) {
                return undefined;
            } else if (-1 === idx) {
                return array[array.length - 1];
            } else if (idx < -1 || idx > array.length - 1) {
                return undefined;
            } else {
                return array[idx];
            }
        },
        /**
     * gpf.each implementation on object
     *
     * @param {Object} dictionary
     * @param {Function} memberCallback
     * @param {*} defaultResult
     * @private
     */
        _gpfDictionaryEachWithResult = function (dictionary, memberCallback, defaultResult) {
            var result, member;
            for (member in dictionary) {
                if (dictionary.hasOwnProperty(member)) {
                    result = memberCallback.apply(this, [
                        member,
                        dictionary[member]
                    ]);
                    if (undefined !== result) {
                        return result;
                    }
                }
            }
            return defaultResult;
        },
        /**
     * gpf.each implementation on object without default result
     *
     * @param {Object} dictionary
     * @param {Function} memberCallback
     * @private
     */
        _gpfDictionaryEach = function (dictionary, memberCallback) {
            var member;
            for (member in dictionary) {
                if (dictionary.hasOwnProperty(member)) {
                    memberCallback.apply(this, [
                        member,
                        dictionary[member]
                    ]);
                }
            }
        },
        /**
     * gpf.extend implementation of assign without any callback
     *
     * @param {String} member
     * @param {*} value
     * @private
     */
        _gpfAssign = function (member, value) {
            // this = gpf.extend's arguments
            // this[0] is dictionary
            this[0][member] = value;
        },
        /**
     * gpf.extend implementation of assign with a  callback
     *
     * @param {String} member
     * @param {*} value
     * @private
     */
        _gpfAssignOrCall = function (member, value) {
            // this = gpf.extend's arguments
            var dictionary = this[0], overwriteCallback = this[2];
            // TODO: see if in is faster
            if (undefined !== dictionary[member]) {
                overwriteCallback(dictionary, member, value);
            } else {
                dictionary[member] = value;
            }
        },
        /**
     * gpf.value handlers per type
     *
     * @type {Object}
     * @private
     */
        _gpfValues = {
            boolean: function (value, valueType, defaultValue) {
                if ("string" === valueType) {
                    if ("yes" === value || "true" === value) {
                        return true;
                    }
                    return 0 !== parseInt(value, 10);
                }
                if ("number" === valueType) {
                    return 0 !== value;
                }
                return defaultValue;
            },
            number: function (value, valueType, defaultValue) {
                if ("string" === valueType) {
                    return parseFloat(value);
                }
                return defaultValue;
            },
            string: function (value, valueType, defaultValue) {
                gpf.interfaces.ignoreParameter(valueType);
                gpf.interfaces.ignoreParameter(defaultValue);
                if (value instanceof Date) {
                    return gpf.dateToComparableFormat(value);
                }
                return value.toString();
            },
            object: function (value, valueType, defaultValue) {
                if (defaultValue instanceof Date && "string" === valueType) {
                    return gpf.dateFromComparableFormat(value);
                }
                return defaultValue;
            }
        },
        /**
     * Capitalize the string
     *
     * @param that
     * @return {String}
     * @private
     */
        _gpfStringCapitalize = function (that) {
            return that.charAt(0).toUpperCase() + that.substr(1);
        },
        /**
     * String replacement using dictionary map
     *
     * @param {String} that
     * @param {Object} replacements map of strings to search and replace
     * @return {String}
     */
        _gpfStringReplaceEx = function (that, replacements) {
            var result = that, key;
            for (key in replacements) {
                if (replacements.hasOwnProperty(key)) {
                    if (-1 < result.indexOf(key)) {
                        result = result.split(key).join(replacements[key]);
                    }
                }
            }
            return result;
        },
        /**
     * @type {Object} Dictionary of language to escapes
     * @private
     */
        _gpfStringEscapes = {
            javascript: {
                "\\": "\\\\",
                "\"": "\\\"",
                "\n": "\\n",
                "\r": "\\r",
                "\t": "\\t"
            },
            xml: {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;"
            },
            html: {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\xE9": "&eacute;",
                "\xE8": "&egrave;",
                "\xEA": "&ecirc;",
                "\xE1": "&aacute;",
                "\xE0": "&agrave;"
            }
        },
        /**
     * Make the string content compatible with lang
     *
     * @param {String} that
     * @param {String} language
     * @return {String}
     */
        _gpfStringEscapeFor = function (that, language) {
            var replacements = _gpfStringEscapes[language];
            if (undefined !== replacements) {
                that = _gpfStringReplaceEx(that, replacements);
                if ("javascript" === language) {
                    that = "\"" + that + "\"";
                }
            }
            return that;
        },
        /*exported _gpfIsArrayLike*/
        /**
     * Return true if the parameter looks like an array
     *
     * @param {Object} obj
     * @return {Boolean} True if array-like
     */
        _gpfIsArrayLike;
    if ("browser" === _gpfHost && (window.HTMLCollection || window.NodeList)) {
        _gpfIsArrayLike = function (obj) {
            return obj instanceof Array || obj instanceof window.HTMLCollection || obj instanceof window.NodeList;
        };
    } else {
        _gpfIsArrayLike = function (obj) {
            return obj instanceof Array;
        };
    }
    /**
 * Return true if the provided parameter looks like an array (i.e. it has
 * a property length and each item can be accessed with [])
 *
 * @param {Object} obj
 * @return {Boolean} True if array-like
 */
    gpf.isArrayLike = _gpfIsArrayLike;
    /*jshint unused: false */
    // Because of arguments
    /*
 * Enumerate dictionary members and call memberCallback for each of them.
 * If defaultResult is defined, memberCallback may return a result.
 * If memberCallback returns anything, the function stops and returns it.
 * Otherwise, the defaultResult is returned.
 * When defaultResult is not defined, memberCallback result is ignored.
 *
 * @param {Object|Array} dictionary
 * @param {Function} memberCallback
 * @param {Function} memberCallback will receive parameters
 * - {Number|String} index array index or member name
 * - {*} value
 * - {Number} length total array length (undefined for dictionary)
 *
 * @param {*} [defaultResult=undefined] defaultResult
 * @return {*}
 * @chainable
 * @forwardThis
 */
    gpf.each = function (dictionary, memberCallback, defaultResult) {
        if (3 > arguments.length) {
            if (gpf.isArrayLike(dictionary)) {
                _gpfArrayEach.apply(this, arguments);
            } else {
                _gpfDictionaryEach.apply(this, arguments);
            }
            return;
        }
        if (gpf.isArrayLike(dictionary)) {
            return _gpfArrayEachWithResult.apply(this, arguments);
        }
        return _gpfDictionaryEachWithResult.apply(this, arguments);
    };
    /*jshint unused: true */
    /*
 * Appends members of additionalProperties to the dictionary object.
 * If a conflict has to be handled (i.e. member exists on both objects),
 * the overwriteCallback has to handle it.
 *
 * @param {Object} dictionary
 * @param {Object} additionalProperties
 * @param {Function} overwriteCallback
 * @return {Object} the modified dictionary
 * @chainable
 */
    gpf.extend = function (dictionary, additionalProperties, overwriteCallback) {
        var callbackToUse;
        if (undefined === overwriteCallback) {
            callbackToUse = _gpfAssign;
        } else {
            gpf.ASSERT("function" === typeof overwriteCallback, "Expected function");
            callbackToUse = _gpfAssignOrCall;
        }
        _gpfDictionaryEach.apply(arguments, [
            additionalProperties,
            callbackToUse
        ]);
        return dictionary;
    };
    gpf.extend(gpf, {
        /*
     * Converts the provided value to match the expectedType.
     * If not specified or impossible to do so, defaultValue is returned.
     * When expectedType is not provided, it is deduced from defaultValue.
     *
     * @param {*} value
     * @param {*} default value
     * @param {String} [expectedType=typeof defaultValue] expected type
     * @return {*}
     */
        value: function (value, defaultValue, expectedType) {
            var valueType = typeof value;
            if (!expectedType) {
                expectedType = typeof defaultValue;
            }
            if (expectedType === valueType) {
                return value;
            }
            if ("undefined" === valueType || !value) {
                return defaultValue;
            }
            return _gpfValues[expectedType](value, valueType, defaultValue);
        },
        /**
     * Shallow copy an object
     *
     * @param {Object} obj
     * @return {Object}
     */
        clone: function (obj) {
            /*
         * http://stackoverflow.com/questions/122102/what-is-the-most-
         * efficient-way-to-clone-an-object/5344074#5344074
         */
            return gpf.json.parse(gpf.json.stringify(obj));
        },
        /*
     * Find the first member of dictionary which value equals to value.
     *
     * @param {Object/array} dictionary
     * @param {*} value
     * @return {String/number/undefined} undefined if not found
     */
        test: function (dictionary, value) {
            var idx;
            if (dictionary instanceof Array) {
                idx = dictionary.length;
                while (idx > 0) {
                    if (dictionary[--idx] === value) {
                        return idx;
                    }
                }
            } else {
                for (idx in dictionary) {
                    if (dictionary.hasOwnProperty(idx) && dictionary[idx] === value) {
                        return idx;
                    }
                }
            }
            return undefined;
        },
        /*
     * Inserts the value in the array if not already present.
     *
     * @param {Array} array
     * @param {*} value
     * @return {Array}
     * @chainable
     */
        set: function (array, value) {
            gpf.ASSERT(array instanceof Array, "gpf.set must be used with an Array");
            var idx = array.length;
            while (idx > 0) {
                if (array[--idx] === value) {
                    return array;    // Already set
                }
            }
            array.push(value);
            return array;
        },
        /*
     * Removes the member of 'dictionary' which value equals 'value'.
     * NOTE: that the object is modified.
     *
     * @param {Object/array} dictionary
     * @param {*} value
     * @return {Object/array} dictionary
     * @chainable
     */
        clear: function (dictionary, value) {
            var idx;
            if (dictionary instanceof Array) {
                idx = dictionary.length;
                while (idx > 0) {
                    if (dictionary[--idx] === value) {
                        dictionary.splice(idx, 1);
                        break;
                    }
                }
            } else {
                for (idx in dictionary) {
                    if (dictionary.hasOwnProperty(idx) && dictionary[idx] === value) {
                        break;
                    }
                }
            }
            return dictionary;
        },
        /**
     * XOR
     *
     * @param {Boolean} a
     * @param {Boolean} b
     */
        xor: function (a, b) {
            return a && !b || !a && b;
        },
        /**
     * Exit function
     *
     * @paran {Number} [exitCode=0] exitCode
     */
        exit: function (exitCode) {
            if (undefined === exitCode) {
                exitCode = 0;
            }
            _gpfExit(exitCode);
        }
    });
    //region NodeJS helpers
    if (_gpfInNode) {
        /**
     * Converts a NodeJS buffer into a native array containing unsigned
     * bytes
     *
     * @param {Buffer} buffer
     * @return {Number[]}
     */
        gpf.node.buffer2JsArray = function (buffer) {
            var result = [], len = buffer.length, idx;
            for (idx = 0; idx < len; ++idx) {
                result.push(buffer.readUInt8(idx));
            }
            return result;
        };
    }    //endregion
    var
    /**
     * Object representing the context of a like operation.
     * It remembers what objects must be compared and the ones that are already
     * matching.
     *
     * @param {Boolean} [alike=false] alike Allow to be tolerant on primitive
     * types compared with their object equivalent. If alike, the objects may
     * not have the same class.
     *
     *
     * @class _GpfLikeContext
     * @constructor
     * @private
     */
    _GpfLikeContext = function (alike) {
        this._pending = [];
        this._done = [];
        // Override for this instance only
        if (true !== alike) {
            this._alike = _gpfFalseFunc;
        } else {
            this._haveDifferentPrototypes = _gpfFalseFunc;
        }
    };
    _GpfLikeContext.prototype = {
        /**
     * Array of objects to be compared (filled by pairs)
     *
     * type {Object[]}
     * @private
     */
        _pending: [],
        /**
     * Array of objects already compared (filled by pairs)
     *
     * type {Object[]}
     * @private
     */
        _done: [],
        /**
     * If a was never compared with b, adds the pair to the pending list.
     *
     * @param {Object} a
     * @param {Object} b
     * @private
     */
        _stack: function (a, b) {
            var array = this._done, indexOfA, comparedWith;
            indexOfA = array.indexOf(a);
            while (-1 < indexOfA) {
                if (indexOfA % 2) {
                    comparedWith = array[indexOfA - 1];
                } else {
                    comparedWith = array[indexOfA + 1];
                }
                if (comparedWith === b) {
                    return;    // Already compared
                }
                indexOfA = array.indexOf(a, indexOfA + 1);
            }
            // Adds to the pending list
            array = this._pending;
            array.push(a);
            array.push(b);
        },
        /**
     * Check if the objects have different prototypes
     *
     * @param {Object} a
     * @param {Object} b
     * @return {boolean}
     * @private
     */
        _haveDifferentPrototypes: function (a, b) {
            return a.prototype !== b.prototype;
        },
        /**
     * Process the pending list
     *
     * @return {boolean}
     */
        explore: function () {
            var pending = this._pending, a, b, done = this._done, membersCount, member;
            while (0 !== pending.length) {
                b = pending.pop();
                a = pending.pop();
                // Are the object sharing the same prototype?
                if (this._haveDifferentPrototypes(a, b)) {
                    return false;
                }
                done.push(a, b);
                membersCount = 0;
                // a members
                for (member in a) {
                    if (a.hasOwnProperty(member)) {
                        ++membersCount;
                        if (!this.like(a, b)) {
                            return false;
                        }
                    }
                }
                // b members
                for (member in b) {
                    if (b.hasOwnProperty(member)) {
                        --membersCount;
                    }
                }
                // Difference on members count?
                if (0 !== membersCount) {
                    return false;
                }
            }
            return true;
        },
        /**
     * Downcast a value to its scalar equivalent (if possible)
     *
     * @param {*} a
     * @return {*}
     */
        _downcast: function (a) {
            if ("object" === typeof a) {
                if (a instanceof String) {
                    return a.toString();
                }
                if (a instanceof Number) {
                    return a.valueOf();
                }
                if (a instanceof Boolean) {
                    return !!a;
                }
            }
            return a;
        },
        /**
     * gpf.like comparison of values knowing they have different types.
     * DOWNCAST the values to their scalar equivalent (if any)
     *
     * @param {*} a
     * @param {*} b
     * @return {boolean}
     * @private
     */
        _alike: function (a, b) {
            return this._downcast(a) === this._downcast(b);
        },
        /**
     * Internal version of gpf.like
     *
     * @param {*} a
     * @param {*} b
     * @return {boolean}
     */
        like: function (a, b) {
            if (a === b) {
                return true;
            }
            if (typeof a !== typeof b) {
                return this._alike(a, b);
            }
            if (null === a || null === b || "object" !== typeof a) {
                return false;    // Because we know that a !== b
            }
            this._stack(a, b);
            return true;
        }
    };
    /*
 * Compares a and b and return true if they are look-alike (all members
 * have the same type and same value).
 *
 * NOTES:
 * 2013-04-14
 * Generates too much recursion, changed the algorithm to avoid
 * recursion using document.body (and any kind of object that references
 * other objects) I found that it was necessary to keep track of already
 * processed objects.
 *
 * 2015-02-26
 * Rewrote to be easier to maintain (and easier to understand).
 *
 * @param {*} a
 * @param {*} b
 * @param {Boolean} [alike=false] alike Allow to be tolerant on primitive types
 * compared with their object equivalent
 * @return {Boolean}
 */
    gpf.like = function (a, b, alike) {
        var context = new _GpfLikeContext(alike);
        return context.like(a, b) && context.explore();
    };
    var
        /**
     * @inheritdoc gpf.Callback:buildParamArray
     * @private
     */
        _gpfBuildParamArray = function (count, params) {
            var len, result, idx;
            if (params) {
                len = params.length;
                result = new Array(count + len);
                for (idx = 0; idx < len; ++idx) {
                    result[count] = params[idx];
                    ++count;
                }
            } else {
                result = new Array(count);
            }
            return result;
        },
        /**
     * @inheritdoc gpf.Callback:doApply
     * @private
     */
        _gpfDoApply = function (callback, scope, paramArray) {
            var len = arguments.length, idx = 3, paramIdx = 0;
            while (idx < len) {
                paramArray[paramIdx] = arguments[idx];
                ++idx;
                ++paramIdx;
            }
            return callback.apply(scope, paramArray);
        };
    /**
 * Generic callback handler
 *
 * @param {Function} handler
 * @param {Object} scope
 * @constructor
 * @class gpf.Callback
 */
    gpf.Callback = function (handler, scope) {
        gpf.ASSERT(handler, "Handler expected");
        this._handler = handler;
        if (scope) {
            this._scope = _gpfResolveScope(scope);
        }
    };
    // Define gpf.Callback interface (the 'old' way)
    gpf.extend(gpf.Callback.prototype, {
        /**
     * Function to call
     *
     * @type {Function}
     * @private
     */
        _handler: _gpfEmptyFunc,
        /**
     * Scope to apply
     *
     * @tyoe {Object}
     * @private
     */
        _scope: null,
        /**
     * Get the handler function
     *
     * @return {Function}
     */
        handler: function () {
            return this._handler;
        },
        /**
     * Get the scope
     *
     * @return {Object}
     */
        scope: function () {
            return this._scope;
        },
        /**
     * Executes the callback and override the scope if not defined
     *
     * @param {Object} scope Scope to apply if none set in the callback
     * @param {*} ... Forwarded to the callback handler
     * @return {*}
     */
        call: function () {
            return this.apply(arguments[0], _gpfArraySlice.apply(arguments, [1]));
        },
        /**
     * Executes the callback and override the scope if not defined
     *
     * @param {Object} scope Scope to apply if none set in the callback
     * @param {*[]} args Forwarded to the callback handler
     * @return {*}
     */
        apply: function (scope, args) {
            var finalScope = _gpfResolveScope(scope || this._scope);
            return this._handler.apply(finalScope, args || []);
        }
    });
    // define Static helpers
    gpf.extend(gpf.Callback, {
        /**
     * Resolve to a valid scope.
     * If no scope is provided, the default context is used
     *
     * @param {Object} [scope=undefined] scope
     * @return {Object}
     * @static
     */
        resolveScope: _gpfResolveScope,
        /**
     * Build a parameter array with
     * - Placeholders for known parameters
     * - Leading parameters filled wih the provided params
     *
     * @param {Number} count
     * @param {*} [params=undefined] params Additional parameters
     * appended at the end of the parameter list
     * @return {Array}
     * @static
     */
        buildParamArray: _gpfBuildParamArray,
        /**
     * Helper to call a function with a variable list of parameters
     *
     * @param {Function} callback
     * @param {Object} scope
     * @param {Array} paramArray array of parameters built with
     * gpf.Callback.buildParamArray
     * @param {...*} var_args
     * @return {*}
     */
        doApply: _gpfDoApply,
        /**
     * Get a method that is bound to the object
     *
     * @param {Object} obj
     * @param {String} method
     * @param {Boolean} [dynamic=false] dynamic Method is bound dynamically
     * (i.e. using the name) or statically (i.e. using function object)
     * @return {Function}
     * @closure
     */
        bind: function (obj, method, dynamic) {
            gpf.ASSERT("string" === typeof method, "Expected method name");
            gpf.ASSERT("function" === typeof obj[method], "Only methods can be bound");
            var boundMember = method + ":boundToThis", result;
            result = obj[boundMember];
            if (undefined === result) {
                if (true === dynamic) {
                    result = function () {
                        return obj[method].apply(obj, arguments);
                    };
                } else {
                    result = obj[method].bind(obj);
                }
                obj[boundMember] = result;
            }
            return result;
        }
    });
    gpf.events.EventDispatcherImpl = {
        /**
     * @type {Object} Dictionary of event name to the list of callbacks
     * @private
     */
        _eventDispatcherListeners: null,
        /**
     * Add an event listener to the target
     *
     * @param {String} event name
     * @param {gpf.events.Handler} eventsHandler
     * @param {Boolean} [useCapture=false] useCapture push it on top of the
     * triggering queue
     * @return {Object}
     * @chainable
     */
        addEventListener: function (event, eventsHandler, useCapture) {
            var listeners = this._eventDispatcherListeners;
            if (!listeners) {
                listeners = this._eventDispatcherListeners = {};
            }
            if (!useCapture) {
                useCapture = false;
            }
            if (undefined === listeners[event]) {
                listeners[event] = [];
            }
            if (useCapture) {
                listeners[event].unshift(eventsHandler);
            } else {
                listeners[event].push(eventsHandler);
            }
            return this;
        },
        /**
     * Remove an event listener to the target
     *
     * @param {String} event name
     * @param {gpf.events.Handler} eventsHandler
     * @return {Object}
     * @chainable
     */
        removeEventListener: function (event, eventsHandler) {
            var listeners = this._eventDispatcherListeners, eventListeners, idx;
            if (listeners) {
                eventListeners = listeners[event];
                if (undefined !== eventListeners) {
                    idx = eventListeners.indexOf(eventsHandler);
                    if (-1 !== idx) {
                        eventListeners.splice(idx, 1);
                    }
                }
            }
            return this;
        },
        /**
     * Broadcast the event
     *
     * @param {String|gpf.events.Event} event name or object
     * @param {Object} [params={}] event parameters
     * @return {Object}
     * @protected
     * @chainable
     */
        _dispatchEvent: function (event, params) {
            var listeners = this._eventDispatcherListeners, eventObj, type, eventListeners, len, idx;
            if (!listeners) {
                return this;    // No listeners at all
            }
            if (event instanceof gpf.events.Event) {
                eventObj = event;
                type = event.type;
            } else {
                type = event;
            }
            eventListeners = this._eventDispatcherListeners[type];
            if (undefined === eventListeners) {
                return this;    // Nothing listeners for this event
            }
            if (!eventObj) {
                eventObj = new gpf.events.Event(type, params, this);
            }
            len = eventListeners.length;
            for (idx = 0; idx < len; ++idx) {
                gpf.events.fire.apply(this, [
                    eventObj,
                    eventListeners[idx]
                ]);
            }
            return this;
        }
    };
    var
        /**
     * Object used to generate _gpfMimeTypesFromExtension and
     * _gpfMimeTypesToExtension
     *
     * @type {Object}
     * @private
     */
        _gpfHardCodedMimeTypes = {
            application: { javascript: "js" },
            image: {
                gif: 0,
                jpeg: "jpg,jpeg",
                png: 0
            },
            text: {
                css: 0,
                html: "htm,html",
                plain: "txt,text,log"
            }
        },
        /**
     * Dictionary of mime type to extension
     *
     * @type {Object}
     * @private
     */
        _gpfMimeTypesToExtension = null,
        /**
     * Dictionary of extension to mime type
     *
     * @type {Object}
     * @private
     */
        _gpfMimeTypesFromExtension = null, _gpfBuildMimeTypeFromMappings = function (path, mappings) {
            var key, mimeType, fileExtension, extensions, len, idx;
            for (key in mappings) {
                if (mappings.hasOwnProperty(key)) {
                    if (path) {
                        mimeType = path + "/" + key;
                    } else {
                        mimeType = key;
                    }
                    extensions = mappings[key];
                    if (0 === extensions) {
                        fileExtension = "." + key;
                        _gpfMimeTypesFromExtension[fileExtension] = mimeType;
                        if (undefined === _gpfMimeTypesToExtension[mimeType]) {
                            _gpfMimeTypesToExtension[mimeType] = fileExtension;
                        }
                    } else if ("string" === typeof extensions) {
                        extensions = extensions.split(",");
                        len = extensions.length;
                        for (idx = 0; idx < len; ++idx) {
                            fileExtension = "." + extensions[idx];
                            _gpfMimeTypesFromExtension[fileExtension] = mimeType;
                            if (undefined === _gpfMimeTypesToExtension[mimeType]) {
                                _gpfMimeTypesToExtension[mimeType] = fileExtension;
                            }
                        }
                    } else {
                        // Assuming extensions is an object
                        _gpfBuildMimeTypeFromMappings(mimeType, extensions);
                    }
                }
            }
        },
        /**
     * Initialize _gpfMimeTypesFromExtension and _gpfMimeTypesToExtension
     *
     * @private
     */
        _gpfInitMimeTypes = function () {
            if (null === _gpfMimeTypesFromExtension) {
                _gpfMimeTypesFromExtension = {};
                _gpfMimeTypesToExtension = {};
                _gpfBuildMimeTypeFromMappings("", _gpfHardCodedMimeTypes);
            }
        };
    /**
 * Retrieve the mime type associates with the file extension (default is
 * "application/octet-stream")
 *
 * @param {String} fileExtension
 * @return {String}
 */
    gpf.web.getMimeType = function (fileExtension) {
        var mimeType;
        _gpfInitMimeTypes();
        mimeType = _gpfMimeTypesFromExtension[fileExtension.toLowerCase()];
        if (undefined === mimeType) {
            // Default
            mimeType = "application/octet-stream";
        }
        return mimeType;
    };
    /**
 * Retrieve the file extension associated with the mime type (default is ".bin")
 *
 * @param {String} mimeType
 * @return {String}
 */
    gpf.web.getFileExtension = function (mimeType) {
        var fileExtension;
        _gpfInitMimeTypes();
        fileExtension = _gpfMimeTypesToExtension[mimeType.toLowerCase()];
        if (undefined === fileExtension) {
            // Default
            fileExtension = ".bin";
        }
        return fileExtension;
    };
    "use strict";
    /*global _gpfHost*/
    // Host type
    /*global _gpfResolveScope*/
    // Translate the parameter into a valid scope
    /*global _gpfIsArrayLike*/
    // Return true if the parameter looks like an array
    /*global _gpfEmptyFunc*/
    // An empty function
    /*global _gpfIgnore*/
    // Helper to remove unused parameter warning
    /*global _gpfFunc*/
    // Create a new function using the source
    var
        /**
     * Creates a function that wraps the callback, the scope and its
     * arguments
     *
     * @param {Function|String} callback
     * @param {Object} [scope=null] scope
     * @param {Array} [args=[]] args
     * @return {Function}
     * @closure
     */
        _gpfAsyncCallback = function (callback, scope, args) {
            if ("string" === typeof callback) {
                callback = _gpfFunc(callback);
            }
            if (!_gpfIsArrayLike(args)) {
                args = [];
            }
            return function () {
                callback.apply(_gpfResolveScope(scope), args);
            };
        },
        /**
     * If used, it contains the list of asynchronous callbacks
     *
     * @type {Array}
     * @private
     */
        _gpfAsyncQueue = [],
        /**
     * Sorting function used to reorder the async queue
     *
     * @param {Object} a
     * @param {Object} b
     * @return {Number}
     * @private
     */
        _gpfSortOnDt = function (a, b) {
            return a._dt - b._dt;
        },
        /*exported _gpfDefer*/
        /**
     * Defer the execution of the callback
     *
     * @param {Function} callback
     * @param {Number} [timeout=0] timeout
     * @param {Object} [scope=null] scope
     * @param {Array} [args=[]] args
     */
        _gpfDefer;
    /**
 * Run the asynchronous queue (mandatory for some environments)
 */
    gpf.runAsyncQueue = _gpfEmptyFunc;
    if ("browser" === _gpfHost) {
        // Leverage the use of setTimeout(func, delay, [param1, param2, ...])
        // as it avoids creating closures
        /**
     * Same as the initial documentation but does not require any closure
     * @param parameters
     *
     * @private
     */
        _gpfAsyncCallback = function (parameters) {
            parameters[0].apply(_gpfResolveScope(parameters[1]), parameters[2]);
        };
        _gpfDefer = function (callback, timeout, scope, args) {
            if ("string" === typeof callback) {
                callback = _gpfFunc(callback);
            }
            if (!timeout) {
                timeout = 0;
            }
            setTimeout(_gpfAsyncCallback, timeout, [
                callback,
                scope,
                args
            ]);
        };
    } else if ("undefined" !== typeof setTimeout) {
        // Consider the use of setTimeout(func, delay)
        _gpfDefer = function (callback, timeout, scope, args) {
            if (!timeout) {
                timeout = 0;
            }
            setTimeout(_gpfAsyncCallback(callback, scope, args), timeout);
        };
    } else if ("wscript" === _gpfHost) {
        // Custom mechanism
        _gpfDefer = function (callback, timeout, scope, args) {
            var item = _gpfAsyncCallback(callback, scope, args);
            if (!timeout) {
                timeout = 0;
            }
            item._dt = new Date(new Date() - -timeout);
            _gpfAsyncQueue.push(item);
            _gpfAsyncQueue.sort(_gpfSortOnDt);
        };
        gpf.runAsyncQueue = function () {
            var queue = _gpfAsyncQueue, callback;
            while (queue.length) {
                callback = queue.shift();
                if (callback._dt > new Date()) {
                    WScript.Sleep(callback._dt - new Date());
                }
                callback();
            }
        };
    } else {
        console.warn("No implementation for gpf.defer");
        _gpfDefer = function (callback, timeout, scope, args) {
            _gpfIgnore(timeout);
            _gpfAsyncCallback(callback, scope, args)();
        };
    }
    /**
 * Defer the execution of the callback
 *
 * @param {Function} callback
 * @param {Number} [timeout=0] timeout
 * @param {Object} [scope=null] scope
 * @param {Array} [args=[]] args
 */
    gpf.defer = _gpfDefer;
    var _b64 = _gpfALPHA + _gpfAlpha + _gpfDigit + "+/", _b16 = "0123456789ABCDEF", _toBaseANY = function (base, value, length, safepad) {
            var baseLength = base.length, pow = gpf.bin.isPow2(baseLength), bits, mask, result = [], digit;
            if (-1 < pow && (undefined === length || length * pow <= 32)) {
                /*
             * Good conditions to use bits masking & shifting,
             * will work with negative values and will be faster
             */
                if (undefined === length) {
                    bits = 32;
                } else {
                    bits = length * pow;
                }
                mask = (1 << bits - pow) - 1;
                bits = (1 << pow) - 1;
                while (0 !== value) {
                    digit = value & bits;
                    result.unshift(base.charAt(digit));
                    value = value >> pow & mask;
                }
            } else {
                while (0 !== value) {
                    digit = value % baseLength;
                    result.unshift(base.charAt(digit));
                    value = (value - digit) / baseLength;
                }
            }
            if (undefined !== length) {
                if (undefined === safepad) {
                    safepad = base.charAt(0);
                }
                while (result.length < length) {
                    result.unshift(safepad.charAt(result.length % safepad.length));
                }
            } else if (0 === result.length) {
                result = [base.charAt(0)];    // 0
            }
            return result.join("");
        }, _fromBaseANY = function (base, text, safepad) {
            var baseLength = base.length, result = 0, idx = 0;
            if (undefined === safepad) {
                safepad = base.charAt(0);
            }
            while (idx < text.length) {
                if (-1 === safepad.indexOf(text.charAt(idx))) {
                    break;
                } else {
                    ++idx;
                }
            }
            while (idx < text.length) {
                result = baseLength * result + base.indexOf(text.charAt(idx++));
            }
            return result;
        };
    gpf.bin = {
        /**
     * Computes the power of 2
     *
     * @param {Number} n the power to compute
     * @return {Number}
     */
        pow2: function (n) {
            return 1 << n;
        },
        /**
     * Check if the given value is a power of 2
     *
     * @param {Number} value the value to check
     * @return {Number} the power of 2 or -1
     */
        isPow2: function (value) {
            // http://en.wikipedia.org/wiki/Power_of_two
            if (0 < value && 0 === (value & value - 1)) {
                var result = 0;
                while (1 < value) {
                    ++result;
                    value >>= 1;
                }
                return result;
            } else {
                return -1;
            }
        },
        /**
     * Encodes the value within the specified base.
     * Result string length can be defined and missing characters will be
     * added with safepad.
     *
     * @param {String} base values
     * @param {Number} value to encode
     * @param {Number} length of encoding
     * @param {String} safepad [safepad=base.charAt(0)]
     * @return {String}
     */
        toBaseANY: _toBaseANY,
        /**
     * Decodes the text value using the specified base.
     * @param {String} base
     * @param {String} text
     * @param {String} safepad [safepad=""]
     * @return {Number}
     */
        fromBaseANY: _fromBaseANY,
        /**
     * Returns the hexadecimal encoding of value.
     * @param {Number} value
     * @param {Number} length of encoding
     * @param {String} safepad [safepad="0"]
     * @return {String}
     */
        toHexa: function (value, length, safepad) {
            return _toBaseANY(_b16, value, length, safepad);
        },
        /**
     * Decodes the hexadecimal text value.
     * @param {String} text
     * @param {String} safepad [safepad="0"]
     * @return {Number}
     */
        fromHexa: function (text, safepad) {
            return _fromBaseANY(_b16, text, safepad);
        },
        /**
     * Returns the base 64 encoding of value.
     * @param {Number} value
     * @param {Number} length of encoding
     * @param {String} safepad [safepad="0"]
     * @return {String}
     */
        toBase64: function (value, length, safepad) {
            return _toBaseANY(_b64, value, length, safepad);
        },
        /**
     * Decodes the hexadecimal text value.
     * @param {String} text
     * @param {String} safepad [safepad="0"]
     * @return {Number}
     */
        fromBase64: function (text, safepad) {
            return _fromBaseANY(_b64, text, safepad);
        },
        /**
     * Test if the value contains the bitmask.
     *
     * @param {Number} value
     * @param {Number} bitmask
     * @return {Boolean}
     */
        test: function (value, bitmask) {
            return (value & bitmask) === bitmask;
        },
        /**
     * Clear the bitmask inside the value
     *
     * @param {Number} value
     * @param {Number} bitmask
     * @return {Number}
     */
        clear: function (value, bitmask) {
            return value & ~bitmask;
        }
    };
    var _gpfJsonStringify, _gpfJsonParse;
    function _gpfObject2Json(object) {
        var isArray, results, property, value;
        isArray = object instanceof Array;
        results = [];
        /*jshint -W089*/
        for (property in object) {
            if ("function" === typeof object[property]) {
                continue;    // ignore
            }
            value = _gpfJsonStringify(object[property]);
            if (isArray) {
                results.push(value);
            } else {
                results.push(_gpfStringEscapeFor(property, "javascript") + ":" + value);
            }
        }
        if (isArray) {
            return "[" + results.join(",") + "]";
        } else {
            return "{" + results.join(",") + "}";
        }    /*jshint +W089*/
    }
    // Need to use typeof as this is a global object
    if ("undefined" === typeof JSON) {
        _gpfJsonStringify = function (object) {
            var type = typeof object;
            if ("undefined" === type || "function" === type) {
                return;
            } else if ("number" === type || "boolean" === type) {
                return object.toString();
            } else if ("string" === type) {
                return _gpfStringEscapeFor(object, "javascript");
            }
            if (null === object) {
                return "null";
            } else {
                return _gpfObject2Json(object);
            }
        };
        _gpfJsonParse = function (test) {
            return _gpfFunc("return " + test)();
        };
    } else {
        _gpfJsonStringify = JSON.stringify;
        _gpfJsonParse = JSON.parse;
    }
    gpf.json = {
        /**
     * The JSON.stringify() method converts a JavaScript value to a JSON string
     *
     * @param {*} value the value to convert to a JSON string
     * @return {String}
     */
        stringify: _gpfJsonStringify,
        /**
     * The JSON.parse() method parses a string as JSON
     *
     * @param {*} text The string to parse as JSON
     * @return {Object}
     */
        parse: _gpfJsonParse,
        /**
     * TODO there must be a way to make it less specific to JSON
     * TODO handle object sub members
     * TODO handle before/after load methods
     * TODO handle before/after save methods
     */
        /**
     * Load the object properties from the json representation.
     *
     * @param {Object} object
     * @param {Object|string} json
     * @return {Object}
     * @chainable
     */
        load: function (object, json) {
            var prototype = object.constructor.prototype, attributes = new _gpfA.Map(object), member, jsonMember;
            /*jshint -W089*/
            // Actually, I want all properties
            for (member in prototype) {
                if ("function" === typeof prototype[member] || attributes.member(member).has(_gpfANoSerial)) {
                    continue;    // Ignore functions & unwanted members
                }
                /*
             * We have a member that must be serialized,
             * by default members with a starting _ will be initialized from
             * the corresponding member (without _) of the json object
             */
                if (0 === member.indexOf("_")) {
                    jsonMember = member.substr(1);
                } else {
                    jsonMember = member;
                }
                if (jsonMember in json) {
                    object[member] = json[jsonMember];
                } else {
                    // Reset the value coming from the prototype
                    object[member] = prototype[member];
                }
            }
            return object;
        },
        /*jshint +W089*/
        /**
     * Save the object properties into a json representation.
     *
     * @param {Object} object
     * @return {Object}
     */
        save: function (object) {
            var result = {}, prototype = object.constructor.prototype, attributes = new _gpfA.Map(object), member, jsonMember, value;
            /*jshint -W089*/
            // Actually, I want all properties
            for (member in prototype) {
                if ("function" === typeof prototype[member] || attributes.member(member).has(_gpfANoSerial)) {
                    continue;    // Ignore functions & unwanted members
                }
                /*
             * We have a member that must be serialized,
             * by default members with a starting _ will be initialized from
             * the corresponding member (without _) of the json object
             */
                if (0 === member.indexOf("_")) {
                    jsonMember = member.substr(1);
                } else {
                    jsonMember = member;
                }
                value = object[member];
                if (value !== prototype[member]) {
                    result[jsonMember] = value;
                }
            }
            return result;
        }    /*jshint +W089*/
    };
    var
        /**
     * Split the part to be processed in _GpfPathMatcher#_matchName
     *
     * @param {String} part
     * @private
     */
        _gpfPatternPartSplit = function (part) {
            return part.split("*");
        },
        /**
     *
     * @param {String} pattern
     *
     * @class _GpfLikeContext
     * @constructor
     * @private
     */
        _GpfPathMatcher = function (pattern) {
            this._dbgSource = pattern;
            if ("!" === pattern.charAt(0)) {
                this.negative = true;
                pattern = pattern.substr(1);
            }
            /**
         * if any use of "**", split the pattern in two:
         * - the before part: start
         * - the after part: end
         * (otherwise, it is only the before part)
         */
            var pos = pattern.indexOf("**");
            if (-1 === pos) {
                this.start = pattern.split("/").map(_gpfPatternPartSplit);
            } else {
                if (0 < pos) {
                    gpf.ASSERT(pattern.charAt(pos - 1) === "/", "** must be preceded by /");
                    this.start = pattern.substr(0, pos - 1)    // skip /
.split("/").map(_gpfPatternPartSplit);
                }
                if (pos < pattern.length - 2) {
                    gpf.ASSERT(pattern.charAt(pos + 2) === "/", "** must be followed by /");
                    this.end = pattern.substr(pos + 3)    // skip /
.split("/").map(_gpfPatternPartSplit).reverse();
                }
            }
        },
        /**
     * Convert - if necessary - the pattern parameter
     *
     * @param {_GpfPathMatcher|String} pattern
     * @return {_GpfPathMatcher}
     * @private
     */
        _gpfPathMatchCompilePattern = function (pattern) {
            if (pattern instanceof _GpfPathMatcher) {
                return pattern;
            } else {
                return new _GpfPathMatcher(pattern);
            }
        },
        /**
     * Convert - if necessary - the pattern parameter
     *
     * @param {Array|String} pattern
     * @return {_GpfPathMatcher[]}
     * @private
     */
        _gpfPathMatchCompilePatterns = function (pattern) {
            if (pattern instanceof Array) {
                return pattern.map(_gpfPathMatchCompilePattern);
            } else {
                return [_gpfPathMatchCompilePattern(pattern)];
            }
        },
        /**
     * Match a path item
     *
     * @param pathMatcher
     * @this An object containing
     * - {String[]} parts the path being tested split in parts
     * - {Boolean} [result=undefined] result the result
     *
     * @private
     */
        _gpfPathMatchApply = function (pathMatcher) {
            var negative = pathMatcher.negative;
            if (pathMatcher.match(this.parts)) {
                this.result = !negative;
                return false;    // Stop the main loop
            }
            if (negative) {
                this.result = true;
                return false;    // Stop the main loop
            }
            return true;    // continue
        },
        /**
     * Match the pattern with the path
     * @param {Array|String} pattern
     * @param {String} path
     * @return {Boolean|undefined}
     * @private
     */
        _gpfPathMatch = function (pattern, path) {
            if (_gpfDosPath) {
                path = path.toLowerCase().split("\\").join("/");
            }
            var parts = path.split("/"), matchers = _gpfPathMatchCompilePatterns(pattern), scope = { parts: parts };
            matchers.every(_gpfPathMatchApply, scope);
            return scope.result;
        };
    _GpfPathMatcher.prototype = {
        constructor: _GpfPathMatcher,
        /**
     * Source of the pattern
     *
     * @type {String}
     * @private
     */
        _dbgSource: "",
        /**
     * Indicate the pattern started with !
     *
     * @type {Boolean}
     * @private
     */
        negative: false,
        /**
     * List of name patterns to be applied on the beginning of the path
     *
     * @type {String[]}
     */
        start: null,
        /**
     * List of name patterns to be applied on the end of the path
     * (note they are in the reverse order)
     *
     * @type {String[]}
     */
        end: null,
        /**
     * When no * is used, the namePattern must exactly match the part.
     * Otherwise the * represents a variable part in the part.
     * It may contain as many variable part as necessary.
     *
     * a*b  matches     (start)a(anything)b(end)
     * *b   matches     b(end)
     * a*   matches     (start)a
     *
     * @param {String[]} fixedPatterns
     * @param {String} part
     * @private
     */
        _matchName: function (fixedPatterns, part) {
            var len = fixedPatterns.length, idx, fixedPattern, pos = 0;
            // end
            for (idx = 0; idx < len; ++idx) {
                fixedPattern = fixedPatterns[idx];
                // an empty pattern correspond to a star position
                if (fixedPattern) {
                    pos = part.indexOf(fixedPattern, pos);
                    // part not found means not matching
                    if (-1 === pos) {
                        return false;
                    }
                    // the first part must match the beginning
                    if (0 === idx && 0 < pos) {
                        return false;
                    }
                }
            }
            /**
         * fixedPattern represents the last pattern used (and matching)
         * If empty, we match (because we don't care about the end)
         * Otherwise, it should leads us to the end of the part.
         */
            return !fixedPattern || pos + fixedPattern.length === part.length;
        },
        /**
     * Matches the provided path
     *
     * @param {String[]} parts
     * @return {Boolean}
     */
        match: function (parts) {
            var partsLen = parts.length, startPos = 0, endPos = partsLen - 1, array, len, idx;
            if (this.start) {
                array = this.start;
                len = array.length;
                for (idx = 0; idx < len; ++idx) {
                    if (this._matchName(array[idx], parts[startPos])) {
                        if (++startPos >= partsLen) {
                            // Match if last part of the start and no end
                            return idx === len - 1 && !this.end;
                        }
                    } else {
                        return false;
                    }
                }
            }
            if (this.end) {
                array = this.end;
                len = array.length;
                for (idx = 0; idx < len; ++idx) {
                    if (-1 < endPos && this._matchName(array[idx], parts[endPos])) {
                        if (endPos-- < startPos) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            }
            return true;
        }
    };
    gpf.path = {
        /**
     * Matches the provided path
     *
     * PATTERN FORMAT
     * - An optional prefix "!" negates the pattern
     * - Path separator are /
     * - In a DOS environment, path is transformed to lowercase and path
     * separators are converted to / (hence the pattern remains the same)
     * - A leading slash matches the beginning of the pathname. For example,
     * "/*.c" matches "cat-file.c" but not "mozilla-sha1/sha1.c".
     * - Two consecutive asterisks ("**") in patterns matched against full
     * pathname may have special meaning:
     *   - A leading "**" followed by a slash means match in all directories.
     *   For example, "**" + "/foo" matches file or directory "foo" anywhere,
     *   the same as pattern "foo". "**" + "/foo/bar" matches file or directory
     *   "bar" anywhere that is directly under directory "foo".
     *   - A trailing "/**" matches everything inside. For example, "abc/**"
     *   matches all files inside directory "abc"
     *   - A slash followed by two consecutive asterisks then a slash matches
     *   zero or more directories. For example, "a/**" + "/b" matches "a/b",
     *   "a/x/b", "a/x/y/b" and so on.
     * Other consecutive asterisks are considered invalid.
     *
     * @param {Array|String} pattern
     * @param {String} path
     * @return {Boolean}
     */
        match: function (pattern, path) {
            return _gpfPathMatch(pattern, path) || false;
        },
        /**
     * Process the pattern and return an array that can be used in match
     * NOTE this is not mandatory but if you reuse the same pattern multiple
     * times, this will make it more efficient.
     *
     * @param {Array|String} pattern
     * @return {Array}
     */
        compileMatchPattern: function (pattern) {
            return _gpfPathMatchCompilePatterns(pattern);
        }
    };
    var _GPF_ERRORS = {
            // boot.js
            // define.js
            "ClassMemberOverloadWithTypeChange": "You can't overload a member to change its type",
            "ClassInvalidVisibility": "Invalid visibility keyword",
            // parser.js
            "PatternUnexpected": "Invalid syntax (unexpected)",
            "PatternEmpty": "Empty pattern",
            "PatternInvalidSyntax": "Invalid syntax",
            "PatternEmptyGroup": "Syntax error (empty group)",
            // html.js
            "HtmlHandlerMultiplicityError": "Too many $HtmlHandler attributes for '{member}'",
            "HtmlHandlerMissing": "No $HtmlHandler attributes",
            "HtmlHandlerNoDefault": "No default $HtmlHandler attribute",
            // engine.js
            "EngineStackUnderflow": "Stack underflow",
            "EngineTypeCheck": "Type check",
            // encoding.js
            "EncodingNotSupported": "Encoding not supported",
            "EncodingEOFWithUnprocessedBytes": "Unexpected end of stream: unprocessed bytes",
            // xml.js
            "XmlInvalidName": "Invalid XML name",
            // params.js
            "ParamsNameRequired": "Missing name",
            "ParamsTypeUnknown": "Type unknown",
            "ParamsRequiredMissing": "Required parameter '{name}' is missing",
            // fs.js
            "FileNotFound": "File not found"
        },
        /**
     * GPF Error class
     *
     * @constructor
     * @class _GpfError
     * @alias gpf.Error
     */
        _GpfError = gpf.Error = function () {
        },
        /**
     * Generates an error function
     *
     * @param {Number} code
     * @param {String} name
     * @return {Function}
     * @closure
     * @private
     */
        _gpfGenErrorName = function (code, name, message) {
            var result = function (context) {
                var error = new gpf.Error(), finalMessage, replacements, key;
                gpf.setReadOnlyProperty(error, "code", code);
                gpf.setReadOnlyProperty(error, "name", name);
                if (context) {
                    replacements = {};
                    for (key in context) {
                        if (context.hasOwnProperty(key)) {
                            replacements["{" + key + "}"] = context[key].toString();
                        }
                    }
                    finalMessage = _gpfStringReplaceEx(message, replacements);
                } else {
                    finalMessage = message;
                }
                gpf.setReadOnlyProperty(error, "message", finalMessage);
                return error;
            };
            gpf.setReadOnlyProperty(result, "CODE", code);
            gpf.setReadOnlyProperty(result, "NAME", name);
            gpf.setReadOnlyProperty(result, "MESSAGE", message);
            return result;
        },
        /**
     * Last allocated error code
     *
     * @type {number}
     * @private
     */
        _gpfLastErrorCode = 0,
        /**
     * Declare error messages
     *
     * @param {String} module
     * @param {Object} list Dictionary of name to message
     * @private
     */
        _gpfErrorDeclare = function (module, list) {
            var name, code;
            _gpfIgnore(module);
            for (name in list) {
                if (list.hasOwnProperty(name)) {
                    code = ++_gpfLastErrorCode;
                    gpf.Error["CODE_" + name.toUpperCase()] = code;
                    gpf.Error[name] = _gpfGenErrorName(code, name, list[name]);
                }
            }
        };
    _GpfError.prototype = {
        constructor: _GpfError,
        /**
     * Error code
     *
     * @type {Number}
     * @read-only
     */
        code: 0,
        /**
     * Error name
     *
     * @type {String}
     * @read-only
     */
        name: "Error",
        /**
     * Error message
     *
     * @type {String}
     * @read-only
     */
        message: ""
    };
    _gpfErrorDeclare("boot", {
        NotImplemented: "Not implemented",
        Abstract: "Abstract",
        AssertionFailed: "Assertion failed: {message}"
    });
    _gpfIgnore(_GPF_ERRORS);
    gpf.js = {
        /**
     * The list of JavaScript keywords
     *
     * @return {String[]}
     */
        keywords: function () {
            return [].concat(_gpfJsKeywords);
        }
    };
    _gpfErrorDeclare("csv", { CsvInvalid: "Invalid CSV syntax (bad quote sequence or missing end of file)" });
    var
        /**
     * Usual CSV separators
     *
     * @type {string}
     * @private
     */
        _gpfCsvSeparators = ";,\t ",
        /**
     * Deduce CSV separator from line (usually, the header)
     *
     * @param {String} header
     * @return {String}
     * @private
     */
        _gpfCsvComputeSeparator = function (header) {
            var len = _gpfCsvSeparators.length, idx, separator;
            for (idx = 0; idx < len; ++idx) {
                separator = _gpfCsvSeparators.charAt(idx);
                if (-1 !== header.indexOf(separator)) {
                    return separator;
                }
            }
            // Default
            return _gpfCsvSeparators.charAt(0);
        },
        /**
     * Handle quoted value.
     * Either the quote appears in the middle of the value: it must be followed
     * by another quote.
     * And/Or it appears at the end of the value: it means this ends the quoted
     * value
     *
     * @param {String} value
     * @param {String} quote
     * @return {Array}
     * First element is the result value
     * Second element indicates if the quote escaping is still active
     * @private
     */
        _gpfCsvUnquote = function (value, quote) {
            var pos = value.indexOf(quote), inQuotedString = true;
            while (-1 < pos) {
                if (pos === value.length - 1) {
                    // Last character of the string
                    value = value.substr(0, pos);
                    inQuotedString = false;
                    break;
                } else {
                    if (value.charAt(pos + 1) === quote) {
                        // Double quote means escaped one
                        value = value.substr(0, pos) + value.substr(pos + 1);
                    } else {
                        throw gpf.Error.CsvInvalid();
                    }
                }
                pos = value.indexOf(quote, pos + 1);
            }
            return [
                value,
                inQuotedString
            ];
        },
        /**
     * Read one 'line' of values. quote escaping is handled meaning that a line
     * might be on several lines.
     *
     * @param {String[]} lines
     * @param {String} separator
     * @param {String} quote
     * @private
     */
        _gpfCsvReadValues = function (lines, separator, quote) {
            var values = [], line, inQuotedString = false, includeCarriageReturn, idx, value, previousValue, unQuoted;
            while (lines.length) {
                line = lines.shift();
                line = line.split(separator);
                if (inQuotedString) {
                    includeCarriageReturn = true;
                    line.unshift(values.pop());
                    // Last value is not completed
                    idx = 1;
                } else {
                    idx = 0;
                    includeCarriageReturn = false;
                }
                /* Check the values to see if quote has been used */
                while (idx < line.length) {
                    value = line[idx];
                    if (inQuotedString) {
                        // Concatenate with 'previous' item
                        previousValue = [line[idx - 1]];
                        if (includeCarriageReturn) {
                            previousValue.push("\r\n");
                        } else {
                            // part of the escaped string
                            previousValue.push(separator);
                        }
                        unQuoted = _gpfCsvUnquote(value, quote);
                        previousValue.push(unQuoted[0]);
                        inQuotedString = unQuoted[1];
                        line[idx - 1] = previousValue.join("");
                        includeCarriageReturn = false;
                        line.splice(idx, 1);
                    } else {
                        if (0 === value.indexOf(quote)) {
                            inQuotedString = true;
                            unQuoted = _gpfCsvUnquote(value.substr(1), quote);
                            line[idx] = unQuoted[0];
                            inQuotedString = unQuoted[1];
                        }
                        ++idx;
                    }
                }
                values = values.concat(line);
                if (inQuotedString) {
                    if (0 === lines.length) {
                        throw gpf.Error.CsvInvalid();
                    }
                } else {
                    return values;
                }
            }
        },
        /**
     * Remove final \r from the line
     *
     * @param {String} line
     * @return {String}
     * @private
     */
        _trimFinalR = function (line) {
            var len = line.length - 1;
            if ("\r" === line.charAt(len)) {
                return line.substr(0, len);
            }
            return line;
        },
        /**
     * @inheritdoc gpf.csv.parse
     * @private
     */
        _gpfCsvParse = function (content, options) {
            options = options || {};
            // to have at least an empty object
            var lines = content.split("\n").map(_trimFinalR), header = options.header || lines.shift(), headerLen, separator = options.separator || _gpfCsvComputeSeparator(header), values, record, idx, result = [];
            header = header.split(separator);
            headerLen = header.length;
            while (lines.length) {
                values = _gpfCsvReadValues(lines, separator, options.quote || "\"");
                // Create a new record
                record = {};
                for (idx = 0; idx < headerLen; ++idx) {
                    record[header[idx]] = values[idx];
                }
                result.push(record);
            }
            return result;
        };
    gpf.csv = {
        /**
     * CSV parsing function
     *
     * @param {String} content CSV content
     * @param {Object} options
     * - {String} [header=undefined] header
     * - {String} [separator=undefined] separator can be deduced from header
     * - {String} [quote="\""] quote
     *
     * @return {Object[]} records
     */
        parse: _gpfCsvParse
    };
    var _gpfVisibilityKeywords = "public|protected|private|static".split("|"), _GPF_CLASSDEF_MARKER = "_gpf", _GPF_VISIBILITY_PUBLIC = 0, _GPF_VISIBILITY_PROTECTED = 1,
        //  _GPF_VISIBILITY_PRIVATE     = 2,
        _GPF_VISIBILITY_STATIC = 3, _gpfClassInitAllowed = true, _gpfClassDefUID = 0,
        /**
     * Template for new class constructor (using name that includes namespace)
     * - Uses closure to keep track of constructor and pass it to _gpfClassInit
     * - _CONSTRUCTOR_ will be replaced with the actual class name
     *
     * As this is used inside a new function (src), we loose parameter
     * Also, google closure compiler will try to replace any use of
     * arguments[idx] by a named parameter (can't work), so...
     *
     * @param {Function} classInit _gpfClassInit
     * @return {Function}
     * @private
     * @closure
     */
        _gpfClassConstructorTpl = function () {
            var args = arguments, constructor = function () {
                    args[0].apply(this, [
                        constructor,
                        arguments
                    ]);
                };
            return constructor;
        },
        /**
     * Returns the source of _newClassConstructor with the appropriate function
     * name
     *
     * @param {String} name
     * @return {String}
     * @private
     */
        _gpfNewClassConstructorSrc = function (name) {
            var src = _gpfClassConstructorTpl.toString(), start, end;
            // Extract body
            start = src.indexOf("{") + 1;
            end = src.lastIndexOf("}") - 1;
            src = src.substr(start, end - start + 1);
            // Inject name of the function
            return src.replace("function", "function " + name);
        },
        /**
     * Detects if the function uses ._super
     * The function source is split on the "._super" key and I look for the
     * first char after to see if it is not an identifier character.
     *
     * @param {Function} member
     * @return {Boolean}
     * @private
     */
        _gpfUsesSuper = function (member) {
            var parts, len, idx;
            parts = member.toString().split("._super");
            len = parts.length;
            for (idx = 1; idx < len; ++idx) {
                if (-1 === _gpfIdentifierOtherChars.indexOf(parts[idx].charAt(0))) {
                    return true;    // Used
                }
            }
            return false;    // Not used
        },
        /**
     * Generates a closure in which this._super points to the base definition of
     * the overridden member
     *
     * @param {Function} superMember
     * @param {Function} member
     * @return {Function}
     * @private
     * @closure
     */
        _gpfGenSuperMember = function (superMember, member) {
            return function () {
                var previousSuper = this._super, result;
                // Add a new ._super() method pointing to the base class member
                this._super = superMember;
                try {
                    // Execute the method
                    result = member.apply(this, arguments);
                } finally {
                    // Remove it when we're done executing
                    if (undefined === previousSuper) {
                        delete this._super;
                    } else {
                        this._super = previousSuper;
                    }
                }
                return result;
            };
        },
        /**
     * Allocate a new class handler that is specific to a class type
     * (used for interfaces & attributes)
     *
     * @param {String} ctxRoot Default context root
     * @param {String} defaultBase Default contextual root class
     * @private
     */
        _gpfGenDefHandler = function (ctxRoot, defaultBase) {
            ctxRoot = ctxRoot + ".";
            return function (name, base, definition) {
                var result;
                if (undefined === definition && "object" === typeof base) {
                    definition = base;
                    base = ctxRoot + defaultBase;
                } else if (undefined === base) {
                    base = ctxRoot + defaultBase;
                }
                if (-1 === name.indexOf(".")) {
                    name = ctxRoot + name;
                }
                result = gpf.define(name, base, definition);
                return result;
            };
        },
        //region Class definition helper
        /**
     * Global dictionary of known class definitions
     *
     * @type {Object}
     * @private
     */
        _gpfClassDefinitions = {},
        /**
     * An helper to create class and store its information
     *
     * @class gpf.ClassDefinition
     * @constructor
     * @param {String|Function} name
     * @param {Function} Super
     * @param {Object} definition
     * @private
     */
        _GpfClassDefinition = function (name, Super, definition) {
            this._uid = ++_gpfClassDefUID;
            _gpfClassDefinitions[this._uid] = this;
            this._Subs = [];
            if ("function" === typeof name) {
                // TODO use js tokenizer to extract function name (if any)
                this._name = "anonymous";
                // TODO how do we grab the parent constructor (?)
                this._Constructor = name;
            } else {
                this._name = name;
                this._Super = Super;
                this._definition = definition;
                this._build();
            }
        },
        /**
     * Retrieves (or allocate) the class definition object
     *
     * @param {Function} constructor Class constructor
     * @return {gpf.ClassDefinition}
     */
        _gpfGetClassDefinition = function (constructor) {
            var classDef, uid = constructor[_GPF_CLASSDEF_MARKER];
            if (undefined === uid) {
                classDef = new _GpfClassDefinition(constructor);
                gpf.setReadOnlyProperty(constructor, _GPF_CLASSDEF_MARKER, classDef.uid());
            } else {
                classDef = _gpfClassDefinitions[uid];
            }
            return classDef;
        },
        /**
     * Class initializer: it triggers the call to this._defConstructor only if
     * _gpfClassInitAllowed is true.
     *
     * @param {Function} constructor Class constructor
     * @param {*[]} args Arguments
     * @private
     */
        _gpfClassInit = function (constructor, args) {
            if (_gpfClassInitAllowed) {
                var classDef = _gpfGetClassDefinition(constructor);
                // TODO Implement deferred class building here
                if (classDef._defConstructor) {
                    classDef._defConstructor.apply(this, args);
                } else {
                    classDef._Super.apply(this, args);
                }
            }
        };
    _GpfClassDefinition.prototype = {
        constructor: _GpfClassDefinition,
        //region Members
        /**
     * Unique identifier
     *
     * @type {Number}
     * @private
     */
        _uid: 0,
        /**
     * Unique identifier
     *
     * @return {Number}
     */
        uid: function () {
            return this._uid;
        },
        /**
     * Full class name
     *
     * @type {String}
     * @private
     */
        _name: "",
        /**
     * Full class name
     *
     * @return {String}
     */
        name: function () {
            return this._name;
        },
        /**
     * Class name (without namespace)
     *
     * @return {String}
     */
        nameOnly: function () {
            var name = this._name, pos = name.lastIndexOf(".");
            if (-1 === pos) {
                return name;
            } else {
                return name.substr(pos + 1);
            }
        },
        /**
     * Super class
     *
     * @type {Function}
     * @private
     */
        _Super: Object,
        /**
     * Super class
     *
     * @return {Function}
     */
        Super: function () {
            return this._Super;
        },
        /**
     * Child classes
     *
     * @type {Function[}}
     * @private
     */
        _Subs: [],
        /**
     * Child classes
     *
     * @return {Function[}}
     */
        Subs: function () {
            return this._Subs;
        },
        /**
     * Attributes of this class
     *
     * NOTE: during definition, this member is used as a simple JavaScript
     * Object
     *
     * @type {gpf.attributes.Map}
     * @private
     */
        _attributes: null,
        /**
     * Attributes of this class
     *
     * @return {gpf.attributes.Map}
     */
        attributes: function () {
            if (!this._attributes) {
                this._attributes = new gpf.attributes.Map();
            }
            return this._attributes;
        },
        /**
     * Class constructor
     *
     * @type {Function}
     * @private
     */
        _Constructor: function () {
        },
        /**
     * Class 'definition' constructor
     *
     * @type {Function}
     * @private
     */
        _defConstructor: null,
        /**
     * Class constructor
     *
     * @return {Function}
     */
        Constructor: function () {
            return this._Constructor;
        },
        //endregion
        //region Class construction
        /**
     * Class definition
     *
     * @type {Object}
     * @private
     */
        _definition: null,
        /**
     * Adds a member to the class definition.
     * This method must not be used for
     * - constructor
     * - overriding an existing member
     *
     * @param {String} member
     * @param {*} value
     * @param {String|number} [visibility=_GPF_VISIBILITY_PUBLIC] visibility
     */
        addMember: function (member, value, visibility) {
            var newPrototype = this._Constructor.prototype;
            gpf.ASSERT(member !== "constructor", "No constructor can be added");
            gpf.ASSERT(undefined === newPrototype[member], "No member can be overridden");
            if (undefined === visibility) {
                visibility = _GPF_VISIBILITY_PUBLIC;
            } else if ("string" === typeof visibility) {
                visibility = _gpfVisibilityKeywords.indexOf(visibility);
                if (-1 === visibility) {
                    visibility = _GPF_VISIBILITY_PUBLIC;
                }
            }
            this._addMember(member, value, visibility);
        },
        /**
     * Adds a member to the class definition
     *
     * @param {String} member
     * @param {*} value
     * @param {number} visibility
     * @private
     */
        _addMember: function (member, value, visibility) {
            var newPrototype = this._Constructor.prototype;
            if (_GPF_VISIBILITY_STATIC === visibility) {
                gpf.setReadOnlyProperty(newPrototype.constructor, member, value);
            } else {
                newPrototype[member] = value;
            }
        },
        /**
     * Defines a new member of the class
     *
     * @param {String} member Name of the member to define
     * @param {Number} visibility Visibility of the members
     * @private
     * @closure
     */
        _processMember: function (member, visibility) {
            // Don't know yet how I want to handle visibility
            var defMember = this._definition[member], isConstructor = member === "constructor", newType, baseMember, baseType;
            newType = typeof defMember;
            if (_GPF_VISIBILITY_STATIC === visibility) {
                // No inheritance can be applied here
                this._addMember(member, defMember, _GPF_VISIBILITY_STATIC);
                return;
            }
            if (isConstructor) {
                baseMember = this._Super;
            } else {
                baseMember = this._Super.prototype[member];
            }
            baseType = typeof baseMember;
            if ("undefined" !== baseType && null !== baseMember    // Special case as null is common
&& newType !== baseType) {
                throw gpf.Error.ClassMemberOverloadWithTypeChange();
            }
            if ("function" === newType && "undefined" !== baseType && _gpfUsesSuper(defMember)) {
                /*
             * As it is a function override, _super is a way to access the
             * base function.
             */
                defMember = _gpfGenSuperMember(baseMember, defMember);
            }
            if (isConstructor) {
                this._defConstructor = defMember;
            } else {
                this._addMember(member, defMember, visibility);
            }
        },
        /**
     * An attribute definition is found in the class definition, store it
     * into a temporary map: it will be processed later
     *
     * @param {String} key Attribute name of the member to associate the
     * attributes to ([name])
     * @private
     */
        _processAttribute: function (key) {
            var attributeArray, newAttributeArray = this._definition[key];
            key = key.substr(1, key.length - 2);
            // Extract member name
            if (!this._attributes) {
                this._attributes = {};
            }
            attributeArray = this._attributes[key];
            if (undefined === attributeArray) {
                attributeArray = [];
            }
            this._attributes[key] = attributeArray.concat(newAttributeArray);
        },
        /**
     * Process class definition including visibility
     *
     * NOTE: alters this._definition
     *
     * @param {Number} visibility Visibility of the members
     * @private
     */
        _processDefWithVisibility: function (visibility) {
            var initialDefinition = this._definition, definition, member;
            member = _gpfVisibilityKeywords[visibility];
            definition = initialDefinition[member];
            this._definition = definition;
            try {
                for (member in definition) {
                    if (definition.hasOwnProperty(member)) {
                        // Attribute
                        if ("[" === member.charAt(0) && "]" === member.charAt(member.length - 1)) {
                            this._processAttribute(member);    // Visibility
                        } else if ("public" === member || "private" === member || "protected" === member || "static" === member) {
                            throw gpf.Error.ClassInvalidVisibility();    // Usual member
                        } else {
                            this._processMember(member, visibility);
                        }
                    }
                }
                // 2014-05-05 #14
                if ("wscript" === gpf.host() && definition.constructor !== Object) {
                    this._processMember("constructor", visibility);
                }
            } finally {
                this._definition = initialDefinition;
            }
        },
        /**
     * Process definition
     *
     * @private
     */
        _processDefinition: function () {
            var definition = this._definition, member, visibility;
            for (member in definition) {
                if (definition.hasOwnProperty(member)) {
                    if ("[" === member.charAt(0) && "]" === member.charAt(member.length - 1)) {
                        // Attribute
                        this._processAttribute(member);
                    } else {
                        visibility = _gpfVisibilityKeywords.indexOf(member);
                        if (-1 === visibility) {
                            // Usual member, protected if starting with _
                            if (member.charAt(0) === "_") {
                                visibility = _GPF_VISIBILITY_PROTECTED;
                            } else {
                                visibility = _GPF_VISIBILITY_PUBLIC;
                            }
                            this._processMember(member, visibility);
                        } else {
                            // Visibility
                            this._processDefWithVisibility(visibility);
                        }
                    }
                }
            }
            // 2014-05-05 #14
            if ("wscript" === gpf.host() && definition.constructor !== Object) {
                this._processMember("constructor", _GPF_VISIBILITY_PUBLIC);
            }
        },
        /**
     * Process the attributes collected in the definition
     *
     * NOTE: gpf.attributes._add is defined in attributes.js
     *
     * @private
     */
        _processAttributes: function () {
            var attributes = this._attributes, Constructor, newPrototype, attributeName;
            if (attributes) {
                delete this._attributes;
                Constructor = this._Constructor;
                newPrototype = Constructor.prototype;
                for (attributeName in attributes) {
                    if (attributes.hasOwnProperty(attributeName)) {
                        if (attributeName in newPrototype || attributeName === "Class") {
                            gpf.attributes.add(Constructor, attributeName, attributes[attributeName]);
                        } else {
                            // 2013-12-15 ABZ Exceptional, trace it only
                            console.error("gpf.define: Invalid attribute name '" + attributeName + "'");
                        }
                    }
                }
            }
        },
        /**
     * Create the new Class constructor
     *
     * @closure
     */
        _build: function () {
            var newClass, newPrototype, baseClassDef, name = this._name, constructorName;
            // Build the function name for the constructor
            // if "." is not found, lastIndexOf = -1 and lastIndexOf + 1 = 0
            constructorName = name.substr(name.lastIndexOf(".") + 1);
            // The new class constructor
            newClass = _gpfFunc(_gpfNewClassConstructorSrc(constructorName))(_gpfClassInit);
            this._Constructor = newClass;
            gpf.setReadOnlyProperty(newClass, _GPF_CLASSDEF_MARKER, this._uid);
            /*
         * Basic JavaScript inheritance mechanism:
         * Defines the newClass prototype as an instance of the base class
         * Do it in a critical section that prevents class initialization
         */
            _gpfClassInitAllowed = false;
            newPrototype = new this._Super();
            _gpfClassInitAllowed = true;
            // Populate our constructed prototype object
            newClass.prototype = newPrototype;
            // Enforce the constructor to be what we expect
            newPrototype.constructor = newClass;
            /*
         * Defines the link between this class and its base one
         * (It is necessary to do it here because of the gpf.addAttributes
         * that will test the parent class)
         */
            baseClassDef = _gpfGetClassDefinition(this._Super);
            baseClassDef.Subs().push(newClass);
            /*
         * 2014-04-28 ABZ Changed again from two passes on all members to
         * two passes in which the first one also collects attributes to
         * simplify the second pass.
         */
            this._processDefinition();
            this._processAttributes();
        }    //endregion
    };
    //endregion
    /**
 * Defines a new class by setting a contextual name
 *
 * @param {String} name New class contextual name
 * @param {String} [base=undefined] base Base class contextual name
 * @param {Object} [definition=undefined] definition Class definition
 * @return {Function}
 */
    gpf.define = function (name, base, definition) {
        var result, path, ns, leafName, classDef;
        if ("string" === typeof base) {
            // Convert base into the function
            base = gpf.context(base);
        } else if ("object" === typeof base) {
            definition = base;
            base = undefined;
        }
        if (undefined === base) {
            base = Object;    // Root class
        }
        if (-1 < name.indexOf(".")) {
            path = name.split(".");
            leafName = path.pop();
            ns = gpf.context(path, true);
        }
        classDef = new _GpfClassDefinition(name, base, definition || {});
        result = classDef.Constructor();
        if (undefined !== ns) {
            ns[leafName] = result;
        }
        return result;
    };
    var
        /**
     * gpf.attributes shortcut
     *
     * @type {Object}
     * @private
     */
        _gpfA = gpf.attributes = {},
        /**
     * Used for empty members
     *
     * @type {gpf.attributes.Array}
     * @private
     */
        _gpfEmptyMemberArray = 0,
        /**
     * Generates a factory capable of creating a new instance of a class
     *
     * @param {Function} objectClass Object constructor
     * @param {String} name Alias name (will be prefixed by $)
     * @private
     * @closure
     */
        _gpfAlias = function (objectClass, name) {
            name = "$" + name;
            gpf[name] = function () {
                var Proxy = _gpfFunc("return function " + name + "(args) {" + "this.constructor.apply(this, args);" + "};")();
                Proxy.prototype = objectClass.prototype;
                return function () {
                    return new Proxy(arguments);
                };
            }();
        },
        /**
     * gpf.define handler for attributes
     *
     * @type {Function}
     * @private
     */
        _gpfDefAttrBase = _gpfGenDefHandler("gpf.attributes", "Attribute"),
        /**
     * gpf.define for attributes
     *
     * @param {String} name Attribute name. If it contains a dot, it is
     * treated as absolute contextual. Otherwise, it is relative to
     * "gpf.attributes". If starting with $ (and no dot), the contextual name
     * will be the "gpf.attributes." + name(without $) + "Attribute" and an
     * alias is automatically created (otherwise, use $Alias attribute on class)
     * @param {Function|string} [base=undefined] base Base attribute
     * (or contextual name)
     * @param {Object} [definition=undefined] definition Attribute definition
     * @return {Function}
     * @private
     */
        _gpfDefAttr = function (name, base, definition) {
            var isAlias = name.charAt(0) === "$", fullName, result;
            if (isAlias) {
                name = name.substr(1);
                fullName = name + "Attribute";
            } else {
                fullName = name;
            }
            result = _gpfDefAttrBase(fullName, base, definition);
            if (isAlias) {
                _gpfAlias(result, name);
            }
            return result;
        };
    /**
 * Base class for any attribute
 *
 * @class gpf.attributes.Attribute
 */
    _gpfDefAttr("Attribute", {
        protected: {
            /**
         * Name of the member the attribute is associated to
         *
         * @type {String}
         * @protected
         * @friend {gpf.attributes.add}
         */
            _member: "",
            /**
         * This method is the implementation of the attribute: it receives
         * the prototype to alter.
         *
         * NOTE: this is called *after* all declared members are set
         *
         * @param {Object} objPrototype Class prototype
         * @protected
         * @friend {gpf.attributes.add}
         */
            _alterPrototype: function (objPrototype) {
                _gpfIgnore(objPrototype);
            }
        },
        public: {
            /**
         * Get the member name
         *
         * @return {String}
         */
            member: function () {
                return this._member;
            }
        }
    });
    /**
 * Generates an alias for the attribute. An alias is a factory function that
 * allocates an attribute instance (parameters are forwarded).
 * As a result, instead of using:
 * "[Class]" : [new gpf.attributes.AliasAttribute("Name")]
 * It is reduced to:
 * "[Class]" : [$Alias("Name")]
 *
 * @param {String} name Name of the alias to build below gpf
 *
 * @class gpf.attributes.AliasAttribute
 * @extends gpf.attributes.Attribute
 * @alias gpf.$Alias
 */
    _gpfDefAttr("$Alias", {
        private: {
            /**
         * Name of the alias to create
         *
         * @type {String}
         * @private
         */
            _name: ""
        },
        protected: {
            /**
         * @inheritdoc gpf.attributes.Attribute:_alterPrototype
         */
            _alterPrototype: function (objPrototype) {
                _gpfAlias(objPrototype.constructor, this._name);
            }
        },
        public: {
            /**
         * Defines an alias
         *
         * @param {String} name Name of the alias to create
         * @constructor
         */
            constructor: function (name) {
                this._name = name;
            }
        }
    });
    /**
 * Attribute array, generally used to list attributes on a class member
 *
 * @class gpf.attributes.Array
 * TODO implements gpf.interfaces.IReadOnlyArray
 */
    gpf.define("gpf.attributes.Array", {
        private: {
            /**
         * @type {gpf.attributes.Attribute[]}
         * @private
         */
            _array: []
        },
        public: {
            /**
         * @constructor
         */
            constructor: function () {
                this._array = [];    // Create a new instance of the array
            },
            /**
         * @inheritdoc gpf.interfaces.IReadOnlyArray:getItemsCount
         *
         * NOTE: this implementation will be replaced with the one coming
         * from IReadOnlyArray (once i_array.js is loaded)
         */
            getItemsCount: function () {
                return this._array.length;
            },
            /**
         * @inheritdoc gpf.interfaces.IReadOnlyArray:getItem
         *
         * NOTE: this implementation will be replaced with the one coming
         * from IReadOnlyArray (once i_array.js is loaded)
         */
            getItem: function (index) {
                return _gpfArrayOrItem(this._array, index);
            },
            /**
         * Return the first occurrence of the expected class
         *
         * @param {gpf.attributes.Attribute} expectedClass the class to
         * match
         * @return {gpf.attributes.Attribute}
         */
            has: function (expectedClass) {
                gpf.ASSERT("function" === typeof expectedClass, "Expected a class parameter");
                gpf.ASSERT(expectedClass.prototype instanceof _gpfA.Attribute, "Expected an Attribute-like class parameter");
                var idx, array = this._array, len = array.length, item;
                for (idx = 0; idx < len; ++idx) {
                    item = array[idx];
                    if (item instanceof expectedClass) {
                        return item;
                    }
                }
                return null;
            },
            /**
         * Returns a new array with all attributes matching the expected
         * class
         *
         * @param {Function} expectedClass the class to match
         * @return {gpf.attributes.Array}
         */
            filter: function (expectedClass) {
                gpf.ASSERT("function" === typeof expectedClass, "Expected a class parameter");
                gpf.ASSERT(expectedClass.prototype instanceof _gpfA.Attribute, "Expected an Attribute-like class parameter");
                var idx, array = this._array, len = array.length, attribute, result = new _gpfA.Array(), resultArray = result._array;
                for (idx = 0; idx < len; ++idx) {
                    attribute = array[idx];
                    if (attribute instanceof expectedClass) {
                        resultArray.push(attribute);
                    }
                }
                return result;
            },
            /**
         * Apply the callback for each attribute in the array.
         * If the callback returns anything, the loop stops and the result
         * is returned to the caller.
         *
         * @param {Function} callback will receive parameters
         * - {Number} index
         * - {gpf.attributes.Attribute} attribute
         * - {Number} array length
         *
         * If a result is returned, the enumeration stops and this result is
         * returned
         * @return {*} undefined by default
         */
            each: function (callback) {
                return _gpfArrayEachWithResult(this._array, callback, undefined);
            }
        }
    });
    /**
 * Attribute map, generally used to list attributes of a class
 *
 * @class gpf.attributes.Map
 */
    gpf.define("gpf.attributes.Map", {
        private: {
            /**
         * @type {Object} Map(String,gpf.attributes.Array)
         * @private
         */
            _members: {},
            /**
         * @type {Number}
         * @private
         */
            _count: 0,
            /**
         * Copy the content of this map to a new one
         *
         * @param {gpf.attributes.Map} attributesMap recipient of the copy
         * @param {Function} [callback=undefined] callback callback function
         * to test if the mapping should be added
         * @param {*} [param=undefined] param additional parameter for the
         * callback
         * @private
         */
            _copyTo: function (attributesMap, callback, param) {
                var members = this._members, member, array, idx, attribute;
                if (this._count) {
                    for (member in members) {
                        if (members.hasOwnProperty(member)) {
                            array = members[member]._array;
                            for (idx = 0; idx < array.length; ++idx) {
                                attribute = array[idx];
                                if (!callback || callback(member, attribute, param)) {
                                    attributesMap.add(member, attribute);
                                }
                            }
                        }
                    }
                }
            },
            /**
         * Callback for _copyTo, test if attribute is of a given class
         *
         * @param {String} member
         * @param {gpf.attributes.Attribute} attribute
         * @param {Function} expectedClass
         * @return {Boolean}
         * @private
         */
            _filterCallback: function (member, attribute, expectedClass) {
                _gpfIgnore(member);
                return attribute instanceof expectedClass;
            }
        },
        public: {
            /**
         * @param {Object|Function} [object=undefined] object Object or
         * constructor to read attributes from
         *
         * @constructor
         */
            constructor: function (object) {
                var classDef;
                this._members = {};
                // Creates a new dictionary
                this._count = 0;
                if (object instanceof Function) {
                    classDef = _gpfGetClassDefinition(object);
                    this.fillFromClassDef(classDef);
                } else if (undefined !== object) {
                    this.fillFromObject(object);
                }
            },
            /**
         * Gives the total number of attributes enclosed in the map
         *
         * @return {Number}
         */
            count: function () {
                return this._count;
            },
            /**
         * Associate an attribute to a member
         *
         * @param {String} member member name
         * @param {gpf.attributes.Attribute} attribute attribute to map
         */
            add: function (member, attribute) {
                var array = this._members[member];
                if (undefined === array) {
                    array = this._members[member] = new _gpfA.Array();
                }
                array._array.push(attribute);
                ++this._count;
            },
            /**
         * Fill the map using object's attributes
         *
         * @param {Object} object object to get attributes from
         * @return {Number} number of attributes in the resulting map
         */
            fillFromObject: function (object) {
                var classDef = _gpfGetClassDefinition(object.constructor);
                return this.fillFromClassDef(classDef);
            },
            /**
         * Fill the map using class definition object
         *
         * @param {gpf.classDef} classDef class definition
         * @return {Number} number of attributes in the resulting map
         */
            fillFromClassDef: function (classDef) {
                var attributes, Super;
                while (classDef) {
                    // !undefined && !null
                    attributes = classDef.attributes();
                    if (attributes) {
                        attributes._copyTo(this);
                    }
                    Super = classDef.Super();
                    if (Super !== Object) {
                        // Can't go upper
                        classDef = _gpfGetClassDefinition(Super);
                    } else {
                        break;
                    }
                }
                return this._count;
            },
            /**
         * Creates a new map that contains only instances of the given
         * attribute class
         *
         * @param {Function} expectedClass
         * @return {gpf.attributes.Map}
         */
            filter: function (expectedClass) {
                gpf.ASSERT("function" === typeof expectedClass, "Expected a class parameter");
                gpf.ASSERT(expectedClass.prototype instanceof _gpfA.Attribute, "Expected an Attribute-like class parameter");
                var result = new _gpfA.Map();
                this._copyTo(result, this._filterCallback, expectedClass);
                return result;
            },
            /**
         * Returns the array of map associated to a member
         *
         * @param {String} name
         * @return {gpf.attributes.Array}
         */
            member: function (name) {
                /**
             * When member is a known Object member (i.e. constructor),
             * this generates weird results. Filter out by testing the
             * result type.
             */
                var result = this._members[name];
                if (undefined === result || !(result instanceof _gpfA.Array)) {
                    if (0 === _gpfEmptyMemberArray) {
                        _gpfEmptyMemberArray = new _gpfA.Array();
                    }
                    result = _gpfEmptyMemberArray;
                }
                return result;
            },
            /**
         * Returns the list of members stored in this map
         *
         * @perf_warn Result is computed on each call
         * @return {String[]}
         */
            members: function () {
                var members = this._members, result = [], member;
                for (member in members) {
                    if (members.hasOwnProperty(member)) {
                        result.push(member);
                    }
                }
                return result;
            },
            /**
         * Apply the callback for each member in the map.
         * If the callback returns anything, the loop stops and the result
         * is returned to the caller.
         *
         * @param {Function} callback will receive parameters
         * - {String} member
         * - {gpf.attributes.Array} attribute
         *
         * If a result is returned, the enumeration stops and this result is
         * returned
         * @return {*} undefined by default
         */
            each: function (callback) {
                return _gpfDictionaryEachWithResult(this._members, callback, undefined);
            },
            /**
         * Add the attributes contained in the map to the given prototype
         *
         * @param {Function} objectClass
         */
            addTo: function (objectClass) {
                var members = this._members, member;
                for (member in members) {
                    if (members.hasOwnProperty(member)) {
                        _gpfA.add(objectClass, member, members[member]);
                    }
                }
            }
        }
    });
    /**
 * Add the attribute list to the given prototype associated with the
 * provided member name
 *
 * @param {Function} objectClass class constructor
 * @param {String} name member name
 * @param {gpf.attributes.Array
 *        |gpf.attributes.Attribute
 *        |gpf.attributes.Attribute[]} attributes
 */
    _gpfA.add = function (objectClass, name, attributes) {
        // Check attributes parameter
        if (attributes instanceof _gpfA.Array) {
            attributes = attributes._array;
        } else if (!(attributes instanceof Array)) {
            attributes = [attributes];
        }
        var objectClassOwnAttributes, len, idx, attribute;
        objectClassOwnAttributes = _gpfGetClassDefinition(objectClass).attributes();
        len = attributes.length;
        for (idx = 0; idx < len; ++idx) {
            attribute = attributes[idx];
            gpf.ASSERT(attribute instanceof _gpfA.Attribute, "Expected attribute");
            attribute._member = name;
            // Assign member name
            objectClassOwnAttributes.add(name, attribute);
            attribute._alterPrototype(objectClass.prototype);
        }
    };
    _gpfErrorDeclare("a_attributes", {
        OnlyForAttributeClass: "The attribute {attributeName} can be used only on an Attribute class",
        OnlyOnClassForAttributeClass: "The attribute {attributeName} must be used on Class",
        ClassOnlyAttribute: "The attribute {attributeName} can be used only for Class",
        MemberOnlyAttribute: "The attribute {attributeName} can be used only for members",
        UniqueAttributeConstraint: "Attribute {attributeName} already defined on {className}",
        UniqueMemberAttributeConstraint: "Attribute {attributeName} already defined on {className}::{memberName}"
    });
    var
        /**
     * Restricts the usage of an attribute to an attribute class only.
     *
     * @class gpf.attributes.AttrClassOnlyAttribute
     * @extends gpf.attributes.Attribute
     */
        _GpfAttrOnly = _gpfDefAttr("AttrClassOnlyAttribute", {
            protected: {
                /**
             * @inheritdoc gpf.attributes.Attribute:_alterPrototype
             */
                _alterPrototype: function (objPrototype) {
                    if (!(objPrototype instanceof _gpfA.Attribute)) {
                        throw gpf.Error.OnlyForAttributeClass({ attributeName: _gpfGetClassDefinition(this.constructor).name() });
                    }
                    if (this._member !== "Class") {
                        throw gpf.Error.OnlyOnClassForAttributeClass({ attributeName: _gpfGetClassDefinition(this.constructor).name() });
                    }
                }
            }
        }),
        /**
     * Provide mechanism to validate the USE of an attribute
     *
     * @class gpf.attributes.AttrConstraintAttribute
     * @extends gpf.attributes.AttrClassOnlyAttribute
     */
        _gpfAttrConstraint = _gpfDefAttr("AttrConstraintAttribute", _GpfAttrOnly, {
            static: {
                /**
             * @property {String} originalAlterPrototype Name used to remember
             * the original _alterPrototype handler
             */
                originalAlterPrototype: "_alterPrototype:checked"
            },
            private: {
                /**
             * Check that all attribute constraints are respected before calling
             * the original _alterPrototype
             *
             * WARNING: this actually is the target attribute
             *
             * @param objPrototype
             * @private
             */
                _checkAndAlterPrototype: function (objPrototype) {
                    var statics = _gpfA.AttrConstraintAttribute, originalAlterPrototype = statics.originalAlterPrototype, targetAttribute = this, attributes;
                    // Get constraints set for THIS attribute
                    attributes = new _gpfA.Map(this);
                    attributes.filter(_gpfAttrConstraint).each(function (member, attributes) {
                        _gpfIgnore(member);
                        var len = attributes.getItemsCount(), idx;
                        for (idx = 0; idx < len; ++idx) {
                            attributes.getItem(idx)._check(targetAttribute, objPrototype);
                        }
                    });
                    // OK, call _alterPrototype
                    targetAttribute[originalAlterPrototype].apply(targetAttribute, [objPrototype]);
                }
            },
            protected: {
                /**
             * Throws an exception if target attribute can't be applied to
             * objPrototype
             *
             * @param {gpf.attributes.Attribute} targetAttribute
             * @param {Object} objPrototype
             * @private
             */
                _check: function (targetAttribute, objPrototype) {
                    _gpfIgnore(targetAttribute);
                    _gpfIgnore(objPrototype);
                    throw gpf.Error.Abstract();
                },
                /**
             * @inheritdoc gpf.attributes.Attribute:_alterPrototype
             * @closure
             */
                _alterPrototype: function (objPrototype) {
                    var statics = _gpfA.AttrConstraintAttribute, originalAlterPrototype = statics.originalAlterPrototype;
                    // Inherited method will take care of checking attribute class
                    this._super(objPrototype);
                    /**
                 * Several constraint attributes might be defined, check if
                 * the _alterPrototype has already been overridden
                 */
                    if (undefined === objPrototype[originalAlterPrototype]) {
                        objPrototype[originalAlterPrototype] = objPrototype._alterPrototype;
                        objPrototype._alterPrototype = this._checkAndAlterPrototype;
                    }
                }
            }
        });
    /**
 * Used on attribute classes to mark them as class attribute (i.e. they can't
 * be used on members)
 *
 * @class gpf.attributes.ClassAttributeAttribute
 * @extends gpf.attributes.AttrConstraintAttribute
 * @alias gpf.$ClassAttribute
 */
    _gpfDefAttr("$ClassAttribute", _gpfAttrConstraint, {
        protected: {
            /**
         * @inheritdoc gpf.attributes.AttrConstraintAttribute:_check
         */
            _check: function (targetAttribute) {
                if (targetAttribute.member() !== "Class") {
                    var attributeClass = targetAttribute.constructor, attributeClassDef = _gpfGetClassDefinition(attributeClass);
                    throw gpf.Error.ClassOnlyAttribute({ attributeName: attributeClassDef.name() });
                }
            }
        }
    });
    /**
 * Used on attribute classes to mark them as member attribute (i.e. they can't
 * be used on Class)
 *
 * @class gpf.attributes.MemberAttributeAttribute
 * @extends gpf.attributes.AttrConstraintAttribute
 * @alias gpf.$MemberAttribute
 */
    _gpfDefAttr("$MemberAttribute", _gpfAttrConstraint, {
        protected: {
            /**
         * @inheritdoc gpf.attributes.AttrConstraintAttribute:_check
         */
            _check: function (targetAttribute) {
                if (targetAttribute.member() === "Class") {
                    var attributeClass = targetAttribute.constructor, attributeClassDef = _gpfGetClassDefinition(attributeClass);
                    throw gpf.Error.MemberOnlyAttribute({ attributeName: attributeClassDef.name() });
                }
            }
        }
    });
    /**
 * Used on attribute classes to mark them as unique through the class hierarchy
 * or per member.
 * If one try to define it more than once, an error is raised.
 *
 * @class gpf.attributes.UniqueAttributeAttribute
 * @extends gpf.attributes.AttrConstraintAttribute
 * @alias gpf.$UniqueAttribute
 */
    _gpfDefAttr("$UniqueAttribute", _gpfAttrConstraint, {
        private: {
            /**
         * The attribute is unique for the whole class when true or per member
         * when false.
         *
         * @type {Boolean}
         * @private
         */
            _classScope: true
        },
        protected: {
            /**
         * @inheritdoc gpf.attributes.AttrConstraintAttribute:_check
         */
            _check: function (targetAttribute, objPrototype) {
                var objectClass, objectClassDef, objectClassAttributes, attributeClass, attributeClassDef, attributesInObj, member = targetAttribute.member();
                // Get object class definition & attributes
                objectClass = objPrototype.constructor;
                objectClassDef = _gpfGetClassDefinition(objectClass);
                objectClassAttributes = new _gpfA.Map(objectClass);
                // Get attribute class definition & attributes
                attributeClass = targetAttribute.constructor;
                attributeClassDef = _gpfGetClassDefinition(attributeClass);
                attributesInObj = objectClassAttributes.filter(attributeClass);
                // Don't forget that targetAttribute is already added to the object
                if (this._classScope) {
                    if (1 < attributesInObj.count()) {
                        throw gpf.Error.UniqueAttributeConstraint({
                            attributeName: attributeClassDef.name(),
                            className: objectClassDef.name()
                        });
                    }
                } else if (1 < attributesInObj.member(member).getItemsCount()) {
                    throw gpf.Error.UniqueMemberAttributeConstraint({
                        attributeName: attributeClassDef.name(),
                        className: objectClassDef.name(),
                        memberName: member
                    });
                }
            }
        },
        public: {
            /**
         * Restricts attribute multiplicity
         *
         * @param {Boolean} [classScope=true] classScope True to set limit to
         * one instance per class (including hierarchy) or false to limit to one
         * instance per member.
         * @constructor
         */
            constructor: function (classScope) {
                if (undefined !== classScope) {
                    this._classScope = true === classScope;
                }
            }
        }
    });
    var
        /**
     * Read-only property accessor template
     *
     * @return {*}
     */
        _gpfROProperty = function () {
            return this._MEMBER_;
        },
        /**
     * Property accessor template
     *
     * @return {*}
     */
        _gpfRWProperty = function () {
            var result = this._MEMBER_;
            if (0 < arguments.length) {
                this._MEMBER_ = arguments[0];
            }
            return result;
        },
        /**
     * Base class for class-specific attributes
     *
     * @class gpf.attributes._gpfClassAttribute
     * @extends gpf.attributes.Attribute
     */
        _gpfClassAttribute = _gpfDefAttr("ClassAttribute"),
        /**
     * alias for gpf.attributes.ClassNonSerializedAttribute
     *
     * @type {Function}
     */
        _gpfANoSerial;
    /**
 * Creates getter (and setter) methods for a private member. The created
 * accessor is a method with the following signature:
 * {type} MEMBER({type} [value=undefined] value)
 * When value is not set, the member acts as a getter
 *
 *
 * @class gpf.attributes.ClassPropertyAttribute
 * @extends gpf.attributes._gpfClassAttribute
 * @alias gpf.$ClassProperty
 */
    _gpfDefAttr("$ClassProperty", _gpfClassAttribute, {
        "[Class]": [
            gpf.$MemberAttribute(),
            gpf.$UniqueAttribute(false)
        ],
        private: {
            /**
         * If true, generates a write wrapper
         *
         * @type {Boolean}
         * @private
         */
            _writeAllowed: false,
            /**
         * If set, provides the member name. Otherwise, name is based on
         * member.
         *
         * @type {String|undefined}
         * @private
         */
            _publicName: undefined,
            /**
         * If set, provides the member visibility.
         * Default is 'public'
         * member.
         *
         * @type {String|undefined}
         * @private
         */
            _visibility: undefined
        },
        protected: {
            /**
         * @inheritdoc gpf.attributes.Attribute:_alterPrototype
         */
            _alterPrototype: function (objPrototype) {
                var member = this._member, publicName = this._publicName, classDef = _gpfGetClassDefinition(objPrototype.constructor), params, src, start, end;
                if (!publicName) {
                    // TODO check if member really starts with _
                    publicName = member.substr(1);    // starts with _
                }
                if (this._writeAllowed) {
                    // Parameter is not used but this will change function length
                    params = ["value"];
                    src = _gpfRWProperty.toString();
                } else {
                    params = [];
                    src = _gpfROProperty.toString();
                }
                // Replace all occurrences of _MEMBER_ with the right name
                src = src.split("_MEMBER_").join(member);
                // Extract content of resulting function source
                start = src.indexOf("{") + 1;
                end = src.lastIndexOf("}") - 1;
                src = src.substr(start, end - start + 1);
                classDef.addMember(publicName, _gpfFunc(params, src), this._visibility);
            }
        },
        public: {
            /**
         * @param {Boolean} writeAllowed
         * @param {String} [publicName=undefined] publicName When not
         * specified, the member name (without _) is applied
         * @param {String} [visibility=undefined] visibility When not
         * specified, public is used
         * @constructor
         */
            constructor: function (writeAllowed, publicName, visibility) {
                if (writeAllowed) {
                    this._writeAllowed = true;
                }
                if ("string" === typeof publicName) {
                    this._publicName = publicName;
                }
                if ("string" === typeof visibility) {
                    this._visibility = visibility;
                }
            }
        }
    });
    /**
 * Used to flag a method which owns a last parameter being an event handler
 *
 * @class gpf.attributes.ClassEventHandlerAttribute
 * @extends gpf.attributes._gpfClassAttribute
 * @alias gpf.$ClassEventHandler
 */
    _gpfDefAttr("$ClassEventHandler", _gpfClassAttribute, {
        "[Class]": [
            gpf.$MemberAttribute(),
            gpf.$UniqueAttribute(false)
        ]
    });
    /**
 * Used to flag a member as non serializable
 *
 * @class gpf.attributes.ClassNonSerializedAttribute
 * @extends gpf.attributes._gpfClassAttribute
 * @alias gpf.$ClassNonSerialized
 */
    _gpfANoSerial = _gpfDefAttr("$ClassNonSerialized", _gpfClassAttribute, {
        "[Class]": [
            gpf.$MemberAttribute(),
            gpf.$UniqueAttribute(false)
        ]
    });
    /**
 * Defines a class extension (internal)
 *
 * @param {String} ofClass
 * @param {String} [publicName=undefined] publicName When not specified, the
 * original method name is used
 *
 * @class gpf.attributes.ClassExtensionAttribute
 * @extends gpf.attributes._gpfClassAttribute
 * @alias gpf.$ClassExtension
 */
    _gpfDefAttr("$ClassExtension", _gpfClassAttribute, {
        private: {
            /**
         * Constructor of the class to extend
         *
         * @type {Function}
         * @private
         */
            _ofClass: _gpfEmptyFunc,
            /**
         * Name of the method if added to the class
         *
         * @type {String}
         * @private
         */
            _publicName: ""
        },
        public: {
            /**
         * @param {Function} ofClass Constructor of the class to extend
         * @param {String} publicName Name of the method if added to the
         * class
         * @constructor
         */
            constructor: function (ofClass, publicName) {
                this._ofClass = ofClass;
                if ("string" === typeof publicName) {
                    this._publicName = publicName;
                }
            }
        }
    });
    _gpfErrorDeclare("interfaces", { InterfaceExpected: "Expected interface not implemented: {name}" });
    var
    /**
     * gpf.attributes shortcut
     *
     * @type {Object}
     * @private
     */
    _gpfI = gpf.interfaces = {
        /**
         * Verify that the object implements the current interface
         *
         * @param {Object|Function} inspectedObject object (or class) to inspect
         * @param {gpf.interfaces.Interface} interfaceDefinition reference
         * interface
         * @return {Boolean}
         */
        isImplementedBy: function (inspectedObject, interfaceDefinition) {
            var member, memberReference, memberValue, memberType;
            if (inspectedObject instanceof Function) {
                inspectedObject = inspectedObject.prototype;
            }
            /*
             * IMPORTANT note: we test the object itself (i.e. own members and
             * the prototype). That's why the hasOwnProperty is skipped
             */
            /*jslint forin:false*/
            for (member in interfaceDefinition.prototype) {
                if ("constructor" === member    // Object
|| "extend" === member) {
                    // gpf.Class
                    continue;
                }
                memberReference = interfaceDefinition.prototype[member];
                memberValue = inspectedObject[member];
                memberType = typeof memberValue;
                if (typeof memberReference !== memberType) {
                    return false;
                }
                if ("function" === memberType && memberReference.length !== memberValue.length) {
                    return false;
                }
            }
            /*jslint forin:true*/
            return true;
        },
        /**
         * Retrieve an object implementing the expected interface from an
         * object.
         * This is done in two passes:
         * - Either the object implements the interface, it is returned
         * - Or the object implements IUnknown, then queryInterface is used
         *
         * @param {Object} objectInstance object to inspect
         * @param {gpf.interfaces.Interface} interfaceDefinition reference
         * interface
         * @param {Boolean} [throwError=true] throwError Throws an error if the
         * interface is not found (otherwise, null is returned)
         * @return {Object|null}
         */
        query: function (objectInstance, interfaceDefinition, throwError) {
            var result = null;
            if (gpf.interfaces.isImplementedBy(objectInstance, interfaceDefinition)) {
                return objectInstance;
            } else if (gpf.interfaces.isImplementedBy(objectInstance, gpf.interfaces.IUnknown)) {
                result = objectInstance.queryInterface(interfaceDefinition);
            }
            if (undefined === throwError) {
                throwError = true;
            }
            if (null === result && throwError) {
                throw gpf.Error.InterfaceExpected({ name: _gpfGetClassDefinition(interfaceDefinition).name() });
            }
            return result;
        }
    };
    /**
 * Defines an interface (relies on gpf.define)
 *
 * @param {String} name Interface name. If it contains a dot, it is
 * treated as absolute contextual. Otherwise, it is relative to
 * "gpf.interfaces"
 * @param {Function|string} [base=undefined] base Base interface
 * (or contextual name)
 * @param {Object} [definition=undefined] definition Interface definition
 * @return {Function}
 * @private
 */
    var _gpfDefIntrf = _gpfGenDefHandler("gpf.interfaces", "Interface");
    _gpfDefIntrf("Interface");
    //region IEventTarget
    _gpfDefIntrf("IEventDispatcher", {
        /**
     * Add an event listener to the target
     *
     * @param {String} event name
     * @param {Function|gpf.Callback} callback
     * @param {Object|Boolean} scope scope of callback or useCapture
     * parameter. NOTE: if a gpf.Callback object is used and a scope
     * specified, a new gpf.Callback object is created.
     * @param {Boolean} [useCapture=false] useCapture push it on top of the
     * triggering queue
     * @return {gpf.interfaces.IEventDispatcher}
     * @chainable
     */
        addEventListener: function (event, callback, useCapture) {
            _gpfIgnore(event);
            _gpfIgnore(callback);
            _gpfIgnore(useCapture);
            return this;
        },
        /**
     * Remove an event listener to the target
     *
     * @param {String} event name
     * @param {Function|gpf.Callback} callback
     * @param {Object} [scope=undefined] scope scope of callback
     * @return {gpf.interfaces.IEventDispatcher}
     * @chainable
     */
        removeEventListener: function (event, callback) {
            _gpfIgnore(event);
            _gpfIgnore(callback);
            return this;
        }
    });
    //endregion
    //region IUnknown
    /**
 * Provide a way for any object to implement an interface using an
 * intermediate object (this avoids overloading the object with temporary
 * / useless members)
 */
    _gpfDefIntrf("IUnknown", {
        /**
     * Retrieves an object supporting the provided interface
     * (maybe the object itself)
     *
     * @param {gpf.interfaces.Interface} interfaceDefinition The expected
     * interface
     * @return {Object|null} The object supporting the interface (or null)
     */
        queryInterface: function (interfaceDefinition) {
            _gpfIgnore(interfaceDefinition);
            return null;
        }
    });
    //endregion
    //region InterfaceImplement attribute
    /**
 * Retrieves an object supporting the provided interface
 * (maybe the object itself). This function (added to any object declaring
 * the attribute InterfaceImplementAttribute with a builder) uses the
 * InterfaceImplementAttribute attribute list to see if the one
 * corresponding to the interface provides a builder and calls it
 *
 * @param {gpf.interfaces.Interface} interfaceDefinition The expected
 * interface
 * @return {Object|null} The object supporting the interface (or null)
 */
    function _queryInterface(interfaceDefinition) {
        /*jslint -W040*/
        var array = new gpf.attributes.Map(this).member("Class").filter(gpf.attributes.InterfaceImplementAttribute), idx, attribute, builder;
        for (idx = 0; idx < array.getItemsCount(); ++idx) {
            attribute = array.getItem(idx);
            builder = attribute._builder;
            if (attribute._interfaceDefinition === interfaceDefinition && builder) {
                if ("function" === typeof builder) {
                    return builder(this);
                }
                // Expects a member name
                return this[builder]();
            }
        }
        // Otherwise
        return null;    /*jslint +W040*/
    }
    /**
 * Creates a wrapper calling _queryInterface and, if no result is built, the
 * original one defined in the object prototype.
 *
 * @param {Function} orgQueryInterface
 * @private
 * @closure
 */
    function _wrapQueryInterface(orgQueryInterface) {
        return function () {
            var result = _queryInterface.apply(this, arguments);
            if (null === result) {
                result = orgQueryInterface.apply(this, arguments);
            }
            return result;
        };
    }
    /**
 * Extend the class to provide an array-like interface
 *
 * @param {Function} interfaceDefinition Implemented interface definition
 * @param {Function|String} [queryInterfaceBuilder=undefined]
 * queryInterfaceBuilder. Function or member name to executed if the implemented
 * interface is requested
 *
 * @class gpf.attributes.ClassArrayInterfaceAttribute
 * @extends gpf.attributes.ClassAttribute
 * @alias gpf.$ClassIArray
 */
    _gpfDefAttr("$InterfaceImplement", {
        private: {
            /**
         * Interface definition
         *
         * @type {Function}
         * @private
         */
            "[_interfaceDefinition]": [gpf.$ClassProperty(false, "which")],
            _interfaceDefinition: _gpfEmptyFunc,
            /**
         * Builder function
         *
         * @type {Function|null}
         * @private
         */
            "[_builder]": [gpf.$ClassProperty(false, "how")],
            _builder: null
        },
        protected: {
            /**
         * @inheritdoc gpf.attributes.Attribute:_alterPrototype
         */
            _alterPrototype: function (objPrototype) {
                var iProto = this._interfaceDefinition.prototype, iClassDef = _gpfGetClassDefinition(this._interfaceDefinition), member, attributes;
                // Get the interface's attributes apply them to the obj
                attributes = new gpf.attributes.Map();
                attributes.fillFromClassDef(iClassDef);
                attributes.addTo(objPrototype.constructor);
                if (!this._builder) {
                    // Fill the missing methods
                    /*jshint -W089*/
                    // Because I also want inherited ones
                    for (member in iProto) {
                        if (!(member in objPrototype)) {
                            objPrototype[member] = iProto[member];
                        }
                    }
                    return;
                }
                // Handle the queryInterface logic
                if (undefined !== objPrototype.queryInterface) {
                    /*
                 * Two situations here:
                 * - Either the class (or one of its parent) already owns
                 *   the $InterfaceImplement attribute
                 * - Or the class (or one of its parent) implements its
                 *   own queryInterface
                 * In that last case, wrap it to use the attribute version
                 * first
                 *
                 * In both case, we take the assumption that the class
                 * already owns
                 * gpf.$InterfaceImplement(gpf.interfaces.IUnknown)
                 */
                    if (_queryInterface !== objPrototype.queryInterface) {
                        objPrototype.queryInterface = _wrapQueryInterface(objPrototype.queryInterface);
                    }
                } else {
                    objPrototype.queryInterface = _queryInterface;
                    gpf.attributes.add(objPrototype.constructor, "Class", [gpf.$InterfaceImplement(gpf.interfaces.IUnknown)]);
                }
            }    /*jshint +W089*/
        },
        public: {
            /**
         * @param {Function} interfaceDefinition Interface definition
         * @param {Function|null} [queryInterfaceBuilder=null]
         * queryInterfaceBuilder Builder function
         * @constructor
         */
            constructor: function (interfaceDefinition, queryInterfaceBuilder) {
                this._interfaceDefinition = interfaceDefinition;
                if (queryInterfaceBuilder) {
                    this._builder = queryInterfaceBuilder;
                }
            }
        }
    });    //endregion
    _gpfErrorDeclare("i_enumerator", { EnumerableInvalidMember: "$Enumerator can be associated to arrays only" });
    /**
 * Enumerable interface
 *
 * @class gpf.interfaces.IEnumerator
 * @extends gpf.interfaces.Interface
 */
    _gpfDefIntrf("IEnumerator", {
        /**
     * Sets the enumerator to its initial position, which is *before* the
     * first element in the collection.
     *
     * NOTE once reset has been called, you must call moveNext to access (or
     * not)the first element.
     */
        reset: function () {
        },
        /**
     * Moves the enumerator to the next element of the enumeration.
     *
     * @param {gpf.events.Handler} eventsHandler
     * @return {Boolean}
     * - true if the enumerator was successfully advanced to the next element
     * - false if the enumerator has passed the end of the collection or it has
     *   to go through an asynchronous operation
     *
     * NOTE: if no eventsHandler is specified, no asynchronous operation will
     * be triggered when false is returned.
     *
     * @event gpf.events.EVENT_DATA
     * The asynchronous operation succeeded, the current item is available
     *
     * @event gpf.events.EVENT_END_OF_DATA
     * No more data is available
     */
        "[moveNext]": [gpf.$ClassEventHandler()],
        moveNext: function (eventsHandler) {
            _gpfIgnore(eventsHandler);
            return false;
        },
        /**
     * Gets the current element in the collection.
     *
     * @return {*}
     */
        current: function () {
            return null;
        },
        static: {
            /**
         * Enumerates all elements of the enumerator and call the callback
         * function.
         *
         * NOTE: reset is *not* called.
         *
         * @param {gpf.interfaces.IEnumerator} enumerator
         * @param {Function} callback receive each item of the enumerator,
         * signature is either:
         * - {*} element
         *
         * or
         * - {*} element
         * - {gpf.events.Handler} eventsHandler
         *
         * If the signature supports two parameter, the last one will be used
         * to control the iteration. The callback function has to trigger
         * - gpf.events.EVENT_CONTINUE
         * - gpf.events.EVENT_STOP
         *
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event gpf.events.EVENT_END_OF_DATA
         * No more data is available, the each function terminated
         *
         * @event gpf.events.EVENT_STOPPED
         * The processing function requested to stop enumeration
         */
            // TODO how to put attributes on static members?
            // "[each]": [gpf.$ClassEventHandler()],
            each: function (enumerator, callback, eventsHandler) {
                var iEnumerator = _gpfI.query(enumerator, _gpfI.IEnumerator), end = function (event) {
                        _gpfEventsFire.apply(enumerator, [
                            event,
                            {},
                            eventsHandler
                        ]);
                    }, process;
                if (1 < callback.length) {
                    process = function (event) {
                        if (gpf.events.EVENT_CONTINUE === event.type) {
                            if (!iEnumerator.moveNext(process)) {
                                return;
                            }
                        } else if (gpf.events.EVENT_STOP === event.type) {
                            return end(gpf.events.EVENT_STOPPED);
                        } else if (gpf.events.EVENT_DATA !== event.type) {
                            return end(event.type);
                        }
                        callback(iEnumerator.current(), process);
                    };
                    if (iEnumerator.moveNext(process)) {
                        callback(iEnumerator.current(), process);
                    }
                } else {
                    process = function (event) {
                        if (gpf.events.EVENT_DATA !== event.type) {
                            return end(event.type);
                        }
                        do {
                            callback(iEnumerator.current());
                        } while (iEnumerator.moveNext(process));
                    };
                    while (iEnumerator.moveNext(process)) {
                        callback(iEnumerator.current());
                    }
                }
            }
        }
    });
    /**
 * Builds an enumerable interface based on an array
 *
 * @param {Object[]} array Base of the enumeration
 * @return {Object} Object implementing the IEnumerable interface
 * @private
 */
    function _gpfArrayEnumerator(array) {
        var pos = -1;
        return {
            reset: function () {
                pos = -1;
            },
            moveNext: function (eventsHandler) {
                var result;
                ++pos;
                result = pos < array.length;
                if (!result && eventsHandler) {
                    _gpfEventsFire.apply(this, [
                        _GPF_EVENT_END_OF_DATA,
                        {},
                        eventsHandler
                    ]);
                }
                return result;
            },
            current: function () {
                if (0 > pos || pos >= array.length) {
                    return undefined;
                }
                return array[pos];
            }
        };
    }
    /**
 * Interface builder that connects to the EnumerableAttribute attribute
 *
 * @param {Object} object
 * @return {Object} Object implementing the IEnumerable interface
 * @private
 */
    function _buildEnumeratorOnObjectArray(object) {
        // Look for related member
        var attributes = new _gpfA.Map(object).filter(_gpfA.EnumerableAttribute), members = attributes.members();
        return _gpfArrayEnumerator(object[members[0]]);
    }
    /**
 * Extend the class to provide an enumerator interface
 *
 * @class gpf.attributes.EnumerableAttribute
 * @extends gpf.attributes.ClassAttribute
 * @alias gpf.$Enumerable
 */
    _gpfDefAttr("$Enumerable", _gpfA.ClassAttribute, {
        "Class": [
            gpf.$UniqueAttribute(),
            gpf.$MemberAttribute()
        ],
        /**
     * @inheritDoc gpf.attributes.Attribute:_alterPrototype
     */
        _alterPrototype: function (objPrototype) {
            if (!_gpfIsArrayLike(objPrototype[this._member])) {
                throw gpf.Error.EnumerableInvalidMember();
            }
            _gpfA.add(objPrototype.constructor, "Class", [new _gpfA.InterfaceImplementAttribute(_gpfI.IEnumerator, _buildEnumeratorOnObjectArray)]);
        }
    });
    _gpfDefIntrf("IReadOnlyArray", {
        /**
     * Return the number of items in the array
     * @return {Number}
     */
        getItemsCount: function () {
            return 0;
        },
        /**
     * Return the item inside the array (idx is 0-based)
     *
     * @param {Number} idx index
     * @return {*}
     */
        getItem: function (idx) {
            _gpfIgnore(idx);
            return undefined;
        }
    });
    ///**
    // * Array interface
    // *
    // * @class gpf.interfaces.IArray
    // * @extends gpf.interfaces.IReadOnlyArray
    // */
    //_gpfDefIntrf("IArray", iROArray, {
    //
    //    /**
    //     * Set the item inside the array (idx is 0-based)
    //     * Return the value that was previously set (or undefined)
    //     *
    //     * @param {Number} idx index
    //     * @param {*} value
    //     * @return {*}
    //     */
    //    setItem: function (idx, value) {
    //        _gpfIgnore(idx);
    //        _gpfIgnore(value);
    //        return undefined;
    //    }
    //
    //});
    //endregion
    //region Class modifier to generate an array interface
    /**
 * Extend the class to provide an array-like interface
 *
 * @param {Boolean} [writeAllowed=false] writeAllowed Switch between read
 * only array and writable one
 *
 * @class gpf.attributes.ClassArrayInterfaceAttribute
 * @extends gpf.attributes.ClassAttribute
 * @alias gpf.$ClassIArray
 */
    _gpfDefAttr("$ClassIArray", _gpfA.ClassAttribute, {
        "Class": [
            gpf.$UniqueAttribute(),
            gpf.$MemberAttribute()
        ],
        private: {
            /**
         * @type {boolean}
         * @private
         */
            _writeAllowed: false
        },
        protected: {
            /**
         * @inheritDoc gpf.attributes.Attribute:_alterPrototype
         */
            _alterPrototype: function (objPrototype) {
                var implementedInterface;
                if (this._writeAllowed) {
                    implementedInterface = _gpfI.IArray;
                } else {
                    implementedInterface = _gpfI.IReadOnlyArray;
                }
                _gpfA.add(objPrototype.constructor, "Class", [gpf.$InterfaceImplement(implementedInterface)]);
                objPrototype.getItemsCount = _gpfFunc("return this." + this._member + ".length;");
                objPrototype.getItem = _gpfFunc(["_gpfArrayOrItem"], "return function (idx) { return _gpfArrayOrItem(this. " + this._member + ", idx); }")(_gpfArrayOrItem);
                if (this._writeAllowed) {
                    objPrototype.setItem = _gpfFunc("var i=arguments[0]," + "v=this." + this._name + "[i];this." + this._member + "[i]=arguments[1];return v;");
                }
            }
        },
        public: {
            constructor: function (writeAllowed) {
                if (writeAllowed) {
                    // TODO decide how to implement IArray
                    throw gpf.Error.NotImplemented();    //this._writeAllowed = true;
                }
            }
        }
    });
    // Alter gpf.attributes.Array class definition
    _gpfA.add(_gpfA.Array, "_array", [gpf.$ClassIArray(false)]);    //endregion
}));
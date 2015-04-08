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
     * <ul>
     *     <li>wscript: Microsoft cscript / wscript</li>
     *     <li>phantomjs: PhantomJS</li>
     *     <li>nodejs: NodeJS</li>
     *     <li>browser: Browser</li>
     *     <li>unknown: Unknown</li>
     * </ul>
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
            if (null === scope || "object" !== typeof scope) {
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
 *      <li>"wscript" for cscript and wscript</li>
 *      <li>"nodejs" for nodejs</li>
 *      <li>"phantomjs" for phantomjs</li>
 *      <li>"browser" for any browser</li>
 *      <li>"unknown" if not detected</li>
 * </ul>
 */
    gpf.host = function () {
        return _gpfHost;
    };
    /**
 * Resolve the provided evaluation path and returns the result
 *
 * @param {String|string[]} [path=undefined] path Dot separated list of
 * identifiers (or identifier array)
 * @return {*|undefined}
 * - when path is empty, it returns the current host higher object
 * - when path is "gpf" it returns the GPF object
 */
    gpf.context = function (path) {
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
            for (; idx < len; ++idx) {
                result = result[path[idx]];
                if (undefined === result) {
                    break;
                }
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
    var
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
     * @param {String} source
     * @returns {Function}
     * @private
     */
        _gpfFunc = function (source) {
            try {
                gpf.ASSERT("string" === typeof source && source.length, "Source expected (or use _gpfEmptyFunc)");
                return new _GpfFunc(source);
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
        type: "",
        scope: null,
        _params: {},
        get: function (name) {
            return this._params[name];
        },
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
            gpf.events.fire.apply(_gpfContext, parameters);
        },
        /**
     * @inheritdoc gpf.web.include
     * Implementation of gpf.web.include
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
        id: 0,
        src: "",
        eventsHandler: null,
        clean: function (domScript) {
            var parent = domScript.parentNode;
            domScript.onerror = domScript.onload = domScript.onreadystatechange = null;
            if (parent) {
                parent.removeChild(domScript);
            }
            // Destroy context mapping
            delete _GpfIncludeContext.map[this.id];
        },
        check: function (domScript) {
            var readyState = domScript.readyState;
            if (!readyState || -1 < [
                    "loaded",
                    "complete"
                ].indexOf(readyState)) {
                this.clean(domScript);
                // IE10: the event is triggered *before* the source is evaluated
                setTimeout(_gpfWebIncludeAsyncResult, 0, [
                    "load",
                    { url: this.src },
                    this.eventsHandler
                ]);
            }
        },
        failed: function (domScript) {
            this.clean(domScript);
            setTimeout(_gpfWebIncludeAsyncResult, 0, [
                "error",
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
     * @event load The resource has been successfully loaded
     *
     * @event error An error occurred when loading the resource
     *
     * Inspired from http://stackoverflow.com/questions/4845762/
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
                    array[idx]
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
                    array[idx]
                ]);
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
     * @returns {string}
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
 * @param {*} defaultResult
 * @return {*}
 * @chainable
 * @forwardThis
 */
    gpf.each = function (dictionary, memberCallback, defaultResult) {
        if (undefined === defaultResult) {
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
        clone: function (obj) {
            /*
         * http://stackoverflow.com/questions/122102/what-is-the-most-
         * efficient-way-to-clone-an-object/5344074#5344074
         */
            return gpf.json.parse(gpf.json.stringify(obj));
        },
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
        xor: function (a, b) {
            return a && !b || !a && b;
        },
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
    var /**
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
        _pending: [],
        _done: [],
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
        _haveDifferentPrototypes: function (a, b) {
            return a.prototype !== b.prototype;
        },
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
        _alike: function (a, b) {
            return this._downcast(a) === this._downcast(b);
        },
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
    gpf.Callback = function (handler, scope) {
        gpf.ASSERT(handler, "Handler expected");
        this._handler = handler;
        if (scope) {
            this._scope = _gpfResolveScope(scope);
        }
    };
    // Define gpf.Callback interface (the 'old' way)
    gpf.extend(gpf.Callback.prototype, {
        _handler: _gpfEmptyFunc,
        _scope: null,
        handler: function () {
            return this._handler;
        },
        scope: function () {
            return this._scope;
        },
        call: function () {
            return this.apply(arguments[0], _gpfArraySlice.apply(arguments, [1]));
        },
        apply: function (scope, args) {
            var finalScope = _gpfResolveScope(scope || this._scope);
            return this._handler.apply(finalScope, args || []);
        }
    });
    // define Static helpers
    gpf.extend(gpf.Callback, {
        resolveScope: function (scope) {
            return _gpfResolveScope(scope);
        },
        buildParamArray: function (count, params) {
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
        doApply: function (callback, scope, paramArray) {
            var len = arguments.length, idx = 3, paramIdx = 0;
            while (idx < len) {
                paramArray[paramIdx] = arguments[idx];
                ++idx;
                ++paramIdx;
            }
            return callback.apply(scope, paramArray);
        },
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
        _eventDispatcherListeners: null,
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
        pow2: function (n) {
            return 1 << n;
        },
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
        toBaseANY: _toBaseANY,
        fromBaseANY: _fromBaseANY,
        toHexa: function (value, length, safepad) {
            return _toBaseANY(_b16, value, length, safepad);
        },
        fromHexa: function (text, safepad) {
            return _fromBaseANY(_b16, text, safepad);
        },
        toBase64: function (value, length, safepad) {
            return _toBaseANY(_b64, value, length, safepad);
        },
        fromBase64: function (text, safepad) {
            return _fromBaseANY(_b64, text, safepad);
        },
        test: function (value, bitmask) {
            return (value & bitmask) === bitmask;
        },
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
        stringify: _gpfJsonStringify,
        parse: _gpfJsonParse
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
                    this.start = pattern.substr(0, pos - 1).split("/").map(_gpfPatternPartSplit);
                }
                if (pos < pattern.length - 2) {
                    gpf.ASSERT(pattern.charAt(pos + 2) === "/", "** must be followed by /");
                    this.end = pattern.substr(pos + 3).split("/").map(_gpfPatternPartSplit).reverse();
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
     * <ul>
     *      <li>{String[]} parts the path being tested split in parts</li>
     *      <li>{Boolean} [result=undefined] result the result</li>
     * </ul>
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
        _dbgSource: "",
        negative: false,
        start: null,
        end: null,
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
        match: function (pattern, path) {
            return _gpfPathMatch(pattern, path) || false;
        },
        compileMatchPattern: function (pattern) {
            return _gpfPathMatchCompilePatterns(pattern);
        }
    };
    var _GPF_ERRORS = {
            "ClassMemberOverloadWithTypeChange": "You can't overload a member to change its type",
            "ClassInvalidVisibility": "Invalid visibility keyword",
            "InterfaceExpected": "Expected interface not implemented: {name}",
            "EnumerableInvalidMember": "$Enumerable can be associated to arrays only",
            "PatternUnexpected": "Invalid syntax (unexpected)",
            "PatternEmpty": "Empty pattern",
            "PatternInvalidSyntax": "Invalid syntax",
            "PatternEmptyGroup": "Syntax error (empty group)",
            "HtmlHandlerMultiplicityError": "Too many $HtmlHandler attributes for '{member}'",
            "HtmlHandlerMissing": "No $HtmlHandler attributes",
            "HtmlHandlerNoDefault": "No default $HtmlHandler attribute",
            "EngineStackUnderflow": "Stack underflow",
            "EngineTypeCheck": "Type check",
            "EncodingNotSupported": "Encoding not supported",
            "EncodingEOFWithUnprocessedBytes": "Unexpected end of stream: unprocessed bytes",
            "XmlInvalidName": "Invalid XML name",
            "ParamsNameRequired": "Missing name",
            "ParamsTypeUnknown": "Type unknown",
            "ParamsRequiredMissing": "Required parameter '{name}' is missing",
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
        code: 0,
        name: "Error",
        message: ""
    };
    _gpfErrorDeclare("boot", {
        NotImplemented: "Not implemented",
        Abstract: "Abstract",
        AssertionFailed: "Assertion failed: {message}"
    });
    gpf.js = {
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
     * @returns {string}
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
     * @returns {Array}
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
     * @inheritDoc gpf.csv.parse
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
    gpf.csv = { parse: _gpfCsvParse };
    var _gpfVisibilityKeywords = "public|protected|private|static".split("|"), _GPF_CLASSDEF_MARKER = "_gpf", _GPF_VISIBILITY_PUBLIC = 0, _GPF_VISIBILITY_PROTECTED = 1,
        //  _GPF_VISIBILITY_PRIVATE     = 2,
        _GPF_VISIBILITY_STATIC = 3, _gpfClassInitAllowed = true, _gpfClassDefUID = 0,
        /**
     * Template for new class constructor (using name that includes namespace)
     * - Uses closure to keep track of constructor and pass it to _gpfClassInit
     * - _CONSTRUCTOR_ will be replaced with the actual class name
     *
     * @param {Function} classInit _gpfClassInit
     * @returns {Function}
     * @private
     * @closure
     */
        _gpfClassConstructorFromFullName = function () {
            /**
         * As this is used inside a new function (src), we loose parameter
         * Also, google closure compiler will try to replace any use of
         * arguments[idx] by a named parameter (can't work), so...
         */
            var args = arguments,
                /*jshint -W120*/
                constructor = _CONSTRUCTOR_ = function () {
                    args[0].apply(this, [
                        constructor,
                        arguments
                    ]);
                };
            return constructor;
        },
        /**
     * Template for new class constructor (using name without namespace)
     * - Uses closure to keep track of constructor and pass it to _gpfClassInit
     * - _CONSTRUCTOR_ will be replaced with the actual class name
     *
     * @param {Function} classInit _gpfClassInit
     * @returns {Function}
     * @private
     * @closure
     */
        _gpfClassConstructorFromName = function () {
            /**
         * As this is used inside a new function (src), we loose parameter
         * Also, google closure compiler will try to replace any use of
         * arguments[idx] by a named parameter (can't work), so...
         */
            var args = arguments, constructor = function _CONSTRUCTOR_() {
                    args[0].apply(this, [
                        constructor,
                        arguments
                    ]);
                };
            return constructor;
        },
        /**
     * Returns the source of _newClassConstructor with the appropriate class
     * name
     *
     * @param {String} name
     * @return {String}
     * @private
     */
        _gpfNewClassConstructorSrc = function (name) {
            var constructorDef, src, start, end;
            if (-1 < name.indexOf(".")) {
                constructorDef = _gpfClassConstructorFromFullName;
            } else {
                constructorDef = _gpfClassConstructorFromName;
            }
            src = constructorDef.toString().replace("_CONSTRUCTOR_", name);
            start = src.indexOf("{") + 1;
            end = src.lastIndexOf("}") - 1;
            return src.substr(start, end - start + 1);
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
     * @returns {gpf.ClassDefinition}
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
        _uid: 0,
        uid: function () {
            return this._uid;
        },
        _name: "",
        name: function () {
            return this._name;
        },
        nameOnly: function () {
            var name = this._name, pos = name.lastIndexOf(".");
            if (-1 === pos) {
                return name;
            } else {
                return name.substr(pos + 1);
            }
        },
        _Super: Object,
        Super: function () {
            return this._Super;
        },
        _Subs: [],
        Subs: function () {
            return this._Subs;
        },
        _attributes: null,
        attributes: function () {
            if (!this._attributes) {
                this._attributes = new gpf.attributes.Map();
            }
            return this._attributes;
        },
        _Constructor: function () {
        },
        _defConstructor: null,
        Constructor: function () {
            return this._Constructor;
        },
        _definition: null,
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
        _addMember: function (member, value, visibility) {
            var newPrototype = this._Constructor.prototype;
            if (_GPF_VISIBILITY_STATIC === visibility) {
                gpf.setReadOnlyProperty(newPrototype.constructor, member, value);
            } else {
                newPrototype[member] = value;
            }
        },
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
            if ("undefined" !== baseType && null !== baseMember && newType !== baseType) {
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
        _build: function () {
            var newClass, newPrototype, baseClassDef;
            // The new class constructor
            newClass = _gpfFunc(_gpfNewClassConstructorSrc(this._name))(_gpfClassInit);
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
            ns = gpf.context(path);
        }
        classDef = new _GpfClassDefinition(name, base, definition || {});
        result = classDef.Constructor();
        if (undefined !== ns) {
            ns[leafName] = result;
        }
        return result;
    };
}));
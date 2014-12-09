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
    var VERSION = "0.1", _host, _context;
    VERSION += "d";
    // Microsoft cscript / wscript
    if ("undefined" !== typeof WScript) {
        _host = "wscript";
        _context = function () {
            return this;
        }.apply(null, []);
        // Define console APIs
        _context.console = {
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
        _host = "phantomjs";
        _context = window;    // Nodejs
                              /*global module:true*/
    } else if ("undefined" !== typeof module && module.exports) {
        _host = "nodejs";
        _context = global;    // Browser
    } else if ("undefined" !== typeof window) {
        _host = "browser";
        _context = window;    // Default: unknown
    } else {
        _host = "unknown";
        _context = this;
    }
    /**
     * Returns the current version
     *
     * @return {string}
     */
    gpf.version = function () {
        return VERSION;
    };
    /**
     * Returns a string identifying the detected host
     *
     * @return {String}
     * - "wscript" for cscript and wscript
     * - "nodejs" for nodejs
     * - "phantomjs" for phantomjs
     * - "browser" for any browser
     * - "unknown" if not detected
     */
    gpf.host = function () {
        return _host;
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
            return _context;
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
                result = _context;
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
    gpf.ASSERT = function (condition, message) {
        if (undefined === message) {
            message = "gpf.ASSERT with no message";
            condition = false;
        }
        if (!condition) {
            console.warn("ASSERTION FAILED: " + message);
            gpf.AssertionFailed({ message: message });
        }
    };
    if (!gpf.ASSERT) {
    }
    (function () {
        /* Begin of privacy scope */
        "use strict";
        if (undefined === Array.prototype.indexOf) {
            // Introduced with JavaScript 1.5
            Array.prototype.indexOf = function (value) {
                var idx = this.length;
                while (idx--) {
                    if (this[idx] === value) {
                        return idx;
                    }
                }
                return -1;
            };
        }
        if (undefined === Object.defineProperty) {
            /**
         * If possible, defines a read-only property
         *
         * @param {Obect} obj
         * @param {String} name
         * @param [*} value
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
    }());    /* End of privacy scope */
    var _arrayEachWithResult = function (array, memberCallback, defaultResult) {
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
        }, _arrayEach = function (array, memberCallback) {
            var len = array.length, idx;
            for (idx = 0; idx < len; ++idx) {
                memberCallback.apply(this, [
                    idx,
                    array[idx]
                ]);
            }
        }, _dictionaryEachWithResult = function (dictionary, memberCallback, defaultResult) {
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
        }, _dictionaryEach = function (dictionary, memberCallback) {
            var member;
            for (member in dictionary) {
                if (dictionary.hasOwnProperty(member)) {
                    memberCallback.apply(this, [
                        member,
                        dictionary[member]
                    ]);
                }
            }
        }, _assign = function (member, value) {
            // this = gpf.extend's arguments
            // this[0] is dictionary
            this[0][member] = value;
        }, _assignOrCall = function (member, value) {
            // this = gpf.extend's arguments
            var dictionary = this[0], overwriteCallback = this[2];
            // TODO: see if in is faster
            if (undefined !== dictionary[member]) {
                overwriteCallback(dictionary, member, value);
            } else {
                dictionary[member] = value;
            }
        }, _likeSearchInDone = function (array, a, b) {
            var idx, ia, ib, len = array.length;
            for (idx = 0; idx < len; ++idx) {
                ia = array[idx].a;
                ib = array[idx].b;
                if (ia === a && ib === b || ib === a && ia === b) {
                    return idx;
                }
            }
            return undefined;
        }, _likeTypes = function (a, b, alike) {
            if (alike && ("object" === typeof a || "object" === typeof b)) {
                /*
                 One of the two is an object but not the other,
                 Consider downcasting Number and String
                 */
                if (a instanceof String || b instanceof String) {
                    return a.toString() === b.toString();
                }
                if (a instanceof Number || b instanceof Number) {
                    return a.valueOf() === b.valueOf();
                }
                return false;
            }
            return false;
        }, _likeCompareMembers = function (ma, mb, alike, stacks) {
            if (ma !== mb) {
                if (typeof ma !== typeof mb && !_likeTypes(ma, mb, alike)) {
                    return false;
                }
                if (null === ma || null === mb || "object" !== typeof ma) {
                    return false;    // Because we know that ma !== mb
                }
                if (undefined === _likeSearchInDone(stacks.done, ma, mb)) {
                    stacks.todo.push(ma);
                    stacks.todo.push(mb);
                }
            }
            return true;
        }, _likeMembers = function (a, b, alike) {
            var member, count, stacks = {
                    todo: [
                        a,
                        b
                    ],
                    done: []
                };
            while (0 !== stacks.todo.length) {
                b = stacks.todo.pop();
                a = stacks.todo.pop();
                if (a.prototype !== b.prototype) {
                    return false;
                }
                stacks.done.push({
                    a: a,
                    b: b
                });
                count = 0;
                for (member in a) {
                    if (a.hasOwnProperty(member)) {
                        ++count;
                        if (!_likeCompareMembers(a[member], b[member], alike, stacks)) {
                            return false;
                        }
                    }
                }
                for (member in b) {
                    if (b.hasOwnProperty(member)) {
                        --count;
                    }
                }
                if (0 !== count) {
                    return false;
                }
            }
            return true;
        }, _values = {
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
        // https://github.com/jshint/jshint/issues/525
        Func = Function,
        // avoid JSHint error
        /**
         * An empty function
         * @private
         */
        _emptyFunc = function () {
            return undefined;
        };
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
            if (dictionary instanceof Array) {
                _arrayEach.apply(this, arguments);
            } else {
                _dictionaryEach.apply(this, arguments);
            }
            return undefined;
        }
        if (dictionary instanceof Array) {
            return _arrayEachWithResult.apply(this, arguments);
        }
        return _dictionaryEachWithResult.apply(this, arguments);
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
            callbackToUse = _assign;
        } else {
            callbackToUse = _assignOrCall;
        }
        gpf.each.apply(arguments, [
            additionalProperties,
            callbackToUse
        ]);
        return dictionary;
    };
    gpf.extend(gpf, {
        _alpha: "abcdefghijklmnopqrstuvwxyz",
        _ALPHA: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        _digit: "0123456789",
        _func: function (source) {
            try {
                if (!source) {
                    return _emptyFunc;
                } else {
                    return new Func(source);
                }
            } catch (e) {
                console.error("An exception occurred compiling:\r\n" + source);
                return null;
            }
        },
        emptyFunction: function () {
            return _emptyFunc;
        },
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
            return _values[expectedType](value, valueType, defaultValue);
        },
        like: function (a, b, alike) {
            if (a === b) {
                return true;
            }
            if (typeof a !== typeof b) {
                return _likeTypes(a, b, alike);
            }
            if (null === a || null === b || "object" !== typeof a) {
                return false;
            }
            return _likeMembers(a, b, alike);
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
        capitalize: function (that) {
            return that.charAt(0).toUpperCase() + that.substr(1);
        },
        Callback: function (handler, scope) {
            if (handler) {
                this._handler = handler;
            }
            if (scope) {
                this._scope = scope;
            }
        }
    });
    gpf.extend(gpf.Callback.prototype, {
        _handler: gpf._func(""),
        _scope: null,
        handler: function () {
            return this._handler;
        },
        scope: function () {
            return this._scope;
        },
        call: function () {
            var scope = arguments[0], args = [], len = arguments.length, idx;
            for (idx = 1; idx < len; ++idx) {
                args.push(arguments[idx]);
            }
            return this.apply(scope, args);
        },
        apply: function (scope, args) {
            var finalScope = gpf.Callback.resolveScope(this._scope || scope);
            return this._handler.apply(finalScope, args || []);
        }
    });
    gpf.extend(gpf.Callback, {
        resolveScope: function (scope) {
            if (null === scope || undefined === scope) {
                scope = gpf.context();
            }
            return scope;
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
        bind: function (obj, method) {
            gpf.ASSERT("string" === typeof method, "Provide method name");
            var _boundMember = method + ":boundToThis";
            gpf.ASSERT("function" === typeof obj[method], "Only methods can be bound");
            if (undefined === obj[_boundMember]) {
                obj[_boundMember] = function () {
                    return obj[method].apply(obj, arguments);
                };
            }
            return obj[_boundMember];
        }
    });
    var
        /**
         * Count the number of gpf.events.fire calls
         *
         * @type {number}
         * @private
         */
        _firing = 0,
        /**
         * Fire the event onto the eventsHandler
         *
         * @param {gpf.events.Event} event event object to fire
         * @param {Object} scope scope of the event
         * @param {gpf.events.Handler} eventsHandler
         */
        _fire = function (event, scope, eventsHandler) {
            if (eventsHandler instanceof Target) {
                eventsHandler._broadcastEvent(event);
            } else if ("function" === typeof eventsHandler || eventsHandler instanceof gpf.Callback) {
                // Compatible with Function & gpf.Callback
                eventsHandler.apply(scope, [event]);
            } else {
                eventsHandler = eventsHandler[event.type()];
                if (undefined !== typeof eventsHandler) {
                    eventsHandler.apply(scope, [event]);
                }
            }
        },
        /**
         * Event Target
         * keep track of listeners and exposes a protected method to dispatch
         * events when fired
         *
         * @param {String[]} [events=undefined] events
         * @constructor
         * @class gpf.events.Target
         */
        Target = function (events) {
            var idx, len, eventName;
            this._listeners = {};
            if (undefined !== events) {
                this._events = events;
                len = events.length;
                for (idx = 0; idx < len; ++idx) {
                    eventName = events[idx];
                    this["on" + eventName.charAt(0).toUpperCase() + eventName.substr(1)] = this._onEVENT(idx);
                    this._listeners[eventName] = [];
                }
            }
        },
        /**
         * Generate a closure capable of handling addEventListener on a given
         * event
         *
         * @param {Number} eventIndex
         * @returns {Function}
         * @closure
         * @private
         */
        _genOnEventClosure = function (eventIndex) {
            return function () {
                var args = [this._events[eventIndex]], len = arguments.length, idx;
                for (idx = 0; idx < len; ++idx) {
                    args.push(arguments[idx]);
                }
                return this.addEventListener.apply(this, args);
            };
        },
        /**
         * Event broadcaster
         *
         * @param {String[]} [events=undefined] events
         * @constructor
         * @class gpf.events.Broadcaster
         */
        Broadcaster = function () {
            Target.apply(this, arguments);
        },
        /**
         * Event
         *
         * @param {String} type
         * @param {Object} [params={}] params
         * @param {Boolean} [cancelable=false] cancelable
         * @param {Object} [scope=undefined] scope
         * @constructor
         * @class gpf.events.Event
         */
        Event = function (type, params, cancelable, scope) {
            this._type = type;
            if (undefined !== params) {
                this._params = params;
            }
            if (cancelable) {
                this._cancelable = true;
            }
            //            this._timeStamp = new Date();
            //            this._returnValue = undefined;
            if (scope) {
                this._scope = scope;
            }
        };
    gpf.extend(Target.prototype, {
        _listeners: {},
        _events: null,
        _onEVENT: function (idx) {
            var closures = Broadcaster.prototype._onEVENT.closures, jdx;
            if (!closures) {
                closures = Broadcaster.prototype._onEVENT.closures = [];
            }
            gpf.ASSERT(closures.length >= idx, "calls must be sequential");
            while (closures.length <= idx) {
                jdx = closures.length;
                closures.push(_genOnEventClosure(jdx));
            }
            return closures[idx];
        },
        addEventListener: function (event, callback, scope, useCapture) {
            var listeners = this._listeners;
            if ("boolean" === typeof scope) {
                useCapture = scope;
                scope = undefined;
            } else {
                if (!scope) {
                    scope = null;
                }
                if (!useCapture) {
                    useCapture = false;
                }
            }
            if (callback instanceof gpf.Callback) {
                if (scope && scope !== callback.scope()) {
                    callback = callback.handler();
                }
            }
            if (!(callback instanceof gpf.Callback)) {
                callback = new gpf.Callback(callback, scope);
            }
            if (undefined === listeners[event]) {
                listeners[event] = [];
            }
            if (useCapture) {
                listeners[event].unshift(callback);
            } else {
                listeners[event].push(callback);
            }
            return this;
        },
        removeEventListener: function (event, callback, scope) {
            var listener = this._listeners[event], registeredCallback, idx;
            if (undefined !== listener) {
                if (callback instanceof gpf.Callback) {
                    if (!scope) {
                        scope = callback.scope();
                    }
                    callback = callback.handler();
                }
                idx = listener.length;
                while (idx > 0) {
                    registeredCallback = listener[--idx];
                    if (registeredCallback.handler() === callback && registeredCallback.scope() === scope) {
                        listener.splice(idx, 1);
                        break;
                    }
                }
            }
            return this;
        },
        _broadcastEvent: function (event, params) {
            var idx, type, listeners;
            if (event instanceof Event) {
                type = event.type();
            } else {
                type = event;
            }
            listeners = this._listeners[type];
            if (undefined === listeners) {
                return this;    // Nothing to do
            }
            if (event instanceof Event) {
                // 'Advanced' version
                for (idx = 0; idx < listeners.length; ++idx) {
                    listeners[idx].apply(event._scope, [event]);
                    if (event._propagationStopped) {
                        break;
                    }
                }
            } else {
                // 'Simple' version with no event management
                for (idx = 0; idx < listeners.length; ++idx) {
                    listeners[idx].apply(null, [
                        event,
                        params
                    ]);
                }
            }
            return this;
        }
    });
    Broadcaster.prototype = new Target();
    gpf.extend(Broadcaster.prototype, {
        broadcastEvent: function () {
            return this._broadcastEvent.apply(this, arguments);
        }
    });
    gpf.extend(Event.prototype, {
        _type: "",
        _params: {},
        _cancelable: false,
        _propagationStopped: false,
        _defaultPrevented: false,
        _scope: null,
        type: function () {
            return this._type;
        },
        scope: function () {
            return gpf.Callback.resolveScope(this._scope);
        },
        cancelable: function () {
            return this._cancelable;
        },
        preventDefault: function () {
            this._defaultPrevented = true;
        },
        defaultPrevented: function () {
            return this._defaultPrevented;
        },
        stopPropagation: function () {
            this._propagationStopped = true;
        },
        get: function (name) {
            return this._params[name];
        },
        fire: function (eventsHandler) {
            return gpf.events.fire(this, eventsHandler);
        }
    });
    gpf.events = {
        Target: Target,
        Broadcaster: Broadcaster,
        Event: Event,
        fire: function (event, params, eventsHandler) {
            var scope;
            if (undefined === eventsHandler) {
                // no last param: shift parameters
                eventsHandler = params;
                params = undefined;
            }
            if (!(event instanceof Event)) {
                event = new gpf.events.Event(event, params, true, this);
            }
            scope = gpf.Callback.resolveScope(event._scope);
            /**
             * This is used both to limit the number of recursion and increase
             * the efficiency of the algorithm.
             */
            if (++_firing > 10) {
                // Too much recursion
                gpf.defer(_fire, 0, null, [
                    event,
                    scope,
                    eventsHandler
                ]);
            } else {
                _fire(event, scope, eventsHandler);
            }
            --_firing;
            return event;
        }
    };
    var _id = 0, _includeContexts = {}, _detachInclude = function (context) {
            // Handle memory leak in IE
            var scriptTag = context.scriptTag, headTag = context.headTag;
            scriptTag.onerror = scriptTag.onload = scriptTag.onreadystatechange = null;
            if (headTag && scriptTag.parentNode) {
                headTag.removeChild(scriptTag);
            }
            // Destroy context
            delete _includeContexts[context.id];
        }, _includeOnLoad = function () {
            // 'this' is the script element
            var context = _includeContexts[this.id];
            if (!context.done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                // IE10: the event is triggered *before* the source is evaluated
                setTimeout(function () {
                    context.done = true;
                    gpf.events.fire("load", { url: context.src }, context.eventsHandler);
                }, 0);
                _detachInclude(context);
            }
        }, _includeOnError = function () {
            // 'this' is the script element
            var context = _includeContexts[this.id];
            // TODO: implement a verbose mode
            if (!context.done) {
                // TODO: provide error reason
                context.done = true;
                gpf.events.fire("error", { url: context.src }, context.eventsHandler);
                _detachInclude(context);
            }
        },
        /**
         * Object used to generate _mimeTypesFromExtension and
         * _mimeTypesToExtension
         *
         * @type {Object}
         * @private
         */
        _hardCodedMimeTypes = {
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
        _mimeTypesToExtension = null,
        /**
         * Dictionary of extension to mime type
         *
         * @type {Object}
         * @private
         */
        _mimeTypesFromExtension = null, _buildMimeTypeFromMappings = function (path, mappings) {
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
                        _mimeTypesFromExtension[fileExtension] = mimeType;
                        if (undefined === _mimeTypesToExtension[mimeType]) {
                            _mimeTypesToExtension[mimeType] = fileExtension;
                        }
                    } else if ("string" === typeof extensions) {
                        extensions = extensions.split(",");
                        len = extensions.length;
                        for (idx = 0; idx < len; ++idx) {
                            fileExtension = "." + extensions[idx];
                            _mimeTypesFromExtension[fileExtension] = mimeType;
                            if (undefined === _mimeTypesToExtension[mimeType]) {
                                _mimeTypesToExtension[mimeType] = fileExtension;
                            }
                        }
                    } else {
                        // Assuming extensions is an object
                        _buildMimeTypeFromMappings(mimeType, extensions);
                    }
                }
            }
        },
        /**
         * Initialize _mimeTypesFromExtension and _mimeTypesToExtension
         *
         * @private
         */
        _initMimeTypes = function () {
            if (null === _mimeTypesFromExtension) {
                _mimeTypesFromExtension = {};
                _mimeTypesToExtension = {};
                _buildMimeTypeFromMappings("", _hardCodedMimeTypes);
            }
        };
    gpf.http = {
        include: function (src, eventsHandler) {
            var context = {
                    src: src,
                    id: "__gpf_http_" + ++_id,
                    headTag: document.getElementsByTagName("head")[0] || document.documentElement,
                    scriptTag: document.createElement("script"),
                    done: false
                }, scriptTag;
            // Handler
            if (undefined === eventsHandler) {
                eventsHandler = new gpf.events.Broadcaster([
                    "load",
                    "error"
                ]);
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
                context.headTag.insertBefore(scriptTag, context.headTag.firstChild);
            }, 0);
        },
        getMimeType: function (fileExtension) {
            var mimeType;
            _initMimeTypes();
            mimeType = _mimeTypesFromExtension[fileExtension.toLowerCase()];
            if (undefined === mimeType) {
                // Default
                mimeType = "application/octet-stream";
            }
            return mimeType;
        },
        getFileExtension: function (mimeType) {
            var fileExtension;
            _initMimeTypes();
            fileExtension = _mimeTypesToExtension[mimeType.toLowerCase()];
            if (undefined === fileExtension) {
                // Default
                fileExtension = ".bin";
            }
            return fileExtension;
        }
    };
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
        _callback = function (callback, scope, args) {
            if ("string" === typeof callback) {
                callback = gpf._func(callback);
            }
            if (!scope) {
                scope = null;
            }
            if (!args) {
                args = [];
            }
            return function () {
                callback.apply(gpf.Callback.resolveScope(scope), args);
            };
        }, _sortOnDt;
    /**
     * Run the asynchronous queue (mandatory for some environments)
     */
    gpf.runAsyncQueue = gpf._func();
    /**
     * Defer the execution of the callback
     *
     * @param {Function} callback
     * @param {Number} [timeout=0] timeout
     * @param {Object} [scope=null] scope
     * @param {Array} [args=[]] args
     */
    gpf.defer = gpf._func();
    if ("browser" === gpf.host()) {
        // Leverage the use of setTimeout(func, delay, [param1, param2, ...])
        // as it avoids creating closures
        _callback = function (parameters) {
            parameters[0].apply(gpf.Callback.resolveScope(parameters[1]), parameters[2]);
        };
        gpf.defer = function (callback, timeout, scope, args) {
            if ("string" === typeof callback) {
                callback = gpf._func(callback);
            }
            if (!timeout) {
                timeout = 0;
            }
            setTimeout(_callback, timeout, [
                callback,
                scope,
                args
            ]);
        };
    } else if ("undefined" !== typeof setTimeout) {
        // Consider the use of setTimeout(func, delay)
        gpf.defer = function (callback, timeout, scope, args) {
            if (!timeout) {
                timeout = 0;
            }
            setTimeout(_callback(callback, scope, args), timeout);
        };
    } else {
        // Custom mechanism
        gpf._asyncQueue = [];
        _sortOnDt = function (a, b) {
            return a._dt - b._dt;
        };
        gpf.defer = function (callback, timeout, scope, args) {
            var item = _callback(callback, scope, args);
            if (!timeout) {
                timeout = 0;
            }
            item._dt = new Date(new Date() - -timeout);
            gpf._asyncQueue.push(item);
            gpf._asyncQueue.sort(_sortOnDt);
        };
        gpf.runAsyncQueue = function () {
            var queue = gpf._asyncQueue, callback;
            while (queue.length) {
                callback = queue.shift();
                if (callback._dt > new Date()) {
                    WScript.Sleep(callback._dt - new Date());
                }
                callback();
            }
        };
    }
    var _b64 = gpf._ALPHA + gpf._alpha + gpf._digit + "+/", _b16 = "0123456789ABCDEF", _toBaseANY = function (base, value, length, safepad) {
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
    gpf.json = {};
    if ("undefined" === typeof JSON) {
        var _obj2json = function (object) {
                var isArray, results, property, value;
                isArray = object instanceof Array;
                results = [];
                /*jshint -W089*/
                for (property in object) {
                    if ("function" === typeof object[property]) {
                        continue;    // ignore
                    }
                    value = _json(object[property]);
                    if (isArray) {
                        results.push(value);
                    } else {
                        results.push(property + ": " + value);
                    }
                }
                if (isArray) {
                    return "[" + results.join(", ") + "]";
                } else {
                    return "(" + results.join(", ") + ")";
                }    /*jshint +W089*/
            }, _json = function (object) {
                var type = typeof object;
                if ("undefined" === type || "function" === type) {
                    return;
                } else if ("number" === type || "boolean" === type) {
                    return object.toString();
                } else if ("string" === type) {
                    return gpf.escapeFor(object, "javascript");
                }
                if (null === object) {
                    return "null";
                } else {
                    return _obj2json(object);
                }
            };
        gpf.json.stringify = _json;
        gpf.json.parse = function (test) {
            return gpf._func("return " + test)();
        };
    } else {
        gpf.json.stringify = JSON.stringify;
        gpf.json.parse = JSON.parse;
    }
    var _visibilityKeywords = "public|protected|private|static".split("|"), _VISIBILITY_PUBLIC = 0, _VISIBILITY_PROTECTED = 1,
        //        _VISIBILITY_PRIVATE     = 2,
        _VISIBILITY_STATIC = 3, _initAllowed = true, _uid = 0,
        /**
         * Used below
         * @type {String}
         * @private
         */
        _invalidSeparator = gpf._alpha + gpf._ALPHA + gpf._digit + "_",
        /**
         * Detects if the function uses ._super
         * NOTE compared to John Reisig version, I try to stay away from
         * regular expression.
         *
         * @param {Function} member
         * @return {Boolean}
         * @private
         */
        _usesSuper = function (member) {
            var pos;
            member = member.toString();
            pos = member.indexOf("._super");
            if (-1 === pos) {
                return false;
            }
            // Test the character *after* _super
            return -1 === _invalidSeparator.indexOf(member.charAt(pos + 7));
        },
        /**
         * Generates a closure in which this._super points to the base
         * definition of the overridden member
         *
         * Based on http://ejohn.org/blog/simple-javascript-inheritance/
         *
         * @param {Function} baseMember
         * @param {Function} member
         * @return {Function}
         * @private
         * @closure
         */
        _super = function (baseMember, member) {
            return function () {
                var previousSuper = this._super, result;
                // Add a new ._super() method that is the same method
                // but on the super-class
                this._super = baseMember;
                // Execute the method
                result = member.apply(this, arguments);
                // The method only need to be bound temporarily, so we
                // remove it when we're done executing
                if (undefined === previousSuper) {
                    delete this._super;
                } else {
                    this._super = previousSuper;
                }
                return result;
            };
        };
    /**
     * An helper to create class and store its information
     *
     * @class gpf.ClassDefinition
     * @constructor
     * @param {String|Function} name
     * @param {Function} Base
     * @param {Object} definition
     */
    gpf.ClassDefinition = function (name, Base, definition) {
        this._uid = ++_uid;
        this._Subs = [];
        if ("function" === typeof name) {
            // TODO to extract class info from there
            this._Constructor = name;
        } else {
            this._name = name;
            this._Base = Base;
            this._definition = definition;
            this._build();
        }
    };
    gpf.extend(gpf.ClassDefinition.prototype, {
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
        _Base: Object,
        Base: function () {
            return this._Base;
        },
        _Subs: [],
        Subs: function () {
            return this._Subs;
        },
        _attributes: null,
        attributes: function () {
            /*__begin__thread_safe__*/
            if (!this._attributes) {
                this._attributes = new gpf.attributes.Map();
            }
            /*__end_thread_safe__*/
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
                visibility = _VISIBILITY_PUBLIC;
            } else if ("string" === typeof visibility) {
                visibility = _visibilityKeywords.indexOf(visibility);
                if (-1 === visibility) {
                    visibility = _VISIBILITY_PUBLIC;
                }
            }
            this._addMember(member, value, visibility);
        },
        _addMember: function (member, value, visibility) {
            var newPrototype = this._Constructor.prototype;
            if (_VISIBILITY_STATIC === visibility) {
                gpf.setReadOnlyProperty(newPrototype.constructor, member, value);
            } else {
                newPrototype[member] = value;
            }
        },
        _processMember: function (member, visibility) {
            // Don't know yet how I want to handle visibility
            var defMember = this._definition[member], isConstructor = member === "constructor", newType, baseMember, baseType;
            newType = typeof defMember;
            if (_VISIBILITY_STATIC === visibility) {
                // No inheritance can be applied here
                this._addMember(member, defMember, _VISIBILITY_STATIC);
                return;
            }
            if (isConstructor) {
                baseMember = this._Base;
            } else {
                baseMember = this._Base.prototype[member];
            }
            baseType = typeof baseMember;
            if ("undefined" !== baseType && null !== baseMember && newType !== baseType) {
                gpf.Error.ClassMemberOverloadWithTypeChange();
            }
            if ("function" === newType && "undefined" !== baseType && _usesSuper(defMember)) {
                /*
                 * As it is a function override, _super is a way to access the
                 * base function.
                 */
                defMember = _super(baseMember, defMember);
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
            member = _visibilityKeywords[visibility];
            definition = initialDefinition[member];
            this._definition = definition;
            try {
                for (member in definition) {
                    if (definition.hasOwnProperty(member)) {
                        // Attribute
                        if ("[" === member.charAt(0) && "]" === member.charAt(member.length - 1)) {
                            this._processAttribute(member);    // Visibility
                        } else if ("public" === member || "private" === member || "protected" === member || "static" === member) {
                            gpf.Error.ClassInvalidVisibility();    // Usual member
                        } else {
                            this._processMember(member, visibility);
                        }
                    }
                }
                // 2014-05-05 #14
                if ("wscript" === gpf.host() && definition.constructor !== Object) {
                    this._processMember("constructor", visibility);
                }
            } catch (e) {
                throw e;
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
                        visibility = _visibilityKeywords.indexOf(member);
                        if (-1 === visibility) {
                            // Usual member, protected if starting with _
                            if (member.charAt(0) === "_") {
                                visibility = _VISIBILITY_PROTECTED;
                            } else {
                                visibility = _VISIBILITY_PUBLIC;
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
                this._processMember("constructor", _VISIBILITY_PUBLIC);
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
            newClass = gpf._func(_getNewClassConstructorSrc(this._name))(gpf);
            this._Constructor = newClass;
            newClass._gpf = this;
            /*
             * Basic JavaScript inheritance mechanism:
             * Defines the newClass prototype as an instance of the base class
             * Do it in a critical section that prevents class initialization
             */
            /*__begin__thread_safe__*/
            _initAllowed = false;
            newPrototype = new this._Base();
            _initAllowed = true;
            /*__end_thread_safe__*/
            // Populate our constructed prototype object
            newClass.prototype = newPrototype;
            // Enforce the constructor to be what we expect
            newPrototype.constructor = newClass;
            /*
             * Defines the link between this class and its base one
             * (It is necessary to do it here because of the gpf.addAttributes
             * that will test the parent class)
             */
            baseClassDef = gpf.classDef(this._Base);
            baseClassDef.Subs().push(newClass);
            /*
             * 2014-04-28 ABZ Changed again from two passes on all members to
             * two passes in which the first one also collects attributes to
             * simplify the second pass.
             */
            this._processDefinition();
            this._processAttributes();
        }    //endregion
    });
    //region Class related helpers
    /**
     * Retrieves (or allocate) the class definition object
     *
     * @param {Function} constructor Class constructor
     * @returns {gpf.ClassDefinition}
     */
    gpf.classDef = function (constructor) {
        if (undefined === constructor._gpf) {
            constructor._gpf = new gpf.ClassDefinition(constructor);
        }
        return constructor._gpf;
    };
    /**
     * Class initializer: it triggers the call to this._defConstructor only if
     * _classInitAllowed is true.
     *
     * NOTE: it must belong to gpf as the created closure will use gpf as an
     * anchor point.
     *
     * @param {Function} constructor Class constructor
     * @param {*[]} args Arguments
     * @private
     */
    gpf._classInit = function (constructor, args) {
        if (_initAllowed) {
            var classDef = gpf.classDef(constructor);
            // TODO resolve prototype if not yet done
            if (classDef._defConstructor) {
                classDef._defConstructor.apply(this, args);
            } else {
                classDef._Base.apply(this, args);
            }
        }
    };
    /*global _CONSTRUCTOR_:true*/
    /**
     * Template for new class constructor (using name that includes namespace)
     * - Uses closure to keep track of gpf handle and constructor function
     * - _CONSTRUCTOR_ will be replaced with the actual class name
     *
     * @param {Object} gpf
     * @returns {Function}
     * @private
     * @closure
     */
    function _newClassConstructorFromFullName() {
        var
            /*gpf:no-reduce*/
            gpf = arguments[0],
            /*jshint -W120*/
            constructor = _CONSTRUCTOR_ = function () {
                gpf._classInit.apply(this, [
                    constructor,
                    arguments
                ]);
            };
        return constructor;
    }
    /**
     * Template for new class constructor (using name without namespace)
     * - Uses closure to keep track of gpf handle and constructor function
     * - _CONSTRUCTOR_ will be replaced with the actual class name
     *
     * @param {Object} gpf
     * @returns {Function}
     * @private
     * @closure
     */
    function _newClassConstructorFromName() {
        var
            /*gpf:no-reduce*/
            gpf = arguments[0], constructor = function _CONSTRUCTOR_() {
                gpf._classInit.apply(this, [
                    constructor,
                    arguments
                ]);
            };
        return constructor;
    }
    /**
     * Returns the source of _newClassConstructor with the appropriate class
     * name
     *
     * @param {String} name
     * @return {String}
     * @private
     */
    function _getNewClassConstructorSrc(name) {
        var constructorDef, src, start, end;
        if (-1 < name.indexOf(".")) {
            constructorDef = _newClassConstructorFromFullName;
        } else {
            constructorDef = _newClassConstructorFromName;
        }
        src = constructorDef.toString().replace("_CONSTRUCTOR_", name);
        start = src.indexOf("{") + 1;
        end = src.lastIndexOf("}") - 1;
        return src.substr(start, end - start + 1);
    }
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
        classDef = new gpf.ClassDefinition(name, base, definition || {});
        result = classDef.Constructor();
        if (undefined !== ns) {
            ns[leafName] = result;
        }
        return result;
    };
    /**
     * Allocate a new class handler that is specific to a class type
     * (used for interfaces & attributes)
     *
     * @param {String} ctxRoot Default context root
     * @param {String} defaultBase Default contextual root class
     * @private
     */
    gpf._genDefHandler = function (ctxRoot, defaultBase) {
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
    };
    var _emptyMember = 0, _defAttrBase = gpf._genDefHandler("gpf.attributes", "Attribute");
    gpf.attributes = {};
    /**
     * Generates a factory capable of creating a new instance of a class
     *
     * @param {Function} objectClass Object constructor
     * @param {String} name Alias name (will be prefixed by $)
     * @private
     * @closure
     */
    function _alias(objectClass, name) {
        name = "$" + name;
        gpf[name] = function () {
            var Proxy = gpf._func("return function " + name + "(args) {" + "this.constructor.apply(this, args);" + "};")();
            Proxy.prototype = objectClass.prototype;
            return function () {
                return new Proxy(arguments);
            };
        }();
    }
    /**
     * Defines an attribute (relies on gpf.define)
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
    gpf._defAttr = function (name, base, definition) {
        var isAlias = name.charAt(0) === "$", fullName, result;
        if (isAlias) {
            name = name.substr(1);
            fullName = name + "Attribute";
        } else {
            fullName = name;
        }
        result = _defAttrBase(fullName, base, definition);
        if (isAlias) {
            _alias(result, name);
        }
        return result;
    };
    /**
     * Base class for any attribute
     *
     * @class gpf.attributes.Attribute
     */
    gpf._defAttr("Attribute", {
        protected: {
            _member: "",
            _alterPrototype: function (objPrototype) {
                gpf.interfaces.ignoreParameter(objPrototype);
            }
        },
        public: {
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
    gpf._defAttr("$Alias", {
        private: { _name: "" },
        protected: {
            _alterPrototype: function (objPrototype) {
                _alias(objPrototype.constructor, this._name);
            }
        },
        public: {
            constructor: function (name) {
                this._name = name;
            }
        }
    });
    /**
     * Attribute array, generally used to list attributes on a class member
     *
     * @class gpf.attributes.Array
     * @implements gpf.interfaces.IReadOnlyArray
     */
    gpf.define("gpf.attributes.Array", {
        private: { _array: [] },
        public: {
            constructor: function () {
                this._array = [];    // Create a new instance of the array
            },
            has: function (expectedClass) {
                gpf.ASSERT("function" === typeof expectedClass, "Expected a class parameter");
                gpf.ASSERT(expectedClass.prototype instanceof gpf.attributes.Attribute, "Expected an Attribute-like class parameter");
                var idx, array = this._array, len = array.length, item;
                for (idx = 0; idx < len; ++idx) {
                    item = array[idx];
                    if (item instanceof expectedClass) {
                        return item;
                    }
                }
                return null;
            },
            filter: function (expectedClass) {
                gpf.ASSERT("function" === typeof expectedClass, "Expected a class parameter");
                gpf.ASSERT(expectedClass.prototype instanceof gpf.attributes.Attribute, "Expected an Attribute-like class parameter");
                var idx, array = this._array, len = array.length, attribute, result = new gpf.attributes.Array(), resultArray = result._array;
                for (idx = 0; idx < len; ++idx) {
                    attribute = array[idx];
                    if (attribute instanceof expectedClass) {
                        resultArray.push(attribute);
                    }
                }
                return result;
            },
            each: function (callback, scope, params) {
                scope = gpf.Callback.resolveScope(scope);
                params = gpf.Callback.buildParamArray(1, params);
                var idx, array = this._array, len = array.length, result;
                for (idx = 0; idx < len; ++idx) {
                    result = gpf.Callback.doApply(callback, scope, params, array[idx]);
                    if (undefined !== result) {
                        return result;
                    }
                }
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
            _members: {},
            _count: 0,
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
            _filterCallback: function (member, attribute, expectedClass) {
                gpf.interfaces.ignoreParameter(member);
                return attribute instanceof expectedClass;
            }
        },
        public: {
            constructor: function (object) {
                this._members = {};
                // Creates a new dictionary
                this._count = 0;
                if (undefined !== object) {
                    this.fillFromObject(object);
                }
            },
            count: function () {
                return this._count;
            },
            add: function (member, attribute) {
                var array = this._members[member];
                if (undefined === array) {
                    array = this._members[member] = new gpf.attributes.Array();
                }
                array._array.push(attribute);
                ++this._count;
            },
            fillFromObject: function (object) {
                return this.fillFromClassDef(gpf.classDef(object.constructor));
            },
            fillFromClassDef: function (classDef) {
                var attributes;
                while (classDef) {
                    // !undefined && !null
                    attributes = classDef.attributes();
                    if (attributes) {
                        attributes._copyTo(this);
                    }
                    if (classDef.Base() !== Object) {
                        // Can't go upper
                        classDef = gpf.classDef(classDef.Base());
                    } else {
                        break;
                    }
                }
                return this._count;
            },
            filter: function (expectedClass) {
                gpf.ASSERT("function" === typeof expectedClass, "Expected a class parameter");
                gpf.ASSERT(expectedClass.prototype instanceof gpf.attributes.Attribute, "Expected an Attribute-like class parameter");
                var result = new gpf.attributes.Map();
                this._copyTo(result, this._filterCallback, expectedClass);
                return result;
            },
            member: function (name) {
                /**
                 * When member is a known Object member (i.e. constructor),
                 * this generates weird results. Filter out by testing the
                 * result type.
                 */
                var result = this._members[name];
                if (undefined === result || !(result instanceof gpf.attributes.Array)) {
                    if (0 === _emptyMember) {
                        _emptyMember = new gpf.attributes.Array();
                    }
                    result = _emptyMember;
                }
                return result;
            },
            members: function () {
                var members = this._members, result = [], member;
                for (member in members) {
                    if (members.hasOwnProperty(member)) {
                        result.push(member);
                    }
                }
                return result;
            },
            each: function (callback, scope, params) {
                scope = gpf.Callback.resolveScope(scope);
                params = gpf.Callback.buildParamArray(2, params);
                var members = this._members, member, result;
                for (member in members) {
                    if (members.hasOwnProperty(member)) {
                        result = gpf.Callback.doApply(callback, scope, params, member, members[member]);
                        if (undefined !== result) {
                            return result;
                        }
                    }
                }
            },
            addTo: function (objectClass) {
                var members = this._members, member;
                for (member in members) {
                    if (members.hasOwnProperty(member)) {
                        gpf.attributes.add(objectClass, member, members[member]);
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
     * @param {gpf.attributes.Attribute[]} attributes
     */
    gpf.attributes.add = function (objectClass, name, attributes) {
        var attributeList, len, idx, attribute;
        attributeList = gpf.classDef(objectClass).attributes();
        len = attributes.length;
        for (idx = 0; idx < len; ++idx) {
            attribute = attributes[idx];
            attribute._member = name;
            // Assign member name
            attributeList.add(name, attribute);
            attribute._alterPrototype(objectClass.prototype);
        }
    };
    gpf.define("gpf.Error", {
        public: {
            code: 0,
            name: "Error",
            message: ""
        }
    });
    var ERRORS = {
            "NotImplemented": "Not implemented",
            "Abstract": "Abstract",
            "AssertionFailed": "Assertion failed: {message}",
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
            "ParamsRequiredMissing": "Required parameter '{name}' is missing"
        },
        /**
         * Generates an error function
         *
         * @param {Number} code
         * @param {String} name
         * @return {Function}
         * @closure
         */
        genThrowError = function (code, name) {
            return function (context) {
                var error = new gpf.Error(), replacements, key;
                error.code = code;
                error.name = name;
                if (context) {
                    replacements = {};
                    for (key in context) {
                        if (context.hasOwnProperty(key)) {
                            replacements["{" + key + "}"] = context[key].toString();
                        }
                    }
                    error.message = gpf.replaceEx(ERRORS[name], replacements);
                } else {
                    error.message = ERRORS[name];
                }
                throw error;
            };
        }, name, code = 0;
    for (name in ERRORS) {
        if (ERRORS.hasOwnProperty(name)) {
            ++code;
            gpf.Error["CODE_" + name.toUpperCase()] = code;
            gpf.Error[name] = genThrowError(code, name);
        }
    }
    var
        /**
         * Read-only property accessor template
         *
         * @return {*}
         */
        _roProperty = function () {
            return this._MEMBER_;
        },
        /**
         * Property accessor template
         *
         * @return {*}
         */
        _rwProperty = function () {
            var result = this._MEMBER_;
            if (0 < arguments.length) {
                this._MEMBER_ = arguments[0];
            }
            return result;
        },
        /**
         * Base class for class-specific attributes
         *
         * @class gpf.attributes.ClassAttribute
         * @extends gpf.attributes.Attribute
         */
        _base = gpf._defAttr("ClassAttribute");
    /**
     * Creates getter (and setter) methods for a private member. The created
     * accessor is a method with the following signature:
     * {type} MEMBER({type} [value=undefined] value)
     * When value is not set, the member acts as a getter
     *
     *
     * @class gpf.attributes.ClassPropertyAttribute
     * @extends gpf.attributes.ClassAttribute
     * @alias gpf.$ClassProperty
     */
    gpf._defAttr("$ClassProperty", _base, {
        private: {
            _writeAllowed: false,
            _publicName: undefined,
            _visibility: undefined
        },
        protected: {
            _alterPrototype: function (objPrototype) {
                var member = this._member, publicName = this._publicName, classDef = gpf.classDef(objPrototype.constructor), src, start, end;
                if (!publicName) {
                    publicName = member.substr(1);    // starts with _
                }
                if (this._writeAllowed) {
                    src = _rwProperty.toString();
                } else {
                    src = _roProperty.toString();
                }
                // Replace all occurrences of _MEMBER_ with the right name
                src = src.split("_MEMBER_").join(member);
                // Extract content of resulting function source
                start = src.indexOf("{") + 1;
                end = src.lastIndexOf("}") - 1;
                src = src.substr(start, end - start + 1);
                classDef.addMember(publicName, gpf._func(src), this._visibility);
            }
        },
        public: {
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
     * @extends gpf.attributes.ClassAttribute
     * @alias gpf.$ClassEventHandler
     */
    gpf._defAttr("$ClassEventHandler", _base, {});
    /**
     * Defines a class extension (internal)
     *
     * @param {String} ofClass
     * @param {String} [publicName=undefined] publicName When not specified,
     * the original method name is used
     *
     * @class gpf.attributes.ClassExtensionAttribute
     * @extends gpf.attributes.ClassAttribute
     * @alias gpf.$ClassExtension
     */
    gpf._defAttr("$ClassExtension", _base, {
        private: {
            _ofClass: gpf.emptyFunction(),
            _publicName: ""
        },
        public: {
            constructor: function (ofClass, publicName) {
                this._ofClass = ofClass;
                if ("string" === typeof publicName) {
                    this._publicName = publicName;
                }
            }
        }
    });
    var
        //region JSON attributes
        /**
         * JSON attribute (base class).
         * once the attribute is assigned to an object, it implements the
         * IXmlSerializable interface
         *
         * @class gpf.attributes.JsonAttribute
         * @extends gpf.attributes.Attribute
         * @private
         */
        _Base = gpf._defAttr("JsonAttribute", {}),
        /**
         * JSON Ignore attribute
         * Indicates the member must not be serialized
         *
         * @class gpf.attributes.JsonIgnoreAttribute
         * @extends gpf.attributes.JsonAttribute
         * @alias gpf.$JsonIgnore
         */
        _Ignore = gpf._defAttr("$JsonIgnore", _Base, {});
    ;
    /**
     * TODO add object sub members
     * TODO add before/after load methods
     * TODO add before/after save methods
     */
    /**
     * Load the object properties from the json representation.
     *
     * @param {Object} object
     * @param {Object|string} json
     * @return {Object}
     * @chainable
     */
    gpf.json.load = function (object, json) {
        var prototype = object.constructor.prototype, attributes = new gpf.attributes.Map(object), member, jsonMember;
        /*jshint -W089*/
        // Actually, I want all properties
        for (member in prototype) {
            if ("function" === typeof prototype[member] || attributes.member(member).has(_Ignore)) {
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
    };
    /*jshint +W089*/
    /**
     * Save the object properties into a json representation.
     *
     * @param {Object} object
     * @return {Object}
     */
    gpf.json.save = function (object) {
        var result = {}, prototype = object.constructor.prototype, attributes = new gpf.attributes.Map(object), member, jsonMember, value;
        /*jshint -W089*/
        // Actually, I want all properties
        for (member in prototype) {
            if ("function" === typeof prototype[member] || attributes.member(member).has(_Ignore)) {
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
    };    /*jshint +W089*/
    gpf.interfaces = {
        isImplementedBy: function (objectInstance, interfaceDefinition) {
            var member;
            /*
             * IMPORTANT note: we test the object itself (i.e. own members and
             * the prototype). That's why the hasOwnProperty is skipped
             */
            /*jslint forin:false*/
            for (member in interfaceDefinition.prototype) {
                if ("constructor" === member || "extend" === member) {
                    // gpf.Class
                    continue;
                }
                if (typeof interfaceDefinition.prototype[member] !== typeof objectInstance[member]) {
                    return false;
                }
            }
            /*jslint forin:true*/
            return true;
        },
        ignoreParameter: function (value) {
            return value;
        },
        query: function (objectInstance, interfaceDefinition, throwError) {
            var result = null;
            if (gpf.interfaces.isImplementedBy(objectInstance, interfaceDefinition)) {
                return objectInstance;
            } else if (gpf.interfaces.isImplementedBy(objectInstance, gpf.interfaces.IUnknown)) {
                result = objectInstance.queryInterface(interfaceDefinition);
            }
            if (null === result && throwError) {
                gpf.Error.InterfaceExpected({ name: gpf.classDef(interfaceDefinition).name() });
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
    gpf._defIntrf = gpf._genDefHandler("gpf.interfaces", "Interface");
    gpf._defIntrf("Interface");
    //region IEventTarget
    gpf._defIntrf("IEventTarget", {
        addEventListener: function (event, callback, scope, useCapture) {
            gpf.interfaces.ignoreParameter(event);
            gpf.interfaces.ignoreParameter(callback);
            gpf.interfaces.ignoreParameter(scope);
            gpf.interfaces.ignoreParameter(useCapture);
        },
        removeEventListener: function (event, callback, scope) {
            gpf.interfaces.ignoreParameter(event);
            gpf.interfaces.ignoreParameter(callback);
            gpf.interfaces.ignoreParameter(scope);
        }
    });
    //endregion
    //region IUnknown
    /**
     * Provide a way for any object to implement an interface using an
     * intermediate object (this avoids overloading the object with temporary
     * / useless members)
     */
    gpf._defIntrf("IUnknown", {
        queryInterface: function (interfaceDefinition) {
            gpf.interfaces.ignoreParameter(interfaceDefinition);
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
        var array = new gpf.attributes.Map(this).member("Class").filter(gpf.attributes.InterfaceImplementAttribute), idx, attribute;
        for (idx = 0; idx < array.length(); ++idx) {
            attribute = array.get(idx);
            if (attribute._interfaceDefinition === interfaceDefinition) {
                if (attribute._builder) {
                    return attribute._builder(this);
                }
                break;
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
     * @param {Function} [queryInterfaceBuilder=undefined] queryInterfaceBuilder
     * Function applied if the implemented interface is requested
     *
     * @class gpf.attributes.ClassArrayInterfaceAttribute
     * @extends gpf.attributes.ClassAttribute
     * @alias gpf.$ClassIArray
     */
    gpf._defAttr("$InterfaceImplement", {
        private: {
            "[_interfaceDefinition]": [gpf.$ClassProperty(false, "which")],
            _interfaceDefinition: gpf.emptyFunction(),
            "[_builder]": [gpf.$ClassProperty(false, "how")],
            _builder: null
        },
        protected: {
            _alterPrototype: function (objPrototype) {
                var iProto = this._interfaceDefinition.prototype, iClassDef = gpf.classDef(this._interfaceDefinition), member, attributes;
                // Get the interface's attributes apply them to the obj
                attributes = new gpf.attributes.Map();
                attributes.fillFromClassDef(iClassDef);
                attributes.addTo(objPrototype.constructor);
                if (!this._builder) {
                    // Fill the missing methods
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
            }
        },
        public: {
            constructor: function (interfaceDefinition, queryInterfaceBuilder) {
                this._interfaceDefinition = interfaceDefinition;
                if (queryInterfaceBuilder) {
                    this._builder = queryInterfaceBuilder;
                }
            }
        }
    });    //endregion
    var gpfI = gpf.interfaces, gpfA = gpf.attributes;
    /**
     * Enumerable interface
     *
     * @class gpf.interfaces.IEnumerable
     * @extends gpf.interfaces.Interface
     */
    gpf._defIntrf("IEnumerable", {
        reset: function () {
        },
        moveNext: function () {
            return false;
        },
        current: function () {
            return null;
        }
    });
    /**
     * Builds an enumerable interface based on an array
     *
     * @param {Object[]} array Base of the enumeration
     * @return {Object} Object implementing the IEnumerable interface
     * @private
     */
    function _arrayEnumerator(array) {
        var pos = -1;
        return {
            reset: function () {
                pos = -1;
            },
            moveNext: function () {
                ++pos;
                return pos < array.length;
            },
            current: function () {
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
    function _buildEnumerableOnArray(object) {
        // Look for related member
        var attributes = new gpfA.Map(object).filter(gpfA.EnumerableAttribute), members = attributes.members();
        gpf.ASSERT(members.length === 1, "Only one member can be defined as enumerable");
        return _arrayEnumerator(object[members[0]]);
    }
    /**
     * Extend the class to provide an enumerable interface
     *
     * @class gpf.attributes.EnumerableAttribute
     * @extends gpf.attributes.ClassAttribute
     * @alias gpf.$ClassIArray
     */
    gpf._defAttr("$Enumerable", gpfA.ClassAttribute, {
        _alterPrototype: function (objPrototype) {
            if (!(objPrototype[this._member] instanceof Array)) {
                gpf.Error.EnumerableInvalidMember();
            }
            gpfA.add(objPrototype.constructor, "Class", [new gpfA.InterfaceImplementAttribute(gpfI.IEnumerable, _buildEnumerableOnArray)]);
        }
    });
    var gpfI = gpf.interfaces, gpfA = gpf.attributes, iROArray;
    //region IReadOnlyArray and IArray
    /**
     * Read only array interface
     *
     * @class gpf.interfaces.IReadOnlyArray
     * @extends gpf.interfaces.Interface
     */
    iROArray = gpf._defIntrf("IReadOnlyArray", {
        length: function () {
            return 0;
        },
        get: function (idx) {
            gpfI.ignoreParameter(idx);
            return undefined;
        }
    });
    /**
     * Array interface
     *
     * @class gpf.interfaces.IArray
     * @extends gpf.interfaces.IReadOnlyArray
     */
    gpf._defIntrf("IArray", iROArray, {
        set: function (idx, value) {
            gpfI.ignoreParameter(idx);
            gpfI.ignoreParameter(value);
            return undefined;
        }
    });
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
    gpf._defAttr("ClassArrayInterfaceAttribute", gpfA.ClassAttribute, {
        "[Class]": [gpf.$Alias("ClassIArray")],
        _writeAllowed: false,
        constructor: function (writeAllowed) {
            if (writeAllowed) {
                this._writeAllowed = true;
            }
        },
        _alterPrototype: function (objPrototype) {
            var implementedInterface;
            if (this._writeAllowed) {
                implementedInterface = gpfI.IArray;
            } else {
                implementedInterface = gpfI.IReadOnlyArray;
            }
            gpfA.add(objPrototype.constructor, "Class", [gpf.$InterfaceImplement(implementedInterface)]);
            objPrototype.length = gpf._func("return this." + this._member + ".length;");
            objPrototype.get = gpf._func("return this." + this._member + "[arguments[0]];");
            if (this._writeAllowed) {
                objPrototype.set = gpf._func("var i=arguments[0]," + "v=this." + this._name + "[i];this." + this._member + "[i]=arguments[1];return v;");
            }
        }
    });
    // Alter gpf.attributes.Array class definition
    gpfA.add(gpfA.Array, "_array", [gpf.$ClassIArray(false)]);
    //endregion
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
    gpf.arrayOrItem = function (array, idx) {
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
    };    //endregion
    var gpfI = gpf.interfaces, gpfFireEvent = gpf.events.fire, _BUFREADSTREAM_READ_SIZE = 256, _BUFREADSTREAM_ISTATE_INIT = 0, _BUFREADSTREAM_ISTATE_INPROGRESS = 1, _BUFREADSTREAM_ISTATE_WAITING = 2, _BUFREADSTREAM_ISTATE_EOS = 3;
    /**
     * The Readable stream interface is the abstraction for a source of data
     * that you are reading from. In other words, data comes out of a Readable
     * stream.
     *
     * @class gpf.interfaces.IReadableStream
     * @extends gpf.interfaces.Interface
     */
    gpf._defIntrf("IReadableStream", {
        "[read]": [gpf.$ClassEventHandler()],
        read: function (size, eventsHandler) {
            gpf.interfaces.ignoreParameter(size);
            gpf.interfaces.ignoreParameter(eventsHandler);
        },
        static: {
            EVENT_ERROR: "error",
            EVENT_DATA: "data",
            EVENT_END_OF_STREAM: "eos",
            EXCEPTION_READ_IN_PROGRESS: { message: "Read in progress" }
        }
    });
    /**
     * The Writable stream interface is an abstraction for a destination that
     * you are writing data to.
     * The expected behavior is:
     * - The callback is asynchronous
     * - One of the following callback must be called after a read
     *   - EVENT_ERROR: an error occurred.
     *     the stream can't be used after this.
     *   - EVENT_READY: the write operation succeeded, the provided buffer has
     *     been fully written (otherwise an error is thrown)
     *
     * @class gpf.interfaces.IReadableStream
     * @extends gpf.interfaces.Interface
     */
    gpf._defIntrf("IWritableStream", {
        "[write]": [gpf.$ClassEventHandler()],
        write: function (int8buffer, eventsHandler) {
            gpf.interfaces.ignoreParameter(int8buffer);
            gpf.interfaces.ignoreParameter(eventsHandler);
        },
        static: {
            EVENT_ERROR: "error",
            EVENT_READY: "ready",
            EXCEPTION_WRITE_IN_PROGRESS: { message: "Read in progress" }
        }
    });
    /**
     * The stream combines both IReadableStream and IWritableStream
     */
    gpf._defIntrf("IStream", {
        "[read]": [gpf.$ClassEventHandler()],
        read: function (size, eventsHandler) {
            gpf.interfaces.ignoreParameter(size);
            gpf.interfaces.ignoreParameter(eventsHandler);
        },
        "[write]": [gpf.$ClassEventHandler()],
        write: function (int8buffer, eventsHandler) {
            gpf.interfaces.ignoreParameter(int8buffer);
            gpf.interfaces.ignoreParameter(eventsHandler);
        }
    });
    /**
     * Text stream: instead of an int8 buffer, the interface handles strings
     *
     * @class gpf.interfaces.ITextStream
     * @extends gpf.interfaces.IStream
     *
     * @event data Some data is ready to be ready
     * @eventParam {String} buffer
     */
    gpf._defIntrf("ITextStream", gpfI.IStream, {});
    //endregion
    //region Stream helpers
    gpf.stream = {};
    /**
     * Handles a buffered stream that depends on a read stream.
     * The way the underlying buffer is read and converted can be overridden
     * through the following protected APIs:
     * - _readSize
     * - _addToBuffer
     *
     * @class gpf.stream.BufferedOnRead
     * @abstract
     * @implements gpf.interfaces.IReadableStream
     */
    gpf.define("gpf.stream.BufferedOnRead", {
        "[Class]": [gpf.$InterfaceImplement(gpfI.IReadableStream)],
        protected: {
            _buffer: [],
            _bufferLength: 0,
            _readSize: _BUFREADSTREAM_READ_SIZE,
            _addToBuffer: function (buffer) {
                gpf.interfaces.ignoreParameter(buffer);
                gpf.Error.Abstract();
            },
            _endOfInputStream: function () {
            },
            _readFromBuffer: function (size) {
                gpf.ASSERT(0 !== this._buffer.length, "Buffer is not empty");
                if ("string" === this._buffer[0]) {
                    return this._readFromStringBuffer(size);
                } else {
                    return this._readFromByteBuffer(size);
                }
            },
            _readFromStringBuffer: function (size) {
                var result = gpf.stringExtractFromStringArray(this._buffer, size);
                this._bufferLength -= result.length;
                return result;
            },
            _readFromByteBuffer: function (size) {
                this._bufferLength -= size;
                return this._buffer.splice(0, size);
            }
        },
        public: {
            constructor: function (input) {
                this._iStream = gpfI.query(input, gpfI.IReadableStream, true);
                this._buffer = [];
            },
            read: function (size, eventsHandler) {
                var iState = this._iState, length = this._bufferLength;
                if (_BUFREADSTREAM_ISTATE_INPROGRESS === iState) {
                    // A read call is already in progress
                    throw gpfI.IReadableStream.EXCEPTION_READ_IN_PROGRESS;
                } else if (size < length || length && _BUFREADSTREAM_ISTATE_EOS === iState) {
                    // Enough chars in the output buffer to do the read
                    // OR there won't be any more chars. Can output something.
                    if (0 === size || size > length) {
                        size = length;
                    }
                    gpfFireEvent.apply(this, [
                        gpfI.IReadableStream.EVENT_DATA,
                        { buffer: this._readFromBuffer(size) },
                        eventsHandler
                    ]);
                } else if (_BUFREADSTREAM_ISTATE_EOS === iState) {
                    // No more input and output buffer is empty
                    gpfFireEvent.apply(this, [
                        gpfI.IReadableStream.EVENT_END_OF_STREAM,
                        eventsHandler
                    ]);
                } else {
                    // Read input
                    if (_BUFREADSTREAM_ISTATE_INIT === this._iState) {
                        // Very first call, create callback for input reads
                        this._cbRead = new gpf.Callback(this._onRead, this);
                    }
                    this._iState = _BUFREADSTREAM_ISTATE_INPROGRESS;
                    // Backup parameters
                    this._size = size;
                    this._eventsHandler = eventsHandler;
                    this._iStream.read(this._readSize, this._cbRead);
                }
            }    //endregion
        },
        private: {
            _iStream: null,
            _cbRead: null,
            _iState: _BUFREADSTREAM_ISTATE_INIT,
            _size: 0,
            _eventsHandler: null,
            _onRead: function (event) {
                var type = event.type();
                if (type === gpfI.IReadableStream.EVENT_END_OF_STREAM) {
                    this._iState = _BUFREADSTREAM_ISTATE_EOS;
                    this._endOfInputStream();
                    // Redirect to read with backed parameters
                    return this.read(this._size, this._eventsHandler);
                } else if (type === gpfI.IReadableStream.EVENT_ERROR) {
                    // Forward the event
                    gpfFireEvent.apply(this, [
                        event,
                        this._eventsHandler
                    ]);
                } else {
                    this._iState = _BUFREADSTREAM_ISTATE_WAITING;
                    this._addToBuffer(event.get("buffer"));
                    if (0 < this._bufferLength) {
                        // Redirect to read with backed parameters
                        return this.read(this._size, this._eventsHandler);
                    } else {
                        // Try to read source again
                        this._iStream.read(_BUFREADSTREAM_READ_SIZE, this._cbRead);
                    }
                }
            }
        }
    });
    /**
     * Bit reader (count is expressed as bits)
     * Rely on a underlying byte stream reader
     *
     * @class gpf.stream.BitReader
     * @extend gpf.stream.BufferedOnRead
     * @implements gpf.interfaces.IReadableStream
     */
    gpf.define("gpf.stream.BitReader", "gpf.stream.BufferedOnRead", {
        "[Class]": [gpf.$InterfaceImplement(gpfI.IReadableStream)],
        protected: {
            _addToBuffer: function (buffer) {
                this._buffer = this._buffer.concat(buffer);
                this._bufferLength += buffer.length * 8;    // Expressed in bits
            },
            _readFromBuffer: function (size) {
                var buffer = this._buffer,
                    // alias
                    result = [], readBit = this._bit, readByte, writeBit = 0, writeByte = 0;
                readByte = buffer[0];
                while (0 < size) {
                    --size;
                    // Expressed in bits
                    writeByte <<= 1;
                    if (0 !== (readByte & readBit)) {
                        writeByte |= 1;
                    }
                    // Next read
                    --this._bufferLength;
                    // Because expressed in bits
                    if (readBit === 1) {
                        // End of current byte, move to next one
                        buffer.shift();
                        readByte = buffer[0];
                        readBit = 128;
                    } else {
                        readBit >>= 1;
                    }
                    // Next write
                    if (writeBit === 7) {
                        result.push(writeByte);
                        writeByte = 0;
                        writeBit = 0;
                    } else {
                        ++writeBit;
                    }
                }
                if (writeBit !== 0) {
                    result.push(writeByte);
                }
                this._bit = readBit;
                return result;
            }
        },
        private: { _bit: 128 }
    });
    var
        /**
         * Base class used to fully read a stream
         *
         * @class AbstractStreamReader
         * @abstract
         * @private
         */
        AbstractStreamReader = gpf.define("AbstractStreamReader", {
            public: {
                constructor: function (scope, eventsHandler) {
                    this._scope = gpf.Callback.resolveScope(scope);
                    this._eventsHandler = eventsHandler;
                },
                read: function (stream) {
                    stream.read(this._readSize, gpf.Callback.bind(this, "callback"));
                }
            },
            protected: {
                _readSize: 0,
                _consolidateBuffer: function () {
                    gpf.Error.Abstract();
                    return [];
                },
                _addBuffer: function (buffer) {
                    gpf.interfaces.ignoreParameter(buffer);
                    gpf.Error.Abstract();
                }
            },
            private: {
                _scope: null,
                _eventsHandler: null,
                callback: function (event) {
                    var type = event.type(), stream = event.scope();
                    if (type === gpfI.IReadableStream.EVENT_END_OF_STREAM) {
                        gpfFireEvent.apply(this._scope, [
                            gpfI.IReadableStream.EVENT_DATA,
                            { buffer: this._consolidateBuffer() },
                            this._eventsHandler
                        ]);
                    } else if (type === gpfI.IReadableStream.EVENT_ERROR) {
                        // Forward the event
                        gpfFireEvent.apply(this._scope, [
                            event,
                            this._eventsHandler
                        ]);
                    } else {
                        this._addBuffer(event.get("buffer"));
                        this.read(stream);
                    }
                }
            }
        }), StreamReader = gpf.define("StreamReader", AbstractStreamReader, {
            public: {
                constructor: function (scope, eventsHandler, concatMethod) {
                    this._super(scope, eventsHandler);
                    this._concatMethod = concatMethod;
                }
            },
            protected: {
                _consolidateBuffer: function () {
                    return this._concatMethod(this._buffer);
                },
                _addBuffer: function (buffer) {
                    this._buffer = this._concatMethod(this._buffer, buffer);
                }
            },
            private: {
                _buffer: undefined,
                _concatMethod: null
            }
        }), B64StreamReader = gpf.define("B64StreamReader", AbstractStreamReader, {
            public: {
                constructor: function (scope, eventsHandler) {
                    this._super(scope, eventsHandler);
                    this._buffer = [];
                }
            },
            protected: {
                _readSize: 6,
                _consolidateBuffer: function () {
                    return this._buffer.join("");
                },
                _addBuffer: function (buffer) {
                    this._buffer.push(gpf.bin.toBase64(buffer[0]));
                }
            },
            private: { _buffer: [] }
        });
    /**
     * Read the whole stream and concat the buffers using the provided handler
     *
     * @param {gpf.interfaces.ITextStream} stream
     * @param {Function} concatMethod
     * @param {gpf.events.Handler} eventsHandler
     *
     * @forwardThis
     *
     * @event data finished reading the stream, the buffer is provided
     * @eventParam {Array|String} buffer
     */
    gpf.stream.readAll = function (stream, concatMethod, eventsHandler) {
        stream = gpf.interfaces.query(stream, gpfI.IReadableStream, true);
        new StreamReader(this, eventsHandler, concatMethod).read(stream);
    };
    /**
     * Read the whole stream and returns a base64 string
     *
     * @param {gpf.interfaces.ITextStream} stream
     * @param {gpf.events.Handler} eventsHandler
     *
     * @forwardThis
     *
     * @event data finished reading the stream, the buffer is provided
     * @eventParam {Array|String} buffer
     */
    gpf.stream.readAllAsB64 = function (stream, eventsHandler) {
        stream = new gpf.stream.BitReader(stream);
        new B64StreamReader(this, eventsHandler).read(stream);
    };    //endregion
    var gpfI = gpf.interfaces, gpfFireEvent = gpf.events.fire, _escapes = {
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
         * Implements ITextStream on top of a string (FIFO read / write)
         *
         * @class StringStream
         * @extend gpf.events.Target
         * @implements gpf.interfaces.ITextStream
         * @private
         */
        StringStream = gpf.define("StringStream", {
            "[Class]": [gpf.$InterfaceImplement(gpf.interfaces.ITextStream)],
            public: {
                constructor: function (string) {
                    if (undefined !== string && string.length) {
                        this._buffer = [string];
                    } else {
                        this._buffer = [];
                    }
                },
                read: function (count, eventsHandler) {
                    var result;
                    if (0 === this._buffer.length) {
                        gpfFireEvent.apply(this, [
                            gpfI.IReadableStream.EVENT_END_OF_STREAM,
                            eventsHandler
                        ]);
                    } else {
                        result = gpf.stringExtractFromStringArray(this._buffer, count);
                        gpfFireEvent.apply(this, [
                            gpfI.IReadableStream.EVENT_DATA,
                            { buffer: result },
                            eventsHandler
                        ]);
                    }
                },
                write: function (buffer, eventsHandler) {
                    gpf.ASSERT(buffer && buffer.length, "Write must contain data");
                    this._buffer.push(buffer);
                    gpfFireEvent.apply(this, [
                        gpfI.IReadableStream.EVENT_READY,
                        eventsHandler
                    ]);
                },
                consolidateString: function () {
                    return this._buffer.join("");
                }
            },
            private: { _buffer: [] }
        });
    gpf.extend(gpf, {
        "[capitalize]": [gpf.$ClassExtension(String)],
        "[replaceEx]": [gpf.$ClassExtension(String)],
        replaceEx: function (that, replacements) {
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
        "[escapeFor]": [gpf.$ClassExtension(String)],
        escapeFor: function (that, language) {
            var replacements = _escapes[language];
            if (undefined !== replacements) {
                that = gpf.replaceEx(that, replacements);
                if ("javascript" === language) {
                    that = "\"" + that + "\"";    /* TODO: handle UNICODE characters
                     l = t.length;
                     r = [];
                     for( i = 0; i < l ; ++i )
                     {
                     c = t.charCodeAt( i );
                     if( c < 128 )
                     r.push( String.fromCharCode( c ) );
                     else
                     r.push( "&#" + c + ";" );
                     }
                     return r.join("");
                     */
                }
            }
            return that;
        },
        "[stringExtractFromStringArray]": [gpf.$ClassExtension(String, "fromStringArray")],
        stringExtractFromStringArray: function (strings, size) {
            var stringsCount = strings.length, result, count, string, len;
            if (!size) {
                // Take the whole content & clear the array
                result = strings.splice(0, stringsCount).join("");
            } else {
                // Check how many string can be included in the result
                count = 0;
                do {
                    string = strings[count];
                    len = string.length;
                    if (len <= size) {
                        ++count;
                        size -= len;
                    } else {
                        break;
                    }
                } while (0 < size && count < stringsCount);
                if (0 === size) {
                    // Simple case (no need to cut the last item)
                    result = strings.splice(0, count).join("");
                } else if (count < stringsCount) {
                    // Last item has to be cut
                    result = [];
                    if (0 < count) {
                        result.push(strings.splice(0, count - 1).join(""));
                    }
                    // Remove first item
                    string = strings.shift();
                    // Add the missing characters
                    result.push(string.substr(0, size));
                    // Put back the remaining characters
                    strings.unshift(string.substr(size));
                    // Consolidate the string
                    result = result.join("");
                } else {
                    // No last item to cut, the whole array fit
                    result = strings.splice(0, stringsCount).join("");
                }
            }
            return result;
        },
        "[stringToStream]": [gpf.$ClassExtension(String, "toStream")],
        stringToStream: function (that) {
            return new StringStream(that);
        },
        "[stringFromStream]": [gpf.$ClassExtension(String, "fromStream")],
        stringFromStream: function (stream, eventsHandler) {
            if (stream instanceof StringStream) {
                gpfFireEvent.apply(this, [
                    gpfI.IReadableStream.EVENT_DATA,
                    { buffer: stream.consolidateString() },
                    eventsHandler
                ]);
            } else {
                gpf.stream.readAll(stream, _stringStreamConcat, eventsHandler);
            }
        }
    });
    function _stringStreamConcat(previous, buffer) {
        if (undefined === previous) {
            return [buffer];
        } else if (undefined !== buffer) {
            previous.push(buffer);
            return previous;
        } else {
            return previous.join("");
        }
    }
    var gpfI = gpf.interfaces, gpfFireEvent = gpf.events.fire,
        /**
         * Implements IStream on top of an array  (FIFO read / write)
         *
         * @class ArrayStream
         * @extend gpf.events.Target
         * @implements gpf.interfaces.ITextStream
         * @private
         */
        ArrayStream = gpf.define("ArrayStream", {
            "[Class]": [gpf.$InterfaceImplement(gpf.interfaces.IStream)],
            public: {
                constructor: function (array) {
                    if (undefined !== array && array.length) {
                        this._buffer = [].concat(array);
                    } else {
                        this._buffer = [];
                    }
                },
                read: function (count, eventsHandler) {
                    var result;
                    if (0 === this._buffer.length) {
                        gpfFireEvent.apply(this, [
                            gpfI.IReadableStream.EVENT_END_OF_STREAM,
                            eventsHandler
                        ]);
                    } else if (undefined === count || count > this._buffer.length) {
                        result = this._buffer;
                        this._buffer = [];
                        gpfFireEvent.apply(this, [
                            gpfI.IReadableStream.EVENT_DATA,
                            { buffer: result },
                            eventsHandler
                        ]);
                    } else {
                        result = this._buffer.splice(0, count);
                        gpfFireEvent.apply(this, [
                            gpfI.IReadableStream.EVENT_DATA,
                            { buffer: result },
                            eventsHandler
                        ]);
                    }
                },
                write: function (buffer, eventsHandler) {
                    gpf.ASSERT(buffer && buffer.length, "Write must contain data");
                    this._buffer = this._buffer.concat(buffer);
                    gpfFireEvent.apply(this, [
                        gpfI.IWritableStream.EVENT_READY,
                        eventsHandler
                    ]);
                },
                consolidateArray: function () {
                    return [].concat(this._buffer);
                }
            },
            private: { _buffer: [] }
        });
    gpf.extend(gpf, {
        "[arrayToStream]": [gpf.$ClassExtension(Array, "toStream")],
        arrayToStream: function (that) {
            return new ArrayStream(that);
        },
        "[arrayFromStream]": [gpf.$ClassExtension(Array, "fromStream")],
        arrayFromStream: function (stream, eventsHandler) {
            if (stream instanceof ArrayStream) {
                gpfFireEvent.apply(this, [
                    gpfI.IReadableStream.EVENT_DATA,
                    { buffer: stream.consolidateArray() },
                    eventsHandler
                ]);
                return;
            } else {
                gpf.stream.readAll(stream, _arrayStreamConcat, eventsHandler);
            }
        }
    });
    function _arrayStreamConcat(previous, buffer) {
        if (undefined === previous) {
            return buffer;
        } else if (undefined !== buffer) {
            previous = previous.concat(buffer);
            return previous;
        } else {
            return previous;
        }
    }
    var _z = function (x) {
        if (10 > x) {
            return "0" + x;
        } else {
            return x;
        }
    };
    ;
    gpf.extend(gpf, {
        "[dateToComparableFormat]": [gpf.$ClassExtension(Date, "toComparableFormat")],
        dateToComparableFormat: function (that, includeTime) {
            if (undefined === includeTime) {
                includeTime = true;
            }
            var result = [
                    that.getFullYear(),
                    "-",
                    _z(that.getMonth() + 1),
                    "-",
                    _z(that.getDate())
                ];
            if (includeTime) {
                result.push(" ", _z(that.getHours()), ":", _z(that.getMinutes()), ":", _z(that.getSeconds()));
            }
            return result.join("");
        },
        "[dateFromComparableFormat]": [gpf.$ClassExtension(String)],
        dateFromComparableFormat: function (that) {
            var date = new Date();
            date.setFullYear(parseInt(that.substr(0, 4), 10), parseInt(that.substr(5, 2), 10) - 1, parseInt(that.substr(8, 2), 10));
            if (10 < that.length) {
                date.setHours(parseInt(that.substr(11, 2), 10), parseInt(that.substr(14, 2), 10), parseInt(that.substr(17, 2), 10), 0);
            } else {
                date.setHours(0, 0, 0, 0);
            }
            return date;
        }
    });
    var gpfFireEvent = gpf.events.fire,
        /**
         * Async implementation of resolve
         *
         * @param {Object} params
         * @private
         */
        _resolve = function (params) {
            var next;
            if (this._list.length) {
                next = this._list.shift();
                this._pos = 0;
                gpfFireEvent.apply(this, [
                    gpf.Promise.THEN,
                    params,
                    next
                ]);
            }
        },
        /**
         * Async implementation of reject
         *
         * @param {Object} params
         * @private
         */
        _reject = function (params) {
            var next, event;
            while (this._list.length) {
                next = this._list.shift();
                if (undefined === event) {
                    event = gpfFireEvent.apply(this, [
                        gpf.Promise.FAIL,
                        params,
                        next
                    ]);
                } else {
                    gpfFireEvent.apply(this, [
                        event,
                        next
                    ]);
                }
                if (event._propagationStopped) {
                    break;
                }
            }
        };
    /**
     * Basic promise implementation
     *
     * @class gpf.Promise
     */
    gpf.define("gpf.Promise", {
        private: {
            _list: [],
            _pos: 0
        },
        public: {
            constructor: function () {
                this._list = [];
            },
            then: function (eventsHandler) {
                this._list.splice(this._pos, 0, eventsHandler);
                ++this._pos;
                return this;
            },
            resolve: function (params) {
                gpf.defer(_resolve, 0, this, [params]);
            },
            reject: function (params) {
                gpf.defer(_reject, 0, this, [params]);
            }
        },
        static: {
            THEN: "then",
            REJECT: "reject"
        }
    });
    var gpfI = gpf.interfaces, gpfFireEvent = gpf.events.fire, _wrappers = {},
        /**
         * Build the synchronous member (no event)
         *
         * @param {String} name
         * @return {Function}
         * @closure
         * @private
         */
        _sync = function (name) {
            return function () {
                this._calls.push(new MethodCall(true, name, arguments, 0));
                this._start();
                return this;
            };
        },
        /**
         * Build the asynchronous member (i.e. event related)
         *
         * @param {String} name
         * @param {Number} length argument count in the function (used to deduce
         * where the event handler is)
         * @return {Function}
         * @closure
         * @private
         */
        _async = function (name, length) {
            return function () {
                this._calls.push(new MethodCall(false, name, arguments, length));
                this._start();
                return this;
            };
        }, _buildMembers = function (interfaceDef) {
            var result = {
                    public: {},
                    static: { interface: interfaceDef }
                }, publicMembers = result.public, attributes = new gpf.attributes.Map(), prototype = interfaceDef.prototype, member, method;
            attributes.fillFromClassDef(gpf.classDef(interfaceDef));
            for (member in prototype) {
                if (prototype.hasOwnProperty(member)) {
                    method = prototype[member];
                    if ("constructor" === member) {
                        continue;    // ignore
                    }
                    gpf.ASSERT("function" === typeof method, "Only methods");
                    if (attributes.member(member).has(gpf.attributes.ClassEventHandlerAttribute)) {
                        publicMembers[member] = _async(member, method.length);
                    } else {
                        publicMembers[member] = _sync(member);
                    }
                }
            }
            return result;
        }, MethodCall = gpf.define("MethodCall", {
            private: {
                _synchronous: true,
                _name: "",
                _args: [],
                _length: 0
            },
            public: {
                constructor: function (synchronous, name, args, length) {
                    this._synchronous = synchronous;
                    this._name = name;
                    this._args = args;
                    this._length = length;
                },
                apply: function (iHandler, callback) {
                    var args = this._args, method = iHandler[this._name], finalArgs, count, idx;
                    if (this._synchronous) {
                        method.apply(iHandler, args);
                        callback.call();
                    } else {
                        count = this._length;
                        finalArgs = new Array(count);
                        finalArgs[--count] = callback;
                        if (count > args.length) {
                            count = args.length;
                        }
                        for (idx = 0; idx < count; ++idx) {
                            finalArgs[idx] = args[idx];
                        }
                        method.apply(iHandler, finalArgs);
                    }
                }
            }
        }), WrapInterface = gpf.define("WrapInterface", {
            private: {
                _iHandler: null,
                _calls: [],
                _callback: null,
                _catch: null,
                _finally: null,
                _finalEventType: "done",
                _asyncResult: function (event) {
                    var iHandler = this._iHandler, calls;
                    if (event && event.type() === "error") {
                        if (this._catch) {
                            gpfFireEvent.apply(iHandler, [
                                event,
                                this._catch
                            ]);
                        }
                        return;
                    }
                    calls = this._calls;
                    if (calls.length) {
                        calls.shift().apply(iHandler, this._callback);
                    } else if (this._finally) {
                        gpfFireEvent.apply(iHandler, [
                            this._finalEventType,
                            this._finally
                        ]);
                    }
                },
                _needStart: true,
                _start: function () {
                    if (this._needStart) {
                        this._needStart = false;
                        gpf.defer(this._asyncResult, 0, this);
                    }
                }
            },
            public: {
                constructor: function (instance) {
                    this._iHandler = gpfI.query(instance, this.constructor.interface);
                    this._calls = [];
                    this._callback = new gpf.Callback(this._asyncResult, this);
                },
                $catch: function (eventHandler) {
                    this._catch = eventHandler;
                    this._start();
                    return this;
                },
                $finally: function (eventHandler, eventType) {
                    this._finally = eventHandler;
                    if (eventType) {
                        this._finalEventType = eventType;
                    }
                    this._start();
                    return this;
                }
            }
        });
    /**
     * Get or build the wrapper class for the given interface definition
     *
     * @param {Function} interfaceDef
     * @return {Function}
     */
    gpfI.wrap = function (interfaceDef) {
        var classDef = gpf.classDef(interfaceDef), result = _wrappers[classDef.uid()], base;
        if (undefined === result) {
            if (interfaceDef === gpfI.Interface) {
                result = WrapInterface;
            } else {
                base = gpfI.wrap(classDef.Base());
                result = gpf.define("Wrap" + classDef.nameOnly(), base, _buildMembers(interfaceDef));
            }
            _wrappers[classDef.uid()] = result;
        }
        return result;
    };
    gpf.define("gpf.Parser", {
        public: {
            constructor: function () {
                this.reset();
            },
            reset: function (state) {
                this._pos = 0;
                this._line = 0;
                this._column = 0;
                this._setParserState(state);
            },
            currentPos: function () {
                return {
                    pos: this._pos,
                    line: this._line,
                    column: this._column
                };
            },
            parse: function () {
                var len = arguments.length, idx, arg;
                for (idx = 0; idx < len; ++idx) {
                    arg = arguments[idx];
                    if (null === arg) {
                        this._finalizeParserState();
                    } else {
                        gpf.ASSERT("string" === typeof arg, "string expected");
                        this._parse(arg);
                    }
                }
            },
            setOutputHandler: function (handler) {
                gpf.ASSERT(handler instanceof Array || handler.apply, "Invalid output handler");
                this._outputHandler = handler;
            }
        },
        protected: {
            _initialParserState: null,
            _ignoreCarriageReturn: false,
            _ignoreLineFeed: false,
            _finalizeParserState: function () {
                this._pState(0);
            },
            _setParserState: function (state) {
                if (!state) {
                    state = this._initialParserState;
                }
                if (state !== this._pState) {
                    // TODO trigger state transition
                    this._pState = state;
                }
            },
            _output: function (item) {
                var handler = this._outputHandler;
                if (handler instanceof Array) {
                    handler.push(item);
                } else if (null !== handler) {
                    // Assuming a Function or a gpf.Callback
                    handler.apply(this, [item]);
                }
            }
        },
        private: {
            _pos: 0,
            _line: 0,
            _column: 0,
            _pState: null,
            _outputHandler: null,
            _parse: function (buffer) {
                var len, idx, char, state, newLine = false;
                len = buffer.length;
                for (idx = 0; idx < len; ++idx) {
                    char = buffer.charAt(idx);
                    if ("\r" === char && this._ignoreCarriageReturn) {
                        char = 0;
                    }
                    if ("\n" === char && this._ignoreLineFeed) {
                        newLine = true;
                        char = 0;
                    }
                    if (char) {
                        state = this._pState.apply(this, [char]);
                        if (undefined !== state) {
                            this._setParserState(state);
                        }
                    }
                    ++this._pos;
                    if ("\n" === char || newLine) {
                        ++this._line;
                        this._column = 0;    //                        this._parsedEndOfLine();
                    } else {
                        ++this._column;
                    }
                }
            }
        },
        static: { FINALIZE: null }
    });
    //endregion
    //region ParserStream
    /**
     * Encapsulate a parser inside a ReadableStream interface
     *
     * @class gpf.ParserStream
     * @extends gpf.stream.BufferedOnRead
     * @implements gpf.interfaces.IReadableStream
     */
    gpf.define("gpf.ParserStream", gpf.stream.BufferedOnRead, {
        public: {
            constructor: function (parser, input) {
                this._super(input);
                this._parser = parser;
                this._parser.setOutputHandler(new gpf.Callback(this._output, this));
            }
        },
        protected: {
            _addToBuffer: function (buffer) {
                this._parser.parse(buffer);
            },
            _endOfInputStream: function () {
                this._parser.parse(gpf.Parser.FINALIZE);
            },
            _readFromBuffer: gpf.stream.BufferedOnRead.prototype._readFromStringBuffer
        },
        private: {
            _output: function (text) {
                this._buffer.push(text);
                this._bufferLength += text.length;
            }
        }
    });
    //endregion
    var bitTest = gpf.bin.test, bitClear = gpf.bin.clear,
        //region ITokenizer
        /**
         * Tokenizer interface
         *
         * @interface gpf.interfaces.ITokenizer
         * @extends gpf.interfaces.Interface
         */
        _ITokenizer = gpf._defIntrf("ITokenizer", {
            write: function (char) {
                gpf.interfaces.ignoreParameter(char);
                return -1;
            }
        }),
        // endregion
        //region Pattern
        /**
     * Pattern structure
     * -----------------
     *
     * [a-zA-Z][a-zA-Z0-9]* is represented by
     *
     * PatternGroup
     * |
     * +- PatternRange
     * |
     * +- PatternRange(max:0)
     *
     *
     * Pattern 'grammar'
     * -----------------
     *
     * pattern
     *      : expression+
     *
     * expression
     *      : item ( '|' item )*
     *
     * item
     *      : match count?
     *
     * count
     *      : '?'
     *      | '*'
     *      | '+'
     *      | '{' <number> '}'
     *
     * match
     *      : '[' char_match_include
     *      | '(' expression ')'
     *      | char
     *
     * char_match_include : '^' char_match_exclude
     *                    | ']'
     *                    | char char_range_sep? char_match_include
     *
     * char_match_exclude : ']'
     *                    | char char_range_sep? char_match_exclude
     *
     * char_range_sep : '-' char
     *
     * char : '\' escaped_char
     *      | <any char but ?*+{[(-[>
     */
        /**
         * Pattern item: an atomic character matching item
         *
         * @class PatternItem
         * @abstract
         * @private
         * @abstract
         */
        PatternItem = gpf.define("PatternItem", {
            private: {
                "[_min]": [gpf.$ClassProperty(true)],
                _min: 1,
                "[_max]": [gpf.$ClassProperty(true)],
                _max: 1
            },
            public: {
                parse: function (char) {
                    gpf.interfaces.ignoreParameter(char);
                    gpf.Error.Abstract();
                    return PatternItem.PARSE_IGNORED;
                },
                finalize: function () {
                },
                reset: function (state) {
                    gpf.interfaces.ignoreParameter(state);
                },
                write: function (state, char) {
                    gpf.interfaces.ignoreParameter(state);
                    gpf.interfaces.ignoreParameter(char);
                    gpf.Error.Abstract();
                    return -1;
                }    //endregion
            },
            static: {
                PARSE_IGNORED: 0,
                PARSE_PROCESSED: 1,
                PARSE_END_OF_PATTERN: 2,
                PARSE_PROCESSED_EOP: 3,
                CHARS_QUANTIFICATION: "?*+",
                WRITE_NO_MATCH: -1,
                WRITE_NEED_DATA: 0,
                WRITE_MATCH: 1,
                WRITE_PATTERN_END: 2,
                WRITE_FINAL_MATCH: 3
            }
        }),
        /**
         * Char pattern: recognizes one character
         *
         * @class PatternChar
         * @extend PatternItem
         * @private
         */
        PatternChar = gpf.define("PatternChar", PatternItem, {
            private: { _match: "" },
            public: {
                parse: function (char) {
                    this._match = char;
                    return PatternItem.PARSE_PROCESSED_EOP;
                },
                write: function (state, char) {
                    gpf.interfaces.ignoreParameter(state);
                    if (char === this._match) {
                        return PatternItem.WRITE_FINAL_MATCH;
                    }
                    return PatternItem.WRITE_NO_MATCH;
                }
            }
        }),
        /**
         * Range pattern: recognizes one char defined by a range
         * (using include/exclude patterns)
         *
         * @class PatternRange
         * @extend PatternItem
         * @private
         */
        PatternRange = gpf.define("PatternRange", PatternItem, {
            private: {
                _inc: "",
                _exc: "",
                _inRange: false,
                _parse: function (char, chars) {
                    var first, last;
                    if ("^" === char) {
                        this._exc = [];
                    } else if ("]" === char) {
                        if (this._inRange) {
                            gpf.Error.PatternInvalidSyntax();
                        }
                        return true;
                    } else if ("-" === char) {
                        if (this._inRange || 0 === chars.length) {
                            gpf.Error.PatternInvalidSyntax();
                        }
                        this._inRange = true;
                    } else {
                        if (this._inRange) {
                            first = chars[chars.length - 1].charCodeAt(0);
                            last = char.charCodeAt(0);
                            while (--last > first) {
                                chars.push(String.fromCharCode(last));
                            }
                            chars.push(char);
                            delete this._inRange;
                        } else {
                            // First char of a range
                            chars.push(char);
                        }
                    }
                    return false;
                }
            },
            public: {
                parse: function (char) {
                    var chars;
                    if (this.hasOwnProperty("_exc")) {
                        if ("^" === char) {
                            gpf.Error.PatternInvalidSyntax();
                        }
                        chars = this._exc;
                    } else {
                        chars = this._inc;
                    }
                    if ("[" === char) {
                        if (this.hasOwnProperty("_inc")) {
                            gpf.Error.PatternInvalidSyntax();
                        }
                        this._inc = [];
                    } else if (this._parse(char, chars)) {
                        return PatternItem.PARSE_PROCESSED_EOP;
                    }
                    return PatternItem.PARSE_PROCESSED;
                },
                finalize: function () {
                    this._inc = this._inc.join("");
                    if (this.hasOwnProperty("_exc")) {
                        this._exc = this._exc.join("");
                    }
                },
                write: function (state, char) {
                    gpf.interfaces.ignoreParameter(state);
                    var match;
                    if (this._inc.length) {
                        match = -1 < this._inc.indexOf(char);
                    } else {
                        match = true;
                    }
                    if (match && this._exc.length) {
                        match = -1 === this._exc.indexOf(char);
                    }
                    if (match) {
                        return PatternItem.WRITE_FINAL_MATCH;
                    } else {
                        return PatternItem.WRITE_NO_MATCH;
                    }
                }
            }
        }),
        /**
         * Group pattern: group several patterns
         * May also be a 'choice' pattern
         *
         * @class PatternGroup
         * @extend PatternItem
         * @private
         */
        PatternGroup = gpf.define("PatternGroup", PatternItem, {
            private: {
                _items: [],
                _choice: false,
                _optionals: [],
                _parsedParenthesis: false,
                _parsedItem: null,
                _getItems: function (pos) {
                    if (this._choice) {
                        if (undefined === pos) {
                            pos = this._items.length - 1;
                        }
                        return this._items[pos];
                    }
                    return this._items;
                },
                _lastItem: function () {
                    var items = this._getItems();
                    return items[items.length - 1];
                },
                _push: function (item) {
                    this._getItems().push(item);
                    this._parsedItem = item;
                    return item;
                },
                _parseItem: function (char) {
                    var parsedItem = this._parsedItem, result;
                    if (parsedItem) {
                        result = parsedItem.parse(char);
                        if (bitTest(result, PatternItem.PARSE_END_OF_PATTERN)) {
                            parsedItem.finalize();
                            this._parsedItem = null;
                            // Remove the flag
                            result = bitClear(result, PatternItem.PARSE_END_OF_PATTERN);
                        }
                    } else {
                        result = 0;
                    }
                    return result;
                },
                _parseQuantity: function (char) {
                    var parsedItem = this._lastItem();
                    if ("*" === char) {
                        parsedItem._min = 0;
                        parsedItem._max = 0;
                    } else if ("+" === char) {
                        parsedItem._max = 0;
                    } else if ("?" === char) {
                        parsedItem._min = 0;
                    }
                    return PatternItem.PARSE_PROCESSED;
                },
                _getOptional: function (items) {
                    var idx;
                    idx = items.length;
                    while (idx--) {
                        if (0 !== items[idx].min()) {
                            ++idx;
                            break;
                        }
                    }
                    return idx;
                },
                _reset: function (item, state) {
                    state.count = 0;
                    state.sub = {};
                    item.reset(state.sub);
                },
                _getItem: function (state, index) {
                    var items = this._getItems(state.choice);
                    if (index < items.length) {
                        return items[index];
                    }
                    return null;
                },
                _writeNoMatch: function (item, state, char) {
                    if (state.count < item.min() || state.length > state.matchingLength + 1) {
                        // Terminal error
                        return PatternItem.WRITE_NO_MATCH;
                    }
                    item = this._getItem(state, state.index + 1);
                    if (null === item) {
                        return PatternItem.WRITE_NO_MATCH;
                    }
                    ++state.index;
                    this._reset(item, state);
                    return this.write(state, char);    // Try with this one
                },
                _writeMatch: function (item, state) {
                    var nextItem = this._getItem(state, state.index + 1), optional;
                    if (this._choice && -1 < state.choice) {
                        optional = this._optionals[state.choice];
                    } else {
                        optional = this._optionals[0];
                    }
                    ++state.count;
                    if (0 === item.max()) {
                        // Unlimited
                        this._reset(item, state);
                        if (null !== nextItem && optional > state.index) {
                            return PatternItem.WRITE_NEED_DATA;
                        } else {
                            // Last (or equivalent) so...
                            return PatternItem.WRITE_MATCH;
                        }
                    } else if (state.count === item.max()) {
                        if (null === nextItem) {
                            return PatternItem.WRITE_FINAL_MATCH;
                        }
                        ++state.index;
                        this._reset(nextItem, state);
                        if (optional <= state.index) {
                            return PatternItem.WRITE_MATCH;
                        }
                    }
                    return PatternItem.WRITE_NEED_DATA;
                }
            },
            public: {
                constructor: function () {
                    this._items = [];
                },
                parse: function (char) {
                    var result = this._parseItem(char);
                    if (0 !== result) {
                        return result;
                    }
                    if (-1 < PatternItem.CHARS_QUANTIFICATION.indexOf(char)) {
                        return this._parseQuantity(char);
                    }
                    if ("|" === char) {
                        if (!this._choice) {
                            this._items = [this._items];
                            this._choice = true;
                        }
                        this._items.push([]);
                        return PatternItem.PARSE_PROCESSED;
                    } else if ("[" === char) {
                        this._push(new PatternRange());
                    } else if ("(" === char) {
                        if (this._parsedParenthesis) {
                            this._push(new PatternGroup());
                        } else {
                            this._parsedParenthesis = true;
                            return PatternItem.PARSE_PROCESSED;
                        }
                    } else if (")" === char) {
                        return PatternItem.PARSE_PROCESSED_EOP;
                    } else {
                        this._push(new PatternChar());
                    }
                    return this._parseItem(char);
                },
                finalize: function () {
                    var len, idx, array;
                    // Compute optionals
                    array = this._optionals = [];
                    if (this._choice) {
                        len = this._items.length;
                        for (idx = 0; idx < len; ++idx) {
                            array.push(this._getOptional(this._items[idx]));
                        }
                    } else {
                        array.push(this._getOptional(this._items));
                    }    // TODO in case of choice, verify they are exclusive
                },
                reset: function (state) {
                    var item;
                    state.index = 0;
                    if (this._choice) {
                        state.choice = -1;
                    }
                    item = this._getItems(0)[0];
                    this._reset(item, state);
                },
                write: function (state, char) {
                    var len, idx, item, result;
                    if (this._choice && -1 === state.choice) {
                        // Enumerate items and stop on first !== NO_MATCH
                        len = this._items.length;
                        for (idx = 0; idx < len; ++idx) {
                            item = this._items[idx][0];
                            this._reset(item, state);
                            result = item.write(state.sub, char);
                            if (PatternItem.WRITE_NO_MATCH !== result) {
                                state.choice = idx;
                                return this._writeMatch(item, state);
                            }
                        }
                        if (idx === len) {
                            return PatternItem.WRITE_NO_MATCH;
                        }
                    }
                    item = this._getItem(state, state.index);
                    result = item.write(state.sub, char);
                    if (PatternItem.WRITE_NEED_DATA === result) {
                        return result;
                    } else if (PatternItem.WRITE_NO_MATCH === result) {
                        return this._writeNoMatch(item, state, char);
                    } else {
                        return this._writeMatch(item, state);
                    }
                }
            }
        }),
        //        /**
        //         * Choice pattern: includes several items, matching only one among
        // them
        //         *
        //         * @class PatternChoice
        //         * @extend PatternItem
        //         * @private
        //         */
        //        PatternChoice = gpf.define("PatternChoice", PatternItem, {
        //
        //            public: {
        //
        ////                /**
        ////                 * @inheritDoc PatternItem:next
        ////                 *
        ////                 * Overridden to 'add' the choice
        ////                 */
        ////                next: function (item) {
        ////                    if (undefined === item) {
        ////                        /*
        ////                         * The only way to have something *after* is to use
        // ()
        ////                         * In that case, it would go through the parent
        ////                         */
        ////                        return null;
        ////                    } else {
        ////                        var
        ////                            parent = item.parent(),
        ////                            pos;
        ////                        this._choices.push(item);
        ////                        item.parent(this);
        ////                        if (1 === this._choices.length) {
        ////                            // Care about parent
        ////                            if (null === parent) {
        ////                                return; // Nothing to care about
        ////                            }
        ////                            if (parent.type() !== PatternItem.TYPE_GROUP) {
        ////                                gpf.Error.PatternUnexpected();
        ////                            }
        ////                            // TODO should be the last
        ////                            pos = gpf.test(parent._items, item);
        ////                            if (undefined === pos) {
        ////                                gpf.Error.PatternUnexpected();
        ////                            }
        ////                            parent._items[pos] = this;
        ////                            this._parent = parent;
        ////                        }
        ////                    }
        ////                },
        //
        //                /**
        //                 * @inheritDoc PatternItem:write
        //                 */
        //                write: function (state, char) {
        //                    // Try all choices and stop on the first one that works
        //                    var
        //                        tmpState = {},
        //                        idx,
        //                        item,
        //                        result;
        //                    for (idx = this._choices.length; idx > 0;) {
        //                        item = this._choices[--idx];
        //                        item.reset(tmpState);
        //                        result = item.write(tmpState, char);
        //                        if (PatternItem.WRITE_NO_MATCH !== result) {
        //                            state.replaceItem = item;
        //                            gpf.extend(state, tmpState);
        //                            return result;
        //                        }
        //                    }
        //                    return PatternItem.WRITE_NO_MATCH;
        //                }
        //
        //            }
        //
        //        }),
        /**
         * Pattern parser context.
         * Class used to parse a pattern, will allocated and consolidate
         * PatternItems
         *
         * @class PatternParserContext
         * @extend gpf.Parser
         * @private
         */
        PatternParser = gpf.define("PatternParser", gpf.Parser, {
            private: {
                "[_patternItem]": [gpf.$ClassProperty()],
                _patternItem: null
            },
            protected: {
                _initialParserState: function (char) {
                    this._patternItem.parse(char);
                },
                _finalizeParserState: function () {
                    var patternItem = this._patternItem;
                    patternItem.parse(")");
                    patternItem.finalize();
                }
            },
            public: {
                constructor: function () {
                    this._super.apply(this, arguments);
                    this._patternItem = new PatternGroup();
                    this._patternItem.parse("(");
                }
            }
        }),
        /**
         * Pattern tokenizer
         *
         * @class {PatternTokenizer}
         * @implements gpf.interfaces.ITokenizer
         * @private
         */
        PatternTokenizer = gpf.define("PatternTokenizer", {
            "[Class]": [gpf.$InterfaceImplement(_ITokenizer)],
            private: {
                _patternItem: null,
                _stopMatching: false,
                _lastResult: 0,
                _totalLength: 0,
                _state: {}
            },
            public: {
                constructor: function (patternItem) {
                    this._patternItem = patternItem;
                    this._state = {};
                    this._patternItem.reset(this._state);
                },
                write: function (char) {
                    var result;
                    if (this._stopMatching) {
                        return this._lastResult;
                    }
                    ++this._totalLength;
                    result = this._patternItem.write(this._state, char);
                    if (0 < result) {
                        this._lastResult = this._totalLength;
                        this._stopMatching = bitTest(result, PatternItem.WRITE_PATTERN_END);
                    } else if (PatternItem.WRITE_NO_MATCH === result) {
                        this._stopMatching = true;
                        if (0 === this._lastResult) {
                            this._lastResult = -1;
                        }
                    }
                    return this._lastResult;
                }    //endregion
            }
        });
    /**
     * Patterns are designed to be an efficient and stream-able alternative to
     * regular expressions. However, the coverage is not the same
     *
     * Supported operators:
     *  [a-z^0-9], [^abc], ., ?, +, *
     *  [^a-z] exclude
     *  . any character
     *
     *
     * @class gpf.Pattern
     */
    gpf.define("gpf.Pattern", {
        private: { _patternItem: null },
        public: {
            constructor: function (pattern) {
                var parser = new PatternParser();
                parser.parse(pattern, null);
                this._patternItem = parser.patternItem();
            },
            allocate: function () {
                return new PatternTokenizer(this._patternItem);
            }
        }
    });    //endregion
    var
        /*
         * These are the types provided in the callback
         */
        _TOKEN_ERROR = "error", _TOKEN_UNKNOWN = "unknown",
        /*
         * break, case, catch, continue, debugger, default
         * delete, do, else, finally, for, function, if, in
         * instanceof, new, return, switch, this, throw, try
         * typeof, var, void, while, with
         */
        _TOKEN_KEYWORD = "keyword",
        // [_a-zA-Z][_a-zA-Z0-9]*
        _TOKEN_IDENTIFIER = "identifier",
        // "[^"]" or '[^']'
        _TOKEN_STRING = "string",
        // [0-9]+
        _TOKEN_NUMBER = "number",
        // \[\]\{\}\(\)...
        _TOKEN_SYMBOL = "symbol", _TOKEN_COMMENT = "comment", _TOKEN_SPACE = "space",
        /*
         * these are the internal parser state
         */
        _TOKEN_STATE_ERROR = 99, _TOKEN_STATE_NONE = 0,
        /* IDENTIFIER, separate first char from the next ones */
        _TOKEN_IDENTIFIER_FIRSTCHAR = gpf._alpha + gpf._ALPHA + "_$", _TOKEN_STATE_IDENTIFIER = 2,
        /* STRING, detect begin, escape char */
        _TOKEN_STATE_STRING1_CHAR = 3, _TOKEN_STATE_STRING1_ESCAPE = 4, _TOKEN_STATE_STRING2_CHAR = 5, _TOKEN_STATE_STRING2_ESCAPE = 6,
        /* Intermediate before COMMENT or LCOMMENT */
        _TOKEN_STATE_SLASH = 7,
        /* LCOMMENT, line comment */
        _TOKEN_STATE_LCOMMENT = 8,
        /* COMMENT, other comment */
        _TOKEN_STATE_COMMENT = 9, _TOKEN_SYMBOL_LIST = "(){}[]<>|&?,.;:!=+-*/%^~", _TOKEN_STATE_SYMBOL = 10, _TOKEN_STATE_NUMBER = 11, _TOKEN_SPACE_LIST = " \t\r\n", _TOKEN_STATE_SPACE = 12,
        /*
         *  Error management:
         *  May have/need a central error message management,
         *  hence the variable BASE
         */
        _TOKEN_ERROR_BASE_ = 0, _TOKEN_ERROR_ABORT = 0, _TOKEN_ERROR_UTOKEN = 1, _TOKEN_ERROR_USTRING = 2, _TOKEN_ERROR_UCOMMENT = 3, _TOKEN_ERROR_STRINGESC = 4, _TOKEN_ERRORS = [
            "Parsing aborted",
            "Unknown token",
            "Unterminated string",
            "Unterminated comment",
            "Invalid or unsupported string escape"
        ],
        /**
         * Generates a new tokenizer context
         * 
         * @return {Object} tokenizer context
         * @internal
         */
        _tokenizerInit = function () {
            return {
                pos: 0,
                line: 0,
                column: 0,
                state: _TOKEN_STATE_NONE,
                chars: [],
                nextPos: 0,
                nextLine: 0,
                nextColumn: 0,
                eventsHandler: null,
                that: null
            };
        },
        /**
         * Hard coded list of keywords
         *
         * @type {string[]}
         * @private
         */
        _keywords = ("break,case,catch,continue,debugger,default,delete,do," + "else,finally,for,function,if,in,instanceof,new,return,switch," + "this,throw,try,typeof,var,void,while,with").split(","),
        /**
         * Association between engine state and corresponding token
         *
         * @type {object}
         * @private
         */
        _tokenStateMapping = function () {
            var result = {};
            result[_TOKEN_STATE_NONE] = _TOKEN_UNKNOWN;
            result[_TOKEN_STATE_SYMBOL] = _TOKEN_SYMBOL;
            result[_TOKEN_STATE_LCOMMENT] = _TOKEN_COMMENT;
            result[_TOKEN_STATE_COMMENT] = _TOKEN_COMMENT;
            result[_TOKEN_STATE_STRING1_CHAR] = _TOKEN_STRING;
            result[_TOKEN_STATE_STRING2_CHAR] = _TOKEN_STRING;
            result[_TOKEN_STATE_NUMBER] = _TOKEN_NUMBER;
            result[_TOKEN_STATE_SPACE] = _TOKEN_SPACE;
            return result;
        }(),
        /**
         * Handles tokenizer events
         * 
         * @param {Object} context tokenizer context
         * @param {Number} [errorCode=undefined] errorCode error
         * @return {undefined}
         * @internal
         */
        _tokenizerCallback = function (context, errorCode) {
            var token, type, event, eventParams = {
                    token: "",
                    pos: context.pos,
                    line: context.line,
                    column: context.column,
                    code: 0,
                    message: ""
                };
            if (undefined !== errorCode) {
                // Error
                type = _TOKEN_ERROR;
                context.state = _TOKEN_STATE_ERROR;
                eventParams.code = errorCode;
                eventParams.message = _TOKEN_ERRORS[errorCode - _TOKEN_ERROR_BASE_];
            } else {
                // Token
                token = context.chars.join("");
                if (_TOKEN_STATE_IDENTIFIER === context.state) {
                    if (undefined !== gpf.test(_keywords, token)) {
                        type = _TOKEN_KEYWORD;
                    } else {
                        type = _TOKEN_IDENTIFIER;
                    }
                } else {
                    type = _tokenStateMapping[context.state];
                }
                eventParams.token = token;
            }
            event = gpf.events.fire.apply(context.that, [
                type,
                eventParams,
                context.eventsHandler
            ]);
            if (event.defaultPrevented()) {
                _tokenizerCallback(context, _TOKEN_ERROR_ABORT);
            } else if (undefined !== errorCode) {
                throw 0;    // Interrupt processing, will be caught at top level
            }
            context.state = _TOKEN_STATE_NONE;
            context.chars = [];
            // New position
            context.pos = context.nextPos;
            context.line = context.nextLine;
            context.column = context.nextColumn;
        },
        /**
         * As the validation is distinct depending on the symbol length,
         * this has been split in N functions (to reduce cyclomatic complexity)
         *
         * @type {function[]}
         * @private
         */
        _symbolValidator = [
            0,
            function (firstChar, chars, newChar) {
                gpf.interfaces.ignoreParameter(chars);
                if (-1 < "(){}[].,;:?".indexOf(firstChar)) {
                    return false;
                }
                if (-1 < "!^~*/%".indexOf(firstChar)) {
                    return "=" === newChar;
                }
                return "=" === newChar || firstChar === newChar;
            },
            function (firstChar, chars, newChar) {
                if (-1 < "+-|&".indexOf(firstChar)) {
                    return false;
                }
                if ("<" === firstChar) {
                    return "<" === chars[1] && "=" === newChar;
                }
                if (-1 < "=!".indexOf(firstChar)) {
                    return "=" === newChar;
                }
                if (">" === firstChar) {
                    return "=" !== chars[1] && ("=" === newChar || ">" === newChar);
                }
                return false;
            },
            function (firstChar, chars, newChar) {
                return ">" === firstChar && "=" !== chars[2] && "=" === newChar;
            },
            function () {
                return false;
            }
        ],
        /**
         * Detects JavaScript symbols
         * 
         * @param {String[]} chars the already recognized characters
         * @param {String} newChar the next char to recognize
         * @return {Boolean} true if the next char makes a valid symbol
         * @internal
         */
        _isValidSymbol = function (chars, newChar) {
            var firstChar = chars[0];
            return _symbolValidator[chars.length](firstChar, chars, newChar);
        },
        /**
         * To reduce cyclomatic complexity, a map containing the analyzer
         * function per state has been created
         *
         * @type {function[]}
         * @private
         */
        _stateAnalyzer = function () {
            var result = {};
            result[_TOKEN_STATE_IDENTIFIER] = function (context, newChar) {
                if (-1 === _TOKEN_IDENTIFIER_FIRSTCHAR.indexOf(newChar) && ("0" > newChar || newChar > "9")) {
                    _tokenizerCallback(context);
                } else {
                    context.chars.push(newChar);
                }
            };
            result[_TOKEN_STATE_NUMBER] = function (context, newChar) {
                if ("0" > newChar || newChar > "9") {
                    _tokenizerCallback(context);
                } else {
                    context.chars.push(newChar);
                }
            };
            result[_TOKEN_STATE_STRING1_CHAR] = result[_TOKEN_STATE_STRING2_CHAR] = function (context, newChar) {
                context.chars.push(newChar);
                if ("\\" === newChar) {
                    ++context.state;    // _ESCAPE
                } else if ("\n" === newChar) {
                    _tokenizerCallback(context, _TOKEN_ERROR_USTRING);
                } else if (_TOKEN_STATE_STRING1_CHAR === context.state && "\"" === newChar) {
                    _tokenizerCallback(context);
                    return true;
                } else if (_TOKEN_STATE_STRING2_CHAR === context.state && "'" === newChar) {
                    _tokenizerCallback(context);
                    return true;
                }
                return false;
            };
            result[_TOKEN_STATE_STRING1_ESCAPE] = result[_TOKEN_STATE_STRING2_ESCAPE] = function (context, newChar) {
                if ("\\" === newChar || "r" === newChar || "n" === newChar || "t" === newChar || "\"" === newChar || "'" === newChar) {
                    --context.state;
                    context.chars.push(newChar);
                } else {
                    _tokenizerCallback(context, _TOKEN_ERROR_STRINGESC);
                }
            };
            result[_TOKEN_STATE_SLASH] = function (context, newChar) {
                if ("/" === newChar) {
                    context.state = _TOKEN_STATE_LCOMMENT;
                    context.chars.push(newChar);
                } else if ("*" === newChar) {
                    context.state = _TOKEN_STATE_COMMENT;
                    context.chars.push(newChar);
                } else {
                    context.state = _TOKEN_STATE_SYMBOL;
                    if (_isValidSymbol(context.chars, newChar)) {
                        context.chars.push(newChar);
                    } else {
                        _tokenizerCallback(context);
                    }
                }
            };
            result[_TOKEN_STATE_LCOMMENT] = function (context, newChar) {
                if ("\n" === newChar) {
                    _tokenizerCallback(context);
                } else {
                    context.chars.push(newChar);
                }
            };
            result[_TOKEN_STATE_COMMENT] = function (context, newChar) {
                context.chars.push(newChar);
                if ("/" === newChar && context.chars[context.chars.length - 2] === "*") {
                    _tokenizerCallback(context);
                    return true;
                }
                return false;
            };
            result[_TOKEN_STATE_SPACE] = function (context, newChar) {
                if (-1 < _TOKEN_SPACE_LIST.indexOf(newChar)) {
                    context.chars.push(newChar);
                } else {
                    _tokenizerCallback(context);
                }
            };
            result[_TOKEN_STATE_SYMBOL] = function (context, newChar) {
                if (-1 < _TOKEN_SYMBOL_LIST.indexOf(newChar)) {
                    if (_isValidSymbol(context.chars, newChar)) {
                        context.chars.push(newChar);
                    } else {
                        _tokenizerCallback(context);
                    }
                } else {
                    _tokenizerCallback(context);
                }
            };
            return result;
        }(),
        /**
         * Default analyzer (when no state is active)
         *
         * @param {Object} context
         * @param {String} newChar
         * @private
         */
        _noStateAnalyzer = function (context, newChar) {
            context.chars = [newChar];
            if (-1 < _TOKEN_IDENTIFIER_FIRSTCHAR.indexOf(newChar)) {
                context.state = _TOKEN_STATE_IDENTIFIER;
            } else if ("0" <= newChar && newChar <= "9") {
                context.state = _TOKEN_STATE_NUMBER;
            } else if ("\"" === newChar) {
                context.state = _TOKEN_STATE_STRING1_CHAR;
            } else if ("'" === newChar) {
                context.state = _TOKEN_STATE_STRING2_CHAR;
            } else if ("/" === newChar) {
                context.state = _TOKEN_STATE_SLASH;
            } else if (-1 < _TOKEN_SYMBOL_LIST.indexOf(newChar)) {
                context.state = _TOKEN_STATE_SYMBOL;
            } else if (-1 < _TOKEN_SPACE_LIST.indexOf(newChar)) {
                context.state = _TOKEN_STATE_SPACE;
            } else {
                _tokenizerCallback(context, _TOKEN_ERROR_UTOKEN);
            }
        },
        /**
         * Main parser function
         * 
         * @param {Object} context tokenizer context
         * @param {String} newChar next char to analyze
         * @return {undefined}
         * @internal
         */
        _analyzeChar = function (context, newChar) {
            var stateAnalyzer = _stateAnalyzer[context.state];
            if (undefined !== stateAnalyzer) {
                if (stateAnalyzer(context, newChar)) {
                    return;
                }
            }
            if (_TOKEN_STATE_NONE === context.state) {
                _noStateAnalyzer(context, newChar);
            }
        },
        /**
         * Compute next char position
         * 
         * @param {Object} context tokenizer context
         * @param {String} newChar char that has been analyzed
         * @return {undefined}
         * @internal
         */
        _computeNextPos = function (context, newChar) {
            ++context.nextPos;
            if ("\n" === newChar) {
                ++context.nextLine;
                context.nextColumn = 0;
            } else {
                ++context.nextColumn;
            }
        },
        /**
         * Inject next char in the tokenizer
         * 
         * @param {Object} context tokenizer context
         * @param {String} newChar char that will be analyzed
         * @return {undefined}
         * @internal
         */
        _tokenizeChar = function (context, newChar) {
            _analyzeChar(context, newChar);
            _computeNextPos(context, newChar);
        },
        /**
         * To reduce cyclomatic complexity, a map has been created to associate
         * last state to a specific action
         *
         * @type {object}
         * @internal
         */
        _finalStatesAction = function () {
            var result = {};
            // Need to throw final callback
            result[_TOKEN_STATE_IDENTIFIER] = 1;
            result[_TOKEN_STATE_NUMBER] = 1;
            result[_TOKEN_STATE_LCOMMENT] = 1;
            result[_TOKEN_STATE_SYMBOL] = 1;
            // Symbol waiting to be thrown
            result[_TOKEN_STATE_SLASH] = 2;
            // Unterminated comment
            result[_TOKEN_STATE_COMMENT] = 3;
            // Unterminated string
            result[_TOKEN_STATE_STRING1_CHAR] = 4;
            result[_TOKEN_STATE_STRING2_CHAR] = 4;
            result[_TOKEN_STATE_STRING1_ESCAPE] = 4;
            result[_TOKEN_STATE_STRING2_ESCAPE] = 4;
            return result;
        }(),
        /**
         * Finalize tokenizer
         * 
         * @param {Object} context tokenizer context
         * @internal
         */
        _tokenizerFinalize = function (context) {
            var action = _finalStatesAction[context.state];
            if (1 === action) {
                // Need to throw final callback
                _tokenizerCallback(context);
            } else if (2 === action) {
                // Symbol waiting to be thrown
                context.state = _TOKEN_STATE_SYMBOL;
                _tokenizerCallback(context);
            } else if (3 === action) {
                // Unterminated comment
                _tokenizerCallback(context, _TOKEN_ERROR_UCOMMENT);
            } else if (4 === action) {
                // Unterminated string
                _tokenizerCallback(context, _TOKEN_ERROR_USTRING);
            }
            gpf.ASSERT(_TOKEN_STATE_NONE === context.state || _TOKEN_STATE_ERROR === context.state || _TOKEN_STATE_SPACE === context.state, "Unexpected non-final state");
        };
    gpf.js = {};
    gpf.extend(gpf.js, {
        keywords: function () {
            return _keywords;
        },
        "[tokenize]": [gpf.$ClassEventHandler()],
        tokenize: function (text, eventsHandler) {
            var idx, len, context = _tokenizerInit();
            context.eventsHandler = eventsHandler;
            context.that = this;
            try {
                for (idx = 0, len = text.length; idx < len; ++idx) {
                    _tokenizeChar(context, text.charAt(idx));
                }
                _tokenizerFinalize(context);
            } catch (e) {
                // used for quick exit
                if ("number" !== typeof e) {
                    throw e;    // TODO: wrap and forward 
                }
            }
        },
        tokenizeEx: function (text, eventsHandler, context) {
            var idx, len;
            if (undefined === context) {
                context = _tokenizerInit();
            }
            context.eventsHandler = eventsHandler;
            context.that = this;
            try {
                if (null === text) {
                    _tokenizerFinalize(context);
                    context = null;    // Must not be reused
                } else {
                    for (idx = 0, len = text.length; idx < len; ++idx) {
                        _tokenizeChar(context, text.charAt(idx));
                    }
                }
            } catch (e) {
                // used for quick exit
                if ("number" !== typeof e) {
                    throw e;    // TODO: wrap and forward 
                }
            }
            return context;
        }
    });
    (function () {
        /* Begin of privacy scope */
        "use strict";
        var
            //region UTF-8
            // UTF-8 encode/decode based on  http://www.webtoolkit.info/
            _utf8Encode = function (input) {
                var result = [], len = input.length, idx, charCode;
                for (idx = 0; idx < len; ++idx) {
                    charCode = input.charCodeAt(idx);
                    if (charCode < 128) {
                        result.push(charCode);
                    } else if (charCode > 127 && charCode < 2048) {
                        result.push(charCode >> 6 | 192);
                        result.push(charCode & 63 | 128);
                    } else {
                        result.push(charCode >> 12 | 224);
                        result.push(charCode >> 6 & 63 | 128);
                        result.push(charCode & 63 | 128);
                    }
                }
                return result;
            }, _utf8Decode = function (input, unprocessed) {
                var result = [], len = input.length, idx = 0, byte, byte2, byte3;
                while (idx < len) {
                    byte = input[idx];
                    if (byte < 128) {
                        result.push(String.fromCharCode(byte));
                    } else if (byte > 191 && byte < 224) {
                        if (idx + 1 === len) {
                            break;
                        }
                        byte2 = input[++idx];
                        result.push(String.fromCharCode((byte & 31) << 6 | byte2 & 63));
                    } else {
                        if (idx + 2 >= len) {
                            break;
                        }
                        byte2 = input[++idx];
                        byte3 = input[++idx];
                        result.push(String.fromCharCode((byte & 15) << 12 | (byte2 & 63) << 6 | byte3 & 63));
                    }
                    ++idx;
                }
                while (idx < len) {
                    unprocessed.push(input[idx++]);
                }
                return result.join("");
            },
            //endregion
            /**
         * Map that relates encoding to the appropriate encoder/decoder
         *
         * encode (string input) : byte[]
         * decode (byte[] input, byte[] unprocessed) : string
         *
         * @type {Object}
         * @private
         */
            _encodings = {
                "utf-8": [
                    _utf8Encode,
                    _utf8Decode
                ]
            },
            //region Encoder / Decoder stream implementation
            /**
         * Encoder stream
         *
         * @class gpf.encoding.EncoderStream
         * @extends gpf.stream.BufferedOnRead
         * @implements gpf.interfaces.IReadableStream
         * @private
         */
            EncoderStream = gpf.define("EncoderStream", gpf.stream.BufferedOnRead, {
                public: {
                    constructor: function (encoder, input) {
                        this._super(input);
                        this._encoder = encoder;
                    }
                },
                protected: {
                    _addToBuffer: function (buffer) {
                        this._buffer = this._buffer.concat(this._encoder(buffer));
                        this._bufferLength = this._buffer.length;
                    },
                    _readFromBuffer: gpf.stream.BufferedOnRead.prototype._readFromByteBuffer
                },
                private: { _encoder: null }
            }),
            /**
         * Decoder stream
         *
         * @class gpf.encoding.DecoderStream
         * @extends gpf.stream.BufferedOnRead
         * @implements gpf.interfaces.IReadableStream
         * @private
         */
            DecoderStream = gpf.define("DecoderStream", gpf.stream.BufferedOnRead, {
                public: {
                    constructor: function (decoder, input) {
                        this._super(input);
                        this._decoder = decoder;
                    }
                },
                protected: {
                    _addToBuffer: function (buffer) {
                        var string;
                        if (this._unprocessed.length) {
                            buffer = this._unprocessed.concat(buffer);
                        }
                        this._unprocessed = [];
                        string = this._decoder(buffer, this._unprocessed);
                        this._buffer.push(string);
                        this._bufferLength += string.length;
                    },
                    _endOfInputStream: function () {
                        if (this._unprocessed.length) {
                            gpf.Error.EncodingEOFWithUnprocessedBytes();
                        }
                    },
                    _readFromBuffer: gpf.stream.BufferedOnRead.prototype._readFromStringBuffer
                },
                private: {
                    _decoder: null,
                    _unprocessed: []
                }
            });
        //endregion
        gpf.encoding = {
            UTF_8: "utf-8",
            createEncoder: function (input, encoding) {
                var module = _encodings[encoding];
                if (undefined === module) {
                    gpf.Error.EncodingNotSupported();
                }
                return new EncoderStream(module[0], input);
            },
            createDecoder: function (input, encoding) {
                var module = _encodings[encoding];
                if (undefined === module) {
                    gpf.Error.EncodingNotSupported();
                }
                return new DecoderStream(module[1], input);
            }
        };
    }());    /* End of privacy scope */
    gpf.html = {};
    var gpfI = gpf.interfaces, gpfFireEvent = gpf.events.fire;
    /**
     * Markdown to HTML converter using Parser interface
     * Inspired from http://en.wikipedia.org/wiki/Markdown
     *
     * Weak -but working- implementation
     *
     * @class gpf.html.MarkdownParser
     */
    gpf.define("gpf.html.MarkdownParser", "gpf.Parser", {
        public: {
            constructor: function () {
                this._super.apply(this, arguments);
                this._openedTags = [];
            }
        },
        protected: {
            _ignoreCarriageReturn: true,
            _initialParserState: function (char) {
                var newState, tagsOpened = 0 < this._openedTags.length;
                if ("#" === char) {
                    this._hLevel = 1;
                    newState = this._parseTitle;
                } else if ("*" === char || "0" <= char && "9" >= char) {
                    if (char !== "*") {
                        this._numericList = 1;
                    } else {
                        this._numericList = 0;
                    }
                    newState = this._parseList;
                    tagsOpened = false;    // Wait for disambiguation
                } else if (" " !== char && "\t" !== char && "\n" !== char) {
                    if (tagsOpened) {
                        this._output(" ");
                        tagsOpened = false;    // Avoid closing below
                    } else {
                        this._openTag("p");
                    }
                    newState = this._parseContent(char);
                    if (!newState) {
                        newState = this._parseContent;
                    }
                }
                if (tagsOpened) {
                    this._closeTags();
                }
                return newState;
            },
            _finalizeParserState: function () {
                this._closeTags();
            }
        },
        private: {
            _openedTags: [],
            _closeTags: function () {
                var tag;
                while (this._openedTags.length) {
                    tag = this._openedTags.pop();
                    this._output("</" + tag + ">");
                    if ("p" === tag) {
                        break;
                    }
                }
            },
            _openList: function (listTag) {
                var tag, len = this._openedTags.length;
                while (len) {
                    tag = this._openedTags.pop();
                    --len;
                    this._output("</" + tag + ">");
                    if ("li" === tag) {
                        break;
                    }
                }
                if (len) {
                    tag = this._openedTags[len - 1];
                    if (tag !== listTag) {
                        this._openedTags.pop();
                        this._output("</" + tag + ">");
                    } else {
                        return;
                    }
                }
                this._openTag(listTag);
            },
            _toggleTag: function (tag) {
                var len = this._openedTags.length;
                if (len && this._openedTags[len - 1] === tag) {
                    this._openedTags.pop();
                    this._output("</" + tag + ">");
                } else {
                    this._openTag(tag);
                }
            },
            _openTag: function (tag) {
                this._output("<" + tag + ">");
                this._openedTags.push(tag);
            },
            _hLevel: 1,
            _parseTitle: function (char) {
                if ("#" === char) {
                    ++this._hLevel;
                } else {
                    this._openTag("h" + this._hLevel);
                    return this._parseText;    // No formatting allowed in Hx
                }
            },
            _numericList: false,
            _parseList: function (char) {
                var tagsOpened = 0 < this._openedTags.length, listTag;
                if (" " === char) {
                    // Start or append list
                    if (this._numericList) {
                        listTag = "ol";
                    } else {
                        listTag = "ul";
                    }
                    this._openList(listTag);
                    this._openTag("li");
                } else if (this._numericList && ("0" <= char && "9" >= char || "." === char)) {
                    return;    // No state change
                } else if ("*" === char) {
                    if (tagsOpened) {
                        this._output(" ");    // new line inside a paragraph
                    }
                    this._openTag("strong");
                }
                return this._parseContent;
            },
            _handleEntities: function (char) {
                if ("<" === char) {
                    this._output("&lt;");
                } else if (">" === char) {
                    this._output("&gt;");
                } else if ("&" === char) {
                    this._output("&amp;");
                } else {
                    return false;
                }
                return true;
            },
            _escapeChar: "",
            _escapeCount: 0,
            _parseEscape: function (char) {
                var escapeChar = this._escapeChar, count;
                if (char === escapeChar) {
                    count = ++this._escapeCount;
                    if ("-" === escapeChar && 3 === count) {
                        this._output("&mdash;");
                        return this._parseContent;
                    }
                } else {
                    count = this._escapeCount + 1;
                    while (--count) {
                        this._output(escapeChar);
                    }
                    this._setParserState(this._parseContent);
                    return this._parseContent(char);
                }
            },
            _parseContent: function (char) {
                if (this._handleEntities(char)) {
                    return;
                }
                if ("*" === char) {
                    return this._parseItalic;
                } else if ("`" === char) {
                    this._toggleTag("code");
                    return;
                } else if ("[" === char) {
                    this._linkState = 0;
                    this._linkText = [];
                    this._linkUrl = [];
                    return this._parseLink;
                } else if ("-" === char) {
                    this._escapeCount = 1;
                    this._escapeChar = "-";
                    return this._parseEscape;
                } else if ("\n" === char) {
                    return null;
                } else {
                    this._output(char);
                }
            },
            _parseItalic: function (char) {
                if ("*" === char) {
                    this._toggleTag("strong");
                } else {
                    this._toggleTag("em");
                    this._output(char);
                }
                return this._parseContent;
            },
            _parseText: function (char) {
                if (this._handleEntities(char)) {
                    return;
                }
                if ("\n" === char) {
                    // Ignore any formatting until \n
                    this._closeTags();
                    return null;
                } else {
                    this._output(char);
                }
            },
            _linkText: [],
            _linkUrl: [],
            _linkState: 0,
            _parseLink: function (char) {
                var linkState = this._linkState;
                if ("]" === char && 0 === linkState) {
                    ++this._linkState;
                } else if ("(" === char && 1 === linkState) {
                    ++this._linkState;
                } else if (")" === char && 2 === linkState) {
                    this._output("<a href=\"");
                    this._output(this._linkUrl.join(""));
                    this._output("\">");
                    this._output(this._linkText.join(""));
                    this._output("</a>");
                    return this._parseContent;
                } else if (0 === linkState) {
                    this._linkText.push(char);
                } else if (2 === linkState) {
                    this._linkUrl.push(char);
                }    // Else... nothing. do some kind of error handling?
            }
        }
    });
    /**
     * HTML5 File to ReadableStream wrapper
     */
    gpf.define("gpf.html.File", {
        "[Class]": [gpf.$InterfaceImplement(gpf.interfaces.ITextStream)],
        public: {
            constructor: function (file) {
                this._file = file;
            },
            name: function () {
                return this._file.name;
            },
            size: function () {
                return this._file.size;
            },
            read: function (count, eventsHandler) {
                var that = this, reader = this._reader, left = this._file.size - this._pos, blob;
                if (0 === left) {
                    gpfFireEvent.apply(this, [
                        gpfI.IReadableStream.EVENT_END_OF_STREAM,
                        eventsHandler
                    ]);
                    return;
                }
                this._eventsHandler = eventsHandler;
                if (null === reader) {
                    reader = this._reader = new FileReader();
                    reader.onloadend = function (event) {
                        that._onLoadEnd(event);
                    };
                }
                if (0 === count || count > left) {
                    count = left;
                }
                blob = this._file.slice(this._pos, count);
                this._pos += count;
                reader.readAsArrayBuffer(blob);
            }
        },
        private: {
            _file: null,
            _reader: null,
            _pos: 0,
            _eventsHandler: null,
            _onLoadEnd: function (event) {
                var reader = event.target, buffer, len, result, idx;
                gpf.ASSERT(reader === this._reader, "Unexpected change of reader");
                if (reader.error) {
                    gpfFireEvent.apply(this, [
                        gpfI.IReadableStream.ERROR,
                        {
                            error: {
                                name: reader.error.name,
                                message: reader.error.message
                            }
                        },
                        this._eventsHandler
                    ]);
                } else if (reader.readyState === FileReader.DONE) {
                    buffer = new Int8Array(reader.result);
                    len = buffer.length;
                    result = [];
                    for (idx = 0; idx < len; ++idx) {
                        result.push(buffer[idx]);
                    }
                    gpfFireEvent.apply(this, [
                        gpfI.IReadableStream.EVENT_DATA,
                        { buffer: result },
                        this._eventsHandler
                    ]);
                }
            }
        }
    });
    //region HTML Attributes
    var
        /**
         * HTML attribute (base class).
         *
         * @class gpf.attributes.HtmlAttribute
         * @extends gpf.attributes.Attribute
         * @private
         */
        _Base = gpf._defAttr("HtmlAttribute", {}),
        /**
         * HTML Handler
         * Used to identify the member receiving the attached DOM inside an
         * object
         *
         * @class gpf.attributes.HtmlHandlerAttribute
         * @extends gpf.attributes.HtmlAttribute
         * @alias gpf.$HtmlHandler
         * @friend _handleHandlers
         * @friend _handleEvent
         */
        _Handler = gpf._defAttr("$HtmlHandler", _Base, {
            private: {
                _selector: "",
                _globalSelector: false
            },
            protected: {
                _select: function (domObject) {
                    var selector = this._selector;
                    if (selector) {
                        if (this._globalSelector) {
                            return document.querySelector(selector);
                        } else {
                            return domObject.querySelector(selector);
                        }
                    }
                    return undefined;
                }
            },
            public: {
                constructor: function (selector, global) {
                    if (selector) {
                        this._selector = selector;
                    }
                    if (undefined !== global) {
                        this._globalSelector = global === true;
                    }
                }
            }
        }),
        /**
         * HTML Event Mapper
         *
         * @class gpf.attributes.HtmlEventAttribute
         * @extends gpf.attributes.HtmlHandlerAttribute
         * @alias gpf.$HtmlEvent
         * @friend _handleEvent
         */
        _Event = gpf._defAttr("$HtmlEvent", _Handler, {
            private: { _event: "" },
            public: {
                constructor: function (event, selector, global) {
                    _Handler.apply(this, [
                        selector,
                        global
                    ]);
                    this._event = event;
                }
            }
        });
    //endregion
    //region HTML event handlers mappers through attributes
    function _getHandlerAttribute(member, handlerAttributeArray) {
        var attribute;
        if (1 !== handlerAttributeArray.length()) {
            gpf.Error.HtmlHandlerMultiplicityError({ member: member });
        }
        attribute = handlerAttributeArray.get(0);
        if (!(attribute instanceof _Event)) {
            return attribute;
        }
        return null;
    }
    function _findDefaultHandler(member, handlerAttributeArray) {
        var attribute = _getHandlerAttribute(member, handlerAttributeArray);
        if (attribute && !attribute._selector) {
            return attribute;
        }
    }
    /**
     * Attach the selected DOM object to the object instance
     *
     * @param {Object} instance Object instance
     * @param {String|Object} [domSelection=undefined] domSelection DOM
     * selector, DOM object or nothing. If a DOM selector or object is provided
     * it will be associated to the object using the default $HtmlHandler
     * attribute.
     * Otherwise, this can be used to refresh the missing associations.
     *
     * @return {Object|undefined} the DOM object
     * @closure
     */
    gpf.html.handle = function (instance, domSelection) {
        var allAttributes = new gpf.attributes.Map(instance).filter(_Base), handlerAttributes = allAttributes.filter(_Handler), defaultHandler, eventAttributes;
        if (0 === handlerAttributes.count()) {
            gpf.Error.HtmlHandlerMissing();
        }
        defaultHandler = handlerAttributes.each(_findDefaultHandler);
        if (undefined === defaultHandler) {
            gpf.Error.HtmlHandlerNoDefault();
        }
        defaultHandler = defaultHandler.member();
        if (undefined === domSelection) {
            domSelection = instance[defaultHandler];
            gpf.ASSERT(domSelection, "Handle not previously set");
        } else {
            if ("string" === typeof domSelection) {
                domSelection = document.querySelector(domSelection);
            }
            gpf.ASSERT(domSelection, "Selector does not resolve to DOM");
            if (!domSelection) {
                return;    // Nothing can be done
            }
            instance[defaultHandler] = domSelection;
        }
        // Process other handlers
        handlerAttributes.each(_handleHandlers, instance, [domSelection]);
        // Process event handlers
        eventAttributes = allAttributes.filter(_Event);
        if (0 < eventAttributes.count()) {
            eventAttributes.each(_handleEvents, instance, [domSelection]);
        }
        return domSelection;
    };
    function _handleHandlers(member, handlerAttributeArray, domObject) {
        /*jshint -W040*/
        // Used as a callback, this is the object instance
        var attribute = _getHandlerAttribute(member, handlerAttributeArray);
        if (!attribute || !attribute._selector) {
            return;
        }
        domObject = attribute._select(domObject);
        if (!domObject) {
            return;
        }
        this[member] = domObject;    /*jshint +W040*/
    }
    /**
     * @param {String} member
     * @param {gpf.attributes.Array} attributesArray
     * @param {Object} domObject
     * @private
     */
    function _handleEvents(member, attributesArray, domObject) {
        /*jshint -W040*/
        // Used as a callback, this is the object instance
        attributesArray.each(_handleEvent, this, [
            member,
            domObject
        ]);    /*jshint +W040*/
    }
    /**
     * @param {gpf.attributes.HtmlEventAttribute} eventAttribute
     * @param {String} member
     * @param {Object} domObject
     * @private
     */
    function _handleEvent(eventAttribute, member, domObject) {
        /*jshint -W040*/
        // Used as a callback, this is the object instance
        var event = eventAttribute._event, _boundMember = member + ":$HtmlEvent(" + event + "," + eventAttribute._selector + ")";
        domObject = eventAttribute._select(domObject);
        if (!domObject) {
            return;    // Nothing to do
        }
        if (!this[_boundMember]) {
            domObject.addEventListener(event, gpf.Callback.bind(this, member));
            this[_boundMember] = true;
        }    /*jshint +W040*/
    }
    //endregion
    //region Common HTML helpers
    gpf.extend(gpf.html, {
        hasClass: function (domObject, toCheck) {
            var classNames, len, idx;
            if ("string" === typeof toCheck) {
                toCheck = [toCheck];
            }
            gpf.ASSERT(toCheck instanceof Array, "Expected array");
            classNames = domObject.className.split(" ");
            len = toCheck.length;
            for (idx = 0; idx < len; ++idx) {
                if (undefined !== gpf.test(classNames, toCheck[idx])) {
                    return true;
                }
            }
            return false;
        },
        addClass: function (domObject, toAdd) {
            var classNames, lengthBeforeAdding, len, idx;
            if ("string" === typeof toAdd) {
                toAdd = [toAdd];
            }
            gpf.ASSERT(toAdd instanceof Array, "Expected array");
            classNames = domObject.className.split(" ");
            lengthBeforeAdding = classNames.length;
            len = toAdd.length;
            for (idx = 0; idx < len; ++idx) {
                gpf.set(classNames, toAdd[idx]);
            }
            // Avoid resource consuming refresh if nothing changed
            if (lengthBeforeAdding !== classNames.length) {
                domObject.className = classNames.join(" ");
            }
            return domObject;
        },
        removeClass: function (domObject, toRemove) {
            var classNames, lengthBeforeAdding, len, idx;
            if ("string" === typeof toRemove) {
                toRemove = [toRemove];
            }
            gpf.ASSERT(toRemove instanceof Array, "Expected array");
            classNames = domObject.className.split(" ");
            lengthBeforeAdding = classNames.length;
            len = toRemove.length;
            for (idx = 0; idx < len; ++idx) {
                gpf.clear(classNames, toRemove[idx]);
            }
            // Avoid resource consuming refresh if nothing changed
            if (lengthBeforeAdding !== classNames.length) {
                domObject.className = classNames.join(" ");
            }
            return domObject;
        }
    });    //endregion
    var
        // Namespaces shortcut
        gpfI = gpf.interfaces, gpfA = gpf.attributes, gpfFireEvent = gpf.events.fire;
    /*
        // XML Parser constants
        _XMLPARSER_STATE_NONE = 0
*/
    ;
    gpf.xml = {};
    /**
     * Defines the possibility for the object to be saved as XML
     *
     * @class gpf.interfaces.IXmlSerializable
     * @extends gpf.interfaces.Interface
     */
    gpf._defIntrf("IXmlSerializable", {
        "[toXml]": [gpf.$ClassEventHandler()],
        toXml: function (out, eventsHandler) {
            gpfI.ignoreParameter(out);
            gpfI.ignoreParameter(eventsHandler);
        }
    });
    /**
     * Defines the possibility for an object to receive XML serialization events
     *
     * @class gpf.interfaces.IXmlContentHandler
     * @extends gpf.interfaces.Interface
     *
     * Inspired from
     * http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
     */
    gpf._defIntrf("IXmlContentHandler", {
        "[characters]": [gpf.$ClassEventHandler()],
        characters: function (buffer, eventsHandler) {
            gpfI.ignoreParameter(buffer);
            gpfI.ignoreParameter(eventsHandler);
        },
        "[endDocument]": [gpf.$ClassEventHandler()],
        endDocument: function (eventsHandler) {
            gpfI.ignoreParameter(eventsHandler);
        },
        "[endElement]": [gpf.$ClassEventHandler()],
        endElement: function (eventsHandler) {
            gpfI.ignoreParameter(eventsHandler);
        },
        endPrefixMapping: function (prefix) {
            gpfI.ignoreParameter(prefix);
        },
        "[ignorableWhitespace]": [gpf.$ClassEventHandler()],
        ignorableWhitespace: function (buffer, eventsHandler) {
            gpfI.ignoreParameter(buffer);
            gpfI.ignoreParameter(eventsHandler);
        },
        "[processingInstruction]": [gpf.$ClassEventHandler()],
        processingInstruction: function (target, data, eventsHandler) {
            gpfI.ignoreParameter(target);
            gpfI.ignoreParameter(data);
            gpfI.ignoreParameter(eventsHandler);
        },
        setDocumentLocator: function (locator) {
            gpfI.ignoreParameter(locator);
        },
        skippedEntity: function (name) {
            gpfI.ignoreParameter(name);
        },
        "[startDocument]": [gpf.$ClassEventHandler()],
        startDocument: function (eventsHandler) {
            gpfI.ignoreParameter(eventsHandler);
        },
        "[startElement]": [gpf.$ClassEventHandler()],
        startElement: function (uri, localName, qName, attributes, eventsHandler) {
            gpfI.ignoreParameter(uri);
            gpfI.ignoreParameter(localName);
            gpfI.ignoreParameter(qName);
            gpfI.ignoreParameter(attributes);
            gpfI.ignoreParameter(eventsHandler);
        },
        startPrefixMapping: function (prefix, uri) {
            gpfI.ignoreParameter(prefix);
            gpfI.ignoreParameter(uri);
        }
    });
    var
        //region XML attributes
        /**
         * XML attribute (base class).
         * once the attribute is assigned to an object, it implements the
         * IXmlSerializable interface
         *
         * @class gpf.attributes.XmlAttribute
         * @extends gpf.attributes.Attribute
         * @private
         */
        _Base = gpf._defAttr("XmlAttribute", {
            protected: {
                _alterPrototype: function (objPrototype) {
                    /*
                     * If not yet defined creates new XML members
                     * - toXml()
                     * - IXmlContentHandler implementation
                     */
                    if (undefined === objPrototype.toXml) {
                        // Declare toXml
                        gpfA.add(objPrototype.constructor, "Class", [gpf.$InterfaceImplement(gpfI.IXmlSerializable)]);
                        objPrototype.toXml = _toXml;
                        // Declare IXmlContentHandler interface through IUnknown
                        gpfA.add(objPrototype.constructor, "Class", [gpf.$InterfaceImplement(gpfI.IXmlContentHandler, _fromXml)]);
                    }
                }
            }
        }),
        /**
         * XML Ignore attribute
         * Indicates the member must not be serialized
         *
         * @class gpf.attributes.XmlIgnoreAttribute
         * @extends gpf.attributes.XmlAttribute
         * @alias gpf.$XmlIgnore
         */
        _Ignore = gpf._defAttr("$XmlIgnore", _Base, {}),
        /**
         * XML Attribute attribute
         * Indicates the member is serialized as an attribute
         *
         * @param {String} name The attribute name
         *
         * @class gpf.attributes.XmlAttributeAttribute
         * @extends gpf.attributes.XmlAttribute
         * @alias gpf.$XmlAttribute
         */
        _Attribute = gpf._defAttr("$XmlAttribute", _Base, {
            private: {
                "[_name]": [gpf.$ClassProperty()],
                _name: ""
            },
            public: {
                constructor: function (name) {
                    gpf.ASSERT(gpf.xml.isValidName(name), "Valid XML attribute name");
                    this._name = name;
                }
            }
        }),
        /**
         * XML RAW Element attribute
         *
         * @param {String} name The element name
         *
         * @class gpf.attributes.XmlRawElementAttribute
         * @extends gpf.attributes.XmlAttribute
         */
        _RawElement = gpf._defAttr("XmlRawElementAttribute", _Base, {
            private: {
                "[_name]": [gpf.$ClassProperty()],
                _name: ""
            },
            public: {
                constructor: function (name) {
                    gpf.ASSERT(gpf.xml.isValidName(name), "Valid XML element name");
                    this._name = name;
                }
            }
        }),
        /**
         * XML Element attribute
         * Indicates the member is serialized as an element
         *
         * @param {String} name The element name
         * @param {Function} objClass The class used for un-serializing it
         *
         * @class gpf.attributes.XmlElementAttribute
         * @extends gpf.attributes.XmlRawElementAttribute
         * @alias gpf.$XmlElement
         */
        _Element = gpf._defAttr("$XmlElement", _RawElement, {
            private: {
                "[_objClass]": [gpf.$ClassProperty()],
                _objClass: null
            },
            public: {
                constructor: function (name, objClass) {
                    this._super(name);
                    if (objClass) {
                        this._objClass = objClass;
                    }
                }
            }
        }),
        /**
         * XML List attribute
         * Indicates the member is an array and is serialized inside an element
         *
         * @class gpf.attributes.XmlListAttribute
         * @extends gpf.attributes.XmlRawElementAttribute
         * @alias gpf.$XmlList
         */
        _List = gpf._defAttr("$XmlList", _RawElement, {}),
        //endregion
        //region TO XML
        /**
         * Select the attribute related to the value type
         *
         * @param {gpf.attributes.Array} array Attribute array
         * @param {Object} value
         * @return {null|gpf.attributes.Attribute}
         * @private
         */
        _selectByType = function (array, value) {
            var idx, attribute, defaultResult = null, result = null, attObjClass;
            for (idx = 0; idx < array.length(); ++idx) {
                attribute = array.get(idx);
                if (!(attribute instanceof _Element)) {
                    continue;
                }
                attObjClass = attribute.objClass();
                if (attObjClass) {
                    if (value instanceof attObjClass) {
                        /*
                         * If no result attribute has been set
                         * OR if the new attribute is a 'child' class of the
                         * existing result (meaning the new attribute is 'more'
                         * specific)
                         */
                        if (!result || attObjClass.prototype instanceof result.objClass()) {
                            result = attribute;
                        }
                    }
                } else if (!defaultResult) {
                    defaultResult = attribute;
                }
            }
            if (null !== result) {
                return result;
            } else {
                return defaultResult;
            }
        },
        /**
         * Decide if the member value must be serialized as an attribute (and
         * return its name) or as a sub node (empty result)
         *
         * @param {String} member
         * @param {*} value
         * @param {String} type
         * @param {gpf.attributes.Array} attArray
         * @return {String} "" if the member should be serialized as a sub
         *          node, otherwise the name to apply
         * @private
         */
        _objMemberValueIsAttribute = function (member, value, type, attArray) {
            var attribute;
            // Check if list or element
            if (value instanceof Array || attArray.has(_List) || "object" === type || attArray.has(_Element)) {
                return "";    // Not an attribute
            }
            // Else attribute
            attribute = attArray.has(_Attribute);
            if (attribute && attribute.name()) {
                member = attribute.name();
            } else {
                if ("_" === member.charAt(0)) {
                    member = member.substr(1);
                }
            }
            return member;
        },
        /**
         * Convert the object member into XML using the provided XML content
         * handler
         *
         * @param {Object} obj
         * @param {String} member Member name
         * @param {gpf.interfaces.wrap(IXmlContentHandler)} wrapped
         * @param {gpf.attributes.Map} attMap Map filled with XML attributes
         * @private
         */
        _objMemberToSubNodes = function (obj, member, wrapped, attMap) {
            var value, attArray, attribute, closeNode, idx, subValue, type, name;
            value = obj[member];
            // Exception for dates
            if (value instanceof Date) {
                value = gpf.dateToComparableFormat(value, true);
            }
            attArray = attMap.member(member);
            if ("_" === member.charAt(0)) {
                member = member.substr(1);
            }
            // Check if list
            attribute = attArray.has(_List);
            if (value instanceof Array || attribute) {
                // TODO: what to do when value is empty?
                if (attribute && attribute.name()) {
                    closeNode = true;
                    wrapped.startElement("", attribute.name());
                }
                // Get the list of 'candidates'
                attArray = attArray.filter(_Element);
                for (idx = 0; idx < value.length; ++idx) {
                    subValue = value[idx];
                    // Select the right candidate
                    type = _selectByType(attArray, subValue);
                    if (type && type.name()) {
                        name = type.name();
                    } else {
                        name = "item";
                    }
                    _toContentHandler(subValue, wrapped, name);
                }
                if (closeNode) {
                    wrapped.endElement();
                }
                return;
            }
            attribute = attArray.has(_Element);
            // Element
            if (attribute && attribute.name()) {
                name = attribute.name();
            }
            _toContentHandler(value, wrapped, name);
        },
        /**
         * Convert the object into XML using the provided XML content handler
         *
         * @param {Object} obj
         * @param {gpf.interfaces.wrap(IXmlContentHandler)} wrapped
         * @param {String} [name="object"] name Name of the root node
         * @param {gpf.attributes.Map} attMap Map filled with XML attributes
         * @private
         */
        _objPrototypeToContentHandler = function (obj, wrapped, name, attMap) {
            var attArray, member, value, type, attName, subNodeMembers = 0, xmlAttributes = 0, idx;
            /*
             * WARNING: the prototype is used instead of the object itself
             * This is done to respect the order provided in the prototype
             * (order that can be overridden through the object).
             * Furthermore, this guarantees we serialize only 'members'
             * coming from the 'class' definition.
             * It needs two passes:
             * - one for attributes,
             * - another one for sub nodes
             */
            for (member in obj.constructor.prototype) {
                /*
                 * I must also use inherited properties
                 * NO hasOwnProperty
                 */
                value = obj[member];
                // Exception for dates
                if (value instanceof Date) {
                    value = gpf.dateToComparableFormat(value, true);
                }
                type = typeof value;
                // Skip functions
                if ("function" === type) {
                    continue;
                }
                // Check member's attributes
                attArray = attMap.member(member);
                // Ignore?
                if (attArray.has(_Ignore)) {
                    continue;
                }
                // Decide if attribute or subNode
                attName = _objMemberValueIsAttribute(member, value, type, attArray);
                if (attName) {
                    if (0 === xmlAttributes) {
                        xmlAttributes = {};
                    }
                    xmlAttributes[attName] = value.toString();
                } else {
                    // Subnode
                    if (0 === subNodeMembers) {
                        subNodeMembers = [];
                    }
                    subNodeMembers.push(member);
                }
            }
            wrapped.startElement("", name, name, xmlAttributes);
            if (subNodeMembers) {
                for (idx = 0; idx < subNodeMembers.length; ++idx) {
                    _objMemberToSubNodes(obj, subNodeMembers[idx], wrapped, attMap);
                }
            }
        },
        /**
         * Convert the parameter into XML using the provided XML content handler
         *
         * @param {*} obj
         * @param {gpf.interfaces.wrap(IXmlContentHandler)} wrapped
         * @param {String} [name="object"] name Name of the root node
        * @private
         */
        _toContentHandler = function (obj, wrapped, name) {
            var attMap = new gpfA.Map(obj).filter(_Base), attribute;
            // If no 'name', check the Class attribute
            if (!name) {
                attribute = attMap.member("Class").has(_Element);
                if (attribute) {
                    name = attribute.name();
                } else {
                    name = gpf.classDef(obj.constructor).name();
                    if (!name) {
                        name = "object";
                    }
                }
            }
            // If not an object, serialize the textual representation
            if ("object" !== typeof obj) {
                wrapped.startElement("", name);
                wrapped.characters(gpf.value(obj, ""));
            } else {
                _objPrototypeToContentHandler(obj, wrapped, name, attMap);
            }
            wrapped.endElement();
        },
        /**
         * Converts this into XML using the provided XML content handler
         *
         * @@implements gpf.interfaces.IIXmlSerializable:toXml
         * @private
         */
        _toXml = function (out, eventsHandler) {
            var WXmlContentHandler = gpf.interfaces.wrap(gpfI.IXmlContentHandler), wrapped = new WXmlContentHandler(out);
            wrapped.$catch(eventsHandler).$finally(eventsHandler, "ready");
            _toContentHandler(this, wrapped);
        },
        //endregion
        //region FROM XML
        /**
         * Class to handle object un-serialization from XML
         *
         * @class FromXmlContentHandler
         * @implements gpf.interfaces.IXmlContentHandler
         * @private
         */
        FromXmlContentHandler = gpf.define("FromXmlContentHandler", {
            "[Class]": [gpf.$InterfaceImplement(gpfI.IXmlContentHandler)],
            _target: null,
            _firstElement: true,
            _forward: [],
            constructor: function (target) {
                this._target = target;
                this._firstElement = true;
                this._forward = [];
            },
            _fillFromAttributes: function (attributes) {
                var xmlAttributes = new gpfA.Map(this._target), targetProto = this._target.constructor.prototype, member, attArray, attName;
                for (member in targetProto) {
                    if ("function" === typeof targetProto[member]) {
                        continue;    // ignore
                    }
                    attArray = xmlAttributes.member(member).filter(_Attribute);
                    if (0 < attArray.length()) {
                        gpf.ASSERT(attArray.length() === 1, "Expected one attribute only");
                        attName = attArray.get(0).name();
                    } else {
                        // Only private are serialized by default as att.
                        if (member.charAt(0) === "_") {
                            attName = member.substr(1);
                        } else {
                            continue;    // ignore
                        }
                    }
                    if (attName in attributes) {
                        this._target[member] = gpf.value(attributes[attName], targetProto[member]);
                    }
                }
            },
            _fillFromElement: function (uri, localName, qName, attributes) {
                var xmlAttributes = new gpfA.Map(this._target).filter(_RawElement), forward = this._forward[0], members, idx, member, attArray, jdx, attribute;
                gpf.interfaces.ignoreParameter(uri);
                gpf.interfaces.ignoreParameter(qName);
                gpf.interfaces.ignoreParameter(attributes);
                // If
                if (undefined === forward) {
                    // No forward, check all members
                    members = xmlAttributes.members();
                } else {
                    // At least one forward exists, it is related to a member
                    gpf.ASSERT(forward.type !== 0, "No content handler here");
                    members = [forward.member];
                }
                for (idx = 0; idx < members.length; ++idx) {
                    member = members[idx];
                    attArray = xmlAttributes.member(member);
                    for (jdx = 0; jdx < attArray.length(); ++jdx) {
                        attribute = attArray.get(jdx);
                        // TODO handle namespaces
                        if (attribute.name() === localName) {
                            // Attribute found, try
                            if (this._fillFromRawElement(member, attribute)) {
                                return;
                            }
                        }
                    }
                }    // Ignore?
            },
            _fillFromRawElement: function (member, attribute) {
                var obj, forward;
                if (attribute instanceof _Element) {
                    // Build new object and assign it to the member
                    if (attribute.objClass()) {
                        obj = new (attribute.objClass())();
                        this._target[member] = obj;
                        // Query IXmlContentHandler
                        forward = gpfI.query(obj, gpfI.IXmlContentHandler);
                    }
                    if (forward) {
                        forward = {
                            type: 0,
                            iXCH: forward
                        };
                    } else {
                        forward = {
                            type: 1,
                            member: member,
                            buffer: []
                        };
                    }
                } else if (attribute instanceof _List) {
                    // The member is an array of objects
                    this._target[member] = [];
                    forward = {
                        type: 2,
                        member: member
                    };
                }
                if (forward) {
                    forward.depth = 1;
                    this._forward.unshift(forward);
                    return true;
                } else {
                    return false;
                }
            },
            characters: function (buffer, eventsHandler) {
                var forward = this._forward[0];
                if (undefined !== forward) {
                    if (0 === forward.type) {
                        forward.iXCH.characters.apply(forward.iXCH, arguments);
                    } else if (1 === forward.type) {
                        forward.buffer.push(buffer);
                    }
                }
                gpfFireEvent.apply(this, [
                    "ready",
                    eventsHandler
                ]);
            },
            endDocument: function (eventsHandler) {
                gpfFireEvent.apply(this, [
                    "ready",
                    eventsHandler
                ]);
            },
            endElement: function (eventsHandler) {
                var forward = this._forward[0], memberValue, textValue;
                if (undefined !== forward) {
                    if (0 === forward.type) {
                        forward.iXCH.endElement.apply(forward.iXCH, arguments);
                    } else if (1 === forward.type) {
                        memberValue = this._target[forward.member];
                        textValue = forward.buffer.join("");
                        if (memberValue instanceof Array) {
                            memberValue.push(textValue);
                        } else {
                            this._target[forward.member] = gpf.value(textValue, memberValue);
                        }
                    }
                    /*else if (2 === forward.type) {
                        // Nothing to do

                    } */
                    if (0 === --forward.depth) {
                        this._forward.shift();
                    }
                }
                gpfFireEvent.apply(this, [
                    "ready",
                    eventsHandler
                ]);
            },
            endPrefixMapping: function (prefix) {
                // Nothing to do (?)
                gpfI.ignoreParameter(prefix);
            },
            ignorableWhitespace: function (buffer, eventsHandler) {
                // Nothing to do
                gpfI.ignoreParameter(buffer);
                gpfFireEvent.apply(this, [
                    "ready",
                    eventsHandler
                ]);
            },
            processingInstruction: function (target, data, eventsHandler) {
                // Not relevant
                gpfI.ignoreParameter(target);
                gpfI.ignoreParameter(data);
                gpfFireEvent.apply(this, [
                    "ready",
                    eventsHandler
                ]);
            },
            setDocumentLocator: function (locator) {
                // Nothing to do
                gpfI.ignoreParameter(locator);
            },
            skippedEntity: function (name) {
                // Nothing to do
                gpfI.ignoreParameter(name);
            },
            startDocument: function (eventsHandler) {
                // Nothing to do
                gpfFireEvent.apply(this, [
                    "ready",
                    eventsHandler
                ]);
            },
            startElement: function (uri, localName, qName, attributes, eventsHandler) {
                var forward = this._forward[0];
                gpf.interfaces.ignoreParameter(uri);
                gpf.interfaces.ignoreParameter(localName);
                gpf.interfaces.ignoreParameter(qName);
                if (undefined !== forward) {
                    if (0 === forward.type) {
                        ++forward.depth;
                        forward.iXCH.startElement.apply(forward.iXCH, arguments);
                    } else {
                        this._fillFromElement.apply(this, arguments);
                    }
                } else if (this._firstElement) {
                    this._firstElement = false;
                    /*
                     * First time startElement is called, ignore localName
                     * but process attributes.
                     */
                    this._fillFromAttributes(attributes);
                } else {
                    /*
                     * Elements are used to introduce a sub-object
                     */
                    this._fillFromElement.apply(this, arguments);
                }
                gpfFireEvent.apply(this, [
                    "ready",
                    eventsHandler
                ]);
            },
            startPrefixMapping: function (prefix, uri) {
                // Nothing to do (?)
                gpfI.ignoreParameter(prefix);
                gpfI.ignoreParameter(uri);
            }    //endregion
        }), _fromXml = function (target) {
            return new FromXmlContentHandler(target);
        };
    // endregion
    //region XML Writer
    /**
     * A class to serialize an XML into a string
     *
     * @class gpf.xml.Writer
     * @implements gpf.interfaces.IXmlContentHandler
     */
    gpf.define("gpf.xml.Writer", {
        "[Class]": [gpf.$InterfaceImplement(gpfI.IXmlContentHandler)],
        private: {
            _stream: null,
            _branch: [],
            _pendingPrefixMappings: [],
            _buffer: [],
            _eventsHandler: null,
            _closeLeafForContent: function () {
                var leaf;
                if (this._branch.length) {
                    leaf = this._branch[this._branch.length - 1];
                    if (!leaf.hasContent) {
                        this._buffer.push(">");
                        leaf.hasContent = true;
                    }
                }
            },
            _flush: function (eventsHandler) {
                this._eventsHandler = eventsHandler;
                this._flushed();
            },
            _flushed: function (event) {
                var eventsHandler;
                if (event && event.type() === gpfI.IWritableStream.EVENT_ERROR) {
                    gpfFireEvent.apply(this, [
                        event,
                        this._eventsHandler
                    ]);
                } else if (0 === this._buffer.length) {
                    eventsHandler = this._eventsHandler;
                    this._eventsHandler = null;
                    gpfFireEvent.apply(this, [
                        gpfI.IWritableStream.EVENT_READY,
                        eventsHandler
                    ]);
                } else {
                    this._stream.write(this._buffer.shift(), gpf.Callback.bind(this, "_flushed"));
                }
            }
        },
        public: {
            constructor: function (stream) {
                this._stream = gpfI.query(stream, gpfI.IWritableStream, true);
                this._branch = [];
                this._pendingPrefixMappings = [];
                this._buffer = [];
            },
            characters: function (buffer, eventsHandler) {
                gpf.ASSERT(null === this._eventsHandler, "Write in progress");
                this._closeLeafForContent();
                this._buffer.push(buffer);
                this._flush(eventsHandler);
            },
            endDocument: function (eventsHandler) {
                gpf.ASSERT(null === this._eventsHandler, "Write in progress");
                // Nothing to do
                this._flush(eventsHandler);
            },
            endElement: function (eventsHandler) {
                gpf.ASSERT(null === this._eventsHandler, "Write in progress");
                var leaf = this._branch.pop();
                if (leaf.hasContent) {
                    this._buffer.push("</", leaf.qName, ">");
                } else {
                    this._buffer.push("/>");
                }
                this._flush(eventsHandler);
            },
            endPrefixMapping: function (prefix) {
                // Nothing to do (?)
                gpf.interfaces.ignoreParameter(prefix);
            },
            ignorableWhitespace: function (buffer, eventsHandler) {
                gpf.ASSERT(null === this._eventsHandler, "Write in progress");
                this._closeLeafForContent();
                this._buffer.push(buffer);
                this._flush(eventsHandler);
            },
            processingInstruction: function (target, data, eventsHandler) {
                gpf.ASSERT(null === this._eventsHandler, "Write in progress");
                this._buffer.push("<?", target, " ", gpf.escapeFor(data, "xml"), "?>");
                this._flush(eventsHandler);
            },
            setDocumentLocator: function (locator) {
                // Nothing to do
                gpf.interfaces.ignoreParameter(locator);
            },
            skippedEntity: function (name) {
                // Nothing to do
                gpf.interfaces.ignoreParameter(name);
            },
            startDocument: function (eventsHandler) {
                gpf.ASSERT(null === this._eventsHandler, "Write in progress");
                // Nothing to do
                this._flush(eventsHandler);
            },
            startElement: function (uri, localName, qName, attributes, eventsHandler) {
                gpf.ASSERT(null === this._eventsHandler, "Write in progress");
                var attName, attValue, len, idx;
                if (undefined === qName && !uri) {
                    qName = localName;
                }
                this._closeLeafForContent();
                var leaf = {
                        hasContent: false,
                        qName: qName
                    };
                this._branch.push(leaf);
                this._buffer.push("<", qName);
                if (attributes) {
                    for (attName in attributes) {
                        if (attributes.hasOwnProperty(attName)) {
                            this._buffer.push(" ", attName, "=\"");
                            attValue = gpf.escapeFor(attributes[attName].toString(), "xml");
                            if (-1 < attValue.indexOf("\"")) {
                                attValue = gpf.replaceEx(attValue, { "\"": "&quot;" });
                            }
                            this._buffer.push(attValue, "\"");
                        }
                    }
                }
                len = this._pendingPrefixMappings.length;
                if (len) {
                    for (idx = 0; idx < len; ++idx) {
                        this._buffer.push(" ", this._pendingPrefixMappings[idx]);
                    }
                    this._pendingPrefixMappings = [];
                }
                this._flush(eventsHandler);
            },
            startPrefixMapping: function (prefix, uri) {
                this._pendingPrefixMappings.push([
                    "xmlns:",
                    prefix,
                    ":\"",
                    gpf.escapeFor(uri, "xml"),
                    "\""
                ].join(""));
            }    //endregion
        }
    });
    //endregion
    //region XML Parser
    /* TBD
    gpf.xml.Parser = gpf.Parser.extend({

        _contentHandler: null,

        constructor: function (contentHandler) {
            this._contentHandler = contentHandler;
        },

        _parse: function (char) {

            if (_XMLPARSER_STATE_NONE === this._state) {
                
            }

        },

        _reset: function () {

        }

    });
*/
    //endregion
    //region Parsing
    /**
     * Tries to convert any value into XML
     *
     * @param {*} value
     * @param {Object} out Recipient object for XML serialization
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event ready
     */
    gpf.xml.convert = function (value, out, eventsHandler) {
        var iXmlSerializable;
        if ("string" === typeof value) {
            gpf.Error.NotImplemented();
        } else if ("object" === typeof value) {
            iXmlSerializable = gpfI.query(value, gpfI.IXmlSerializable);
            if (null === iXmlSerializable) {
                iXmlSerializable = new gpf.xml.ConstNode(value);
            }
            iXmlSerializable.toXml(out, eventsHandler);
        }
    };
    //endregion
    //region Helpers
    var _firstValidChar = gpf._alpha + gpf._ALPHA + "_", _otherValidChars = _firstValidChar + "012345789.-";
    gpf.extend(gpf.xml, {
        isValidName: function (name) {
            var idx;
            if (0 === name.length || -1 === _firstValidChar.indexOf(name.charAt(0))) {
                return false;
            }
            for (idx = 1; idx < name.length; ++idx) {
                if (-1 === _otherValidChars.indexOf(name.charAt(idx))) {
                    return false;
                }
            }
            return true;
        },
        toValidName: function (name) {
            var newName;
            if (gpf.xml.isValidName(name)) {
                return name;
            }
            // Try with a starting _
            newName = "_" + name;
            if (!gpf.xml.isValidName(newName)) {
                gpf.Error.XmlInvalidName();
            }
            return newName;
        }
    });    //endregion
    var
        // gpfA = gpf.attributes,
        gpfI = gpf.interfaces;
    gpf.extend(gpf.xml, {
        NODE_INVALID: 0,
        NODE_ELEMENT: 1,
        NODE_ATTRIBUTE: 2,
        NODE_TEXT: 3,
        NODE_ENTITY_REFERENCE: 5,
        NODE_PROCESSING_INSTRUCTION: 7,
        NODE_COMMENT: 8,
        NODE_DOCUMENT: 9
    });
    /**
     * Defines an XML node structure (Read Only)
     *
     * @class gpf.interfaces.IXmlConstNode
     * @extends gpf.interfaces.Interface
     */
    gpf._defIntrf("IXmlConstNode", {
        attributes: function (name) {
            gpf.interfaces.ignoreParameter(name);
            return "";
        },
        children: function (idx) {
            if (undefined === idx) {
                return [];
            } else {
                return undefined;
            }
        },
        localName: function () {
            return "";
        },
        namespaceURI: function () {
            return "";
        },
        nextSibling: function () {
            return null;
        },
        nodeName: function () {
            return "";
        },
        nodeType: function () {
            return 0;
        },
        nodeValue: function () {
            return null;
        },
        ownerDocument: function () {
            return null;
        },
        parentNode: function () {
            return null;
        },
        prefix: function () {
            return "";
        },
        previousSibling: function () {
            return null;
        },
        textContent: function () {
            return "";
        }
    });
    /**
     * Manipulate a JavaScript object as an XML node
     *
     * @class gpf.xml.ConstNode
     * @implements gpf.interfaces.IXmlConstNode
     * @implements gpf.interfaces.IXmlSerializable
     */
    gpf.define("gpf.xml.ConstNode", {
        "[Class]": [
            gpf.$InterfaceImplement(gpfI.IXmlConstNode),
            gpf.$InterfaceImplement(gpfI.IXmlSerializable)
        ],
        _obj: null,
        _name: "",
        _parentNode: null,
        _attributes: {},
        _elements: {},
        _children: [],
        constructor: function (obj, name) {
            this._obj = obj;
            this._attributes = null;
            this._elements = null;
            this._children = null;
            if (undefined === name) {
                this._name = "root";
            } else {
                this._name = name;
            }
        },
        _members: function () {
            var member, value, name;
            this._attributes = {};
            this._elements = {};
            if ("object" === typeof this._obj && !(this._obj instanceof Array)) {
                for (member in this._obj) {
                    if (this._obj.hasOwnProperty(member)) {
                        value = this._obj[member];
                        if (null === value) {
                            // Ignore
                            continue;
                        }
                        name = gpf.xml.toValidName(member);
                        if ("object" === typeof value) {
                            this._elements[member] = name;
                        } else {
                            this._attributes[member] = name;
                        }
                    }
                }
            }
        },
        attributes: function (name) {
            var result, member, mappedName;
            if (null === this._attributes) {
                this._members();
            }
            if (undefined === name) {
                result = {};
                for (member in this._attributes) {
                    if (this._attributes.hasOwnProperty(member)) {
                        mappedName = this._attributes[member];
                        result[mappedName] = this._obj[member];
                    }
                }
                return result;
            }
            for (member in this._attributes) {
                if (this._attributes.hasOwnProperty(member)) {
                    if (name === this._attributes[member]) {
                        return this._obj[member];
                    }
                }
            }
            return undefined;
        },
        children: function (idx) {
            var jdx, child, member, name;
            if (null === this._children) {
                if (null === this._elements) {
                    this._members();
                }
                this._children = [];
                if (this._obj instanceof Array) {
                    for (jdx = 0; jdx < this._obj.length; ++jdx) {
                        child = new gpf.xml.ConstNode(this._obj[jdx], "item");
                        child._parentNode = this;
                        this._children.push(child);
                    }
                } else {
                    for (member in this._elements) {
                        if (this._elements.hasOwnProperty(member)) {
                            name = this._elements[member];
                            child = new gpf.xml.ConstNode(this._obj[member], name);
                            child._parentNode = this;
                            this._children.push(child);
                        }
                    }
                }
            }
            return gpf.arrayOrItem(this._children, idx);
        },
        localName: function () {
            return this._name;
        },
        namespaceURI: function () {
            return "";
        },
        nextSibling: function () {
            var pos;
            if (null !== this._parentNode) {
                pos = gpf.test(this._parentNode._children, this);
                if (undefined !== pos && pos < this._parentNode._children.length - 1) {
                    return this._parentNode._children[pos + 1];
                }
            }
            return null;
        },
        nodeName: function () {
            return this._name;
        },
        nodeType: function () {
            return gpf.xml.NODE_ELEMENT;
        },
        nodeValue: function () {
            return this._obj;
        },
        ownerDocument: function () {
            return null;
        },
        parentNode: function () {
            return this._parentNode;
        },
        prefix: function () {
            return "";
        },
        previousSibling: function () {
            var pos;
            if (null !== this._parentNode) {
                pos = gpf.test(this._parentNode._children, this);
                if (0 < pos) {
                    return this._parentNode._children[pos - 1];
                }
            }
            return null;
        },
        textContent: function () {
            if ("object" !== typeof this._obj) {
                return gpf.value(this._obj, "");
            } else {
                return "";
            }
        },
        toXml: function (out, eventsHandler) {
            gpf.xml.nodeToXml(this, out, eventsHandler);
        }    //endregion
    });
    /**
     * Serialize the node into an gpf.interfaces.IXmlContentHandler
     *
     * @param {gpf.interfaces.IXmlConstNode} node Node to serialize
     * @param {gpf.interfaces.wrap(IXmlContentHandler)} wrapped XML Content
     */
    function _nodeToXml(node, wrapped) {
        var name = node.localName(), attributes = node.attributes(), children = node.children(), text = node.textContent(), idx;
        wrapped.startElement("", name, name, attributes);
        // Today the XmlConstNode may not have both children and textual content
        if (text) {
            wrapped.characters(text);
        } else {
            for (idx = 0; idx < children.length; ++idx) {
                _nodeToXml(children[idx], wrapped);
            }
        }
        wrapped.endElement();
    }
    /**
     * Serialize the node into an gpf.interfaces.IXmlContentHandler
     *
     * @param {gpf.interfaces.IXmlConstNode} node Node to serialize
     * @param {gpf.interfaces.IXmlContentHandler} out XML Content handler
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event ready
     */
    gpf.xml.nodeToXml = function (node, out, eventsHandler) {
        var WXmlContentHandler = gpf.interfaces.wrap(gpfI.IXmlContentHandler), wrapped = new WXmlContentHandler(out);
        wrapped.$catch(eventsHandler).$finally(eventsHandler, "ready");
        _nodeToXml(node, wrapped);
    };
    function _each(nodes, func, param, resultSet) {
        var idx, node;
        for (idx = 0; idx < nodes.length; ++idx) {
            node = nodes[idx];
            func(node, param, resultSet);
        }
    }
    /**
     * Test an expression with type = NODE_ELEMENT
     *
     * @param {gpf.xml.IXmlConstNode} node
     * @param {Object} expr
     * @param {gpf.xml.IXmlConstNode[]} resultSet
     * @private
     */
    function _testELEMENT(node, expr, resultSet) {
        var children = node.children(), child, idx, keep;
        for (idx = 0; idx < children.length; ++idx) {
            keep = true;
            child = children[idx];
            if (expr.name && child.localName() !== expr.name) {
                keep = false;
            } else if (expr.text && child.textContent() !== expr.text) {
                keep = false;
            }
            if (keep) {
                resultSet.push(child);
            }
            if (undefined !== expr.relative && !expr.relative) {
                _testELEMENT(child, expr, resultSet);
            }
        }
    }
    /**
     * Test an expression with type = NODE_ATTRIBUTE
     *
     * @param {gpf.xml.IXmlConstNode} node
     * @param {Object} expr
     * @param {gpf.xml.IXmlConstNode[]} resultSet
     * @private
     */
    function _testATTRIBUTE(node, expr, resultSet) {
        var attributes, name, text;
        if (expr.name) {
            text = node.attributes(expr.name);
            if (undefined !== text && (!expr.text || text === expr.text)) {
                resultSet.push(node);
            }
        } else {
            attributes = node.attributes();
            for (name in attributes) {
                if (attributes.hasOwnProperty(name)) {
                    text = attributes[name];
                    if (!expr.text || text === expr.text) {
                        resultSet.push(node);
                        break;
                    }
                }
            }
        }
    }
    /**
     * Apply the expression on each element of the nodeSet and build the
     * resultSet
     *
     * @param {gpf.xml.IXmlConstNode[]} nodeSet
     * @param {Object} expr
     * @param {gpf.xml.IXmlConstNode[]} resultSet
     * @private
     */
    function _test(nodeSet, expr, resultSet) {
        if (gpf.xml.NODE_ELEMENT === expr.type) {
            _each(nodeSet, _testELEMENT, expr, resultSet);
        } else if (gpf.xml.NODE_ATTRIBUTE === expr.type) {
            _each(nodeSet, _testATTRIBUTE, expr, resultSet);
        }
    }
    /**
     * Apply the filter expression on the node
     *
     * @param {gpf.xml.IXmlConstNode} node
     * @param {Object} expr
     * @param {gpf.xml.IXmlConstNode[]} resultSet
     * @private
     */
    function _filter(node, expr, resultSet) {
        var selectedNodes, conditions, type, idx, condition;
        if (expr.and) {
            conditions = expr.and;
            type = 0;
        } else if (expr.or) {
            conditions = expr.or;
            type = 1;
        }
        for (idx = 0; idx < conditions.length; ++idx) {
            condition = conditions[idx];
            if (condition.and || condition.or) {
                selectedNodes = [];
                _filter(node, condition, selectedNodes);
            } else {
                selectedNodes = _select(node, condition);
            }
            if (0 === type && selectedNodes.length === 0) {
                return;
            }
            if (1 === type && selectedNodes.length !== 0) {
                resultSet.push(node);
                return;
            }
        }
        if (0 === type) {
            resultSet.push(node);
        }
    }
    /**
     * Select the expression on the current node
     *
     * @param {gpf.xml.IXmlConstNode} node
     * @param {Object} expr
     * @private
     */
    function _select(node, expr) {
        var resultSet, nodeSet = [node];
        while (expr) {
            resultSet = [];
            _test(nodeSet, expr, resultSet);
            if (0 === resultSet.length) {
                return [];
            }
            nodeSet = resultSet;
            if (expr.filter) {
                resultSet = [];
                _each(nodeSet, _filter, expr.filter, resultSet);
                if (0 === resultSet.length) {
                    return [];
                }
                nodeSet = resultSet;
            }
            expr = expr.then;
        }
        return resultSet;
    }
    /**
     * XPath parser and selector
     *
     * @class gpf.xml.XPath
     */
    gpf.define("gpf.xml.XPath", {
        _xpath: null,
        constructor: function (xpath) {
            this._reset();
            if ("string" === typeof xpath) {
                this._xpath = this._compile(xpath);
            } else {
                this._xpath = xpath;
            }
        },
        _reset: function () {
        },
        _compile: function (xpath) {
            gpf.interfaces.ignoreParameter(xpath);
            this._xpath = null;
        },
        selectNodes: function (node) {
            return _select(node, this._xpath);
        }
    });
    gpf.define("gpf.Parameter", {
        private: {
            "[_name]": [
                gpf.$ClassProperty(),
                gpf.$XmlAttribute("name")
            ],
            _name: "",
            "[_description]": [
                gpf.$ClassProperty(),
                gpf.$XmlElement("description")
            ],
            _description: "",
            "[_type]": [
                gpf.$ClassProperty(),
                gpf.$XmlAttribute("type")
            ],
            _type: "string",
            "[_required]": [
                gpf.$ClassProperty(),
                gpf.$XmlAttribute("required")
            ],
            _required: false,
            "[_defaultValue]": [
                gpf.$ClassProperty(),
                gpf.$XmlElement("default")
            ],
            _defaultValue: undefined,
            "[_prefix]": [
                gpf.$ClassProperty(),
                gpf.$XmlAttribute("prefix")
            ],
            _prefix: "",
            "[_multiple]": [
                gpf.$ClassProperty(),
                gpf.$XmlAttribute("multiple")
            ],
            _multiple: false,
            "[_hidden]": [
                gpf.$ClassProperty(),
                gpf.$XmlAttribute("hidden")
            ],
            _hidden: false
        },
        public: {},
        static: {
            VERBOSE: "verbose",
            HELP: "help",
            TYPE_BOOLEAN: "boolean",
            TYPE_NUMBER: "number",
            TYPE_STRING: "string",
            DEFAULTS: {
                "string": "",
                "boolean": false,
                "number": 0
            },
            create: function (definitions) {
                var result = [], len = definitions.length, idx, definition;
                for (idx = 0; idx < len; ++idx) {
                    definition = definitions[idx];
                    if (!(definition instanceof gpf.Parameter)) {
                        definition = this._createFromObject(definition);
                    }
                    result.push(definition);
                }
                return result;
            },
            _createFromObject: function (definition) {
                var result = new gpf.Parameter(), typeDefaultValue;
                if (definition === gpf.Parameter.VERBOSE || definition.prefix === gpf.Parameter.VERBOSE) {
                    definition = {
                        name: "verbose",
                        description: "Enable verbose mode",
                        type: "boolean",
                        defaultValue: false,
                        prefix: gpf.Parameter.VERBOSE
                    };
                } else if (definition === gpf.Parameter.HELP || definition.prefix === gpf.Parameter.HELP) {
                    definition = {
                        name: "help",
                        description: "Display help",
                        type: "boolean",
                        defaultValue: false,
                        prefix: gpf.Parameter.HELP
                    };
                }
                gpf.json.load(result, definition);
                // name is required
                if (!result._name) {
                    gpf.Error.ParamsNameRequired();
                }
                // Check type and default value
                typeDefaultValue = this.DEFAULTS[result._type];
                if (undefined === typeDefaultValue) {
                    gpf.Error.ParamsTypeUnknown();
                }
                if (result.hasOwnProperty("_defaultValue")) {
                    result._defaultValue = gpf.value(result._defaultValue, typeDefaultValue, result._type);
                }
                return result;
            },
            getOnPrefix: function (parameters, prefix) {
                var len, idx, parameter;
                if (undefined === prefix) {
                    prefix = 0;
                }
                len = parameters.length;
                if ("number" === typeof prefix) {
                    idx = prefix;
                    prefix = "";
                } else {
                    idx = 0;
                }
                for (; idx < len; ++idx) {
                    parameter = parameters[idx];
                    if (parameter._prefix === prefix) {
                        return parameter;
                    }
                }
                return null;
            },
            getByName: function (parameters, name) {
                var len, idx, parameter;
                len = parameters.length;
                for (idx = 0; idx < len; ++idx) {
                    parameter = parameters[idx];
                    if (parameter._name === name) {
                        return parameter;
                    }
                }
                return null;
            },
            parse: function (parameters, argumentsToParse) {
                var result = {}, len, idx, argument, parameter, name, lastNonPrefixIdx = 0;
                parameters = gpf.Parameter.create(parameters);
                len = argumentsToParse.length;
                for (idx = 0; idx < len; ++idx) {
                    // Check if a prefix was used and find parameter
                    argument = this.getPrefixValuePair(argumentsToParse[idx]);
                    if (argument instanceof Array) {
                        parameter = this.getOnPrefix(parameters, argument[0]);
                        argument = argument[1];
                    } else {
                        parameter = this.getOnPrefix(parameters, lastNonPrefixIdx);
                        lastNonPrefixIdx = parameters.indexOf(parameter) + 1;
                    }
                    // If no parameter corresponds, ignore
                    if (!parameter) {
                        // TODO maybe an error might be more appropriate
                        continue;
                    }
                    // Sometimes, the prefix might be used without value
                    if (undefined === argument) {
                        if ("boolean" === parameter._type) {
                            argument = !parameter._defaultValue;
                        } else {
                            // Nothing to do with it
                            // TODO maybe an error might be more appropriate
                            continue;
                        }
                    }
                    // Convert the value to match the type
                    // TODO change when type will be an object
                    argument = gpf.value(argument, parameter._defaultValue, parameter._type);
                    // Assign the corresponding member of the result object
                    name = parameter._name;
                    if (parameter._multiple) {
                        if (undefined === result[name]) {
                            result[name] = [];
                        }
                        result[name].push(argument);
                        if (parameter._prefix === "") {
                            --lastNonPrefixIdx;
                        }
                    } else {
                        // The last one wins
                        result[name] = argument;
                    }
                }
                this._finalizeParse(parameters, result);
                return result;
            },
            _finalizeParse: function (parameters, result) {
                var len, idx, parameter, name, value;
                len = parameters.length;
                for (idx = 0; idx < len; ++idx) {
                    parameter = parameters[idx];
                    name = parameter._name;
                    if (undefined === result[name]) {
                        if (parameter._required) {
                            gpf.Error.ParamsRequiredMissing({ name: name });
                        }
                        value = parameter._defaultValue;
                        if (undefined !== value) {
                            if (parameter._multiple) {
                                value = [value];
                            }
                            result[name] = value;
                        }
                    }
                }
            },
            getPrefixValuePair: function (argument) {
                var pos;
                // -{prefix}:
                if (argument.charAt(0) === "-") {
                    argument = argument.substr(1);
                    pos = argument.indexOf(":");
                    if (-1 < pos) {
                        return [
                            argument.substr(0, pos),
                            argument.substr(pos + 1)
                        ];
                    } else {
                        return [argument];
                    }
                }
                // {prefix}=
                pos = argument.indexOf("=");
                if (-1 < pos) {
                    return [
                        argument.substr(0, pos),
                        argument.substr(pos + 1)
                    ];
                }
                // Default
                return argument;
            },
            usage: function (parameters) {
                gpf.interface.ignoreParameter(parameters);
                return "";
            }
        }
    });
    function _processOptions(options) {
        // Options parsing
        var name, maxLen;
        if (options instanceof Array) {
            options = gpf.Parameter.parse([
                {
                    name: "port",
                    type: "number",
                    defaultValue: 80,
                    prefix: "port"
                },
                {
                    name: "root",
                    type: "string",
                    defaultValue: ".",
                    prefix: "root"
                },
                {
                    name: "chunkSize",
                    type: "number",
                    defaultValue: 65536,
                    prefix: "chunk"
                },
                gpf.Parameter.VERBOSE,
                gpf.Parameter.HELP
            ], options);
        }
        // Server boot trace
        console.log("GPF " + gpf.version() + " web server");
        if (options.root === ".") {
            options.root = process.cwd();
        }
        if (options.verbose) {
            maxLen = 0;
            for (name in options) {
                if (options.hasOwnProperty(name)) {
                    if (name.length > maxLen) {
                        maxLen = name.length;
                    }
                }
            }
            ++maxLen;
            for (name in options) {
                if (options.hasOwnProperty(name)) {
                    console.log([
                        "\t",
                        name,
                        new Array(maxLen - name.length + 1).join(" "),
                        ": ",
                        options[name]
                    ].join(""));
                }
            }
        }
        return options;
    }
    var
        /**
         * Placeholder class to extend the NodeJS response class and provide
         * more context to it
         *
         * @class ResponseHandler
         * @private
         */
        ResponseHandler = gpf.define("ResponseHandler", {
            private: {
                _options: null,
                _request: null,
                _response: null,
                _parsedUrl: null,
                _filePath: "",
                _extName: ""
            },
            public: {
                constructor: function (options, request, response) {
                    var url = require("url"), path = require("path");
                    this._options = options;
                    this._request = request;
                    this._response = response;
                    // Parse and analyse URL
                    this._parsedUrl = url.parse(request.url);
                    this._filePath = path.join(this._options.root, this._parsedUrl.pathname);
                    this._extName = path.extname(this._filePath).toLowerCase();
                    // Extend response
                    response._gpf = this;
                    response.plain = ResponseHandler._plain;
                },
                process: function () {
                    var fs = require("fs");
                    if (fs.existsSync(this._filePath)) {
                        if (".jsp" === this._extName) {
                            this.plain(500, "JSP not handled yet");
                        } else {
                            this.fromFile(this._filePath);
                        }
                    } else {
                        this.plain(404, "No file found");
                    }
                },
                plain: function (statusCode, text) {
                    var resp = this._response;
                    resp.writeHead(statusCode, { "Content-Type": "text/plain" });
                    resp.write([
                        "port    : " + this._options.port,
                        "method  : " + this._request.method,
                        "url     : " + this._request.url,
                        "root    : " + this._options.root,
                        "path    : " + this._filePath,
                        "headers : " + JSON.stringify(this._request.headers, null, "\t\t"),
                        text
                    ].join("\n"));
                    resp.end();
                },
                fromFile: function (filePath) {
                    var me = this, fs = require("fs"), path = require("path"), extName = path.extname(filePath).toLowerCase(), chunkSize = me._options.chunkSize, buffer, pos = 0, size, fileDescriptor, close, read, write;
                    close = function () {
                        if (fileDescriptor) {
                            fs.close(fileDescriptor);
                        }
                        me._response.end();
                    };
                    read = function () {
                        var len = size - pos;
                        if (0 === len) {
                            // Done
                            close();
                            return;
                        }
                        if (len > chunkSize) {
                            len = chunkSize;
                        }
                        fs.read(fileDescriptor, buffer, 0, len, pos, write);
                    };
                    write = function (err, bytesRead, data) {
                        if (err) {
                            // Partly answered, close the answer and dump error
                            console.error([
                                "Error while sending '",
                                filePath,
                                "' (",
                                err,
                                ")"
                            ].join(""));
                            close();
                            return;
                        }
                        pos += bytesRead;
                        me._response.write(data, read);
                    };
                    fs.stat(filePath, function (err, stats) {
                        var mimeType;
                        if (err) {
                            me._response.plain(500, "Unable to access file (" + err + ")");
                            return;
                        }
                        if (stats.isDirectory()) {
                            me._response.plain(200, "Directory.");
                            return;
                        } else if (!stats.isFile()) {
                            me._response.plain(200, "Not a file.");
                            return;
                        }
                        size = stats.size;
                        mimeType = gpf.http.getMimeType(extName);
                        if (me._options.verbose) {
                            console.log("\tMime type  : " + mimeType);
                            console.log("\tFile size  : " + size);
                        }
                        fs.open(filePath, "r", function (err, fd) {
                            if (err) {
                                me._response.plain(500, "Unable to open file (" + err + ")");
                                return;
                            }
                            me._response.writeHead(200, {
                                "Content-Type": mimeType,
                                "Content-Length": size
                            });
                            fileDescriptor = fd;
                            if (me._options.verbose) {
                                console.log("\tFile handle: " + fd);
                            }
                            buffer = new Buffer(chunkSize);
                            read();
                        });
                    });
                }
            },
            static: {
                _plain: function (statusCode, text) {
                    return this._gpf.plain(statusCode, text);
                },
                _fromFile: function (filePath) {
                    return this._gpf.fromFile(filePath);
                }
            }
        });
    /**
     * Run the GPF web server
     *
     * @param {String[]|Object|undefined} options
     */
    gpf.runWebServer = function (options) {
        options = _processOptions(options);
        // Expose ExtJS require
        global.require = require;
        // Build the web server
        require("http").createServer(function (request, response) {
            if (options.verbose) {
                console.log([
                    request.method,
                    "     ".substr(request.method.length),
                    request.url
                ].join(""));
            }
            var handler = new ResponseHandler(options, request, response);
            handler.process();
        }).on("close", function () {
            console.log("Closed.");
        }).listen(options.port);
        if (options.verbose) {
            console.log("Listening... (CTRL+C to stop)");
        }
    };
    /**
     * Detect if the library was run as a standalone file, in that case, run
     * the web server.
     */
    (function () {
        var path, scriptName;
        if ("nodejs" !== gpf.host()) {
            return;    // Not inside nodejs
        }
        path = require("path");
        scriptName = path.basename(process.argv[1], ".js");
        if (scriptName === "boot" || scriptName === "gpf" || scriptName === "gpf-debug") {
            gpf.runWebServer(process.argv.slice(2));
        }
    }());
}));
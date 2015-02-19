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
    var VERSION = "0.1", _host, _context, _hostNamespace;
    VERSION += "d";
    // Microsoft cscript / wscript
    if ("undefined" !== typeof WScript) {
        _host = "wscript";
        _context = function () {
            return this;
        }.apply(null, []);
        _hostNamespace = "ms";
        // Microsoft
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
        _context = window;
        _hostNamespace = "node";    // Nodejs
                                    /*global module:true*/
    } else if ("undefined" !== typeof module && module.exports) {
        _host = "nodejs";
        _context = global;
        _hostNamespace = "node";    // Browser
    } else if ("undefined" !== typeof window) {
        _host = "browser";
        _context = window;    // Default: unknown
    } else {
        _host = "unknown";
        _context = this;
    }
    // Install host specific namespace (if any)
    if (_hostNamespace) {
        gpf[_hostNamespace] = {};
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
     * <ul>
     *      <li>"wscript" for cscript and wscript</li>
     *      <li>"nodejs" for nodejs</li>
     *      <li>"phantomjs" for phantomjs</li>
     *      <li>"browser" for any browser</li>
     *      <li>"unknown" if not detected</li>
     * </ul>
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
            throw gpf.Error.AssertionFailed({ message: message });
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
    /**
     * Return true if the provided parameter looks like an array (i.e. it has
     * a property length and each item can be accessed with [])
     *
     * @param {Object} obj
     * @return {Boolean} True if array-like
     */
    if ("browser" === gpf.host() && window.HTMLCollection) {
        gpf.isArrayLike = function (obj) {
            return obj instanceof Array || obj instanceof window.HTMLCollection || obj instanceof window.NodeList;
        };
    } else {
        gpf.isArrayLike = function (obj) {
            return obj instanceof Array;
        };
    }
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
                _arrayEach.apply(this, arguments);
            } else {
                _dictionaryEach.apply(this, arguments);
            }
            return undefined;
        }
        if (gpf.isArrayLike(dictionary)) {
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
        /**
         * An empty function
         * return {Function}
         */
        emptyFunction: function () {
            return _emptyFunc;
        },
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
            return _values[expectedType](value, valueType, defaultValue);
        },
        /*
         * Compares a and b and return true if they are look-alike (all members
         * have the same type and same value).
         * 
         * NOTES:
         * 14/04/2013 17:19:43
         * Generates too much recursion, changed the algorithm to avoid
         * recursion using document.body (and any kind of object that references
         * other objects) I found that it was necessary to keep track of already
         * processed objects.
         *
         * @param {*} a
         * @param {*} b
         * @param {Boolean} [alike=false] alike Allow to be tolerant on
         *        primitive types compared with their object equivalent
         * @return {Boolean}
         */
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
         * Capitalize the string
         *
         * @param {String} that
         * @return {String}
         */
        capitalize: function (that) {
            return that.charAt(0).toUpperCase() + that.substr(1);
        },
        /**
         * Generic callback handler
         *
         * @param {Function} handler
         * @param {Object} scope
         * @constructor
         * @class gpf.Callback
         */
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
        /**
         * Get the handler function
         *
         * @returns {Function}
         */
        handler: function () {
            return this._handler;
        },
        /**
         * Get the scope
         *
         * @returns {Object}
         */
        scope: function () {
            return this._scope;
        },
        /**
         * Executes the callback and override the scope if not defined
         *
         * @param {Object} scope Scope to apply if none set in the callback
         * @param {*} ... Forwarded to the callback handler
         * @returns {*}
         */
        call: function () {
            var scope = arguments[0], args = [], len = arguments.length, idx;
            for (idx = 1; idx < len; ++idx) {
                args.push(arguments[idx]);
            }
            return this.apply(scope, args);
        },
        /**
         * Executes the callback and override the scope if not defined
         *
         * @param {Object} scope Scope to apply if none set in the callback
         * @param {*[]} args Forwarded to the callback handler
         * @returns {*}
         */
        apply: function (scope, args) {
            var finalScope = gpf.Callback.resolveScope(this._scope || scope);
            return this._handler.apply(finalScope, args || []);
        }
    });
    gpf.extend(gpf.Callback, {
        /**
         * Resolve function scope
         *
         * @static
         */
        resolveScope: function (scope) {
            if (null === scope || undefined === scope) {
                scope = gpf.context();
            }
            return scope;
        },
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
        doApply: function (callback, scope, paramArray) {
            var len = arguments.length, idx = 3, paramIdx = 0;
            while (idx < len) {
                paramArray[paramIdx] = arguments[idx];
                ++idx;
                ++paramIdx;
            }
            return callback.apply(scope, paramArray);
        },
        /**
         * Get a method that is bound to the object
         *
         * @param {Object} obj
         * @param {String} method
         * @returns {*}
         */
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
    //region NodeJS helpers
    if (gpf.node) {
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
            var eventHandler, overriddenScope;
            if (eventsHandler instanceof Target) {
                eventsHandler._broadcastEvent(event);
            } else if ("function" === typeof eventsHandler || eventsHandler instanceof gpf.Callback) {
                // Compatible with Function & gpf.Callback
                eventsHandler.apply(scope, [event]);
            } else {
                eventHandler = eventsHandler[event.type()];
                if (undefined === eventHandler) {
                    // Try with a default handler
                    eventHandler = eventsHandler["*"];
                }
                if (undefined !== eventHandler) {
                    overriddenScope = eventsHandler.scope;
                    if (undefined !== overriddenScope) {
                        scope = overriddenScope;
                    }
                    eventHandler.apply(scope, [event]);
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
        /**
         * @type {Object} Map of event name to the list of callbacks
         * @private
         */
        _listeners: {},
        /**
         * @type {String[]} List of predefined event names
         * @private
         */
        _events: null,
        /**
         * To avoid an extensive use of closures, functions are created with an
         * index that points to the list of 'declared' events (this._events).
         * function _onEVENT(callback,useCapture) {
         *     this.addEventListener(this._events[IDX],callback,useCapture);
         * }
         * 
         * @param {Number} idx index of the method to create
         * @internal
         */
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
        /**
         * Add an event listener to the target
         *
         * @param {String} event name
         * @param {gpf.events.Handler} eventsHandler
         * @param {Boolean} [useCapture=false] useCapture push it on top of the
         * triggering queue
         * @return {gpf.events.Target}
         * @chainable
         */
        addEventListener: function (event, eventsHandler, useCapture) {
            var listeners = this._listeners;
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
         * @return {gpf.events.Target}
         * @chainable
         */
        removeEventListener: function (event, eventsHandler) {
            var eventsHandlers = this._listeners[event], idx;
            if (undefined !== eventsHandlers) {
                idx = eventsHandlers.indexOf(eventsHandler);
                if (-1 !== idx) {
                    eventsHandlers.splice(idx, 1);
                }
            }
            return this;
        },
        /**
         * Broadcast the event
         *
         * @param {String|gpf.events.Event} event name or object
         * @param {Object} [params={}] event parameters
         * @return {gpf.events.Target}
         * @protected
         * @chainable
         */
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
            if (!(event instanceof Event)) {
                event = new gpf.events.Event(event, params, true, this);
            }
            for (idx = 0; idx < listeners.length; ++idx) {
                gpf.events.fire.apply(this, [
                    event,
                    listeners[idx]
                ]);
                // TODO see how it complies with asynchronous processing
                if (event._propagationStopped) {
                    break;
                }
            }
            return this;
        }
    });
    Broadcaster.prototype = new Target();
    gpf.extend(Broadcaster.prototype, {
        /**
         * Broadcast the event
         *
         * @param {String|gpf.events.Event} event name or object
         * @param {Object} [params={}] event parameters
         * @return {gpf.events.Target}
         * @chainable
         */
        broadcastEvent: function () {
            return this._broadcastEvent.apply(this, arguments);
        }
    });
    gpf.extend(Event.prototype, {
        /**
         * Event type
         *
         * @type {String}
         * @private
         */
        _type: "",
        /**
         * Event parameters
         *
         * @type {Object} Map of key to value
         * @private
         */
        _params: {},
        /**
         * Event can be cancelled
         *
         * @type {Boolean}
         * @private
         */
        _cancelable: false,
        /**
         * Event propagation was stopped
         *
         * @type {Boolean}
         * @private
         */
        _propagationStopped: false,
        /**
         * Event default handling is prevented
         *
         * @type {Boolean}
         * @private
         */
        _defaultPrevented: false,
        /**
         * Event scope
         *
         * @type {Object|null}
         * @private
         */
        _scope: null,
        /**
         * Event type
         *
         * @return {String}
         */
        type: function () {
            return this._type;
        },
        /**
         * Event scope
         *
         * @return {Object}
         */
        scope: function () {
            return gpf.Callback.resolveScope(this._scope);
        },
        /**
         * Event can be cancelled
         *
         * @return {Boolean}
         */
        cancelable: function () {
            return this._cancelable;
        },
        /**
         * Cancel the event if it is cancelable, meaning that any default
         * action normally taken by the implementation as a result of the event
         * will not occur
         */
        preventDefault: function () {
            this._defaultPrevented = true;
        },
        /**
         * Returns true if preventDefault has been called at least once
         *
         * @return {Boolean}
         */
        defaultPrevented: function () {
            return this._defaultPrevented;
        },
        /**
         * To prevent further propagation of an event during event flow
         */
        stopPropagation: function () {
            this._propagationStopped = true;
        },
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
    });
    gpf.events = {
        Target: Target,
        Broadcaster: Broadcaster,
        Event: Event,
        /**
         * Event Handler,
         * - gpf.events.Broadcaster: broadcastEvent(event)
         * - gpf.Callback|Function: apply(scope, [event])
         * - Object: consider a map between event type and callback function
         * @type {gpf.events.Target|gpf.Callback|Function|Object}
         * @alias {gpf.events.Handler}
         */
        /**
         * If necessary, build an event object and use the provided media
         * (broadcaster or callback function) to throw it.
         * 
         * NOTE: this is transmitted through the call
         * 
         * @param {String/gpf.events.Event} event string or event object to fire
         * @param {Object} [params={}] params parameter of the event
         *                 (when type is a string)
         * @param {gpf.events.Handler} eventsHandler
         * @return {gpf.events.Event} the event object
         */
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
            scope = gpf.Callback.resolveScope(this);
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
                _detachInclude(context);
                // IE10: the event is triggered *before* the source is evaluated
                setTimeout(function () {
                    context.done = true;
                    gpf.events.fire("load", { url: context.src }, context.eventsHandler);
                }, 0);
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
        /**
         * Loads dynamically any script
         * Waits for the script to be loaded and calls a eventsHandler when done
         * The following is an easy way to handle eventsHandlers whenever the
         * process is asychronous (window.setTimeout, onload eventsHandler).
         * The function returns an object that can be overriden with our own
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
         * 
         */
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
        /**
         * Retrieve the mime type associates with the file extension (default is
         * "application/octet-stream")
         *
         * @param {String} fileExtension
         * @return {String}
         */
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
        /**
         * Retrieve the file extension associated with the mime type (default is
         * ".bin")
         *
         * @param {String} mimeType
         * @return {String}
         */
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
         * @returns {Boolean}
         */
        test: function (value, bitmask) {
            return (value & bitmask) === bitmask;
        },
        /**
         * Clear the bitmask inside the value
         *
         * @param {Number} value
         * @param {Number} bitmask
         * @returns {Number}
         */
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
                    return "{" + results.join(", ") + "}";
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
         * Class name
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
         * Base class
         *
         * @type {Function}
         * @private
         */
        _Base: Object,
        /**
         * Base class
         *
         * @return {Function}
         */
        Base: function () {
            return this._Base;
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
            /*__begin__thread_safe__*/
            if (!this._attributes) {
                this._attributes = new gpf.attributes.Map();
            }
            /*__end_thread_safe__*/
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
         * @param {String|number} [visibility=_VISIBILITY_PUBLIC] visibility
         */
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
            if (_VISIBILITY_STATIC === visibility) {
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
            if ("undefined" !== baseType && null !== baseMember    // Special case as null is common
&& newType !== baseType) {
                throw gpf.Error.ClassMemberOverloadWithTypeChange();
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
            } catch (e) {
                throw e;
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
                gpf.interfaces.ignoreParameter(objPrototype);
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
    gpf._defAttr("$Alias", {
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
             * @inheritDoc gpf.attributes.Attribute:_alterPrototype
             */
            _alterPrototype: function (objPrototype) {
                _alias(objPrototype.constructor, this._name);
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
     * @implements gpf.interfaces.IReadOnlyArray
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
             * Return the first occurrence of the expected class
             *
             * @param {gpf.attributes.Attribute} expectedClass the class to
             * match
             * @return {gpf.attributes.Attribute}
             */
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
            /**
             * Returns a new array with all attributes matching the expected
             * class
             *
             * @param {Function} expectedClass the class to match
             * @return {gpf.attributes.Array}
             */
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
            /**
             * Apply the callback for each attribute in the array.
             * If the callback returns anything, the loop stops and the result
             * is returned to the caller.
             *
             * @param {Function} callback, defined with parameters
             * * {gpf.attributes.Attribute} attribute
             * No result is expected
             * @param {Object} [scope=undefined] scope
             * @param {*} [params=undefined] params Additional parameters
             * appended at the end of the expected parameter list
             * @return {*}
             */
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
                gpf.interfaces.ignoreParameter(member);
                return attribute instanceof expectedClass;
            }
        },
        public: {
            /**
             * @param {Object} [object=undefined] object Object to read
             *        attributes from
             * @constructor
             */
            constructor: function (object) {
                this._members = {};
                // Creates a new dictionary
                this._count = 0;
                if (undefined !== object) {
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
                    array = this._members[member] = new gpf.attributes.Array();
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
                return this.fillFromClassDef(gpf.classDef(object.constructor));
            },
            /**
             * Fill the map using class definition object
             *
             * @param {gpf.classDef} classDef class definition
             * @return {Number} number of attributes in the resulting map
             */
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
            /**
             * Creates a new map that contains only instances of the given
             * attribute class
             *
             * @param {Function} expectedClass
             * @return {gpf.attributes.Map}
             */
            filter: function (expectedClass) {
                gpf.ASSERT("function" === typeof expectedClass, "Expected a class parameter");
                gpf.ASSERT(expectedClass.prototype instanceof gpf.attributes.Attribute, "Expected an Attribute-like class parameter");
                var result = new gpf.attributes.Map();
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
                if (undefined === result || !(result instanceof gpf.attributes.Array)) {
                    if (0 === _emptyMember) {
                        _emptyMember = new gpf.attributes.Array();
                    }
                    result = _emptyMember;
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
             * Apply the callback for each member in the map
             * If the callback returns anything, the loop stops and the result
             * is returned to the caller.
             *
             * @param {Function} callback, defined with parameters
             * * {String} member
             * * {gpf.attributes.Array} attributes
             * No result is expected
             * @param {Object} [scope=undefined] scope
             * @param {*} [params=undefined] params Additional parameters
             * appended at the end of the expected parameter list
             * @return {*}
             */
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
            /**
             * Add the attributes contained in the map to the given prototype
             *
             * @param {Function} objectClass
             */
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
            /**
             * Error code
             *
             * @type {Number}
             */
            code: 0,
            /**
             * Error name
             *
             * @type {String}
             */
            name: "Error",
            /**
             * Error message
             *
             * @type {String}
             */
            message: ""
        }
    });
    var ERRORS = {
            // boot.js
            "NotImplemented": "Not implemented",
            "Abstract": "Abstract",
            "AssertionFailed": "Assertion failed: {message}",
            // class.js
            "ClassMemberOverloadWithTypeChange": "You can't overload a member to change its type",
            "ClassInvalidVisibility": "Invalid visibility keyword",
            // interface.js
            "InterfaceExpected": "Expected interface not implemented: {name}",
            // i_enumerable.js
            "EnumerableInvalidMember": "$Enumerable can be associated to arrays only",
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
         * Generates an error function
         *
         * @param {Number} code
         * @param {String} name
         * @return {Function}
         * @closure
         */
        genThrowError = function (code, name) {
            var message = ERRORS[name], result = function (context) {
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
                        error.message = message;
                    }
                    return error;
                };
            result.CODE = code;
            result.NAME = name;
            result.MESSAGE = message;
            return result;
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
            /**
             * Constructor of the class to extend
             *
             * @type {Function}
             * @private
             */
            _ofClass: gpf.emptyFunction(),
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
    var
        //region JSON attributes
        /**
         * JSON attribute (base class).
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
        /**
         * Verify that the object implements the current interface
         *
         * @param {Object} objectInstance object to inspect
         * @param {gpf.interfaces.Interface} interfaceDefinition reference
         * interface
         * @return {Boolean}
         */
        isImplementedBy: function (objectInstance, interfaceDefinition) {
            var member;
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
                if (typeof interfaceDefinition.prototype[member] !== typeof objectInstance[member]) {
                    return false;
                }
            }
            /*jslint forin:true*/
            return true;
        },
        /**
         * Used to remove warnings about unused parameters
         */
        ignoreParameter: function (value) {
            return value;
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
         * @param {Boolean} [throwError=false] throwError Throws an error if the
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
            if (null === result && throwError) {
                throw gpf.Error.InterfaceExpected({ name: gpf.classDef(interfaceDefinition).name() });
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
         * @return {gpf.interfaces.IEventTarget}
         * @chainable
         */
        addEventListener: function (event, callback, scope, useCapture) {
            gpf.interfaces.ignoreParameter(event);
            gpf.interfaces.ignoreParameter(callback);
            gpf.interfaces.ignoreParameter(scope);
            gpf.interfaces.ignoreParameter(useCapture);
        },
        /**
         * Remove an event listener to the target
         *
         * @param {String} event name
         * @param {Function|gpf.Callback} callback
         * @param {Object} [scope=undefined] scope scope of callback
         * @return {gpf.interfaces.IEventTarget}
         * @chainable
         */
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
        /**
         * Retrieves an object supporting the provided interface
         * (maybe the object itself)
         *
         * @param {gpf.interfaces.Interface} interfaceDefinition The expected
         * interface
         * @return {Object|null} The object supporting the interface (or null)
         */
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
            /**
             * Interface definition
             *
             * @type {Function}
             * @private
             */
            "[_interfaceDefinition]": [gpf.$ClassProperty(false, "which")],
            _interfaceDefinition: gpf.emptyFunction(),
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
                var iProto = this._interfaceDefinition.prototype, iClassDef = gpf.classDef(this._interfaceDefinition), member, attributes;
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
    var gpfI = gpf.interfaces, gpfA = gpf.attributes;
    /**
     * Enumerable interface
     *
     * @class gpf.interfaces.IEnumerable
     * @extends gpf.interfaces.Interface
     */
    gpf._defIntrf("IEnumerable", {
        /**
         * Sets the enumerator to its initial position, which is before the
         * first element in the collection
         */
        reset: function () {
        },
        /**
         * Advances the enumerator to the next element of the collection
         * @return {Boolean} true if the enumerator was successfully advanced
         * to the next element; false if the enumerator has passed the end of
         * the collection
         */
        moveNext: function () {
            return false;
        },
        /**
         * Gets the current element in the collection
         * @return {*}
         */
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
        /**
         * @inheritDoc gpf.attributes.Attribute:_alterPrototype
         */
        _alterPrototype: function (objPrototype) {
            if (!gpf.isArrayLike(objPrototype[this._member])) {
                throw gpf.Error.EnumerableInvalidMember();
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
        /**
         * Return the number of items in the array
         * @return {Number}
         */
        length: function () {
            return 0;
        },
        /**
         * Return the item inside the array (idx is 0-based)
         *
         * @param {Number} idx index
         * @return {*}
         */
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
        /**
         * Set the item inside the array (idx is 0-based)
         * Return the value that was previously set (or undefined)
         *
         * @param {Number} idx index
         * @param {*} value
         * @return {*}
         */
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
        /**
         * @type {boolean}
         */
        _writeAllowed: false,
        constructor: function (writeAllowed) {
            if (writeAllowed) {
                this._writeAllowed = true;
            }
        },
        /**
         * @inheritDoc gpf.attributes.Attribute:_alterPrototype
         */
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
        /**
         * Triggers the reading of data.
         * The expected behavior is:
         * - The callback is asynchronous
         * - One of the following callback must be called after a read
         *   - EVENT_ERROR: an error occurred.
         *     the stream can't be used after this.
         *   - EVENT_END_OF_STREAM: stream ended.
         *     the stream can't be used after this.
         *   - EVENT_DATA: a buffer is provided, it can't be empty.
         *
         * @param {Number} [size=0] size Number of bytes to read. Read
         * as much as possible if 0
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event data Some data is ready to be used
         * @eventParam {gpf.IReadOnlyArray} buffer Bytes buffer
         *
         * @event eos No more data can be read from the stream
         *
         */
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
        /**
         * Triggers the writing of data
         *
         * @param {IReadOnlyArray} int8buffer Buffer to write
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event ready it is appropriate to begin writing more data to the
         * stream
         *
         */
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
        /**
         * @inheritDoc gpf.interfaces.IReadableStream:read
         */
        "[read]": [gpf.$ClassEventHandler()],
        read: function (size, eventsHandler) {
            gpf.interfaces.ignoreParameter(size);
            gpf.interfaces.ignoreParameter(eventsHandler);
        },
        /**
         * @inheritDoc gpf.interfaces.IWritableStream:write
         */
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
    //region Stream namespace
    gpf.stream = {
        /**
         *
         * @param {gpf.interfaces.IReadableStream} readable
         * @param {gpf.interfaces.IWritableStream} writable
         * @param {Object} [options=undefined] options
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event done The readable stream was written in the writable one
         */
        pipe: function (readable, writable, options, eventsHandler) {
            var scope = new StreamPipeScope(readable, writable, options, eventsHandler);
            scope.ready();
        }
    };
    //region gpf.stream.pipe implementation
    /**
     * Creates a custom EventsHandler to sequence the calls to be made
     *
     * @param {gpf.interfaces.IReadableStream} readable
     * @param {gpf.interfaces.IWritableStream} writable
     * @param {Object} [options=undefined] options
     * @param {gpf.events.Handler} eventsHandler
     * @constructor
     */
    function StreamPipeScope(readable, writable, options, eventsHandler) {
        this._readable = gpfI.queryInterface(readable, gpfI.IReadableStream, true);
        this._writable = gpfI.queryInterface(writable, gpfI.IWritableStream, true);
        if (undefined === eventsHandler) {
            this._options = {};
            this._eventsHandler = options;
        } else {
            this._options = options;
            this._eventsHandler = eventsHandler;
        }
        this.scope = this;
    }
    StreamPipeScope.prototype = {
        _readable: null,
        // Readable stream
        _writable: null,
        // Writable stream
        _options: null,
        // Options
        _eventsHandler: null,
        // Original events handler
        scope: null    // This eventsHandler scope
    };
    /**
     * ready event handler
     *
     * @param {gpf.Event} event
     */
    StreamPipeScope.prototype.ready = function () {
        var chunkSize = this._options.chunkSize || 4096;
        this._readable.read(chunkSize, this);
    };
    /**
     * eos event handler
     *
     * @param {gpf.Event} event
     */
    StreamPipeScope.prototype.eos = function () {
        gpfFireEvent("done", this._eventsHandler);
    };
    /**
     * data event handler
     *
     * @param {gpf.Event} event
     */
    StreamPipeScope.prototype.data = function (event) {
        var buffer = event.get("buffer");
        this._writable.write(buffer, this);
    };
    /**
     * Any other event handler
     *
     * @param {gpf.Event} event
     */
    StreamPipeScope.prototype["*"] = function (event) {
        // Forward to original handler (error or data)
        gpfFireEvent(event, this._eventsHandler);
    };
    //endregion
    //region gpf.stream.Out
    /**
     * console.log exposed as an output stream.
     * Line is buffered until the carriage return.
     *
     * @class gpf.stream.Out
     * @implements gpf.interfaces.IWritableStream
     */
    gpf.define("gpf.stream.Out", {
        "[Class]": [gpf.$InterfaceImplement(gpfI.IWritableStream)],
        public: {
            /**
             * @constructor
             */
            constructor: function () {
                this._buffer = [];
            },
            /**
             * @inheritdoc gpf.interfaces.IWritableStream:write
             */
            write: function (buffer, eventsHandler) {
                // TODO: do we allow mixin strings & buffer
                if ("string" === typeof buffer) {
                    this._writeString(buffer, eventsHandler);
                } else {
                    this._writeBuffer(buffer, eventsHandler);
                }
            }
        },
        private: {
            /**
             * Line buffer
             *
             * @type {String[]}
             * private
             */
            _buffer: [],
            /**
             * @inheritdoc gpf.interfaces.IWritableStream:write
             *
             * String version
             *
             * @private
             */
            _writeString: function (buffer, eventsHandler) {
                var lines = buffer.split("\n"), len, idx;
                len = lines.length;
                if (len) {
                    // If the array has at least 2 elements, \n was present
                    if (1 < len) {
                        console.log(this._buffer.join("") + this._trimFinalR(lines[0]));
                        this._buffer = [];
                    }
                    --len;
                    // The last item of the array did not have \n
                    if (lines[len].length) {
                        this._buffer.push(lines[len]);
                    }
                    // Dump other lines
                    for (idx = 1; idx < len; ++idx) {
                        console.log(this._trimFinalR(lines[idx]));
                    }
                }
                gpfFireEvent.apply(this, [
                    gpfI.IWritableStream.EVENT_READY,
                    eventsHandler
                ]);
            },
            /**
             * Remove final \r if any
             *
             * @param {String} line
             * @return {String}
             * @private
             */
            _trimFinalR: function (line) {
                var lastCharIdx = line.length - 1;
                if (-1 < lastCharIdx && line.charAt(lastCharIdx) === "\r") {
                    return line.substr(0, lastCharIdx);
                }
                return line;
            },
            /**
             * @inheritdoc gpf.interfaces.IWritableStream:write
             *
             * String version
             *
             * @private
             */
            _writeBuffer: function (buffer, eventsHandler) {
                gpf.interfaces.ignore(buffer);
                gpf.interfaces.ignore(eventsHandler);
                /**
                 * TODO implement
                 * Would need to reuse UTF8 decoder in order to output
                 * characters.
                 * Maybe I can create a ReadableStream which input would be
                 * appended with the buffer and rely on the createDecoder
                 * stream.
                 *
                 * Right now: I don't need it.
                 */
                throw gpf.Error.NotImplemented();
            }
        }
    });
    //endregion
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
        //region Configurable part
        protected: {
            /**
             * Output buffer containing content to be read
             *
             * @type {*[]}
             * @protected
             */
            _buffer: [],
            /**
             * Length of the buffer (compared with read size)
             *
             * @type {Number}
             * @protected
             */
            _bufferLength: 0,
            /**
             * Underlying stream default read size
             *
             * @type {Number}
             * @protected
             */
            _readSize: _BUFREADSTREAM_READ_SIZE,
            /**
             * Process underlying stream buffer (this should grow the output
             * buffer)
             *
             * @param {Array} buffer
             * @abstract
             * @protected
             */
            _addToBuffer: function (buffer) {
                gpf.interfaces.ignoreParameter(buffer);
                throw gpf.Error.Abstract();
            },
            /**
             * Underlying stream reached its end (this may grow the output
             * buffer)
             *
             * @protected
             */
            _endOfInputStream: function () {
            },
            /**
             * Read buffer.
             * This default implementation checks the buffer type to switch
             * between string and byte array.
             *
             * @param {Number} size
             * @returns {String|Array}
             * @protected
             */
            _readFromBuffer: function (size) {
                gpf.ASSERT(0 !== this._buffer.length, "Buffer is not empty");
                if ("string" === this._buffer[0]) {
                    return this._readFromStringBuffer(size);
                } else {
                    return this._readFromByteBuffer(size);
                }
            },
            /**
             * Read string buffer.
             *
             * @param {Number} size
             * @returns {String}
             * @protected
             */
            _readFromStringBuffer: function (size) {
                var result = gpf.stringExtractFromStringArray(this._buffer, size);
                this._bufferLength -= result.length;
                return result;
            },
            /**
             * Read byte buffer.
             *
             * @param {Number} size
             * @returns {Array}
             * @protected
             */
            _readFromByteBuffer: function (size) {
                this._bufferLength -= size;
                return this._buffer.splice(0, size);
            }
        },
        //endregion
        //region Implementation
        public: {
            /**
             * @param {gpf.interfaces.IReadableStream} input
             * @constructor
             */
            constructor: function (input) {
                this._iStream = gpfI.query(input, gpfI.IReadableStream, true);
                this._buffer = [];
            },
            //region gpf.interfaces.IReadableStream
            /**
             * @implements gpf.interfaces.IReadableStream:read
             */
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
            /**
             * Input stream
             * @type {gpf.interfaces.IReadableStream}
             */
            _iStream: null,
            /**
             * Input stream read callback (pointing to this:_onRead)
             * @type {gpf.Callback}
             */
            _cbRead: null,
            /**
             * Input state
             * @type {Number} see _BUFREADSTREAM_ISTATE_xxx
             */
            _iState: _BUFREADSTREAM_ISTATE_INIT,
            /**
             * Pending read call size
             * @type {Number}
             */
            _size: 0,
            /**
             * Pending read call event handlers
             * @type {gpf.events.Handler}
             */
            _eventsHandler: null,
            /**
             * Handles input stream read event
             *
             * @param {gpf.events.Event} event
             * @private
             */
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
        }    //endregion
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
        //region Implementation
        protected: {
            /**
             * @inheritdoc gpf.stream.BufferedOnRead:_addToBuffer
             */
            _addToBuffer: function (buffer) {
                this._buffer = this._buffer.concat(buffer);
                this._bufferLength += buffer.length * 8;    // Expressed in bits
            },
            /**
             * @inheritdoc gpf.stream.BufferedOnRead:_readFromBuffer
             */
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
        private: {
            /**
             * Current bit cursor
             *
             * @type {Number}
             * @private
             */
            _bit: 128
        }    //endregion
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
                    throw gpf.Error.Abstract();
                },
                _addBuffer: function (buffer) {
                    gpf.interfaces.ignoreParameter(buffer);
                    throw gpf.Error.Abstract();
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
    };
    //endregion
    //region NodeJS specific classes
    if (gpf.node) {
        /**
         * Wraps a readable stream from NodeJS into a IReadableStream
         *
         * @class gpf.stream.NodeReadable
         * @implements gpf.interfaces.IReadableStream
         */
        gpf.define("gpf.node.ReadableStream", {
            "[Class]": [gpf.$InterfaceImplement(gpfI.IReadableStream)],
            public: {
                /**
                 * @param {stream.Readable} stream
                 * @constructor
                 */
                constructor: function (stream) {
                    this._stream = stream;
                    stream.on("end", gpf.Callback.bind(this, "_onEnd"));
                    stream.on("error", gpf.Callback.bind(this, "_onError"));
                },
                /**
                 * @inheritDoc gpf.interfaces.IReadableStream:read
                 */
                "[read]": [gpf.$ClassEventHandler()],
                read: function (size, eventsHandler) {
                    var chunk;
                    // Used as a critical section to prevent concurrent reads
                    if (null !== this._eventsHandler) {
                        // A read call is already in progress
                        throw gpfI.IReadableStream.EXCEPTION_READ_IN_PROGRESS;
                    }
                    this._eventsHandler = eventsHandler;
                    // If we received the "readable" event
                    if (this._readable) {
                        // We try to read a chunk
                        chunk = this._stream.read(size);
                        if (chunk) {
                            this._onData(chunk);
                            return;
                        }
                        // No chunk means we must wait for next "readable"
                        this._readable = false;
                    }
                    this._size = size;
                    this._stream.once("readable", gpf.Callback.bind(this, "_onReadable"));
                }
            },
            protected: {
                /**
                 * Before doing any read on the stream, we wait for the readable
                 * event to be thrown
                 *
                 * @type {Boolean}
                 * @protected
                 */
                _readable: false,
                /**
                 * Last read eventsHandler
                 * Also used as a critical section to prevent concurrent reads
                 *
                 * @type {gpf.events.Handler}
                 * @protected
                 */
                _eventsHandler: null,
                /**
                 * Last read size (if pending)
                 *
                 * @type {Number}
                 * @protected
                 */
                _size: 0,
                /**
                 * Provides an atomic access to the _eventsHandler variable
                 * (that is immediately cleared)
                 *
                 * @return {gpf.events.Handler}
                 * @private
                 */
                _getEventsHandler: function () {
                    var result = this._eventsHandler;
                    gpf.ASSERT(null !== result, "Event handler expected");
                    this._eventsHandler = null;
                    return result;
                },
                /**
                 * Handles "readable" stream event
                 * NOTE that it was registered with once
                 *
                 * @private
                 */
                _onReadable: function () {
                    this._readable = true;
                    this._onData(this._stream.read(this._size));
                },
                /**
                 * Handles "data" stream event
                 *
                 * @param {Buffer} chunk
                 * @private
                 */
                _onData: function (chunk) {
                    gpf.events.fire("data", { buffer: gpf.node.buffer2JsArray(chunk) }, this._getEventsHandler());
                },
                _onEnd: function () {
                    gpf.events.fire("eos", this._getEventsHandler());
                },
                _onError: function (error) {
                    gpf.events.fire("error", { error: error }, this._getEventsHandler());
                }
            },
            private: {
                /**
                 * @type {stream.Readable}
                 * @private
                 */
                _stream: null
            }
        });
        /**
         * Wraps a writable stream from NodeJS into a IReadableStream
         *
         * @class gpf.stream.NodeWritable
         * @implements gpf.interfaces.IReadableStream
         */
        gpf.define("gpf.node.WritableStream", {
            "[Class]": [gpf.$InterfaceImplement(gpfI.IWritableStream)],
            public: {
                /**
                 * @param {stream.Writable} stream
                 * @constructor
                 */
                constructor: function (stream) {
                    this._stream = stream;
                },
                /**
                 * @inheritDoc gpf.interfaces.IWritableStream:write
                 */
                "[write]": [gpf.$ClassEventHandler()],
                write: function (int8buffer, eventsHandler) {
                    gpf.interfaces.ignoreParameter(int8buffer);
                    gpf.interfaces.ignoreParameter(eventsHandler);
                }
            },
            private: {
                /**
                 * @type {stream.Writable}
                 * @private
                 */
                _stream: null
            }
        });
    }    //endregion
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
                /**
                 * @param {String} [string=undefined] string
                 * @constructor
                 */
                constructor: function (string) {
                    if (undefined !== string && string.length) {
                        this._buffer = [string];
                    } else {
                        this._buffer = [];
                    }
                },
                //region gpf.interfaces.ITextStream
                /**
                 * @implements gpf.interfaces.ITextStream:read
                 */
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
                /**
                 * @implements gpf.interfaces.ITextStream:write
                 */
                write: function (buffer, eventsHandler) {
                    gpf.ASSERT(buffer && buffer.length, "Write must contain data");
                    this._buffer.push(buffer);
                    gpfFireEvent.apply(this, [
                        gpfI.IReadableStream.EVENT_READY,
                        eventsHandler
                    ]);
                },
                //endregion
                /**
                 * Consolidate the result string
                 * @return {String}
                 */
                consolidateString: function () {
                    return this._buffer.join("");
                }
            },
            private: {
                /**
                 * @type {String[]}
                 * @private
                 */
                _buffer: []
            }
        });
    gpf.extend(gpf, {
        "[capitalize]": [gpf.$ClassExtension(String)],
        // Declared in base.js
        "[replaceEx]": [gpf.$ClassExtension(String)],
        /**
         * Substitutes all occurrences of the keys found in the replacements
         * object with their values
         *
         * @param {String} that
         * @param {Object} replacements map of strings to search and replace
         * @return {String}
         */
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
        /**
         * Adapt the string content to be compatible with the provided language
         *
         * @param {String} that
         * @param {String} language
         * @return {String}
         */
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
        // TODO Should be a static extension as 'that' is not used
        "[stringExtractFromStringArray]": [gpf.$ClassExtension(String, "fromStringArray")],
        /**
         * Extract the first characters of a string array
         *
         * @param {Strings[]} strings This array is modified after extraction
         * @param {Number} [size=0] size Number of characters to get, all if 0
         * @returns {string}
         */
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
        /**
         * Converts the string into a stream
         *
         * @param {String} that
         * @return {Object} Implementing gpf.interfaces.ITextStream
         */
        stringToStream: function (that) {
            return new StringStream(that);
        },
        // TODO Should be a static extension as 'that' is not used
        "[stringFromStream]": [gpf.$ClassExtension(String, "fromStream")],
        /**
         * Converts the stream into a string
         *
         * @param {gpf.interfaces.ITextStream} stream
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event data finished reading the stream, the buffer is provided
         * @eventParam {String} buffer
         */
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
        },
        "[stringFromFile]": [gpf.$ClassExtension(String, "fromFile")],
        /**
         * Completely reads a file
         *
         * @param {*} path
         * @param {String} encoding
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event data finished reading the file, the buffer is provided
         * @eventParam {String} buffer
         */
        stringFromFile: function (path, encoding, eventsHandler) {
            gpf.fs.getInfo(path, new StringFromFileScope(path, encoding, eventsHandler));
        }
    });
    //region stringFromStream helpers
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
    //endregion
    //region stringFromFile helpers
    /**
     * Creates a custom EventsHandler to sequence the calls to be made
     *
     * @param {*} path
     * @param {String} encoding
     * @param {gpf.events.Handler} eventsHandler
     * @constructor
     */
    function StringFromFileScope(path, encoding, eventsHandler) {
        this._path = path;
        this._encoding = encoding;
        this._eventsHandler = eventsHandler;
        this.scope = this;
    }
    StringFromFileScope.prototype = {
        _path: null,
        // File path
        _encoding: "",
        // Encoding
        _eventsHandler: null,
        // Original events handler
        _step: 0,
        // 0: getInfo, 1: readAsBinaryStream
        scope: null    // This eventsHandler scope
    };
    /**
     * ready event handler
     *
     * @param {gpf.Event} event
     */
    StringFromFileScope.prototype.ready = function (event) {
        if (0 === this._step) {
            var info = event.get("info");
            if (info.type === gpf.fs.TYPE_NOT_FOUND) {
                gpf.events.fire("error", { error: gpf.Error.FileNotFound() }, this._eventsHandler);
                return;
            }
            this._step = 1;
            gpf.fs.readAsBinaryStream(this._path, this);
        } else {
            var stream = event.get("stream");
            var decoder = gpf.encoding.createDecoder(stream, this._encoding);
            gpf.stringFromStream(decoder, this);
        }
    };
    /**
     * Any other event handler
     *
     * @param {gpf.Event} event
     */
    StringFromFileScope.prototype["*"] = function (event) {
        // Forward to original handler (error or data)
        gpf.events.fire(event, this._eventsHandler);
    };    //endregion
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
                /**
                 * @param {Array} [array=undefined] array Cloned
                 * @constructor
                 */
                constructor: function (array) {
                    if (undefined !== array && array.length) {
                        this._buffer = [].concat(array);
                    } else {
                        this._buffer = [];
                    }
                },
                //region gpf.interfaces.IStream
                /**
                 * @implements gpf.interfaces.IStream:read
                 */
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
                /**
                 * @implements gpf.interfaces.ITextStream:write
                 */
                write: function (buffer, eventsHandler) {
                    gpf.ASSERT(buffer && buffer.length, "Write must contain data");
                    this._buffer = this._buffer.concat(buffer);
                    gpfFireEvent.apply(this, [
                        gpfI.IWritableStream.EVENT_READY,
                        eventsHandler
                    ]);
                },
                //endregion
                /**
                 * Consolidate the result array
                 * @return {Array}
                 */
                consolidateArray: function () {
                    return [].concat(this._buffer);
                }
            },
            private: {
                /**
                 * @type {Array}
                 * @private
                 */
                _buffer: []
            }
        });
    gpf.extend(gpf, {
        "[arrayToStream]": [gpf.$ClassExtension(Array, "toStream")],
        /**
         * Converts the string into a stream
         *
         * @param {Array} that
         * @return {Object} Implementing gpf.interfaces.IStream
         */
        arrayToStream: function (that) {
            return new ArrayStream(that);
        },
        // TODO Should be a static extension as 'that' is not used
        "[arrayFromStream]": [gpf.$ClassExtension(Array, "fromStream")],
        /**
         * Converts the stream into an array
         *
         * @param {gpf.interfaces.ITextStream} stream
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event data finished reading the stream, the buffer is provided
         * @eventParam {Array} buffer
         *
         */
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
    gpf.extend(gpf, {
        "[dateToComparableFormat]": [gpf.$ClassExtension(Date, "toComparableFormat")],
        /**
         * Converts the date into a string that can be compared with another
         * date
         *
         * @param {Date} that
         * @param {Boolean} [includeTime=true] includeTime
         * @return {String}
         */
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
        /**
         * Converts a string into a Date using the format used inside the
         * function dateToComparableFormat
         *
         * @param {String} that
         * @return {Date}
         */
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
            /**
             * @type {gpf.events.Handler[]}
             * @private
             */
            _list: [],
            /**
             * @type {Number}
             * @private
             */
            _pos: 0
        },
        public: {
            /**
             * @constructor
             */
            constructor: function () {
                this._list = [];
            },
            /**
             * THEN
             *
             * @param {gpf.events.Handler} eventsHandler
             * @return {gpf.Promise}
             */
            then: function (eventsHandler) {
                this._list.splice(this._pos, 0, eventsHandler);
                ++this._pos;
                return this;
            },
            /**
             * RESOLVE
             *
             * @param {Object} [params=undefined] params
             */
            resolve: function (params) {
                gpf.defer(_resolve, 0, this, [params]);
            },
            /**
             * REJECT
             *
             * @param {Object} [params=undefined] params
             */
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
                /**
                 * Call is synchronous
                 *
                 * @type {Boolean}
                 * @private
                 */
                _synchronous: true,
                /**
                 * Method name
                 *
                 * @type {String}
                 * @private
                 */
                _name: "",
                /**
                 * Method arguments
                 *
                 * @type {Array}
                 * @private
                 */
                _args: [],
                /**
                 * When asynchronous, length provides the position of the event
                 * handler
                 *
                 * @type {Number}
                 * @private
                 */
                _length: 0
            },
            public: {
                /**
                 *
                 * @param {Boolean} synchronous Call is synchronous
                 * @param {String} name Method name
                 * @param {Array} args Method arguments
                 * @param {Number} length When asynchronous, length provides the
                 * position of the event handler
                 */
                constructor: function (synchronous, name, args, length) {
                    this._synchronous = synchronous;
                    this._name = name;
                    this._args = args;
                    this._length = length;
                },
                /**
                 * Apply the call
                 *
                 * @param {Object} iHandler
                 * @param {gpf.Callback} callback
                 */
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
                /**
                 * Interface handler
                 *
                 * @type {gpf.interfaces.Interface}
                 * @private
                 */
                _iHandler: null,
                /**
                 * List of method calls
                 *
                 * @type {MethodCall[]}
                 * @private
                 */
                _calls: [],
                /**
                 * Callback to be used as event handler
                 *
                 * @type {gpf.Callback}
                 * @private
                 */
                _callback: null,
                /**
                 * $catch callback
                 *
                 * @type {gpf.events.Handler}
                 * @private
                 */
                _catch: null,
                /**
                 * $finally callback
                 *
                 * @type {gpf.events.Handler}
                 * @private
                 */
                _finally: null,
                /**
                 * $finally event type
                 *
                 * @type {String}
                 * @private
                 */
                _finalEventType: "done",
                /**
                 * Event handler
                 *
                 * @param {gpf.Event} event
                 * @private
                 */
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
                /**
                 * @type {Boolean}
                 * @private
                 */
                _needStart: true,
                /**
                 * When at least one method is called, this one makes sure the
                 * execution starts
                 *
                 * @private
                 */
                _start: function () {
                    if (this._needStart) {
                        this._needStart = false;
                        gpf.defer(this._asyncResult, 0, this);
                    }
                }
            },
            public: {
                /**
                 * @param {Object} instance
                 * @constructor
                 */
                constructor: function (instance) {
                    this._iHandler = gpfI.query(instance, this.constructor.interface);
                    this._calls = [];
                    this._callback = new gpf.Callback(this._asyncResult, this);
                },
                /**
                 * Configure the error handler
                 *
                 * @param {gpf.events.Handler} eventHandler
                 * @return {WrapInterface}
                 * @chainable
                 */
                $catch: function (eventHandler) {
                    this._catch = eventHandler;
                    this._start();
                    return this;
                },
                /**
                 * Configure the final handler
                 *
                 * @param {gpf.events.Handler} eventHandler
                 * @param {String}[eventType=done] eventType
                 * @return {WrapInterface}
                 * @chainable
                 */
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
            /**
             * Resets the parser position & state
             *
             * @param {Function} [state=null] state
             */
            reset: function (state) {
                this._pos = 0;
                this._line = 0;
                this._column = 0;
                this._setParserState(state);
            },
            /**
             * Get current position
             *
             * @return {{pos: number, line: number, column: number}}
             */
            currentPos: function () {
                return {
                    pos: this._pos,
                    line: this._line,
                    column: this._column
                };
            },
            /**
             * Parser entry point
             *
             * @param {...String|null} var_args
             */
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
            /**
             * Defines an handler for the parser output
             *
             * @param {Array|Function|gpf.Callback) handler
             * @private
             */
            setOutputHandler: function (handler) {
                gpf.ASSERT(handler instanceof Array || handler.apply, "Invalid output handler");
                this._outputHandler = handler;
            }
        },
        protected: {
            // Configuration / pre-defined handlers
            /**
             * Initial parser state (set with reset)
             *
             * @type {Function|null}
             * @protected
             */
            _initialParserState: null,
            /**
             * Ignore \r  (i.e. no parsing function called)
             *
             * @type {Boolean}
             * @protected
             */
            _ignoreCarriageReturn: false,
            /**
             * Ignore \n (i.e. no parsing function called)
             *
             * @type {Boolean}
             * @protected
             */
            _ignoreLineFeed: false,
            //            /**
            //             * Sometimes, common handling of new line can be achieved by a
            //             * single function called automatically
            //             *
            //             * @protected
            //             */
            //            _parsedEndOfLine: function () {}
            /**
             * No more character will be entered, parser must end
             * Default implementation consists in calling current state with 0
             * as parameter. Can be overridden.
             *
             * @protected
             */
            _finalizeParserState: function () {
                this._pState(0);
            },
            /**
             * Change parser state
             *
             * @param {Function} [state=null] state
             * @protected
             */
            _setParserState: function (state) {
                if (!state) {
                    state = this._initialParserState;
                }
                if (state !== this._pState) {
                    // TODO trigger state transition
                    this._pState = state;
                }
            },
            /**
             * The parser generates an output
             *
             * @param {*} item
             * @protected
             */
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
            /**
             * Absolute parser current position
             *
             * @type {Number}
             * @private
             */
            _pos: 0,
            /**
             * Parser current line
             *
             * @type {Number}
             * @private
             */
            _line: 0,
            /**
             * Parser current column
             *
             * @type {Number}
             * @private
             */
            _column: 0,
            /**
             * Parser current state function
             *
             * @type {Function}
             * @private
             */
            _pState: null,
            /**
             * Output handler
             *
             * @type {Array|Function|gpf.Callback)
             * @private
             */
            _outputHandler: null,
            /**
             * Parser internal entry point
             *
             * @param {String} buffer
             * @private
             */
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
        static: {
            /**
             * Use to finalize the parser state
             */
            FINALIZE: null
        }
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
            /**
             * @param {gpf.Parser} parser
             * @param {gpf.interfaces.IReadableStream} input
             * @constructor
             */
            constructor: function (parser, input) {
                this._super(input);
                this._parser = parser;
                this._parser.setOutputHandler(new gpf.Callback(this._output, this));
            }
        },
        protected: {
            /**
             * @inheritdoc gpf.stream.BufferedOnRead:_addToBuffer
             */
            _addToBuffer: function (buffer) {
                this._parser.parse(buffer);
            },
            /**
             * @inheritdoc gpf.stream.BufferedOnRead:_endOfInputStream
             */
            _endOfInputStream: function () {
                this._parser.parse(gpf.Parser.FINALIZE);
            },
            /**
             * @inheritdoc gpf.stream.BufferedOnRead:_readFromBuffer
             */
            _readFromBuffer: gpf.stream.BufferedOnRead.prototype._readFromStringBuffer
        },
        private: {
            /**
             * Callback used to grab the parser output that is concatenated to
             * the buffer
             *
             * @param {String} text
             * @private
             */
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
            /**
             * Submit a character to the tokenizer, result indicates if the
             * token is recognized
             *
             * @param {String} char One character to analyze
             * @return {Number} < 0 means won't recognize
             *                    0 means need more chars
             *                  > 0 means a token is recognized (length result)
             *
             * NOTE: if the result is positive, you may submit more chars and
             * check if it changes.
             */
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
                /**
                 * Min number of item iteration
                 *
                 * @type {Number}
                 * @private
                 */
                "[_min]": [gpf.$ClassProperty(true)],
                _min: 1,
                /**
                 * Maximum number of item iteration
                 * 0 means unlimited
                 *
                 * @type {Number}
                 * @private
                 */
                "[_max]": [gpf.$ClassProperty(true)],
                _max: 1
            },
            public: {
                //region Parsing time
                /**
                 * Parse the character (in the context of the pattern item)
                 *
                 * @param {String} char Character to parse
                 * @return {Number} see PatternItem.PARSE_xxx
                 * @abstract
                 */
                parse: function (char) {
                    gpf.interfaces.ignoreParameter(char);
                    throw gpf.Error.Abstract();    // return PatternItem.PARSE_IGNORED;
                },
                /**
                 * finalize the item
                 *
                 * @abstract
                 */
                finalize: function () {
                },
                //endregion
                //region Execution time
                /**
                 * item will be evaluated, reset tokenizer state
                 *
                 * @param {Object} state Free structure to add values to
                 * @abstract
                 */
                reset: function (state) {
                    gpf.interfaces.ignoreParameter(state);
                },
                /**
                 * item evaluation with a character
                 *
                 * @param {Object} state Free structure containing current state
                 * @param {String} char character to test the pattern with
                 * @return {Number} Matching result, see PatternItem.WRITE_xxx
                 * @abstract
                 */
                write: function (state, char) {
                    gpf.interfaces.ignoreParameter(state);
                    gpf.interfaces.ignoreParameter(char);
                    throw gpf.Error.Abstract();    // return -1;
                }    //endregion
            },
            static: {
                PARSE_IGNORED: 0,
                PARSE_PROCESSED: 1,
                PARSE_END_OF_PATTERN: 2,
                PARSE_PROCESSED_EOP: 3,
                // PROCESSED + END OF PATTERN
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
            private: {
                /**
                 * The character to match
                 *
                 * @type {string}
                 * @private
                 */
                _match: ""
            },
            public: {
                /**
                 * @inheritDoc PatternItem:parse
                 */
                parse: function (char) {
                    this._match = char;
                    return PatternItem.PARSE_PROCESSED_EOP;
                },
                /**
                 * @inheritDoc PatternItem:write
                 */
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
                /**
                 * Included characters
                 *
                 * @type {string|string[]}
                 * @private
                 */
                _inc: "",
                /**
                 * Excluded characters
                 *
                 * @type {string|string[]}
                 * @private
                 */
                _exc: "",
                /**
                 * While parsing: the next char is used for a range
                 * specification
                 *
                 * @type {Boolean}
                 * @private
                 */
                _inRange: false,
                /**
                 * Reduce the cyclomatic complexity of parse
                 *
                 * @param {String} char Character to parse
                 * @param {String[]} chars Character array of already parsed
                 * chars
                 * @return {Boolean} True means PARSE_PROCESSED_EOP, otherwise
                 * PARSE_PROCESSED is returned
                 */
                _parse: function (char, chars) {
                    var first, last;
                    if ("^" === char) {
                        this._exc = [];
                    } else if ("]" === char) {
                        if (this._inRange) {
                            throw gpf.Error.PatternInvalidSyntax();
                        }
                        return true;
                    } else if ("-" === char) {
                        if (this._inRange || 0 === chars.length) {
                            throw gpf.Error.PatternInvalidSyntax();
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
                /**
                 * @inheritDoc PatternItem:parse
                 */
                parse: function (char) {
                    var chars;
                    if (this.hasOwnProperty("_exc")) {
                        if ("^" === char) {
                            throw gpf.Error.PatternInvalidSyntax();
                        }
                        chars = this._exc;
                    } else {
                        chars = this._inc;
                    }
                    if ("[" === char) {
                        if (this.hasOwnProperty("_inc")) {
                            throw gpf.Error.PatternInvalidSyntax();
                        }
                        this._inc = [];
                    } else if (this._parse(char, chars)) {
                        return PatternItem.PARSE_PROCESSED_EOP;
                    }
                    return PatternItem.PARSE_PROCESSED;
                },
                /**
                 * @inheritDoc PatternItem:finalize
                 */
                finalize: function () {
                    this._inc = this._inc.join("");
                    if (this.hasOwnProperty("_exc")) {
                        this._exc = this._exc.join("");
                    }
                },
                /**
                 * @inheritDoc PatternItem:write
                 */
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
                /**
                 * Contains either an item list or a list of item list
                 * (if transformed into a choice)
                 *
                 * @type {PatternItem[]|(PatternItem[])[]}
                 * @private
                 */
                _items: [],
                /**
                 * Choice group (with |)
                 *
                 * @type {Boolean}
                 * @private
                 */
                _choice: false,
                /**
                 * Computed during the finalization phase, this array keep track
                 * of the index of last item that is not optional in the group.
                 *
                 * @type {Number[]}
                 * @private
                 */
                _optionals: [],
                /**
                 * True if the opening parenthesis has been parsed
                 *
                 * @type {Boolean}
                 * @private
                 */
                _parsedParenthesis: false,
                /**
                 * Currently parsed item
                 *
                 * @type {PatternItem}
                 * @private
                 */
                _parsedItem: null,
                /**
                 * Get the current list of items
                 *
                 * @param {Number} [pos=undefined] When choices, get the items
                 * at the given position (last one when undefined). Ignored
                 * otherwise.
                 * @return {PatternItem[]}
                 * @private
                 */
                _getItems: function (pos) {
                    if (this._choice) {
                        if (undefined === pos) {
                            pos = this._items.length - 1;
                        }
                        return this._items[pos];
                    }
                    return this._items;
                },
                /**
                 * Get the last parsed item
                 *
                 * @type {PatternItem}
                 * @private
                 */
                _lastItem: function () {
                    var items = this._getItems();
                    return items[items.length - 1];
                },
                /**
                 * Push a new item to be parsed
                 *
                 * @param {PatternItem} item
                 * @return {PatternItem}
                 * @private
                 */
                _push: function (item) {
                    this._getItems().push(item);
                    this._parsedItem = item;
                    return item;
                },
                /**
                 * Reduce the cyclomatic complexity of parse
                 * Process current item
                 *
                 * @param {String} char
                 * @returns {Number}
                 * @private
                 */
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
                /**
                 * Reduce the cyclomatic complexity of parse
                 * Process quantification char
                 *
                 * @param {String} char
                 * @returns {Number}
                 * @private
                 */
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
                /**
                 * Return the position from which all items can be optional
                 *
                 * @param {PatterItem[]} items
                 * @return {Number}
                 * @private
                 */
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
                /**
                 * Reset for the provided item
                 *
                 * @param {PatternItem} item
                 * @param {Object} state
                 * @private
                 */
                _reset: function (item, state) {
                    state.count = 0;
                    state.sub = {};
                    item.reset(state.sub);
                },
                /**
                 * Modify state to move to (and get) the next item (if any)
                 *
                 * @param {Object} state
                 * @param {Number} index
                 * @return {PatternItem}
                 * @private
                 */
                _getItem: function (state, index) {
                    var items = this._getItems(state.choice);
                    if (index < items.length) {
                        return items[index];
                    }
                    return null;
                },
                /**
                 * Handles situation when current item does not match on char
                 *
                 * @param {PatternItem} item
                 * @param {Object} state
                 * @param {String} char
                 * @return {Number} write result
                 * @private
                 */
                _writeNoMatch: function (item, state, char) {
                    if (state.count < item.min()    // Not enough match
                                      // or at least two characters went through
|| state.length > state.matchingLength + 1) {
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
                /**
                 * Handles situation when current item matches on char
                 *
                 * @param {PatternItem} item
                 * @return {Number} write result
                 * @private
                 */
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
                /**
                 * @constructor
                 */
                constructor: function () {
                    this._items = [];
                },
                /**
                 * @inheritDoc PatternItem:parse
                 */
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
                /**
                 * @inheritDoc PatternItem:finalize
                 */
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
                /**
                 * @inheritDoc PatternItem:reset
                 */
                reset: function (state) {
                    var item;
                    state.index = 0;
                    if (this._choice) {
                        state.choice = -1;
                    }
                    item = this._getItems(0)[0];
                    this._reset(item, state);
                },
                /**
                 * @inheritDoc PatternItem:write
                 */
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
                /**
                 * @type {PatternGroup}
                 * @private
                 */
                "[_patternItem]": [gpf.$ClassProperty()],
                _patternItem: null
            },
            protected: {
                /**
                 * @inheritdoc gpf.Parser:_initialParserState
                 */
                _initialParserState: function (char) {
                    this._patternItem.parse(char);
                },
                /**
                 * @inheritdoc gpf.Parser:_finalizeParserState
                 */
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
                /**
                 * @type {PatternItem}
                 * @private
                 */
                _patternItem: null,
                /**
                 * @type {Boolean}
                 * @private
                 */
                _stopMatching: false,
                /**
                 * @type {Number}
                 * @private
                 */
                _lastResult: 0,
                /**
                 * @type {Number}
                 * @private
                 */
                _totalLength: 0,
                /**
                 * Pattern state
                 *
                 * @type {Object}
                 * @private
                 */
                _state: {}
            },
            public: {
                /**
                 * @param {PatternItem} patternItem
                 */
                constructor: function (patternItem) {
                    this._patternItem = patternItem;
                    this._state = {};
                    this._patternItem.reset(this._state);
                },
                //region ITokenizer
                /**
                 * @implements gpf.interfaces.ITokenizer:write
                 */
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
        private: {
            /**
             * @type {PatternItem}
             * @private
             */
            _patternItem: null
        },
        public: {
            /**
             * Constructor, check and compile the pattern
             *
             * @param {String} pattern
             */
            constructor: function (pattern) {
                var parser = new PatternParser();
                parser.parse(pattern, null);
                this._patternItem = parser.patternItem();
            },
            /**
             * Allocate a tokenizer based on the pattern
             *
             * @return {gpf.interfaces.ITokenizer}
             */
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
                // Position of token start
                line: 0,
                //    Translated to line
                column: 0,
                //    And column
                state: _TOKEN_STATE_NONE,
                // State
                chars: [],
                // Current token
                nextPos: 0,
                // Real position
                nextLine: 0,
                //    Translated to line
                nextColumn: 0,
                //    And column
                eventsHandler: null,
                // Events handler
                that: null    // Transported this
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
            // chars.length == 1
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
            // chars.length == 2
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
            // chars.length == 3
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
        /**
         * Returns the list of known keyword
         *
         * @return {String[]}
         */
        keywords: function () {
            return _keywords;
        },
        /**
         * Identify tokens in the provided text, the source is supposed to be
         * complete (and valid).
         * @param {String} text Text to analyze
         * @param {Object/function} eventsHandler
         * @return {undefined}
         * 
         * @eventParam {string} token The token value
         * @eventParam {number} pos Absolute position of the error (0-based)
         * @eventParam {number} line Absolute line position of the error
         *             (0-based)
         * @eventParam {number} column Column position relatively to the current
         *             line (0-based)
         * @eventParam {number} code Error code (0 if token found)
         * @eventParam {string} message Error message (empty if token found)
         * 
         * @eventDefault If prevented, an error is generated (abort) and the
         *               processing is stopped
         * 
         * @eventThis Transmitted from the function call
         * 
         * @event error A parsing error occured, the parameters code and message
         *        are set accordingly
         * 
         * @event keyword A keyword has been recognized
         * 
         * @event identifier An identifier has been recognized
         * 
         * @event string A string has been recognized. NOTE: the token keeps the
         *        string notation intact (i.e. with surrounding quotes and
         *        escapes)
         * 
         * @event number A number has been recognized. NOTE: this version
         *        handles only positive integers (with no sign)
         * 
         * @event symbol A symbol has been recognized
         * 
         * @event comment A comment has been recognized. NOTE: the token keeps
         *        the comment notation
         * 
         * @event space One or more spaces has been recognized (i.e. space, tab
         *        and any carriage return combination)
         *
         */
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
        /**
         * @see gpf.tokenize
         * 
         * Identify tokens in the provided text, the parsing context is returned
         * so that it can be chained with consecutive calls.

         * @param {String} text Text to analyze. Use null to finalize the
         *        parsing
         * @param {Object/function} eventsHandler
         * @param {Object} context Tokenizer context (initialized if not set)
         * @return {undefined}
         *
         */
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
                    /**
                 * @param {Function} encoder
                 * @param {gpf.interfaces.IReadableStream} input
                 * @constructor
                 */
                    constructor: function (encoder, input) {
                        this._super(input);
                        this._encoder = encoder;
                    }
                },
                protected: {
                    /**
                 * @inheritdoc gpf.stream.BufferedOnRead:_addToBuffer
                 */
                    _addToBuffer: function (buffer) {
                        this._buffer = this._buffer.concat(this._encoder(buffer));
                        this._bufferLength = this._buffer.length;
                    },
                    /**
                 * @inheritdoc gpf.stream.BufferedOnRead:_readFromBuffer
                 */
                    _readFromBuffer: gpf.stream.BufferedOnRead.prototype._readFromByteBuffer
                },
                private: {
                    /**
                 * @type {Function}
                 * @private
                 */
                    _encoder: null
                }
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
                    /**
                 * @param {Function} decoder
                 * @param {gpf.interfaces.IReadableStream} input
                 * @constructor
                 */
                    constructor: function (decoder, input) {
                        this._super(input);
                        this._decoder = decoder;
                    }
                },
                protected: {
                    /**
                 * @inheritdoc gpf.stream.BufferedOnRead:_addToBuffer
                 */
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
                    /**
                 * @inheritdoc gpf.stream.BufferedOnRead:_endOfInputStream
                 */
                    _endOfInputStream: function () {
                        if (this._unprocessed.length) {
                            throw gpf.Error.EncodingEOFWithUnprocessedBytes();
                        }
                    },
                    /**
                 * @inheritdoc gpf.stream.BufferedOnRead:_readFromBuffer
                 */
                    _readFromBuffer: gpf.stream.BufferedOnRead.prototype._readFromStringBuffer
                },
                private: {
                    /**
                 * @type {Function}
                 * @private
                 */
                    _decoder: null,
                    /**
                 * @type {Number[]}
                 * @private
                 */
                    _unprocessed: []
                }
            });
        //endregion
        gpf.encoding = {
            UTF_8: "utf-8",
            /**
         * Create a encoder to convert an input text stream into an output
         * binary buffer.
         *
         * @param {gpf.interfaces.IReadableStream} input
         * @param {String} encoding
         * @return {gpf.interfaces.IReadableStream}
         */
            createEncoder: function (input, encoding) {
                var module = _encodings[encoding];
                if (undefined === module) {
                    throw gpf.Error.EncodingNotSupported();
                }
                return new EncoderStream(module[0], input);
            },
            /**
         * Create a decoder to convert an input binary stream into an output
         * string.
         *
         * @param {gpf.interfaces.IReadableStream} input
         * @param {String} encoding
         * @return {gpf.interfaces.IReadableStream}
         */
            createDecoder: function (input, encoding) {
                var module = _encodings[encoding];
                if (undefined === module) {
                    throw gpf.Error.EncodingNotSupported();
                }
                return new DecoderStream(module[1], input);
            }
        };
    }());    /* End of privacy scope */
    var
        // Namespaces shortcut
        gpfI = gpf.interfaces, gpfA = gpf.attributes, gpfFireEvent = gpf.events.fire;
    gpf.xml = {};
    /**
     * Defines the possibility for the object to be saved as XML
     *
     * @class gpf.interfaces.IXmlSerializable
     * @extends gpf.interfaces.Interface
     */
    gpf._defIntrf("IXmlSerializable", {
        /**
         * Translate obj into an gpf.interfaces.IXmlContentHandler and serialize
         * itself into XML
         *
         * @param {gpf.interfaces.IXmlContentHandler} out XML Content handler
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event ready
         */
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
        /**
         * Receive notification of character data
         *
         * @param {String} buffer characters
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event ready
         */
        "[characters]": [gpf.$ClassEventHandler()],
        characters: function (buffer, eventsHandler) {
            gpfI.ignoreParameter(buffer);
            gpfI.ignoreParameter(eventsHandler);
        },
        /**
         * Receive notification of the end of a document
         *
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event ready
         */
        "[endDocument]": [gpf.$ClassEventHandler()],
        endDocument: function (eventsHandler) {
            gpfI.ignoreParameter(eventsHandler);
        },
        /**
         * Signal the end of an element
         *
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event ready
         */
        "[endElement]": [gpf.$ClassEventHandler()],
        endElement: function (eventsHandler) {
            gpfI.ignoreParameter(eventsHandler);
        },
        /**
         *  End the scope of a prefix-URI mapping
         *
         * @param {String} prefix
         *
         * @event ready
         */
        endPrefixMapping: function (prefix) {
            gpfI.ignoreParameter(prefix);
        },
        /**
         * Receive notification of ignorable whitespace in element content
         *
         * @param {String} buffer characters
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event ready
         */
        "[ignorableWhitespace]": [gpf.$ClassEventHandler()],
        ignorableWhitespace: function (buffer, eventsHandler) {
            gpfI.ignoreParameter(buffer);
            gpfI.ignoreParameter(eventsHandler);
        },
        /**
         * Receive notification of a processing instruction
         *
         * @param {String} target
         * @param {String} data
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event ready
         */
        "[processingInstruction]": [gpf.$ClassEventHandler()],
        processingInstruction: function (target, data, eventsHandler) {
            gpfI.ignoreParameter(target);
            gpfI.ignoreParameter(data);
            gpfI.ignoreParameter(eventsHandler);
        },
        /**
         * Receive an object for locating the origin of SAX document events.
         *
         * @param {*} locator
         */
        setDocumentLocator: function (locator) {
            gpfI.ignoreParameter(locator);
        },
        /**
         * Receive notification of a skipped entity
         *
         * @param {String} name
         */
        skippedEntity: function (name) {
            gpfI.ignoreParameter(name);
        },
        /**
         * Receive notification of the beginning of a document
         *
         * @param {gpf.events.Handler} eventsHandler
         */
        "[startDocument]": [gpf.$ClassEventHandler()],
        startDocument: function (eventsHandler) {
            gpfI.ignoreParameter(eventsHandler);
        },
        /**
         * Receive notification of the beginning of an element
         *
         * @param {String} uri [uri=""] namespace uri (if any)
         * @param {String} localName
         * @param {String} [qName=localName] qName qualified name
         * @param {Object} attributes attribute dictionary (string/string)
         * @param {gpf.events.Handler} eventsHandler
         */
        "[startElement]": [gpf.$ClassEventHandler()],
        startElement: function (uri, localName, qName, attributes, eventsHandler) {
            gpfI.ignoreParameter(uri);
            gpfI.ignoreParameter(localName);
            gpfI.ignoreParameter(qName);
            gpfI.ignoreParameter(attributes);
            gpfI.ignoreParameter(eventsHandler);
        },
        /**
         * Begin the scope of a prefix-URI Namespace mapping
         *
         * @param {String} prefix
         * @param {String} uri
         */
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
        _XmlBase = gpf._defAttr("XmlAttribute", {
            protected: {
                /**
                 * @inheritdoc gpf.attributes.Attribute:_alterPrototype
                 */
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
        _XmlIgnore = gpf._defAttr("$XmlIgnore", _XmlBase, {}),
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
        _XmlAttribute = gpf._defAttr("$XmlAttribute", _XmlBase, {
            private: {
                /**
                 * Name of the attribute
                 *
                 * @type {String}
                 * @private
                 */
                "[_name]": [gpf.$ClassProperty()],
                _name: ""
            },
            public: {
                /**
                 * @param {String} name Name of the attribute
                 * @constructor
                 */
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
        _XmlRawElement = gpf._defAttr("XmlRawElementAttribute", _XmlBase, {
            private: {
                /**
                 * Name of the element
                 *
                 * @type {String}
                 * @private
                 */
                "[_name]": [gpf.$ClassProperty()],
                _name: ""
            },
            public: {
                /**
                 * @param {String} name Name of the element
                 * @constructor
                 */
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
        _XmlElement = gpf._defAttr("$XmlElement", _XmlRawElement, {
            private: {
                /**
                 * Object constructor
                 *
                 * @type {Function}
                 * @private
                 */
                "[_objClass]": [gpf.$ClassProperty()],
                _objClass: null
            },
            public: {
                /**
                 * @param {String} name Name of the element
                 * @param {Function} objClass Object constructor
                 * @constructor
                 */
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
        _XmlList = gpf._defAttr("$XmlList", _XmlRawElement, {}),
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
                if (!(attribute instanceof _XmlElement)) {
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
            if (value instanceof Array || attArray.has(_XmlList) || "object" === type || attArray.has(_XmlElement)) {
                return "";    // Not an attribute
            }
            // Else attribute
            attribute = attArray.has(_XmlAttribute);
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
            attribute = attArray.has(_XmlList);
            if (value instanceof Array || attribute) {
                // TODO: what to do when value is empty?
                if (attribute && attribute.name()) {
                    closeNode = true;
                    wrapped.startElement("", attribute.name());
                }
                // Get the list of 'candidates'
                attArray = attArray.filter(_XmlElement);
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
            attribute = attArray.has(_XmlElement);
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
                if (attArray.has(_XmlIgnore)) {
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
            var attMap = new gpfA.Map(obj).filter(_XmlBase), attribute;
            // If no 'name', check the Class attribute
            if (!name) {
                attribute = attMap.member("Class").has(_XmlElement);
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
            // Even if it is not necessary, let be precise
            "[Class]": [gpf.$InterfaceImplement(gpfI.IXmlContentHandler)],
            _target: null,
            // Object that is serialized
            _firstElement: true,
            // startElement has not been called
            _forward: [],
            // subsequent handlers
            /*
                {
                    {number} type
                                0 IXmlContentHandler
                                1 Element
                                2 List
                    {object} iXCH
                    {string} member
                    {string[]} buffer
                    {number} depth
                }
             */
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
                    attArray = xmlAttributes.member(member).filter(_XmlAttribute);
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
                var xmlAttributes = new gpfA.Map(this._target).filter(_XmlRawElement), forward = this._forward[0], members, idx, member, attArray, jdx, attribute;
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
                if (attribute instanceof _XmlElement) {
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
                } else if (attribute instanceof _XmlList) {
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
            //region gpf.interfaces.IXmlContentHandler
            /**
             * @implements gpf.interfaces.IXmlContentHandler:characters
             */
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
            /**
             * @implements gpf.interfaces.IXmlContentHandler:endDocument
             */
            endDocument: function (eventsHandler) {
                gpfFireEvent.apply(this, [
                    "ready",
                    eventsHandler
                ]);
            },
            /**
             * @implements gpf.interfaces.IXmlContentHandler:endElement
             */
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
            /**
             * @implements gpf.interfaces.IXmlContentHandler:endPrefixMapping
             */
            endPrefixMapping: function (prefix) {
                // Nothing to do (?)
                gpfI.ignoreParameter(prefix);
            },
            /**
             * @implements gpf.interfaces.IXmlContentHandler:ignorableWhitespace
             */
            ignorableWhitespace: function (buffer, eventsHandler) {
                // Nothing to do
                gpfI.ignoreParameter(buffer);
                gpfFireEvent.apply(this, [
                    "ready",
                    eventsHandler
                ]);
            },
            /**
             * @implements gpf.interfaces
             *             .IXmlContentHandler:processingInstruction
             */
            processingInstruction: function (target, data, eventsHandler) {
                // Not relevant
                gpfI.ignoreParameter(target);
                gpfI.ignoreParameter(data);
                gpfFireEvent.apply(this, [
                    "ready",
                    eventsHandler
                ]);
            },
            /**
             * @implements gpf.interfaces.IXmlContentHandler:setDocumentLocator
             */
            setDocumentLocator: function (locator) {
                // Nothing to do
                gpfI.ignoreParameter(locator);
            },
            /**
             * @implements gpf.interfaces.IXmlContentHandler:skippedEntity
             */
            skippedEntity: function (name) {
                // Nothing to do
                gpfI.ignoreParameter(name);
            },
            /**
             * @implements gpf.interfaces.IXmlContentHandler:startDocument
             */
            startDocument: function (eventsHandler) {
                // Nothing to do
                gpfFireEvent.apply(this, [
                    "ready",
                    eventsHandler
                ]);
            },
            /**
             * @implements gpf.interfaces.IXmlContentHandler:startElement
             */
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
            /**
             * @implements gpf.interfaces.IXmlContentHandler:startPrefixMapping
             */
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
            /**
             * @type {gpf.interfaces.IWritableStream}
             * @private
             */
            _stream: null,
            /**
             * @type {Boolean[]}
             * @private
             */
            _branch: [],
            /**
             * @type {String[]}
             * @private
             */
            _pendingPrefixMappings: [],
            /**
             * @type {String[]}
             * @private
             */
            _buffer: [],
            /**
             * @type {gpf.events.Handler}
             * @private
             */
            _eventsHandler: null,
            /**
             * Close the current tag (if opened) in order to put content in it
             *
             * @private
             */
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
            /**
             * Flush the buffer into the stream
             *
             * @param {gpf.events.Handler} eventsHandler
             * @private
             */
            _flush: function (eventsHandler) {
                this._eventsHandler = eventsHandler;
                this._flushed();
            },
            /**
             * Handle write event on stream
             *
             * @param {gpf.events.Event} event
             * @private
             */
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
            /**
             * @param {gpf.interfaces.IWritableStream} stream
             * @constructor
             */
            constructor: function (stream) {
                this._stream = gpfI.query(stream, gpfI.IWritableStream, true);
                this._branch = [];
                this._pendingPrefixMappings = [];
                this._buffer = [];
            },
            //region gpf.interfaces.IXmlContentHandler
            /**
             * @implements gpf.interfaces.IXmlContentHandler:characters
             */
            characters: function (buffer, eventsHandler) {
                gpf.ASSERT(null === this._eventsHandler, "Write in progress");
                this._closeLeafForContent();
                this._buffer.push(buffer);
                this._flush(eventsHandler);
            },
            /**
             * @implements gpf.interfaces.IXmlContentHandler:endDocument
             */
            endDocument: function (eventsHandler) {
                gpf.ASSERT(null === this._eventsHandler, "Write in progress");
                // Nothing to do
                this._flush(eventsHandler);
            },
            /**
             * @implements gpf.interfaces.IXmlContentHandler:endElement
             */
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
            /**
             * @implements gpf.interfaces.IXmlContentHandler:endPrefixMapping
             */
            endPrefixMapping: function (prefix) {
                // Nothing to do (?)
                gpf.interfaces.ignoreParameter(prefix);
            },
            /**
             * @implements gpf.interfaces.IXmlContentHandler:ignorableWhitespace
             */
            ignorableWhitespace: function (buffer, eventsHandler) {
                gpf.ASSERT(null === this._eventsHandler, "Write in progress");
                this._closeLeafForContent();
                this._buffer.push(buffer);
                this._flush(eventsHandler);
            },
            /**
             * @implements gpf.interfaces.IXmlContentHandler:
             * processingInstruction
             */
            processingInstruction: function (target, data, eventsHandler) {
                gpf.ASSERT(null === this._eventsHandler, "Write in progress");
                this._buffer.push("<?", target, " ", gpf.escapeFor(data, "xml"), "?>");
                this._flush(eventsHandler);
            },
            /**
             * @implements gpf.interfaces.IXmlContentHandler:setDocumentLocator
             */
            setDocumentLocator: function (locator) {
                // Nothing to do
                gpf.interfaces.ignoreParameter(locator);
            },
            /**
             * @implements gpf.interfaces.IXmlContentHandler:skippedEntity
             */
            skippedEntity: function (name) {
                // Nothing to do
                gpf.interfaces.ignoreParameter(name);
            },
            /**
             * @implements gpf.interfaces.IXmlContentHandler:startDocument
             */
            startDocument: function (eventsHandler) {
                gpf.ASSERT(null === this._eventsHandler, "Write in progress");
                // Nothing to do
                this._flush(eventsHandler);
            },
            /**
             * @implements gpf.interfaces.IXmlContentHandler:startElement
             */
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
            /**
             * @implements gpf.interfaces.IXmlContentHandler:startPrefixMapping
             */
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
            throw gpf.Error.NotImplemented();
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
        /**
         * Check that the provided name can be use as an element or attribute
         * name
         *
         * @param {String} name
         * @return {Boolean}
         */
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
        /**
         * Make sure that the provided name can be use as an element or
         * attribute name
         *
         * @param {String} name
         * @return {String} a valid attribute/element name
         */
        toValidName: function (name) {
            var newName;
            if (gpf.xml.isValidName(name)) {
                return name;
            }
            // Try with a starting _
            newName = "_" + name;
            if (!gpf.xml.isValidName(newName)) {
                throw gpf.Error.XmlInvalidName();
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
        //        NODE_CDATA_SECTION:             4,
        NODE_ENTITY_REFERENCE: 5,
        //        NODE_ENTITY:                    6,
        NODE_PROCESSING_INSTRUCTION: 7,
        NODE_COMMENT: 8,
        NODE_DOCUMENT: 9    //        NODE_DOCUMENT_TYPE:             10,
             //        NODE_DOCUMENT_FRAGMENT:         11,
             //        NODE_NOTATION:                  12
    });
    /**
     * Defines an XML node structure (Read Only)
     *
     * @class gpf.interfaces.IXmlConstNode
     * @extends gpf.interfaces.Interface
     */
    gpf._defIntrf("IXmlConstNode", {
        /**
         * Access to the attributes of this node: attributes() returns a map
         * with attributes and their values, attributes(name) returns the
         * selected attribute value
         *
         * @param {String} name When specified, name of the attribute to get or
         *        set
         * @return {Object|string}
         */
        attributes: function (name) {
            gpf.interfaces.ignoreParameter(name);
            return "";
        },
        /**
         * Returns the array of child nodes for the node
         *
         * @param {Number} [idx=undefined] idx (see gpf.arrayOrItem)
         * @return {gpf.interfaces.IXmlConstNode
         *           |gpf.interfaces.IXmlConstNode[]
         *           |undefined}
         */
        children: function (idx) {
            if (undefined === idx) {
                return [];
            } else {
                return undefined;
            }
        },
        /**
         * Returns the local part of the name of a node
         *
         * @return {String}
         */
        localName: function () {
            return "";
        },
        /**
         * Returns the namespace URI of a node
         *
         * @return {String}
         */
        namespaceURI: function () {
            return "";
        },
        /**
         * Returns the node immediately following a node
         *
         * @return {gpf.interfaces.IXmlConstNode}
         */
        nextSibling: function () {
            return null;
        },
        /**
         * Returns the name of a node, depending on its type
         *
         * @return {String}
         */
        nodeName: function () {
            return "";
        },
        /**
         * Returns the type of a node
         *
         * @return {Number}
         */
        nodeType: function () {
            return 0;
        },
        /**
         * Returns the value of a node, depending on its type
         *
         * @return {*}
         */
        nodeValue: function () {
            return null;
        },
        /**
         * Returns the root element (document object) for a node
         *
         * @return {gpf.interfaces.IXmlConstNode}
         */
        ownerDocument: function () {
            return null;
        },
        /**
         * Returns the parent node of a node
         *
         * @return {gpf.interfaces.IXmlConstNode}
         */
        parentNode: function () {
            return null;
        },
        /**
         * Sets or returns the namespace prefix of a node
         *
         * @return {String}
         */
        prefix: function () {
            return "";
        },
        /**
         * Returns the node immediately before a node
         *
         * @return {gpf.interfaces.IXmlConstNode}
         */
        previousSibling: function () {
            return null;
        },
        /**
         * Sets or returns the textual content of a node and its descendants
         *
         * @return {String}
         */
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
        //region gpf.interfaces.IXmlConstNode
        /**
         * @implements gpf.interfaces.IXmlConstNode:attributes
         */
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
        /**
         * @implements gpf.interfaces.IXmlConstNode:children
         */
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
        /**
         * @implements gpf.interfaces.IXmlConstNode:localName
         */
        localName: function () {
            return this._name;
        },
        /**
         * @implements gpf.interfaces.IXmlConstNode:namespaceURI
         */
        namespaceURI: function () {
            return "";
        },
        /**
         * @implements gpf.interfaces.IXmlConstNode:nextSibling
         */
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
        /**
         * @implements gpf.interfaces.IXmlConstNode:nodeName
         */
        nodeName: function () {
            return this._name;
        },
        /**
         * @implements gpf.interfaces.IXmlConstNode:nodeType
         */
        nodeType: function () {
            return gpf.xml.NODE_ELEMENT;
        },
        /**
         * @implements gpf.interfaces.IXmlConstNode:nodeValue
         */
        nodeValue: function () {
            return this._obj;
        },
        /**
         * @implements gpf.interfaces.IXmlConstNode:ownerDocument
         */
        ownerDocument: function () {
            return null;
        },
        /**
         * @implements gpf.interfaces.IXmlConstNode:parentNode
         */
        parentNode: function () {
            return this._parentNode;
        },
        /**
         * @implements gpf.interfaces.IXmlConstNode:prefix
         */
        prefix: function () {
            return "";
        },
        /**
         * @implements gpf.interfaces.IXmlConstNode:previousSibling
         */
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
        /**
         * @implements gpf.interfaces.IXmlConstNode:textContent
         */
        textContent: function () {
            if ("object" !== typeof this._obj) {
                return gpf.value(this._obj, "");
            } else {
                return "";
            }
        },
        //endregion
        //region gpf.interfaces.IXmlSerializable
        /**
         * @implements gpf.interfaces.IXmlSerializable:toXml
         */
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
        /**
         * Compile the XPATH specifier
         *
         * @param {String} xpath
         * @private
         */
        _compile: function (xpath) {
            gpf.interfaces.ignoreParameter(xpath);
            this._xpath = null;
        },
        /**
         *
         * @param {gpf.xml.IXmlConstNode} node
         * @return {gpf.xml.IXmlConstNode[]}
         */
        selectNodes: function (node) {
            return _select(node, this._xpath);
        }
    });
    gpf.define("gpf.Parameter", {
        private: {
            /**
             * Name
             *
             * @type {String}
             * @private
             */
            "[_name]": [
                gpf.$ClassProperty(),
                gpf.$XmlAttribute("name")
            ],
            _name: "",
            /**
             * Description
             *
             * @type {String}
             * @private
             */
            "[_description]": [
                gpf.$ClassProperty(),
                gpf.$XmlElement("description")
            ],
            _description: "",
            /**
             * Type
             *
             * @type {String} see gpf.Parameter.TYPE_xxx
             * @private
             */
            "[_type]": [
                gpf.$ClassProperty(),
                gpf.$XmlAttribute("type")
            ],
            _type: "string",
            /**
             * Is required
             *
             * @type {Boolean}
             * @private
             */
            "[_required]": [
                gpf.$ClassProperty(),
                gpf.$XmlAttribute("required")
            ],
            _required: false,
            /**
             * Default value to apply if not specified
             *
             * @type {*}
             * @private
             */
            "[_defaultValue]": [
                gpf.$ClassProperty(),
                gpf.$XmlElement("default")
            ],
            _defaultValue: undefined,
            /**
             * Prefix used to locate parameter in the given parameter list.
             * NOTE: required parameter may not specify any prefix: they are
             * have to be specified in the correct order (and they can't be
             * multiple)
             *
             * @type {String}
             * @private
             */
            "[_prefix]": [
                gpf.$ClassProperty(),
                gpf.$XmlAttribute("prefix")
            ],
            _prefix: "",
            /**
             * Multiple parameter means they can be specified more than once.
             * The parameter value would be then an array.
             *
             * @type {Boolean}
             * @private
             */
            "[_multiple]": [
                gpf.$ClassProperty(),
                gpf.$XmlAttribute("multiple")
            ],
            _multiple: false,
            /**
             * Hidden parameters are not displayed when calling usage
             *
             * @type {Boolean}
             * @private
             */
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
            /**
             * Create a list of parameters
             *
             * @param {Object[]} definitions
             * @return {gpf.Parameter[]}
             */
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
            /**
             * Create a parameter from the definition object
             *
             * @param {Object} definition
             * @return {gpf.Parameter}
             * @private
             */
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
                    throw gpf.Error.ParamsNameRequired();
                }
                if (!result._multiple) {
                    /**
                     * When multiple is used, the default value will be an array
                     * if not specified.
                     * Otherwise, we get the default value based on the type
                     */
                    typeDefaultValue = this.DEFAULTS[result._type];
                    if (undefined === typeDefaultValue) {
                        throw gpf.Error.ParamsTypeUnknown();
                    }
                    if (result.hasOwnProperty("_defaultValue")) {
                        result._defaultValue = gpf.value(result._defaultValue, typeDefaultValue, result._type);
                    }
                }
                return result;
            },
            /**
             * Helper used to manipulate the list of parameters: retrieve one
             * using prefix. If no prefix is specified or a number is used, get
             * the first parameter with no prefix (starting at N if a number was
             * used).
             *
             * @param {gpf.Parameter[]} parameters
             * @param {String|Number} [prefix=0] prefix
             */
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
            /**
             * Helper used to manipulate the list of parameters: retrieve one
             * using name.
             *
             * @param {gpf.Parameter[]} parameters
             * @param {String} name
             */
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
            /**
             * Parse the arguments and return an object with the
             * recognized parameters. Throws an error if required parameters
             * are missing.
             *
             * @param {gpf.Parameter[]|Object[]} parameters
             * @param {String[]} argumentsToParse
             * @return {Object}
             */
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
            /**
             * Check that all required fields are set,
             * apply default values
             *
             * @param {gpf.Parameter[]} parameters
             * @param {Object} result
             * @private
             */
            _finalizeParse: function (parameters, result) {
                var len, idx, parameter, name, value;
                len = parameters.length;
                for (idx = 0; idx < len; ++idx) {
                    parameter = parameters[idx];
                    name = parameter._name;
                    if (undefined === result[name]) {
                        if (parameter._required) {
                            throw gpf.Error.ParamsRequiredMissing({ name: name });
                        }
                        value = parameter._defaultValue;
                        if (undefined !== value) {
                            if (parameter._multiple) {
                                value = [value];
                            }
                            result[name] = value;
                        } else if (parameter._multiple) {
                            result[name] = [];
                        }
                    }
                }
            },
            /**
             * Split the argument in a prefix / value pair if it makes sense.
             * Otherwise, only the value is returned.
             *
             * Recognized prefixes:
             * <ul>
             *     <li>-{prefix}[:value]</li>
             *     <li>{prefix}=value</li>
             * </ul>
             *
             * @param {String} argument
             * @return {String[]|String}
             */
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
            /**
             * Build the usage string for these parameters
             *
             * @param {gpf.Parameter[]} parameters
             * @return {String}
             */
            usage: function (parameters) {
                gpf.interface.ignoreParameter(parameters);
                return "";
            }
        }
    });
    gpf.fs = {
        TYPE_NOT_FOUND: 0,
        TYPE_FILE: 1,
        TYPE_DIRECTORY: 2,
        TYPE_UNKNOWN: 99,
        /**
         * Get information on the provided file path
         *
         * @param {*} path
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event ready
         * @eventParam {Object} info contains:
         * - type {Number} see gpf.fs.TYPE_xxx
         * - size {Number}
         * - createdDateTime
         * - modifiedDateTime
         */
        getInfo: function (path, eventsHandler) {
            gpf.interfaces.ignoreParameter(path);
            gpf.interfaces.ignoreParameter(eventsHandler);
            throw gpf.Error.Abstract();
        },
        /**
         * Read as a binary stream
         *
         * @param {*} path
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event ready
         * @eventParam {gpf.interface.IReadableStream} stream
         */
        readAsBinaryStream: function (path, eventsHandler) {
            gpf.interfaces.ignoreParameter(path);
            gpf.interfaces.ignoreParameter(eventsHandler);
            throw gpf.Error.Abstract();
        },
        /**
         * Write as a binary stream (overwrite file if it exists)
         *
         * @param {*} path
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event ready
         * @eventParam {gpf.interface.IWritableStream} stream
         */
        writeAsBinaryStream: function (path, eventsHandler) {
            gpf.interfaces.ignoreParameter(path);
            gpf.interfaces.ignoreParameter(eventsHandler);
            throw gpf.Error.Abstract();
        },
        /**
         * Close the underlying file: the stream becomes unusable
         *
         * @param {gpf.interfaces.IReadableStream|
         * gpf.interfaces.IWritableStream} stream
         */
        close: function (stream) {
            gpf.interfaces.ignoreParameter(stream);
            throw gpf.Error.Abstract();
        }
    };
    if (gpf.node) {
        var _fs, _getNodeFS = function () {
                if (undefined === _fs) {
                    _fs = require("fs");
                }
                return _fs;
            }, _fireNodeError = function (err, eventsHandler) {
                gpf.events.fire("error", { error: err }, eventsHandler);
            };
        gpf.fs.getInfo = function (path, eventsHandler) {
            _getNodeFS().exists(path, function (exists) {
                if (exists) {
                    _getNodeFS().stat(path, function (err, stats) {
                        var result;
                        if (err) {
                            _fireNodeError(err, eventsHandler);
                        } else {
                            result = {
                                size: stats.size,
                                createdDateTime: stats.ctime,
                                modifiedDateTime: stats.mtime
                            };
                            if (stats.isDirectory()) {
                                result.type = gpf.fs.TYPE_DIRECTORY;
                            } else if (stats.isFile()) {
                                result.type = gpf.fs.TYPE_FILE;
                            } else {
                                result.type = gpf.fs.TYPE_UNKNOWN;
                            }
                            gpf.events.fire("ready", { info: result }, eventsHandler);
                        }
                    });
                } else {
                    gpf.events.fire("ready", { info: { type: gpf.fs.TYPE_NOT_FOUND } }, eventsHandler);
                }
            });
        };
        gpf.fs.readAsBinaryStream = function (path, eventsHandler) {
            // TODO handle error
            var nodeStream = _getNodeFS().createReadStream(path);
            gpf.events.fire("ready", { stream: new gpf.node.ReadableStream(nodeStream) }, eventsHandler);
        };
        gpf.fs.writeAsBinaryStream = function (path, eventsHandler) {
            // TODO handle error
            var nodeStream = _getNodeFS().createWriteStream(path);
            gpf.events.fire("ready", { stream: new gpf.node.WritableStream(nodeStream) }, eventsHandler);
        };
        gpf.fs.close = function (stream) {
            gpf.interfaces.ignoreParameter(stream);    // TODO not sure what I should do with it...
        };
    }
    gpf.html = {
        // DOM standards
        ELEMENT_NODE: 1,
        TEXT_NODE: 3
    };
    var gpfI = gpf.interfaces, gpfFireEvent = gpf.events.fire;
    /**
     * Markdown to HTML converter using Parser interface
     * Inspired from http://en.wikipedia.org/wiki/Markdown,
     * improved with http://daringfireball.net/projects/markdown/syntax
     *
     * Weak -but working- implementation
     *
     * @class gpf.html.MarkdownParser
     */
    gpf.define("gpf.html.MarkdownParser", "gpf.Parser", {
        public: {
            /**
             * @constructor
             */
            constructor: function () {
                this._super.apply(this, arguments);
                this._openedTags = [];
            }
        },
        /*
     * 'Grammar'
     * init
     *      : '\n' init
     *      | '#' title1
     *      | '*' list
     *      | '0'...'9' list
     *      | ' ' init
     *      | content
     *
     * title1
     *      : '#' title2
     *      | text \n init
     * title2
     *      : '#' title3
     *      | text \n init
     * title3
     *       : text \n init
     *
     * list
     *      : ' ' content // confirmed
     *      | '0'...'9' list // If started with '0'...'9'
     *      | '.' content // confirmed, if started with '0'...'9'
     *      | '*' text '*' '*' // bold
     *      | content
     *
     * content
     *      : '\n' init
     *      | '*' italic
     *      | '`' monospace
     *      | '[' link
     *      | '!' image (if followed by '[')
     *      | '&' content
     *      | '<' content
     *      | '>' content
     *      | '-' escape
     *      | content
     *
     * escape
     *      : '-' '-' content
     *
     * italic
     *      : '*' content '*' '*' // bold
     *      : content '*' // italic
     *
     * monospace
     *      : (text) '`'
     *
     * link
     *      : (text) ']' '(' (text) ')'
     *
     * image
     *      : '[' link
     *      : content
     */
        protected: {
            //region Parser configuration
            _ignoreCarriageReturn: true,
            // \r
            /**
             * Initial state
             *
             * @param {String} char
             * @protected
             */
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
            /**
             * @inheritdoc gpf.Parser:_finalizeParserState
             * @protected
             */
            _finalizeParserState: function () {
                this._closeTags();
            }
        },
        private: {
            /**
             * Stack of opened tags
             *
             * @type {String[}}
             * @private
             */
            _openedTags: [],
            /**
             * Close all opened tags
             *
             * @private
             */
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
            /**
             * Open (or concatenate) a list tag. This includes closing previous
             * list item (if any)
             *
             * @param {String} listTag
             * @private
             */
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
            /**
             * Open/Close tag depending if it has been opened previously (if it
             * appears as the top tag on the stacked items)
             *
             * @param {String} tag
             * @private
             */
            _toggleTag: function (tag) {
                var len = this._openedTags.length;
                if (len && this._openedTags[len - 1] === tag) {
                    this._openedTags.pop();
                    this._output("</" + tag + ">");
                } else {
                    this._openTag(tag);
                }
            },
            /**
             * Open a tag (and adds it to the stack)
             *
             * @param {String} tag
             * @private
             */
            _openTag: function (tag) {
                this._output("<" + tag + ">");
                this._openedTags.push(tag);
            },
            /**
             * H level (number of times the # char has been found)
             *
             * @type {Number}
             * @private
             */
            _hLevel: 1,
            /**
             * States title1, ... N
             *
             * @param {String} char
             * @private
             */
            _parseTitle: function (char) {
                if ("#" === char) {
                    ++this._hLevel;
                } else {
                    this._openTag("h" + this._hLevel);
                    return this._parseText;    // No formatting allowed in Hx
                }
            },
            /**
             * Indicates a numeric list element has been found
             *
             * @type {Boolean}
             * @private
             */
            _numericList: false,
            /**
             * State list
             * TODO: numbered list parsing is incorrect
             *
             * @param {String} char
             * @private
             */
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
            /**
             * Handles <, > and & HTML entities
             *
             * @param {String} char
             * @returns {boolean} The character has been processed
             * @private
             */
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
            /**
             * Escape character
             *
             * @type {String}
             * @private
             */
            _escapeChar: "",
            /**
             * Escape character count
             *
             * @type {Number}
             * @private
             */
            _escapeCount: 0,
            /**
             * State escape
             *
             * @param {String} char
             * @private
             */
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
            /**
             * State content
             *
             * @param {String} char
             * @private
             */
            _parseContent: function (char) {
                if (this._handleEntities(char)) {
                    return;
                }
                if ("*" === char) {
                    return this._parseItalic;
                } else if ("`" === char) {
                    this._toggleTag("code");
                    return this._parseMonospace;
                } else if ("[" === char) {
                    return this._startLink(0);
                } else if ("!" === char) {
                    return this._parseImage;
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
            /**
             * State italic
             *
             * @param {String} char
             * @private
             */
            _parseItalic: function (char) {
                if ("*" === char) {
                    this._toggleTag("strong");
                } else {
                    this._toggleTag("em");
                    this._output(char);
                }
                return this._parseContent;
            },
            /**
             * State text
             *
             * @param {String} char
             * @private
             */
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
            /**
             * State monospace
             *
             * @param {String} char
             * @private
             */
            _parseMonospace: function (char) {
                if ("`" === char) {
                    this._toggleTag("code");
                    return this._parseContent;
                } else {
                    this._output(char);
                }
            },
            /**
             * 0 for A, 1 for IMG
             *
             * @type {Number}
             * @private
             */
            _linkType: 0,
            /**
             * 0: in text
             * 1: ], waiting for (
             * 2: in url
             *
             * @type {Number}
             * @private
             */
            _linkState: 0,
            /**
             * Link text
             *
             * @type {String[]}
             * @private
             */
            _linkText: [],
            /**
             * Link url
             *
             * @type {String[]}
             * @private
             */
            _linkUrl: [],
            /**
             * Prepare a link parsing
             *
             * @return {Function}
             * @private
             */
            _startLink: function (type) {
                this._linkType = type;
                this._linkState = 0;
                this._linkText = [];
                this._linkUrl = [];
                return this._parseLink;
            },
            /**
             * Finalize link parsing
             *
             * @return {Function}
             * @private
             */
            _finishLink: function () {
                var url = this._linkUrl.join(""), text = this._linkText.join("");
                if (0 === this._linkType) {
                    this._output("<a href=\"");
                    this._output(url);
                    this._output("\">");
                    this._output(text);
                    this._output("</a>");
                } else if (1 === this._linkType) {
                    this._output("<img src=\"");
                    this._output(url);
                    this._output("\" alt=\"");
                    this._output(text);
                    this._output("\" title=\"");
                    this._output(text);
                    this._output("\">");
                }
                return this._parseContent;
            },
            /**
             * State link
             * TODO improve?
             *
             * @param {String} char
             * @private
             */
            _parseLink: function (char) {
                var linkState = this._linkState;
                if ("]" === char && 0 === linkState) {
                    ++this._linkState;
                } else if ("(" === char && 1 === linkState) {
                    ++this._linkState;
                } else if (")" === char && 2 === linkState) {
                    return this._finishLink();
                } else if (0 === linkState) {
                    this._linkText.push(char);
                } else if (2 === linkState) {
                    /*
                     * https://github.com/ArnaudBuchholz/gpf-js/issues/33
                     * Filter out tabs and carriage returns
                     */
                    if (-1 === "\t\n".indexOf(char)) {
                        this._linkUrl.push(char);
                    }
                }    // Else... nothing. do some kind of error handling?
            },
            /**
             * State image
             *
             * @param {String} char
             * @private
             */
            _parseImage: function (char) {
                if ("[" === char) {
                    return this._startLink(1);
                } else {
                    this._output("!");
                    this._setParserState(this._parseContent);
                    return this._parseContent(char);
                }
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
            /**
             * Name of the file
             *
             * @return {String}
             */
            name: function () {
                return this._file.name;
            },
            /**
             * Size of the file
             *
             * @return {Number}
             */
            size: function () {
                return this._file.size;
            },
            /**
             * @implements gpf.interfaces.ITextStream:read
             * @closure
             */
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
            /**
             * @type {File}
             * @private
             */
            _file: null,
            /**
             * @type {FileReader}
             * @private
             */
            _reader: null,
            /**
             * @type {Number}
             * @private
             */
            _pos: 0,
            /**
             * @type {gpf.events.Handler}
             * @private
             */
            _eventsHandler: null,
            /**
             * Wrapper for the onloadend event handler
             *
             * @param {DOM Event} event
             * @private
             */
            _onLoadEnd: function (event) {
                var reader = event.target, buffer, len, result, idx;
                gpf.ASSERT(reader === this._reader, "Unexpected change of reader");
                if (reader.error) {
                    gpfFireEvent.apply(this, [
                        gpfI.IReadableStream.ERROR,
                        {
                            // According to W3C
                            // http://www.w3.org/TR/domcore/#interface-domerror
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
        _HtmBase = gpf._defAttr("HtmlAttribute", {}),
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
        _HtmHandler = gpf._defAttr("$HtmlHandler", _HtmBase, {
            private: {
                _selector: "",
                _globalSelector: false
            },
            protected: {
                /**
                 * Apply selection starting from the provided object
                 *
                 * @param {Object} domObject
                 * @returns {Object|undefined}
                 * @private
                 */
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
                /**
                 * @constructor
                 * @param {String} [selector=undefined] selector
                 * @param {Boolean} [global=false] global
                 */
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
        _HtmEvent = gpf._defAttr("$HtmlEvent", _HtmHandler, {
            private: { _event: "" },
            public: {
                /**
                 * @constructor
                 * @param {String} event
                 * @param {String} [selector=undefined] selector
                 * @param {Boolean} [global=false] global
                 */
                constructor: function (event, selector, global) {
                    _HtmHandler.apply(this, [
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
            throw gpf.Error.HtmlHandlerMultiplicityError({ member: member });
        }
        attribute = handlerAttributeArray.get(0);
        if (!(attribute instanceof _HtmEvent)) {
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
        var allAttributes = new gpf.attributes.Map(instance).filter(_HtmBase), handlerAttributes = allAttributes.filter(_HtmHandler), defaultHandler, eventAttributes;
        if (0 === handlerAttributes.count()) {
            throw gpf.Error.HtmlHandlerMissing();
        }
        defaultHandler = handlerAttributes.each(_findDefaultHandler);
        if (undefined === defaultHandler) {
            throw gpf.Error.HtmlHandlerNoDefault();
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
        eventAttributes = allAttributes.filter(_HtmEvent);
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
        /**
         * Check if the DOM object has the requested class name(s)
         *
         * @param {Object} domObject
         * @param {String|String[]} toCheck
         * @return {Boolean}
         * @chainable
         */
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
        /**
         * Add/Remove the provided class name(s) to the DOM object
         *
         * @param {Object} domObject
         * @param {String|String[]} toAdd
         * @param {String|String[]} toRemove
         * @return {Object}
         * @chainable
         */
        alterClass: function (domObject, toAdd, toRemove) {
            var classNames, lengthBefore, len, idx;
            if (domObject.className) {
                classNames = domObject.className.split(" ");
            } else {
                classNames = [];
            }
            lengthBefore = classNames.length;
            // Remove first (faster)
            if (undefined !== toRemove) {
                if ("string" === typeof toRemove) {
                    toRemove = [toRemove];
                }
                gpf.ASSERT(toRemove instanceof Array, "Expected array");
                len = toRemove.length;
                for (idx = 0; idx < len; ++idx) {
                    gpf.clear(classNames, toRemove[idx]);
                }
            }
            // Then add
            if (undefined !== toAdd) {
                if ("string" === typeof toAdd) {
                    toAdd = [toAdd];
                }
                gpf.ASSERT(toAdd instanceof Array, "Expected array");
                len = toAdd.length;
                for (idx = 0; idx < len; ++idx) {
                    gpf.set(classNames, toAdd[idx]);
                }
            }
            // Avoid resource consuming refresh if nothing changed
            if (lengthBefore !== classNames.length) {
                domObject.className = classNames.join(" ");
            }
            return domObject;
        },
        /**
         * Add the provided class name(s) to the DOM object
         *
         * @param {Object} domObject
         * @param {String|String[]} toAdd
         * @return {Object}
         * @chainable
         */
        addClass: function (domObject, toAdd) {
            return gpf.html.alterClass(domObject, toAdd, undefined);
        },
        /**
         * Remove the provided class name(s) to the DOM object
         *
         * @param {Object} domObject
         * @param {String|String[]} toRemove
         * @return {Object}
         * @chainable
         */
        removeClass: function (domObject, toRemove) {
            return gpf.html.alterClass(domObject, undefined, toRemove);
        }
    });
    //endregion
    //region Responsive page framework
    var
        /**
         * Responsive framework broadcaster
         *
         * @type {gpf.events.Broadcaster}
         * @private
         */
        _broadcaster = null,
        /**
         * Handle of a dynamic CSS section used for some responsive helpers
         *
         * @type {Object}
         * @private
         */
        _dynamicCss = null,
        /**
         * gpf-top
         *
         * @type {boolean}
         * @private
         */
        _monitorTop = false,
        /**
         * Current page width
         *
         * @type {Number}
         * @private
         */
        _width,
        /**
         * Current page height
         *
         * @type {Number}
         * @private
         */
        _height,
        /**
         * Current page scroll Y
         *
         * @type {Number}
         * @private
         */
        _scrollY,
        /**
         * Current page orientation
         *
         * @type {String}
         * @private
         */
        _orientation = "";
    function _updateDynamicCss() {
        var content = [];
        if (_monitorTop) {
            content.push(".gpf-top { top: ", _scrollY, "px; }\n");
        }
        _dynamicCss.innerHTML = content.join("");
    }
    /**
     * HTML Event "resize" listener
     *
     * @private
     */
    function _onResize() {
        _width = window.innerWidth;
        _height = window.innerHeight;
        var orientation, orientationChanged = false, toRemove = [], toAdd = [];
        if (_width > _height) {
            orientation = "gpf-landscape";
        } else {
            orientation = "gpf-portrait";
        }
        if (_orientation !== orientation) {
            toRemove.push(_orientation);
            _orientation = orientation;
            toAdd.push(orientation);
            orientationChanged = true;
        }
        gpf.html.alterClass(document.body, toAdd, toRemove);
        _broadcaster.broadcastEvent("resize", {
            width: _width,
            height: _height
        });
        if (orientationChanged) {
            _broadcaster.broadcastEvent("rotate", { orientation: orientation });
        }
    }
    /**
     * HTML Event "scroll" listener
     *
     * @private
     */
    function _onScroll() {
        _scrollY = window.scrollY;
        if (_monitorTop && _dynamicCss) {
            _updateDynamicCss();
        }
        _broadcaster.broadcastEvent("scroll", { top: _scrollY });
    }
    /**
     * Generates the initial calls for responsive framework
     *
     * @private
     */
    function _init() {
        _onResize();
        _onScroll();
    }
    /**
     * Install (if not done) responsive framework handlers:
     * - Listen to the resize handlers and insert body css classNames according
     *   to the current configuration:
     *
     * @param {Object} options
     * <ul>
     *     <li>{Boolean} [monitorTop=undefined] monitorTop If true, a CSS class
     *     gpf-top is defined and maintained to the vertical offset of top
     *     </li>
     * </ul>
     * @return {gpf.events.Broadcaster}
     */
    gpf.html.responsive = function (options) {
        var needDynamicCss, headTag;
        if (options && undefined !== options.monitorTop) {
            _monitorTop = options.monitorTop;
        }
        needDynamicCss = _monitorTop;
        if (needDynamicCss) {
            if (!_dynamicCss) {
                headTag = document.getElementsByTagName("head")[0] || document.documentElement;
                _dynamicCss = document.createElement("style");
                _dynamicCss.setAttribute("type", "text/css");
                _dynamicCss = headTag.appendChild(_dynamicCss);
            }
        } else if (_dynamicCss) {
            // Remove
            _dynamicCss.parentNode.removeChild(_dynamicCss);
            _dynamicCss = null;
        }
        if (null === _broadcaster) {
            _broadcaster = new gpf.events.Broadcaster([
                /**
                 * @event resize
                 * @eventParam {Number} width
                 * @eventParam {Number} height
                 */
                "resize",
                /**
                 * @event rotate
                 * @eventParam {String} orientation
                 */
                "rotate",
                /**
                 * @event scroll
                 * @eventParam {Number} top
                 */
                "scroll"
            ]);
            // Use the document to check if the framework is already installed
            window.addEventListener("resize", _onResize);
            window.addEventListener("scroll", _onScroll);
            // First execution (deferred to let caller register on them)
            gpf.defer(_init, 0);
        }
        return _broadcaster;
    };
    //endregion
    //region Handles gpf-loaded tag
    var _gpfIncludes = [];
    function _searchGpfLoaded() {
        /**
         * Look for a script tag with the gpf-loaded attribute
         */
        var scripts = document.getElementsByTagName("script"), len = scripts.length, idx, script, gpfLoaded;
        for (idx = 0; idx < len; ++idx) {
            script = scripts[idx];
            gpfLoaded = script.getAttribute("gpf-loaded");
            if (gpfLoaded) {
                script.removeAttribute("gpf-loaded");
                gpfLoaded = gpfLoaded.split(",");
                len = gpfLoaded.length;
                for (idx = 0; idx < len; ++idx) {
                    _gpfIncludes.push(gpfLoaded[idx]);
                }
            }
        }
        // Load the scripts sequentially
        if (_gpfIncludes.length) {
            _loadGpfIncludes();
        }
    }
    function _loadGpfIncludeFailed(event) {
        console.error("gpf-loaded: failed to include '" + event.get("url") + "'");
    }
    function _loadGpfIncludes() {
        if (!_gpfIncludes.length) {
            return;
        }
        var src = _gpfIncludes.shift();
        gpf.http.include(src, {
            load: _loadGpfIncludes,
            error: _loadGpfIncludeFailed
        });
    }
    if ("browser" === gpf.host() || "phantomjs" === gpf.host()) {
        _searchGpfLoaded();
    }    //endregion
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
         * NodeJS modules that will be loaded
         */
        _http = null, _url = null, _path = null, _fs = null,
        /**
         * DateTime of server start
         *
         * @type {Date}
         * @private
         */
        _start,
        /**
         * Placeholder class to extend the NodeJS response class and provide
         * more context to it
         *
         * @class ResponseHandler
         * @private
         */
        ResponseHandler = gpf.define("ResponseHandler", {
            private: {
                /**
                 * Web server options
                 *
                 * @type {Object}
                 * @private
                 */
                _options: null,
                /**
                 * Request
                 *
                 * @type {NodeJS.http.IncomingMessage}
                 * @private
                 */
                _request: null,
                /**
                 * Response
                 *
                 * @type {NodeJS.http.ServerResponse}
                 * @private
                 */
                _response: null,
                /**
                 * Parsed URL object (see NodeJS url.parse documentation)
                 *
                 * @type {Object}
                 * @private
                 */
                _parsedUrl: null,
                /**
                 * Corresponding file path
                 *
                 * @type {String}
                 * @private
                 */
                _filePath: "",
                /**
                 * File extension (lowercase)
                 *
                 * @type {String}
                 * @private
                 */
                _extName: "",
                /**
                 * For performance reasons, I keep track of the time spent
                 *
                 * @type {Date}
                 * @private
                 */
                _startTimeStamp: null
            },
            public: {
                /**
                 * @param {Object} options Web server options
                 * @param {NodeJS.http.IncomingMessage} request
                 * @param {NodeJS.http.ServerResponse} response
                 * @constructor
                 */
                constructor: function (options, request, response) {
                    this._startTimeStamp = new Date();
                    this._options = options;
                    this._request = request;
                    this._response = response;
                    // Parse and analyse URL
                    this._parsedUrl = _url.parse(request.url);
                    this._filePath = _path.join(this._options.root, this._parsedUrl.pathname);
                    this._extName = _path.extname(this._filePath).toLowerCase();
                    // Extend response
                    response._gpf = this;
                    response.plain = ResponseHandler._plain;
                },
                /**
                 * Process the request
                 */
                process: function () {
                    if (_fs.existsSync(this._filePath)) {
                        if (".jsp" === this._extName) {
                            this.plain(500, "JSP not handled yet");
                        } else {
                            this.fromFile(this._filePath);
                        }
                    } else {
                        this.plain(404, "No file found");
                    }
                },
                /**
                 * Generates a PLAIN response to the server
                 *
                 * @param {Number} statusCode
                 * @param {String} text
                 */
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
                /**
                 * Generates a response that contains the specified file
                 *
                 * @param {String} filePath
                 * @private
                 */
                fromFile: function (filePath) {
                    var me = this, extName = _path.extname(filePath).toLowerCase(), size, stream;
                    _fs.stat(filePath, function (err, stats) {
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
                        me._response.writeHead(200, {
                            "content-type": mimeType,
                            "content-length": size
                        });
                        stream = _fs.createReadStream(filePath);
                        //stream.on("data", function (chunk) {
                        //    if (!me._response.write(chunk)) {
                        //        stream.pause();
                        //        me._response.once("drain", function () {
                        //            stream.resume();
                        //        });
                        //    }
                        //});
                        stream.on("end", function () {
                            if (me._options.verbose) {
                                console.log("\tEnd      t+: " + (new Date() - me._startTimeStamp) + "ms");
                            }
                            me._response.statusCode = 200;
                            me._response.end();
                        });
                        stream.pipe(me._response);
                    });
                }
            },
            static: {
                /**
                 * Generates a PLAIN response to the server
                 *
                 * @param {Number} statusCode
                 * @param {String} text
                 * @private
                 */
                _plain: function (statusCode, text) {
                    return this._gpf.plain(statusCode, text);
                },
                /**
                 * Generates a response that contains the specified file
                 *
                 * @param {String} filePath
                 * @private
                 */
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
        // Load the modules that are needed
        _http = require("http");
        _url = require("url");
        _path = require("path");
        _fs = require("fs");
        // Build the web server
        _start = new Date();
        _http.createServer(function (request, response) {
            if (options.verbose) {
                var timestamp = (new Date() - _start).toString();
                console.log([
                    timestamp,
                    "       ".substr(timestamp.length),
                    " ",
                    request.method,
                    "     ".substr(request.method.length),
                    request.url
                ].join(""));
            }
            var handler = new ResponseHandler(options, request, response);
            handler.process();
        }).on("close", function () {
            console.log("Closed.");
        }).listen(options.port, function () {
            if (options.verbose) {
                console.log("Listening... (CTRL+C to stop)");
            }
        });
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
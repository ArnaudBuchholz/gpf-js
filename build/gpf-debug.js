/*global define, exports*/
/*jshint maxlen:false*/
(function (root, factory) {
    "use strict";
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        factory(root.gpf = {});
    }
}(this, function (gpf) {
    "use strict";
    var _host, _context;
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
        };    // Nodejs
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
     * Returns a string identifying the detected host
     *
     * @return {String}
     * - "wscript" for cscript and wscript
     * - "nodejs" for nodejs
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
    gpf.NOT_IMPLEMENTED = function () {
        console.error("Not implemented");
        throw { message: "Not implemented" };
    };
    /*
     * Handling external options
     * TODO: provide ways to turn on/off features by adding options
     */
    // DEBUG specifics
    gpf.ASSERT = function (condition, message) {
        if (!condition) {
            console.warn("ASSERTION FAILED: " + message);
            throw { message: "ASSERTION FAILED: " + message };
        }
    };
    if (!gpf.ASSERT) {
    }
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
        Func = Function;
    // avoid JSHint error
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
        _func: function (source) {
            return new Func(source);
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
                for (idx = 0; idx < dictionary.length; ++idx) {
                    if (dictionary[idx] === value) {
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
            var idx, len = array.length;
            for (idx = 0; idx < len; ++idx) {
                if (array[idx] === value) {
                    return array;    // Already set
                }
            }
            array.push(value);
            return array;
        },
        clear: function (dictionary, value) {
            var idx;
            if (dictionary instanceof Array) {
                for (idx = 0; idx < dictionary.length; ++idx) {
                    if (dictionary[idx] === value) {
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
        }
    });
    var _Broadcaster = function (events) {
            var idx, eventName;
            this._listeners = {};
            if (undefined !== events) {
                this._events = events;
                for (idx = 0; idx < events.length; ++idx) {
                    eventName = events[idx];
                    this["on" + eventName.charAt(0).toUpperCase() + eventName.substr(1)] = this._onEVENT(idx);
                    this._listeners[eventName] = [];
                }
            } else {
                // Used inside a dynamically created closure... so
                this._events = null;
            }
        }, _Event = function (type, params, cancelable, that) {
            this._type = type;
            if (undefined === params) {
                params = {};
            }
            this._params = params;
            this._cancelable = cancelable ? true : false;
            //            this._timeStamp = new Date();
            //            this._returnValue = undefined;
            this._propagationStopped = false;
            this._defaultPrevented = false;
            if (undefined !== that) {
                this._that = that;
            } else {
                this._that = that;
            }
        };
    /**
     * Event broadcaster, keep track of listeners and dispatch events when fired
     *
     * @class gpf.events.Broadcaster
     */
    gpf.extend(_Broadcaster.prototype, {
        _onEVENT: function (idx) {
            var closures = _Broadcaster.prototype._onEVENT.closures, jdx;
            if (!closures) {
                closures = _Broadcaster.prototype._onEVENT.closures = [];
            }
            gpf.ASSERT(closures.length >= idx, "calls must be sequential");
            while (closures.length <= idx) {
                jdx = closures.length;
                closures.push(gpf._func("return this.addEventListener(this._events[" + jdx + "],arguments[0],arguments[1]);"));
            }
            return closures[idx];
        },
        addEventListener: function (event, callback, useCapture) {
            var listeners = this._listeners;
            if (!useCapture) {
                useCapture = false;
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
        removeEventListener: function (event, callback) {
            if (undefined !== this._listeners[event]) {
                gpf.clear(this._listeners[event], callback);
            }
        },
        broadcastEvent: function (event, params) {
            var idx, type, listeners;
            if (event instanceof _Event) {
                type = event.type();
            } else {
                type = event;
            }
            listeners = this._listeners[type];
            if (undefined === listeners) {
                return this;    // Nothing to do
            }
            if (event instanceof _Event) {
                // 'Advanced' version
                for (idx = 0; idx < listeners.length; ++idx) {
                    listeners[idx].apply(event._that, [event]);
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
    /**
     * Event object
     *
     * @class gpf.events.Event
     */
    gpf.extend(_Event.prototype, {
        type: function () {
            return this._type;
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
        Broadcaster: _Broadcaster,
        Event: _Event,
        fire: function (event, params, eventsHandler) {
            if (event instanceof _Event) {
                // Already an event, no params
                eventsHandler = params;
            } else {
                event = new gpf.events.Event(event, params, true, this);
            }
            if (eventsHandler instanceof _Broadcaster) {
                eventsHandler.broadcastEvent(event);
            } else if (event._that) {
                eventsHandler.apply(event._that, [event]);
            } else {
                eventsHandler(event);
            }
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
            return eventsHandler;
        }
    };
    var _b64 = gpf._ALPHA + gpf._alpha + "0123456789+/", _b16 = "0123456789ABCDEF", _toBaseANY = function (base, value, length, safepad) {
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
    var _CLASS_PUBLIC = 0, _CLASS_PROTECTED = 1, _CLASS_PRIVATE = 2, _CLASS_STATIC = 3, _classInitAllowed = true;
    /**
     * An helper to store class information
     *
     * @class ClassInfo
     * @constructor
     * @private
     */
    function ClassInfo() {
        this._Subs = [];
    }
    gpf.extend(ClassInfo.prototype, {
        _name: "",
        name: function () {
            return this._name;
        },
        _Base: null,
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
        _constructor: function () {
        }
    });
    /**
     * Retrieves (or allocate) the class information object
     *
     * @param {Function} constructor Class constructor
     * @returns {ClassInfo}
     */
    gpf.classInfo = function (constructor) {
        if (undefined === constructor._gpf) {
            constructor._gpf = new ClassInfo();
        }
        return constructor._gpf;
    };
    /**
     * Class initializer: it triggers the call to this._constructor only if
     * _classInitAllowed is true.
     *
     * @param {Function} constructor Class constructor
     * @param {*[]} args Arguments
     * @private
     */
    gpf._classInit = function (constructor, args) {
        if (_classInitAllowed) {
            gpf.classInfo(constructor)._constructor.apply(this, args);
        }
    };
    /**
     * Defines a new member of the class
     *
     * @param {Object} definition Class definition
     * @param {Object} basePrototype Base prototype
     * @param {Object} newPrototype Class prototype
     * @param {String} member Name of the member to define
     * @param {Number} visibility Visibility of the members
     * @private
     */
    function _processMember(definition, basePrototype, newPrototype, member, visibility) {
        // Don't know yet how I want to handle visibility
        var defMember = definition[member], newType, baseMember, baseType, baseName;
        if (_CLASS_STATIC === visibility) {
            // No inheritance can be applied here
            newPrototype.constructor[member] = defMember;
            return;
        }
        newType = typeof defMember;
        baseMember = basePrototype[member];
        baseType = typeof baseMember;
        if ("undefined" !== baseType && newType !== baseType) {
            throw { message: "You can't overload a member to change its type" };
        }
        if ("function" === newType && "undefined" !== baseType) {
            /*
             * As it is a function overload, defines a new member that will give
             * a quick access to the base function. This should answer 90% of
             * the cases.
             *
             * TODO how do we handle possible conflict name
             */
            baseName = member;
            if ("_" === baseName.charAt(0)) {
                baseName = baseName.substr(1);
            }
            // Capitalize
            baseName = baseName.charAt(0).toUpperCase() + baseName.substr(1);
            newPrototype["_base" + baseName] = baseMember;
        }
        if ("constructor" === member) {
            gpf.classInfo(newPrototype.constructor)._constructor = defMember;
        } else {
            newPrototype[member] = defMember;
        }
    }
    /**
     * Add the attribute to the map
     *
     * @param {Object} definition Class definition
     * @param {String} member Name of the member to define
     * @param {Object} attributes Map of name to attribute list
     * @private
     */
    function _processAttribute(definition, member, attributes) {
        var attributeArray = attributes[member], newAttributeArray = definition[member];
        member = member.substr(1, member.length - 2);
        if (undefined === attributeArray) {
            attributeArray = [];
        }
        attributes[member] = attributeArray.concat(newAttributeArray);
    }
    /**
     * Process class definition including visibility
     *
     * @param {Object} definition Class definition
     * @param {Object} basePrototype Base prototype
     * @param {Object} newPrototype Class prototype
     * @param {Object} attributes Map of name to attribute list
     * @param {Number} visibility Visibility of the members
     * @private
     */
    function _processDefWithVisibility(definition, basePrototype, newPrototype, attributes, visibility) {
        var member;
        for (member in definition) {
            if (definition.hasOwnProperty(member)) {
                // Attribute
                if ("[" === member.charAt(0) && "]" === member.charAt(member.length - 1)) {
                    _processAttribute(definition, member, attributes);    // Visibility
                } else if ("public" === member || "private" === member || "protected" === member || "static" === member) {
                    throw { message: "Invalid visibility keyword" };    // Usual member
                } else {
                    _processMember(definition, basePrototype, newPrototype, member, visibility);
                }
            }
        }
        // 2014-05-05 #14
        if ("wscript" === gpf.host() && definition.constructor !== Object) {
            _processMember(definition, basePrototype, newPrototype, "constructor", visibility);
        }
    }
    /**
     * Process class definition
     *
     * @param {Object} definition Class definition
     * @param {Object} basePrototype Base prototype
     * @param {Object} newPrototype Class prototype
     * @param {Object} attributes Map of name to attribute list
     * @private
     */
    function _processDefinition(definition, basePrototype, newPrototype, attributes) {
        var member;
        for (member in definition) {
            if (definition.hasOwnProperty(member)) {
                // Attribute
                if ("[" === member.charAt(0) && "]" === member.charAt(member.length - 1)) {
                    _processAttribute(definition, member, attributes);    // Visibility
                } else if ("public" === member) {
                    _processDefWithVisibility(definition[member], basePrototype, newPrototype, attributes, _CLASS_PUBLIC);
                } else if ("private" === member) {
                    _processDefWithVisibility(definition[member], basePrototype, newPrototype, attributes, _CLASS_PRIVATE);
                } else if ("protected" === member) {
                    _processDefWithVisibility(definition[member], basePrototype, newPrototype, attributes, _CLASS_PROTECTED);
                } else if ("static" === member) {
                    _processDefWithVisibility(definition[member], basePrototype, newPrototype, attributes, _CLASS_STATIC);    // Usual member
                } else {
                    _processMember(definition, basePrototype, newPrototype, member, _CLASS_PUBLIC);
                }
            }
        }
        // 2014-05-05 #14
        if ("wscript" === gpf.host() && definition.constructor !== Object) {
            _processMember(definition, basePrototype, newPrototype, "constructor", _CLASS_PUBLIC);
        }
    }
    /**
     * Process the attributes collected in the definition
     *
     * NOTE: gpf.attributes._add is defined in attributes.js

     * @param {Object} attributes Map of name to attribute list
     * @param {Function} newClass
     * @param {Object} newPrototype Class prototype
     * @private
     */
    function _processAttributes(attributes, newClass, newPrototype) {
        var attributeName;
        for (attributeName in attributes) {
            if (attributes.hasOwnProperty(attributeName)) {
                if (attributeName in newPrototype || attributeName === "Class") {
                    gpf.attributes.add(newClass, attributeName, attributes[attributeName]);
                } else {
                    // 2013-12-15 ABZ Consider this as exceptional, trace it
                    console.error("gpf.Class::extend: Invalid attribute name '" + attributeName + "'");
                }
            }
        }
    }
    /**
     * Template for new class constructor
     * - Uses closure to keep track of gpf handle and constructor function
     * - _CONSTRUCTOR_ will be replaced with the actual class name
     *
     * @returns {Function}
     * @private
     */
    function _newClassConstructor() {
        var gpf = arguments[0], constructor = function _CONSTRUCTOR_() {
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
        var src = _newClassConstructor.toString().replace("_CONSTRUCTOR_", name), start = src.indexOf("{") + 1, end = src.lastIndexOf("}") - 1;
        return src.substr(start, end - start + 1);
    }
    /**
     * Create a new Class
     *
     * @param {String} name Name of the class
     * @param {Function} Base Base class to inherit from
     * @param {Object} definition Members / Attributes of the class
     * @return {Function} new class constructor
     * @closure
     */
    function _createClass(name, Base, definition) {
        var basePrototype = Base.prototype, newClass, newPrototype, newClassInfo, baseClassInfo, attributes = {};
        // The new class constructor
        newClass = gpf._func(_getNewClassConstructorSrc(name))(gpf);
        /*
         * Basic JavaScript inheritance mechanism:
         * Defines the newClass prototype as an instance of the base class
         * Do it in a critical section that prevents class initialization
         */
        /*__begin__thread_safe__*/
        _classInitAllowed = false;
        newPrototype = new Base();
        _classInitAllowed = true;
        /*__end_thread_safe__*/
        // Populate our constructed prototype object
        newClass.prototype = newPrototype;
        // Enforce the constructor to be what we expect
        newPrototype.constructor = newClass;
        /*
         * Defines the link between this class and its base one
         * (It is necessary to do it here because of the gpf.addAttributes that
         * will test the parent class)
         */
        newClassInfo = gpf.classInfo(newClass);
        newClassInfo._name = name;
        newClassInfo._Base = Base;
        baseClassInfo = gpf.classInfo(Base);
        baseClassInfo.Subs().push(newClass);
        /*
         * 2014-04-28 ABZ Changed again from two passes on all members to two
         * passes in which the first one also collects attributes to simplify
         * the second pass.
         */
        _processDefinition(definition, basePrototype, newPrototype, attributes);
        _processAttributes(attributes, newClass, newPrototype);
        /*
         * If no constructor was defined, use the inherited one
         * TODO: Not sure this is the best way to handle the situation but at
         * least, it is isolated here
         */
        if (!newClassInfo.hasOwnProperty("_constructor")) {
            newClassInfo._constructor = Base;
        }
        return newClass;
    }
    /**
     * Defines a new class by setting a contextual name
     *
     * @param {String} name New class contextual name
     * @param {String} [base=undefined] base Base class contextual name
     * @param {Object} [definition=undefined] definition Class definition
     * @return {Function}
     */
    gpf.define = function (name, base, definition) {
        var result, ns, path;
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
            name = path.pop();
            ns = gpf.context(path);
        }
        result = _createClass(name, base, definition || {});
        if (undefined !== ns) {
            ns[name] = result;
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
        _member: "",
        member: function (name) {
            var value = this._member;
            if (name) {
                this._member = name;
            }
            return value;
        },
        alterPrototype: function (objPrototype) {
            gpf.interfaces.ignoreParameter(objPrototype);
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
        _name: "",
        constructor: function (name) {
            this._name = name;
        },
        alterPrototype: function (objPrototype) {
            _alias(objPrototype.constructor, this._name);
        }
    });
    /**
     * Attribute array, generally used to list attributes on a class member
     *
     * @class gpf.attributes.Array
     */
    gpf.define("gpf.attributes.Array", {
        _array: [],
        constructor: function () {
            this._array = [];    // Create a new instance of the array
        },
        has: function (expectedClass) {
            gpf.ASSERT("function" === typeof expectedClass);
            var idx, item;
            for (idx = 0; idx < this._array.length; ++idx) {
                item = this._array[idx];
                if (item instanceof expectedClass) {
                    return item;
                }
            }
            return null;
        },
        filter: function (expectedClass) {
            gpf.ASSERT("function" === typeof expectedClass);
            var idx, attribute, result = new gpf.attributes.Array();
            for (idx = 0; idx < this._array.length; ++idx) {
                attribute = this._array[idx];
                if (attribute instanceof expectedClass) {
                    result._array.push(attribute);
                }
            }
            return result;
        }
    });
    /**
     * Attribute map, generally used to list attributes of a class
     *
     * @class gpf.attributes.Map
     */
    gpf.define("gpf.attributes.Map", {
        _members: {},
        _count: 0,
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
        _copyTo: function (attributesMap, callback, param) {
            var member, array, idx, attribute;
            if (this._count) {
                for (member in this._members) {
                    if (this._members.hasOwnProperty(member)) {
                        array = this._members[member]._array;
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
        },
        fillFromObject: function (object) {
            var classInfo = gpf.classInfo(object.constructor), attributes;
            while (classInfo) {
                // !undefined && !null
                attributes = classInfo.attributes();
                if (attributes) {
                    attributes._copyTo(this);
                }
                if (classInfo.Base()) {
                    classInfo = gpf.classInfo(classInfo.Base());
                } else {
                    break;
                }
            }
            return this._count;
        },
        filter: function (expectedClass) {
            gpf.ASSERT("function" === typeof expectedClass);
            var result = new gpf.attributes.Map();
            this._copyTo(result, this._filterCallback, expectedClass);
            return result;
        },
        member: function (name) {
            var result = this._members[name];
            if (undefined === result) {
                if (0 === _emptyMember) {
                    _emptyMember = new gpf.attributes.Array();
                }
                result = _emptyMember;
            }
            return result;
        },
        members: function () {
            var result = [], member;
            for (member in this._members) {
                if (this._members.hasOwnProperty(member)) {
                    result.push(member);
                }
            }
            return result;
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
        attributeList = gpf.classInfo(objectClass).attributes();
        len = attributes.length;
        for (idx = 0; idx < len; ++idx) {
            attribute = attributes[idx];
            attribute.member(name);
            // Assign member name
            attributeList.add(name, attribute);
            attribute.alterPrototype(objectClass.prototype);
        }
    };
    gpf.define("gpf.Error", {
        _message: "",
        _name: "",
        constructor: function (message, name, extended) {
            this._message = message;
            if (name) {
                this._name = name;
            } else {
                this._name = "Error";
            }
            if (extended) {
                gpf.extend(this, extended);
            }
        },
        message: function () {
            return this._message;
        },
        name: function () {
            return this._name;
        }
    });
    var
        /*
         * 2013-12-15 ABZ
         *  Decided to make it as simple as possible
         */
        _roProperty = function (member) {
            return gpf._func("return this." + member + ";");
        }, _rwProperty = function (member) {
            return gpf._func("var r = this." + member + "; if (0 < arguments.length) { this." + member + " = arguments[0]; } return r;");
        }, _base = gpf._defAttr("ClassAttribute");
    /**
     * Creates getter (and setter) methods for a private member. The created
     * accessor is a method with the following signature:
     * {type} MEMBER({type} [value=undefined] value)
     * When value is not set, the member acts as a getter
     *
     * @param {Boolean} writeAllowed
     * @param {String} [publicName=undefined] publicName When not specified,
     * the member name (without _) is applied
     *
     * @class gpf.attributes.ClassPropertyAttribute
     * @extends gpf.attributes.ClassAttribute
     * @alias gpf.$ClassProperty
     */
    gpf._defAttr("$ClassProperty", _base, {
        _writeAllowed: false,
        _publicName: "",
        constructor: function (writeAllowed, publicName) {
            if (writeAllowed) {
                this._writeAllowed = true;
            }
            if ("string" === typeof publicName) {
                this._publicName = publicName;
            }
        },
        alterPrototype: function (objPrototype) {
            var member = this._member, publicName = this._publicName;
            if (!publicName) {
                publicName = member.substr(1);    // Considering it starts with _
            }
            if (this._writeAllowed) {
                objPrototype[publicName] = _rwProperty(member);
            } else {
                objPrototype[publicName] = _roProperty(member);
            }
        }
    });
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
        _ofClass: 0,
        _publicName: "",
        constructor: function (ofClass, publicName) {
            this._ofClass = ofClass;
            if ("string" === typeof publicName) {
                this._publicName = publicName;
            }
        }
    });
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
                }    // TODO: check function arity
            }
            /*jslint forin:true*/
            return true;
        },
        ignoreParameter: function (value) {
            // TODO remove at build time
            return value;
        },
        query: function (objectInstance, interfaceDefinition) {
            if (gpf.interfaces.isImplementedBy(objectInstance, interfaceDefinition)) {
                return objectInstance;
            } else if (gpf.interfaces.isImplementedBy(objectInstance, gpf.interfaces.IUnknown)) {
                return objectInstance.queryInterface(interfaceDefinition);
            } else {
                return null;
            }
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
        "[_interfaceDefinition]": [gpf.$ClassProperty(false, "which")],
        _interfaceDefinition: 0,
        "[_builder]": [gpf.$ClassProperty(false, "how")],
        _builder: null,
        constructor: function (interfaceDefinition, queryInterfaceBuilder) {
            this._interfaceDefinition = interfaceDefinition;
            if (queryInterfaceBuilder) {
                this._builder = queryInterfaceBuilder;
            }
        },
        alterPrototype: function (objPrototype) {
            if (!this._builder) {
                // Nothing to do
                return;
            }
            if (undefined !== objPrototype.queryInterface) {
                /*
                 * Two situations here:
                 * - Either the class (or one of its parent) already owns
                 *   the $InterfaceImplement attribute
                 * - Or the class (or one of its parent) implements its
                 *   own queryInterface
                 * In that last case, wrap it to use the attribute version first
                 *
                 * In both case, we take the assumption that the class already
                 * owns gpf.$InterfaceImplement(gpf.interfaces.IUnknown)
                 */
                if (_queryInterface !== objPrototype.queryInterface) {
                    objPrototype.queryInterface = _wrapQueryInterface(objPrototype.queryInterface);
                }
            } else {
                objPrototype.queryInterface = _queryInterface;
                gpf.attributes.add(objPrototype.constructor, "Class", [gpf.$InterfaceImplement(gpf.interfaces.IUnknown)]);
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
        gpf.ASSERT(members.length === 1);
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
        alterPrototype: function (objPrototype) {
            if (!(objPrototype[this._member] instanceof Array)) {
                throw { message: "$Enumerable can be associated to arrays only" };
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
        alterPrototype: function (objPrototype) {
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
    var gpfI = gpf.interfaces;
    /**
     * Text stream
     *
     * @class gpf.interfaces.ITextStream
     * @extends gpf.interfaces.Interface
     */
    gpf._defIntrf("ITextStream", {
        read: function (count) {
            gpf.interfaces.ignoreParameter(count);
            return "";
        },
        write: function () {
        }
    });
    /**
     * Internal helper to implement the expected write behavior in all streams
     * @inheritDoc gpf.interfaces.ITextStream:write
     */
    gpfI.ITextStream._write = function () {
        var argIdx, arg;
        for (argIdx = 0; argIdx < arguments.length; ++argIdx) {
            arg = arguments[argIdx];
            if (null !== arg && "string" !== typeof arg) {
                arg = arg.toString();
            }
            this.write_(arg);
        }
        if (0 === argIdx) {
            // No parameter at all
            this.write_(null);
        }
    };
    var _escapes = {
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
         * Implements ITextStream on top of a stream
         *
         * @class StringStream
         * @implements gpf.interfaces.ITextStream
         * @private
         */
        StringStream = gpf.define("StringStream", {
            "[Class]": [gpf.$InterfaceImplement(gpf.interfaces.ITextStream)],
            _buffer: [],
            _pos: 0,
            constructor: function (string) {
                if (undefined !== string && string.length) {
                    this._buffer = [string];
                } else {
                    this._buffer = [];
                }
                this._pos = 0;
            },
            read: function (count) {
                // FIFO
                var firstBuffer, length, result;
                if (0 === this._buffer.length) {
                    return null;
                } else {
                    firstBuffer = this._buffer[0];
                    length = firstBuffer.length;
                    if (count > length - this._pos) {
                        count = length - this._pos;
                    }
                    result = firstBuffer.substr(this._pos, count);
                    this._pos += count;
                    if (this._pos === length) {
                        this._buffer.shift();
                        this._pos = 0;
                    }
                    return result;
                }
            },
            write: gpf.interfaces.ITextStream._write,
            write_: function (buffer) {
                if (null === buffer) {
                    this._buffer = [];
                    this._pos = 0;
                } else {
                    this._buffer.push(buffer);
                }
            },
            consolidateString: function () {
                if (this._pos !== 0) {
                    this._buffer.unshift(this._buffer.shift().substr(this._pos));
                }
                return this._buffer.join("");
            }
        });
    gpf.extend(gpf, {
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
        "[stringToStream]": [gpf.$ClassExtension(String, "toStream")],
        stringToStream: function (that) {
            return new StringStream(that);
        },
        "[stringFromStream]": [gpf.$ClassExtension(String, "fromStream")],
        stringFromStream: function (stream) {
            if (stream instanceof StringStream) {
                return stream.consolidateString();
            } else {
                // READ and join...
                gpf.NOT_IMPLEMENTED();
                return null;
            }
        }
    });
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
    var gpfI = gpf.interfaces,
        //region ITokenizer
        /**
         * Tokenizer interface
         *
         * @class gpf.interfaces.ITokenizer
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
        /*
     * Pattern 'grammar'
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
         * @private
         */
        PatternItem = gpf.define("PatternItem", {
            "[_type]": [gpf.$ClassProperty()],
            _type: -1,
            "[_parent]": [gpf.$ClassProperty(true)],
            _parent: null,
            next: function (value) {
                if (undefined === value) {
                    return this._next;
                } else {
                    this._next = value;
                    // Forward parent
                    value.parent(this._parent);
                }
            },
            _next: null,
            "[_min]": [gpf.$ClassProperty(true)],
            _min: 1,
            "[_max]": [gpf.$ClassProperty(true)],
            _max: 1,
            constructor: function (type) {
                this._type = type;
            },
            add: function (char, inRange) {
                gpf.interfaces.ignoreParameter(char);
                gpf.interfaces.ignoreParameter(inRange);
            },
            finalize: function () {
            },
            reset: function (state) {
                gpf.interfaces.ignoreParameter(state);
            },
            write: function (state, char) {
                gpf.interfaces.ignoreParameter(state);
                gpf.interfaces.ignoreParameter(char);
                return -1;
            }
        }),
        /**
         * Simple pattern item: recognizes a sequence of characters
         *
         * @class PatternSimpleItem
         * @extend PatternItem
         * @private
         */
        PatternSimpleItem = gpf.define("PatternSimpleItem", PatternItem, {
            "[_seq]": [gpf.$ClassProperty(false, "sequence")],
            _seq: "",
            constructor: function () {
                this._baseConstructor(PatternItem.TYPE_SIMPLE);
                this._seq = [];
            },
            add: function (char, inRange) {
                gpf.interfaces.ignoreParameter(inRange);
                this._seq.push(char);
            },
            finalize: function () {
                this._seq = this._seq.join("");
            },
            reset: function (state) {
                state.pos = 0;
            },
            write: function (state, char) {
                if (char !== this._seq.charAt(state.pos)) {
                    return PatternItem.WRITE_NO_MATCH;
                }
                ++state.pos;
                if (state.pos < this._seq.length) {
                    return PatternItem.WRITE_NEED_DATA;
                } else {
                    return PatternItem.WRITE_MATCH;
                }
            }
        }),
        /**
         * Range pattern item: recognizes one char
         * (using include/exclude patterns)
         *
         * @class PatternRangeItem
         * @extend PatternItem
         * @private
         */
        PatternRangeItem = gpf.define("PatternRangeItem", PatternItem, {
            _inc: "",
            _exc: "",
            constructor: function () {
                this._baseConstructor(PatternItem.TYPE_RANGE);
                this._inc = [];
            },
            hasExclude: function () {
                return this.hasOwnProperty("_exc");
            },
            enterExclude: function () {
                this._exc = [];
            },
            add: function (char, inRange) {
                var arrayOfChars, first, last;
                if (this.hasExclude()) {
                    arrayOfChars = this._exc;
                } else {
                    arrayOfChars = this._inc;
                }
                if (inRange) {
                    first = arrayOfChars[arrayOfChars.length - 1].charCodeAt(0);
                    last = char.charCodeAt(0);
                    while (--last > first) {
                        arrayOfChars.push(String.fromCharCode(last));
                    }
                    arrayOfChars.push(char);
                } else {
                    // First char of a range
                    arrayOfChars.push(char);
                }
            },
            finalize: function () {
                this._inc = this._inc.join("");
                if (this.hasExclude()) {
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
                    return PatternItem.WRITE_MATCH;
                } else {
                    return PatternItem.WRITE_NO_MATCH;
                }
            }
        }),
        /**
         * Pattern choice item: includes several items, matching only one amoung
         * them
         *
         * @class PatternChoiceItem
         * @extend PatternItem
         * @private
         */
        PatternChoiceItem = gpf.define("PatternChoiceItem", PatternItem, {
            _choices: [],
            next: function (item) {
                if (undefined === item) {
                    /*
                     * The only way to have something *after* is to use ()
                     * In that case, it would go through the parent
                     */
                    return null;
                } else {
                    var parent = item.parent(), pos;
                    this._choices.push(item);
                    item.parent(this);
                    if (1 === this._choices.length) {
                        // Care about parent
                        if (null === parent) {
                            return;    // Nothing to care about
                        }
                        if (parent.type() !== PatternItem.TYPE_GROUP) {
                            throw { message: "Unexpected" };
                        }
                        // TODO should be the last
                        pos = gpf.test(parent._items, item);
                        if (undefined === pos) {
                            throw { message: "Unexpected" };
                        }
                        parent._items[pos] = this;
                        this._parent = parent;
                    }
                }
            },
            constructor: function () {
                this._baseConstructor(PatternItem.TYPE_CHOICE);
                this._choices = [];
            },
            write: function (state, char) {
                // Try all choices and stop on the first one that works
                var tmpState = {}, idx, item, result;
                for (idx = this._choices.length; idx > 0;) {
                    item = this._choices[--idx];
                    item.reset(tmpState);
                    result = item.write(tmpState, char);
                    if (PatternItem.WRITE_NO_MATCH !== result) {
                        state.replaceItem = item;
                        gpf.extend(state, tmpState);
                        return result;
                    }
                }
                return PatternItem.WRITE_NO_MATCH;
            }
        }),
        /**
         * Pattern group item: group several items
         *
         * @class PatternGroupItem
         * @extend PatternItem
         * @private
         */
        PatternGroupItem = gpf.define("PatternGroupItem", PatternItem, {
            _items: [],
            next: function (value) {
                if (undefined === value) {
                    return this._next;
                } else {
                    if (this._items.length) {
                        this._next = value;
                        value.parent(this._parent);
                    } else {
                        this._items.push(value);
                        value.parent(this);
                    }
                }
            },
            constructor: function () {
                this._baseConstructor(PatternItem.TYPE_GROUP);
                this._items = [];
            },
            reset: function (state) {
                this._items[0].reset(state);
            },
            write: function (state, char) {
                var item = this._items[0];
                state.replaceItem = item;
                return item.write(state, char);
            }
        }),
        /**
         * Pattern parser context.
         * Class used to parse a pattern, will allocated and consolidate
         * PatternItems
         *
         * @class PatternParserContext
         * @private
         */
        PatternParserContext = gpf.define("PatternParserContext", {
            _root: null,
            _item: null,
            _inRange: false,
            _afterChar: null,
            parse: null,
            constructor: function () {
                this.parse = this._stateItem;
            },
            root: function () {
                if (null === this._item) {
                    throw { message: "Empty pattern" };
                }
                this._item.finalize();
                if (this.parse !== this._stateItem && this.parse !== this._stateCount) {
                    throw { message: "Invalid syntax" };
                }
                return this._root;
            },
            _getItem: function (type, force) {
                var item = this._item, nextItem;
                if (force || null === item || type !== item.type()) {
                    nextItem = PatternItem.create(type);
                    if (null !== item) {
                        item.finalize();
                        item.next(nextItem);
                    } else {
                        this._root = nextItem;
                    }
                    this._item = nextItem;
                    item = nextItem;
                }
                return item;
            },
            _stateItem: function (char) {
                if ("[" === char) {
                    this._getItem(PatternItem.TYPE_RANGE, true);
                    this.parse = this._stateCharMatchRange;
                } else if ("(" === char) {
                    this._getItem(PatternItem.TYPE_GROUP, true);
                } else {
                    this._getItem(PatternItem.TYPE_SIMPLE);
                    this._afterChar = this._stateCount;
                    this._stateChar(char);
                }
            },
            _stateCharMatchRange: function (char) {
                var curItem = this._getItem(PatternItem.TYPE_RANGE);
                if ("^" === char && !curItem.hasExclude()) {
                    curItem.enterExclude();    // this.parse = this._stateCharMatchRange;
                } else if ("]" === char) {
                    this.parse = this._stateCount;
                } else {
                    this._inRange = false;
                    this._afterChar = this._stateCharRangeSep;
                    this._stateChar(char);
                }
            },
            _stateCharRangeSep: function (char) {
                if ("-" === char) {
                    this._inRange = true;
                    this._afterChar = this._stateCharMatchRange;
                    this.parse = this._stateChar;
                } else {
                    this._stateCharMatchRange(char);
                }
            },
            _stateChar: function (char) {
                if ("\\" === char) {
                    this.parse = this._stateEscapedChar;
                } else {
                    this._item.add(char, this._inRange);
                    this.parse = this._afterChar;
                }
            },
            _stateEscapedChar: function (char) {
                this._item.add(char, this._inRange);
                this.parse = this._afterChar;
            },
            _stateCountByChar: {
                "?": function () {
                    var item = this._splitSimpleOnMinMax();
                    item.min(0);
                },
                "+": function () {
                    var item = this._splitSimpleOnMinMax();
                    item.max(0);
                },
                "*": function () {
                    var item = this._splitSimpleOnMinMax();
                    item.min(0);
                    item.max(0);
                },
                "|": function () {
                    var item = this._item, choice = item.parent();
                    if (null === choice || choice.type() !== PatternItem.TYPE_CHOICE) {
                        choice = PatternItem.create(PatternItem.TYPE_CHOICE);
                        choice.next(item);    // Overridden to 'add' the choice
                    }
                    if (item === this._root) {
                        this._root = choice;
                    }
                    item.finalize();
                    this._item = choice;
                },
                ")": function () {
                    var item = this._item;
                    item.finalize();
                    while (item.type() !== PatternItem.TYPE_GROUP) {
                        item = item.parent();
                    }
                    if (item === this._item) {
                        throw { message: "Syntax error (empty group)" };
                    }
                    this._item = item;
                    return 0;    // !undefined
                }
            },
            _splitSimpleOnMinMax: function () {
                var item = this._item, lastChar;
                if (item.type() === PatternItem.TYPE_SIMPLE && item.sequence().length > 1) {
                    lastChar = item.sequence().pop();
                    item = this._getItem(PatternItem.TYPE_SIMPLE, true);
                    item.add(lastChar);
                }
                return item;
            },
            _stateCount: function (char) {
                var byChar = this._stateCountByChar[char];
                if (undefined === byChar) {
                    this._stateItem(char);
                } else {
                    if (undefined === byChar.apply(this, arguments)) {
                        this.parse = this._stateItem;
                    }
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
            _pattern: null,
            _item: null,
            _state: {
                result: 0,
                length: 0,
                matchingLength: 0,
                count: 0
            },
            constructor: function (pattern) {
                this._pattern = pattern;
                this._item = pattern._root;
                this._state = {
                    result: 0,
                    length: 0,
                    matchingLength: 0,
                    count: 0
                };
                this._item.reset(this._state);
            },
            _getNext: function (item) {
                var result = item.next();
                while (null === result) {
                    item = item.parent();
                    if (null === item) {
                        break;
                    }
                    result = item.next();
                }
                return result;
            },
            _writeNoMatch: function (char) {
                var state = this._state, item = this._item;
                if (state.count < item.min() || state.length > state.matchingLength + 1) {
                    // Terminal error
                    state.result = -1;
                    this._item = null;
                    // No need to go any further
                    return -1;
                }
                item = this._getNext(item);
                if (null === item) {
                    if (0 === state.matchingLength) {
                        state.result = -1;
                    } else {
                        state.result = state.matchingLength;
                    }
                    this._item = null;
                    return state.result;
                }
                item.reset(state);
                this._item = item;
                state.count = 0;
                --state.length;
                return this.write(char);    // Try with this one
            },
            _writeMatch: function () {
                var state = this._state, item = this._item, nextItem = this._getNext(item);
                state.matchingLength = state.length;
                ++state.count;
                if (0 === item.max()) {
                    // Unlimited
                    item.reset(state);
                    if (null !== nextItem) {
                        state.result = PatternItem.WRITE_NEED_DATA;
                    } else {
                        // Last item with unlimited occurrences
                        state.result = state.length;
                    }
                } else if (state.count === item.max()) {
                    item = nextItem;
                    this._item = item;
                    if (null === item) {
                        state.result = state.length;
                    } else {
                        item.reset(state);
                        state.count = 0;
                        state.result = 0;
                        if (0 === item.min()) {
                            // TODO this search should be done only once
                            nextItem = this._getNext(item);
                            while (nextItem && 0 === nextItem.min()) {
                                nextItem = this._getNext(nextItem);
                            }
                            if (!nextItem) {
                                // The rest being optional...
                                state.result = state.matchingLength;
                            }
                        }
                    }
                } else {
                    state.result = PatternItem.WRITE_NEED_DATA;
                }
                return state.result;
            },
            write: function (char) {
                var result, state = this._state, item = this._item;
                if (null !== item) {
                    result = item.write(state, char);
                    ++state.length;
                    if (undefined !== state.replaceItem) {
                        this._item = state.replaceItem;
                    }
                    // Not enough data to conclude
                    if (PatternItem.WRITE_NEED_DATA === result) {
                        return state.result;    // Whatever the previous result
                    }
                    if (PatternItem.WRITE_NO_MATCH === result) {
                        return this._writeNoMatch(char);
                    } else {
                        return this._writeMatch();
                    }
                }
                return state.result;
            }    //endregion
        });
    gpf.extend(PatternItem, {
        TYPE_SIMPLE: 0,
        TYPE_RANGE: 1,
        TYPE_CHOICE: 2,
        TYPE_GROUP: 3,
        WRITE_NO_MATCH: -1,
        WRITE_NEED_DATA: 0,
        WRITE_MATCH: 1,
        _factory: null,
        create: function (type) {
            var factory = PatternItem._factory;
            if (!factory) {
                factory = PatternItem._factory = {};
                factory[this.TYPE_SIMPLE] = PatternSimpleItem;
                factory[this.TYPE_RANGE] = PatternRangeItem;
                factory[this.TYPE_CHOICE] = PatternChoiceItem;
                factory[this.TYPE_GROUP] = PatternGroupItem;
            }
            return new factory[type]();
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
        _root: null,
        constructor: function (pattern) {
            var context = new PatternParserContext(), idx, len = pattern.length;
            for (idx = 0; idx < len; ++idx) {
                context.parse(pattern.charAt(idx));
            }
            this._root = context.root();
        },
        allocate: function () {
            return new PatternTokenizer(this);
        }
    });
    //endregion
    //region Parser
    /**
     * This parser base class maintain the current stream position
     * And also offers some basic features to improve parsing speed
     *
     * @class gpf.Parser
     */
    gpf.define("gpf.Parser", {
        "[Class]": [gpf.$InterfaceImplement(gpfI.ITextStream)],
        _pos: 0,
        _line: 0,
        _column: 0,
        _state: 0,
        constructor: function () {
            this._init();
        },
        _init: function () {
            this._pos = 0;
            this._line = 0;
            this._column = 0;
            this._state = 0;
        },
        currentPos: function () {
            return {
                pos: this._pos,
                line: this._line,
                column: this._column
            };
        },
        _parse: function (char) {
            gpf.interfaces.ignoreParameter(char);
        },
        _reset: function () {
        },
        read: function (count) {
            gpf.interfaces.ignoreParameter(count);
            return "";
        },
        write: gpfI.ITextStream._write,
        write_: function (buffer) {
            var idx, char;
            if (null === buffer) {
                this._reset();
                this._init();
            } else {
                for (idx = 0; idx < buffer.length; ++idx) {
                    char = buffer.charAt(idx);
                    this._parse(char);
                    ++this._pos;
                    if ("\n" === char) {
                        ++this._line;
                        this._column = 0;
                    } else {
                        ++this._column;
                    }
                }
            }
        }    //endregion
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
    var
        // Namespaces shortcut
        gpfI = gpf.interfaces, gpfA = gpf.attributes,
        /*
        // XML Parser constants
        _XMLPARSER_STATE_NONE = 0,
*/
        // This error will be handled in a common way later
        _expectedXmlContentHandler = function () {
            throw { message: "Invalid parameter, " + "expected gpf.interfaces.IXmlContentHandler" };
        };
    ;
    gpf.xml = {};
    /**
     * Defines the possibility for the object to be saved as XML
     *
     * @class gpf.interfaces.IXmlSerializable
     * @extends gpf.interfaces.Interface
     */
    gpf._defIntrf("IXmlSerializable", {
        toXml: function (out) {
            gpfI.ignoreParameter(out);
        }
    });
    /**
     * Defines the possibility for an object to load XML
     *
     * @class gpf.interfaces.IXmlContentHandler
     * @extends gpf.interfaces.Interface
     *
     * Inspired from
     * http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
     */
    gpf._defIntrf("IXmlContentHandler", {
        characters: function (buffer) {
            gpfI.ignoreParameter(buffer);
        },
        endDocument: function () {
        },
        endElement: function () {
        },
        endPrefixMapping: function (prefix) {
            gpfI.ignoreParameter(prefix);
        },
        ignorableWhitespace: function (buffer) {
            gpfI.ignoreParameter(buffer);
        },
        processingInstruction: function (target, data) {
            gpfI.ignoreParameter(target);
            gpfI.ignoreParameter(data);
        },
        setDocumentLocator: function (locator) {
            gpfI.ignoreParameter(locator);
        },
        skippedEntity: function (name) {
            gpfI.ignoreParameter(name);
        },
        startDocument: function () {
        },
        startElement: function (uri, localName, qName, attributes) {
            gpfI.ignoreParameter(uri);
            gpfI.ignoreParameter(localName);
            gpfI.ignoreParameter(qName);
            gpfI.ignoreParameter(attributes);
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
            alterPrototype: function (objPrototype) {
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
            "[_name]": [gpf.$ClassProperty()],
            _name: "",
            constructor: function (name) {
                gpf.ASSERT(gpf.xml.isValidName(name), "Valid XML attribute name");
                this._name = name;
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
            "[_name]": [gpf.$ClassProperty()],
            _name: "",
            constructor: function (name) {
                gpf.ASSERT(gpf.xml.isValidName(name), "Valid XML element name");
                this._name = name;
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
            "[_objClass]": [gpf.$ClassProperty()],
            _objClass: null,
            constructor: function (name, objClass) {
                this._baseConstructor(name);
                if (objClass) {
                    this._objClass = objClass;
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
         * @param {gpf.interfaces.IXmlContentHandler} contentHandler
         * @param {gpf.attributes.Map} attMap Map filled with XML attributes
         * @private
         */
        _objMemberToSubNodes = function (obj, member, contentHandler, attMap) {
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
                    contentHandler.startElement("", attribute.name());
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
                    _toContentHandler(subValue, contentHandler, name);
                }
                if (closeNode) {
                    contentHandler.endElement();
                }
                return;
            }
            attribute = attArray.has(_Element);
            // Element
            if (attribute && attribute.name()) {
                name = attribute.name();
            }
            _toContentHandler(value, contentHandler, name);
        },
        /**
         * Convert the object into XML using the provided XML content handler
         *
         * @param {Object} obj
         * @param {gpf.interfaces.IXmlContentHandler} contentHandler
         * @param {String} [name="object"] name Name of the root node
         * @param {gpf.attributes.Map} attMap Map filled with XML attributes
         * @private
         */
        _objPrototypeToContentHandler = function (obj, contentHandler, name, attMap) {
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
            contentHandler.startElement("", name, name, xmlAttributes);
            if (subNodeMembers) {
                for (idx = 0; idx < subNodeMembers.length; ++idx) {
                    _objMemberToSubNodes(obj, subNodeMembers[idx], contentHandler, attMap);
                }
            }
        },
        /**
         * Convert the parameter into XML using the provided XML content handler
         *
         * @param {*} obj
         * @param {gpf.interfaces.IXmlContentHandler} contentHandler
         * @param {String} [name="object"] name Name of the root node
         * @private
         */
        _toContentHandler = function (obj, contentHandler, name) {
            var attMap = new gpfA.Map(obj).filter(_Base), attribute;
            // If no 'name', check the Class attribute
            if (!name) {
                attribute = attMap.member("Class").has(_Element);
                if (attribute) {
                    name = attribute.name();
                } else {
                    name = gpf.classInfo(obj.constructor).name();
                    if (!name) {
                        name = "object";
                    }
                }
            }
            // If not an object, serialize the textual representation
            if ("object" !== typeof obj) {
                contentHandler.startElement("", name);
                contentHandler.characters(gpf.value(obj, ""));
            } else {
                _objPrototypeToContentHandler(obj, contentHandler, name, attMap);
            }
            contentHandler.endElement();
        },
        /**
         * Converts this into XML using the provided XML content handler
         *
         * @param {gpf.interfaces.IXmlContentHandler} out XML Content handler
         * @private
         */
        _toXml = function (out) {
            var iContentHandler = gpfI.query(out, gpfI.IXmlContentHandler);
            if (iContentHandler) {
                _toContentHandler(this, iContentHandler);
            } else {
                _expectedXmlContentHandler();
            }
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
                        gpf.ASSERT(attArray.length() === 1);
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
            characters: function (buffer) {
                var forward = this._forward[0];
                if (undefined !== forward) {
                    if (0 === forward.type) {
                        forward.iXCH.characters.apply(forward.iXCH, arguments);
                    } else if (1 === forward.type) {
                        forward.buffer.push(buffer);
                    }
                }    // Ignore
            },
            endDocument: function () {
            },
            endElement: function () {
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
            },
            endPrefixMapping: function (prefix) {
                // Nothing to do (?)
                gpfI.ignoreParameter(prefix);
            },
            ignorableWhitespace: function (buffer) {
                // Nothing to do
                gpfI.ignoreParameter(buffer);
            },
            processingInstruction: function (target, data) {
                // Not relevant
                gpfI.ignoreParameter(target);
                gpfI.ignoreParameter(data);
            },
            setDocumentLocator: function (locator) {
                // Nothing to do
                gpfI.ignoreParameter(locator);
            },
            skippedEntity: function (name) {
                // Nothing to do
                gpfI.ignoreParameter(name);
            },
            startDocument: function () {
            },
            startElement: function (uri, localName, qName, attributes) {
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
        _stream: null,
        _branch: [],
        _pendingPrefixMappings: [],
        constructor: function (stream) {
            this._stream = stream;
            this._branch = [];
            this._pendingPrefixMappings = [];
        },
        _closeLeafForContent: function () {
            var leaf;
            if (this._branch.length) {
                leaf = this._branch[this._branch.length - 1];
                if (!leaf.hasContent) {
                    this._stream.write(">");
                    leaf.hasContent = true;
                }
            }
        },
        characters: function (buffer) {
            this._closeLeafForContent();
            this._stream.write(buffer);
        },
        endDocument: function () {
        },
        endElement: function () {
            var leaf = this._branch.pop(), stream = this._stream;
            if (leaf.hasContent) {
                stream.write("</");
                stream.write(leaf.qName);
                stream.write(">");
            } else {
                stream.write("/>");
            }
        },
        endPrefixMapping: function (prefix) {
            // Nothing to do (?)
            gpf.interfaces.ignoreParameter(prefix);
        },
        ignorableWhitespace: function (buffer) {
            this._closeLeafForContent();
            this._stream.write(buffer);
        },
        processingInstruction: function (target, data) {
            var stream = this._stream;
            stream.write("<?");
            stream.write(target);
            stream.write(" ");
            stream.write(gpf.escapeFor(data, "xml"));
            stream.write("?>");
        },
        setDocumentLocator: function (locator) {
            // Nothing to do
            gpf.interfaces.ignoreParameter(locator);
        },
        skippedEntity: function (name) {
            // Nothing to do
            gpf.interfaces.ignoreParameter(name);
        },
        startDocument: function () {
        },
        startElement: function (uri, localName, qName, attributes) {
            var attName, attValue, idx, stream = this._stream;
            if (undefined === qName && !uri) {
                qName = localName;
            }
            this._closeLeafForContent();
            var leaf = {
                    hasContent: false,
                    qName: qName
                };
            this._branch.push(leaf);
            stream.write("<");
            stream.write(qName);
            if (attributes) {
                for (attName in attributes) {
                    if (attributes.hasOwnProperty(attName)) {
                        stream.write(" ");
                        stream.write(attName);
                        stream.write("=\"");
                        attValue = gpf.escapeFor(attributes[attName].toString(), "xml");
                        if (-1 < attValue.indexOf("\"")) {
                            attValue = gpf.replaceEx(attValue, { "\"": "&quot;" });
                        }
                        stream.write(attValue);
                        stream.write("\"");
                    }
                }
            }
            if (this._pendingPrefixMappings.length) {
                for (idx = 0; idx < this._pendingPrefixMappings.length; ++idx) {
                    stream.write(" ");
                    stream.write(this._pendingPrefixMappings);
                }
                this._pendingPrefixMappings = [];
            }
        },
        startPrefixMapping: function (prefix, uri) {
            var mapping = [
                    "xmlns:",
                    prefix,
                    ":\"",
                    gpf.escapeFor(uri, "xml"),
                    "\""
                ].join(""), leaf = this._branch[this._branch.length], stream = this._stream;
            if (leaf.hasContent) {
                this._pendingPrefixMappings.push(mapping);
            } else {
                stream.write(" ");
                stream.write(mapping);
            }
        }    //endregion
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
     */
    gpf.xml.convert = function (value, out) {
        var iContentHandler, iXmlSerializable;
        iContentHandler = gpfI.query(out, gpfI.IXmlContentHandler);
        if (!iContentHandler) {
            _expectedXmlContentHandler();
        }
        if ("string" === typeof value) {
            gpf.NOT_IMPLEMENTED();
        } else if ("object" === typeof value) {
            iXmlSerializable = gpfI.query(value, gpfI.IXmlSerializable);
            if (null !== iXmlSerializable) {
                iXmlSerializable.toXml(iContentHandler);
            } else {
                new gpf.xml.ConstNode(value).toXml(iContentHandler);
            }
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
                throw { message: "Invalid name" };
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
        toXml: function (out) {
            gpf.xml.nodeToXml(this, out);
        }    //endregion
    });
    /**
     * Serialize the node into an gpf.interfaces.IXmlContentHandler
     *
     * @param {gpf.interfaces.IXmlConstNode} node Node to serialize
     * @param {gpf.interfaces.IXmlContentHandler} out XML Content handler
     */
    gpf.xml.nodeToXml = function (node, out) {
        var name = node.localName(), attributes = node.attributes(), children = node.children(), text = node.textContent(), idx;
        out.startElement("", name, name, attributes);
        // Today the XmlConstNode may not have both children and textual content
        if (text) {
            out.characters(text);
        } else {
            for (idx = 0; idx < children.length; ++idx) {
                gpf.xml.nodeToXml(children[idx], out);
            }
        }
        out.endElement();
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
}));
/*global define, exports*/
/*jshint -W098*/
// ignore unused gpf
/*eslint no-unused-vars: 0*/
// ignore unused gpf
/*eslint strict: [2, "function"]*/
// To be more modular
/*global __gpf__*/
/*jshint node: true*/
/*eslint-env node*/
(function (root, factory) {
    "use strict";
    /**
     * Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
     * Rhino, and plain browser loading.
     *
     * 2014-12-04 ABZ Extended for PhantomJS
     * 2015-05-29 ABZ Modified to catch former value of gpf
     */
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else if (typeof module !== "undefined" && module.exports) {
        factory(module.exports);
    } else {
        var newGpf = {};
        factory(newGpf);
        root.gpf = newGpf;
    }
}(this, function (gpf) {
    "use strict";
    function _gpfEmptyFunc() {
    }
    var
        // GPF version
        _gpfVersion = "0.1.5-alpha",
        // Host type constants
        _GPF_HOST_BROWSER = "browser",
        /*jshint browser: true*/
        /*eslint-env browser*/
        _GPF_HOST_NODEJS = "nodejs",
        /*jshint node: true*/
        /*eslint-env node*/
        _GPF_HOST_PHANTOMJS = "phantomjs",
        /*jshint phantom: true*/
        /*eslint-env phantomjs*/
        _GPF_HOST_RHINO = "rhino",
        /*jshint rhino: true*/
        /*eslint-env rhino*/
        _GPF_HOST_UNKNOWN = "unknown", _GPF_HOST_WSCRIPT = "wscript",
        /*jshint wsh: true*/
        /*eslint-env wsh*/
        // Host type, see _GPF_HOST_xxx
        _gpfHost = _GPF_HOST_UNKNOWN,
        // Indicates that paths are DOS-like (i.e. case insensitive with /)
        _gpfDosPath = false,
        /*jshint -W040*/
        // This is the common way to get the global context
        // Main context object
        _gpfMainContext = this,
        //eslint-disable-line consistent-this
        /*jshint +W040*/
        /**
         * To implement gpf.noConflict(), we need to keep the previous content of gpf.
         * Makes sense only for the following hosts:
         * - phantomjs
         * - browser
         * - unknown
         *
         * @type {undefined|Object}
         */
        _gpfConflictingSymbol,
        /**
         * Helper to ignore unused parameter
         *
         * @param {*} param
         */
        /*gpf:nop*/
        _gpfIgnore = _gpfEmptyFunc,
        /**
         * Exit function
         *
         * @param {Number} code
         */
        _gpfExit = _gpfEmptyFunc,
        // The current host is a nodeJS like
        _gpfInNode = false,
        // The current host is a browser like
        _gpfInBrowser = false,
        /**
         * Browser window object
         *
         * @type {Object}
         */
        _gpfWebWindow,
        /**
         * Browser document object
         *
         * @type {Object}
         */
        _gpfWebDocument,
        /**
         * Browser head tag
         *
         * @type {Object}
         */
        _gpfWebHead,
        /**
         * Scripting.FileSystemObject activeX
         *
         * @type {Object}
         */
        _gpfMsFSO,
        /**
         * Node require("fs")
         *
         * @type {Object}
         */
        _gpfNodeFs,
        /**
         * Node require("path")
         *
         * @type {Object}
         */
        _gpfNodePath;
    /**
     * Translate the parameter into a valid scope
     *
     * @param {*} scope
     */
    function _gpfResolveScope(scope) {
        if (null === scope || "object" !== typeof scope) {
            return _gpfMainContext;
        }
        return scope;
    }
    _gpfVersion += "-debug";
    function _getObjectProperty(parent, name) {
        /* istanbul ignore else */
        if (undefined !== parent) {
            return parent[name];
        }
    }
    function _getOrCreateObjectProperty(parent, name) {
        var result = parent[name];
        if (undefined === result) {
            result = parent[name] = {};
        }
        return result;
    }
    /**
     * Resolve the provided contextual path and returns the result
     *
     * @param {String[]} path array of identifiers
     * @param {Boolean} [createMissingParts=false] createMissingParts if the path leads to undefined parts and
     * createMissingParts is true, it allocates a default empty object
     *
     * @return {*|undefined}
     * - when path is undefined, it returns the current host higher object
     * - when path is "gpf" it returns the GPF object
     */
    function _gpfContext(path, createMissingParts) {
        var reducer, rootContext;
        if (createMissingParts) {
            reducer = _getOrCreateObjectProperty;
        } else {
            reducer = _getObjectProperty;
        }
        if (path[0] === "gpf") {
            rootContext = gpf;
            path = path.slice(1);
        } else {
            rootContext = _gpfMainContext;
        }
        return path.reduce(reducer, rootContext);
    }
    /**
     * Create a method that contains a bootstrap (called only once)
     *
     * @param {String} path method path
     * @param {Function} methodFactory Must return a function (it receives the path as parameter)
     * @return {function}
     * @closure
     */
    function _gpfGetBootstrapMethod(path, methodFactory) {
        path = path.split(".");
        var name = path.pop(), namespace = _gpfContext(path, true), mustBootstrap = true, method;
        // The initial method is protected as the caller may keep its reference
        namespace[name] = function () {
            /* istanbul ignore else */
            // Because that's the idea (shouldn't be called twice)
            if (mustBootstrap) {
                method = methodFactory(path);
                namespace[name] = method;
                mustBootstrap = false;
            }
            return method.apply(this, arguments);
        };
    }
    /* Host detection */
    /* istanbul ignore next */
    // Microsoft cscript / wscript
    if ("undefined" !== typeof WScript) {
        /*eslint-disable new-cap*/
        _gpfHost = _GPF_HOST_WSCRIPT;
        _gpfDosPath = true;
        _gpfMainContext = function () {
            return this;
        }.apply(null, []);
        _gpfExit = function (code) {
            WScript.Quit(code);
        };
        // Define console APIs
        _gpfMainContext.console = {
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
        };    /*eslint-enable new-cap*/
    } else if ("undefined" !== typeof print && "undefined" !== typeof java) {
        _gpfHost = _GPF_HOST_RHINO;
        _gpfDosPath = false;
        _gpfMainContext = function () {
            return this;
        }.apply(null, []);
        _gpfExit = function (code) {
            java.lang.System.exit(code);
        };
        // Define console APIs
        _gpfMainContext.console = {
            log: function (t) {
                print("    " + t);
            },
            info: function (t) {
                print("[?] " + t);
            },
            warn: function (t) {
                print("/!\\ " + t);
            },
            error: function (t) {
                print("(X) " + t);
            }
        };    // PhantomJS
    } else if ("undefined" !== typeof phantom && phantom.version) {
        _gpfHost = _GPF_HOST_PHANTOMJS;
        _gpfDosPath = require("fs").separator === "\\";
        _gpfMainContext = window;
        _gpfInNode = true;
        _gpfInBrowser = true;
        _gpfExit = phantom.exit;    // Nodejs
    } else if ("undefined" !== typeof module && module.exports) {
        _gpfHost = _GPF_HOST_NODEJS;
        _gpfNodePath = require("path");
        _gpfDosPath = _gpfNodePath.sep === "\\";
        _gpfMainContext = global;
        _gpfInNode = true;
        _gpfExit = process.exit;    // Browser
    } else if ("undefined" !== typeof window) {
        _gpfHost = _GPF_HOST_BROWSER;
        _gpfMainContext = window;
        _gpfInBrowser = true;
        _gpfExit = _gpfEmptyFunc;
        _gpfWebWindow = window;
        _gpfWebDocument = document;
        _gpfWebHead = _gpfWebDocument.getElementsByTagName("head")[0] || _gpfWebDocument.documentElement;
    }
    _gpfConflictingSymbol = _gpfMainContext.gpf;
    /* istanbul ignore next */
    // web only
    /**
     * Relinquish control of the gpf variable.
     *
     * @return {Object} current GPF instance
     */
    gpf.noConflict = function () {
        if (undefined === _gpfConflictingSymbol) {
            delete _gpfMainContext.gpf;
        } else {
            _gpfMainContext.gpf = _gpfConflictingSymbol;
        }
        return gpf;
    };
    // Install host specifics (if any)
    /* istanbul ignore else */
    // Because tested with NodeJS
    if (_gpfInNode) {
        gpf.node = {};
    }
    // Some web-related tools will be configured even if not in a browser, declare the namespace now
    gpf.web = {};
    // Returns the current version
    gpf.version = function () {
        return _gpfVersion;
    };
    /**
     * Returns a string identifying the detected host
     *
     * @return {String}
     * - gpf.HOST_WSCRIPT for cscript and wscript
     * - gpf.HOST_NODEJS for nodejs
     * - gpf.HOST_PHANTOMJS for phantomjs
     * - gpf.HOST_BROWSER for any browser
     * - gpf.HOST_UNKNOWN if not detected
     */
    gpf.host = function () {
        return _gpfHost;
    };
    /**
     * Resolve the provided contextual path and returns the result
     *
     * @param {String} path Dot separated list of identifiers
     *
     * @return {*|undefined}
     * - when path is undefined, it returns the current host higher object
     * - when path is "gpf" it returns the GPF object
     */
    gpf.context = function (path) {
        if (undefined === path) {
            return _gpfMainContext;
        }
        return _gpfContext(path.split("."));
    };
    gpf.loaded = function (callback) {
        if (callback) {
            callback();
        }
        return true;
    };
    var _gpfAssert, _gpfAsserts;
    // DEBUG specifics
    /* istanbul ignore next */
    // no ASSERT should pop during tests
    /**
     * Assertion helper
     *
     * @param {Boolean} condition May be a truthy value
     * @param {String} message Assertion message (to explain the violation if it fails)
     */
    _gpfAssert = function (condition, message) {
        if (undefined === message) {
            message = "_gpfAssert with no message";
            condition = false;
        }
        if (!condition) {
            console.warn("ASSERTION FAILED: " + message);
            throw gpf.Error.assertionFailed({ message: message });
        }
    };
    /**
     * Batch assertion helper
     *
     * @param {Object} messages Dictionary of messages (value being the condition)
     */
    _gpfAsserts = function (messages) {
        for (var message in messages) {
            /* istanbul ignore else */
            if (messages.hasOwnProperty(message)) {
                _gpfAssert(messages[message], message);
            }
        }
    };
    /* istanbul ignore if */
    // Because tested in DEBUG
    if (!_gpfAssert) {
    }
    var _gpfArrayPrototypeSlice = Array.prototype.slice;
    /**
     * Slice an array-like object
     *
     * @param {Object} array array-like parameter (arguments, Array)
     * @param {Number} from
     * @param {Number} [to=undefined] to
     * @return {Array}
     */
    function _gpfArraySlice(array, from, to) {
        return _gpfArrayPrototypeSlice.apply(array, [
            from || 0,
            to || array.length + 1
        ]);
    }
    var _gpfCompatibility = {
            Array: {
                on: Array.prototype,
                every: function (callback) {
                    var thisArg = arguments[1], len = this.length, idx;
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
                },
                filter: function (callback) {
                    var thisArg = arguments[1], result = [], len = this.length, idx, item;
                    for (idx = 0; idx < len; ++idx) {
                        item = this[idx];
                        if (callback.apply(thisArg, [
                                this[idx],
                                idx,
                                this
                            ])) {
                            result.push(item);
                        }
                    }
                    return result;
                },
                forEach: function (callback) {
                    var thisArg = arguments[1], len = this.length, idx;
                    for (idx = 0; idx < len; ++idx) {
                        callback.apply(thisArg, [
                            this[idx],
                            idx,
                            this
                        ]);
                    }
                },
                indexOf: function (searchElement) {
                    var fromIndex = arguments[1], index = fromIndex || 0, thisLength = this.length;
                    while (index < thisLength) {
                        if (this[index] === searchElement) {
                            return index;
                        }
                        ++index;
                    }
                    return -1;
                },
                map: function (callback) {
                    var thisArg = arguments[1], thisLength = this.length, result = new Array(thisLength), index;
                    for (index = 0; index < thisLength; ++index) {
                        result[index] = callback.apply(thisArg, [
                            this[index],
                            index,
                            this
                        ]);
                    }
                    return result;
                },
                reduce: function (callback) {
                    var initialValue = arguments[1], thisLength = this.length, index = 0, value;
                    if (undefined === initialValue) {
                        value = this[index++];
                    } else {
                        value = initialValue;
                    }
                    for (; index < thisLength; ++index) {
                        value = callback(value, this[index], index, this);
                    }
                    return value;
                }
            },
            Function: {
                on: Function.prototype,
                bind: function (thisArg) {
                    var me = this, prependArgs = _gpfArraySlice(arguments, 1);
                    return function () {
                        var args = _gpfArraySlice(arguments, 0);
                        me.apply(thisArg, prependArgs.concat(args));
                    };
                }
            },
            Object: {
                on: Object,
                create: function () {
                    function Temp() {
                    }
                    return function (O) {
                        Temp.prototype = O;
                        var obj = new Temp();
                        Temp.prototype = null;
                        if (!obj.__proto__) {
                            obj.__proto__ = O;
                        }
                        return obj;
                    };
                }(),
                getPrototypeOf: function (object) {
                    // May break if the constructor has been tampered with
                    return object.__proto__ || object.constructor.prototype;
                }
            },
            String: {
                on: String.prototype,
                trim: function () {
                    var rtrim = new RegExp("^[\\s\uFEFF\xA0]+|[\\s\uFEFF\xA0]+$", "g");
                    return function () {
                        return this.replace(rtrim, "");
                    };
                }()
            }
        };
    (function () {
        var type, compatibleMethods;
        function install(dictionary, methods) {
            for (var name in methods) {
                /* istanbul ignore else */
                if (methods.hasOwnProperty(name)) {
                    if (name === "on") {
                        continue;
                    }
                    /* istanbul ignore if */
                    // NodeJS environment already contains all methods
                    if (undefined === dictionary[name]) {
                        dictionary[name] = methods[name];
                    }
                }
            }
        }
        for (type in _gpfCompatibility) {
            /* istanbul ignore else */
            if (_gpfCompatibility.hasOwnProperty(type)) {
                compatibleMethods = _gpfCompatibility[type];
                install(compatibleMethods.on, compatibleMethods);
            }
        }
    }());
    // Get the name of a function if bound to the call
    var _gpfJsCommentsRegExp = new RegExp("//.*$|/\\*(?:[^\\*]*|\\*[^/]*)\\*/", "gm");
    function _gpfGetFunctionName() {
        // Use simple parsing
        /*jshint validthis:true*/
        var functionSource = Function.prototype.toString.apply(this),
            //eslint-disable-line no-invalid-this
            functionKeywordPos = functionSource.indexOf("function"), parameterListStartPos = functionSource.indexOf("(", functionKeywordPos);
        return functionSource.substr(functionKeywordPos + 9, parameterListStartPos - functionKeywordPos - 9).replace(_gpfJsCommentsRegExp, "").trim();
    }
    // Handling function name properly
    /* istanbul ignore if */
    // NodeJS exposes Function.prototype.name
    if (function () {
            /* istanbul ignore next */
            // Will never be evaluated
            function functionName() {
            }
            return functionName.name !== "functionName";
        }()) {
        Function.prototype.compatibleName = _gpfGetFunctionName;
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
    function safeResolve(fn, onFulfilled, onRejected) {
        var safe = true;
        function makeSafe(callback) {
            return function (value) {
                if (safe) {
                    safe = false;
                    callback(value);
                }
            };
        }
        try {
            fn(makeSafe(onFulfilled), makeSafe(onRejected));
        } catch (e) {
            if (safe) {
                safe = false;
                onRejected(e);
            }
        }
    }
    function finale() {
        /*jshint validthis:true*/
        var me = this;
        //eslint-disable-line no-invalid-this
        /*gpf:inline(array)*/
        me._handlers.forEach(function (handler) {
            handler.process(me);
        });
        me._handlers = [];    // Reset list
    }
    function _gpfPromiseReject(newValue) {
        /*jshint validthis:true*/
        var me = this;
        //eslint-disable-line no-invalid-this
        me._state = false;
        me._value = newValue;
        finale.call(me);
    }
    //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    function _gpfPromiseResolve(newValue) {
        /*jshint validthis:true*/
        var me = this;
        //eslint-disable-line no-invalid-this
        try {
            _gpfAssert(newValue !== me, "A promise cannot be resolved with itself.");
            if (newValue && (typeof newValue === "object" || typeof newValue === "function")) {
                var then = newValue.then;
                if ("function" === typeof then) {
                    safeResolve(then.bind(newValue), _gpfPromiseResolve.bind(me), _gpfPromiseReject.bind(me));
                    return;
                }
            }
            me._state = true;
            me._value = newValue;
            finale.call(me);
        } catch (e) {
            _gpfPromiseReject.apply(me, [e]);
        }
    }
    var _GpfPromise = gpf.Promise = function (fn) {
            safeResolve(fn, _gpfPromiseResolve.bind(this), _gpfPromiseReject.bind(this));
        };
    function _gpfPromiseHandler() {
    }
    _gpfPromiseHandler.prototype = {
        onFulfilled: null,
        onRejected: null,
        resolve: null,
        reject: null,
        process: function (promise) {
            /*jshint validthis:true*/
            var me = this;
            //eslint-disable-line no-invalid-this
            if (promise._state === null) {
                /* istanbul ignore else */
                // Not sure when it would happen
                if (!promise.hasOwnProperty("_handlers")) {
                    promise._handlers = [];
                }
                promise._handlers.push(me);
                return;
            }
            setTimeout(function () {
                var callback, result;
                if (promise._state) {
                    callback = me.onFulfilled;
                } else {
                    callback = me.onRejected;
                }
                if (null === callback) {
                    if (promise._state) {
                        me.resolve(promise._value);
                    } else {
                        me.reject(promise._value);
                    }
                    return;
                }
                try {
                    result = callback(promise._value);
                } catch (e) {
                    me.reject(e);
                    return;
                }
                me.resolve(result);
            }, 0);
        }
    };
    _GpfPromise.prototype = {
        _state: null,
        _value: null,
        _handlers: [],
        then: function (onFulfilled, onRejected) {
            var me = this;
            return new _GpfPromise(function (resolve, reject) {
                var handler = new _gpfPromiseHandler();
                if (undefined !== onFulfilled) {
                    handler.onFulfilled = onFulfilled;
                }
                if (undefined !== onRejected) {
                    handler.onRejected = onRejected;
                }
                handler.resolve = resolve;
                handler.reject = reject;
                handler.process(me);
            });
        },
        "catch": function (onRejected) {
            return this.then(null, onRejected);
        }
    };
    _GpfPromise.resolve = function (value) {
        return new _GpfPromise(function (resolve) {
            resolve(value);
        });
    };
    _GpfPromise.reject = function (value) {
        return new _GpfPromise(function (resolve, reject) {
            _gpfIgnore(resolve);
            reject(value);
        });
    };
    _GpfPromise.all = function (promises) {
        if (0 === promises.length) {
            return _GpfPromise.resolve([]);
        }
        return new _GpfPromise(function (resolve, reject) {
            var remaining = promises.length;
            function handle(result, index) {
                try {
                    if (result && result instanceof _GpfPromise) {
                        result.then(function (value) {
                            handle(value, index);
                        }, reject);
                        return;
                    }
                    promises[index] = result;
                    if (--remaining === 0) {
                        resolve(promises);
                    }
                } catch (e) {
                    reject(e);
                }
            }
            /*gpf:inline(array)*/
            promises.forEach(handle);
        });
    };
    _GpfPromise.race = function (promises) {
        return new _GpfPromise(function (resolve, reject) {
            /*gpf:inline(array)*/
            promises.forEach(function (promise) {
                promise.then(resolve, reject);
            });
        });
    };
    /* istanbul ignore next */
    // Promise exists now in NodeJS
    if (undefined === _gpfMainContext.Promise) {
        _gpfMainContext.Promise = _GpfPromise;
    }
    function _GpfDeferredPromise() {
        /*jshint validthis:true*/
        // constructor
        var me = this;
        me.promise = new Promise(function (resolve, reject) {
            me.resolve = resolve;
            me.reject = reject;
        });
    }
    _GpfDeferredPromise.prototype = {
        resolve: null,
        reject: null,
        promise: null
    };
    gpf.DeferredPromise = _GpfDeferredPromise;
    var
        //region Events
        _GPF_EVENT_ANY = "*", _GPF_EVENT_ERROR = "error", _GPF_EVENT_READY = "ready", _GPF_EVENT_DATA = "data", _GPF_EVENT_END_OF_DATA = "endOfData", _GPF_EVENT_CONTINUE = "continue", _GPF_EVENT_STOP = "stop", _GPF_EVENT_STOPPED = "stopped",
        //endregion
        //region File system constants
        _GPF_FS_TYPE_NOT_FOUND = 0, _GPF_FS_TYPE_FILE = 1, _GPF_FS_TYPE_DIRECTORY = 2, _GPF_FS_TYPE_UNKNOWN = 99,
        //endregion
        // https://github.com/jshint/jshint/issues/525
        _GpfFunc = Function,
        // avoid JSHint error
        // Max value on 31 bits
        _gpfMax31 = 2147483647,
        // Max value on 32 bits
        _gpfMax32 = 4294967295,
        // Letters (lowercase)
        _gpfAlpha = "abcdefghijklmnopqrstuvwxyz",
        // Letters (uppercase)
        _gpfALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        // Digits
        _gpfDigit = "0123456789",
        // List of allowed first char in an identifier
        _gpfIdentifierFirstChar = _gpfAlpha + _gpfALPHA + "_$",
        // List of allowed other chars in an identifier
        _gpfIdentifierOtherChars = _gpfAlpha + _gpfALPHA + _gpfDigit + "_$",
        // TODO update with http://stackoverflow.com/questions/26255/reserved-keywords-in-javascript
        // List of JavaScript keywords
        _gpfJsKeywords = ("break,case,class,catch,const,continue,debugger,default,delete,do,else,export,extends,finally," + "for,function,if,import,in,instanceof,let,new,return,super,switch,this,throw,try,typeof,var,void,while,with," + "yield").split(",");
    // An empty function returning false
    function _gpfFalseFunc() {
        return false;
    }
    /**
     * Create a new function from the source and parameter list.
     * In DEBUG mode, it catches any error to log the problem.
     *
     * @param {String[]} [params=undefined] params Parameter names list
     * @param {String} source
     * @return {Function}
     */
    function _gpfFunc(params, source) {
        var args;
        if (undefined === source) {
            source = params;
            params = [];
        }
        _gpfAssert("string" === typeof source && source.length, "Source expected (or use _gpfEmptyFunc)");
        try {
            if (0 === params.length) {
                return _GpfFunc(source);
            }
            args = [].concat(params);
            args.push(source);
            // TODO depending on the environment the result function name is anonymous !
            return _GpfFunc.apply(null, args);
        } catch (e) {
            /* istanbul ignore next */
            // Not supposed to happen (not tested)
            console.error("An exception occurred compiling:\r\n" + source);
            /* istanbul ignore next */
            return null;
        }
    }
    /**
     * Add constants to the provided object
     *
     * @param {Object} obj
     * @param {Object} dictionary
     */
    function _gpfCreateConstants(obj, dictionary) {
        var key;
        for (key in dictionary) {
            /* istanbul ignore else */
            if (dictionary.hasOwnProperty(key)) {
                /*gpf:constant*/
                obj[key] = dictionary[key];
            }
        }
    }
    _gpfCreateConstants(gpf, {
        HOST_BROWSER: _GPF_HOST_BROWSER,
        HOST_NODEJS: _GPF_HOST_NODEJS,
        HOST_PHANTOMJS: _GPF_HOST_PHANTOMJS,
        HOST_RHINO: _GPF_HOST_RHINO,
        HOST_UNKNOWN: _GPF_HOST_UNKNOWN,
        HOST_WSCRIPT: _GPF_HOST_WSCRIPT
    });
    function _GpfEventsIsValidHandler(eventHandler) {
        var type = typeof eventHandler, dispatchEvent;
        if ("function" === type) {
            return 1 === eventHandler.length;
        }
        if ("object" !== type) {
            return false;
        }
        dispatchEvent = eventHandler.dispatchEvent;
        if ("function" === typeof dispatchEvent) {
            return 1 === dispatchEvent.length;
        }
        // Assuming there will be an handler for the event (we can't know in advance)
        // TODO does it make sense to ignore an event? I may need to check that at least one event handler is available
        return true;
    }
    gpf.events = { isValidHandler: _GpfEventsIsValidHandler };
    /**
     * GPF Event class
     * Simple implementation: type is a read-only member
     *
     * @param {String} type
     * @param {Object} [params={}] params
     * @param {Boolean} [cancelable=false] cancelable
     * @param {Object} [scope=undefined] scope
     * @constructor
     */
    var _GpfEvent = gpf.events.Event = function (type, params, scope) {
            /*jshint validthis:true*/
            // constructor
            /*gpf:constant*/
            this.type = type;
            /*gpf:constant*/
            this.scope = _gpfResolveScope(scope);
            if (undefined !== params) {
                this._params = params;
            }
        };
    // _GpfEvent interface
    _GpfEvent.prototype = {
        constructor: _GpfEvent,
        type: "",
        scope: null,
        _params: {},
        get: function (name) {
            return this._params[name];
        }
    };
    // Returns the function to call (bound with the correct scope)
    function _getEventHandler(event, eventsHandler) {
        var scope = event.scope, eventHandler;
        if ("function" === typeof eventsHandler.dispatchEvent) {
            // Event dispatcher expected interface
            return eventsHandler.dispatchEvent.bind(eventsHandler);
        }
        if ("function" === typeof eventsHandler) {
            return eventsHandler.bind(scope);
        }
        // Composite with a specific event handler
        eventHandler = eventsHandler[event.type] || eventsHandler["*"] || _gpfEmptyFunc;
        return eventHandler.bind(eventsHandler.scope || eventsHandler);
    }
    /**
     * Fire the event by triggering the eventsHandler
     *
     * @param {gpf.events.Event} event event object to fire
     * @param {gpf.events.Handler} eventsHandler
     * @param {gpf.DeferredPromise} [deferredPromise=undefined] deferredPromise promise to resolve on completion
     */
    function _gpfEventsTriggerHandler(event, eventsHandler, deferredPromise) {
        var eventHandler = _getEventHandler(event, eventsHandler);
        eventHandler(event);
        if (undefined !== deferredPromise) {
            deferredPromise.resolve(event);
        }
    }
    var
        // Count the number of gpf.events.fire calls
        _gpfEventsFiring = 0;
    /**
     * gpf.events.fire implementation
     *
     * @param {String/gpf.events.Event} event event name or event object to fire
     * @param {Object} params dictionary of parameters for the event object
     * creation, they are ignored if an event object is specified
     * @param {gpf.events.Handler} eventsHandler
     * @return {Promise<gpf.events.Event>} fulfilled when the event has been fired
     */
    function _gpfEventsFire(event, params, eventsHandler) {
        /*jshint validthis:true*/
        // will be invoked with apply
        var scope = _gpfResolveScope(this), result;
        _gpfAssert(_GpfEventsIsValidHandler(eventsHandler), "Expected a valid event handler");
        if (!(event instanceof _GpfEvent)) {
            event = new gpf.events.Event(event, params, scope);
        }
        /**
         * This is used both to limit the number of recursion and increase
         * the efficiency of the algorithm.
         */
        if (++_gpfEventsFiring > 10) {
            // Too much recursion, use setTimeout to free some space on the stack
            result = new _GpfDeferredPromise();
            setTimeout(_gpfEventsTriggerHandler.bind(null, event, eventsHandler, result), 0);
        } else {
            _gpfEventsTriggerHandler(event, eventsHandler);
            result = Promise.resolve(event);
        }
        --_gpfEventsFiring;
        return result;
    }
    /**
     * Fire the event on the provided eventsHandler
     *
     * @param {gpf.events.Handler} eventsHandler
     * @return {gpf.events.Event} this
     */
    _GpfEvent.prototype.fire = function (eventsHandler) {
        return _gpfEventsFire.apply(this, [
            this,
            {},
            eventsHandler
        ]);
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
     * @return {Promise<gpf.events.Event>} fulfilled when the event has been fired
     */
    gpf.events.fire = function (event, params, eventsHandler) {
        _gpfIgnore(event, params, eventsHandler);
        var me = this, scope;
        if (this !== gpf.events) {
            scope = me;
        }
        // Else it will be adjusted inside _gpfEventsFire
        if (undefined === eventsHandler) {
            eventsHandler = params;
            params = {};
        }
        return _gpfEventsFire.apply(scope, [
            event,
            params,
            eventsHandler
        ]);
    };
    /**
     * Wraps a function that signals events so that it can be used with promises (by letting the eventHandler parameter
     * undefined).
     *
     * @param {Function} eventHandlingMethod encapsulates the call to the event handling function, receives a parameter
     * that must be passed as an event handler.
     * @return {Promise<gpf.events.Event>}
     */
    function _gpfEventGetPromiseHandler(eventHandlingMethod) {
        var deferred = new _GpfDeferredPromise();
        eventHandlingMethod(function (event) {
            if (_GPF_EVENT_ERROR === event.type) {
                deferred.reject(event);
            } else {
                deferred.resolve(event);
            }
        });
        return deferred.promise;
    }
    // @inheritdoc _gpfEventGetPromiseHandler
    gpf.events.getPromiseHandler = _gpfEventGetPromiseHandler;
    _gpfCreateConstants(gpf.events, {
        EVENT_ANY: _GPF_EVENT_ANY,
        EVENT_ERROR: _GPF_EVENT_ERROR,
        EVENT_READY: _GPF_EVENT_READY,
        EVENT_DATA: _GPF_EVENT_DATA,
        EVENT_END_OF_DATA: _GPF_EVENT_END_OF_DATA,
        EVENT_CONTINUE: _GPF_EVENT_CONTINUE,
        EVENT_STOP: _GPF_EVENT_STOP,
        EVENT_STOPPED: _GPF_EVENT_STOPPED
    });
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
        gpf.web.include = function () {
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
            function IncludeContext(url, eventsHandler) {
                /*jshint validthis:true*/
                this.id = ++lastIncludeId;
                this.url = url;
                this.eventsHandler = eventsHandler;
                includeMap[this.id] = this;
            }
            IncludeContext.prototype = {
                id: 0,
                url: "",
                eventsHandler: null,
                clean: function (domScript) {
                    var parent = domScript.parentNode;
                    domScript.onerror = domScript.onload = domScript.onreadystatechange = null;
                    if (parent) {
                        parent.removeChild(domScript);
                    }
                    // Destroy context mapping
                    delete includeMap[this.id];
                },
                check: function (domScript) {
                    var readyState = domScript.readyState;
                    if (!readyState || -1 < [
                            "loaded",
                            "complete"
                        ].indexOf(readyState)) {
                        this.clean(domScript);
                        // IE10: the event is triggered *before* the source is evaluated
                        setTimeout(_gpfEventsFire, 0, _GPF_EVENT_READY, { url: this.url }, this.eventsHandler);
                    }
                },
                failed: function (domScript) {
                    this.clean(domScript);
                    setTimeout(_gpfEventsFire, 0, _GPF_EVENT_ERROR, { url: this.url }, this.eventsHandler);
                }
            };
            function getIncludeContextFromId(id) {
                return includeMap[id.substr(INCLUDE_ID_PREFIX.length)];
            }
            // Wrapper for the load event
            function onLoad() {
                /*jshint validthis:true*/
                // 'this' is the script element
                var me = this;
                //eslint-disable-line no-invalid-this
                var context = getIncludeContextFromId(me.id);
                if (context) {
                    context.check(me);
                }
            }
            // Wrapper for the error event
            function onError() {
                /*jshint validthis:true*/
                // 'this' is the script element
                var me = this;
                //eslint-disable-line no-invalid-this
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
            function insert(domScript) {
                _gpfWebHead.insertBefore(domScript, _gpfWebHead.firstChild);
            }
            /**
             * @inheritdoc gpf.web#include
             * Implementation of gpf.web.include
             *
             * Inspired from http://stackoverflow.com/questions/4845762/
             */
            return function (url, eventsHandler) {
                var context = new IncludeContext(url, eventsHandler), domScript = _gpfWebDocument.createElement("script");
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
        }();
    }
    var
        /**
         * Return true if the parameter looks like an array
         *
         * @param {Object} obj
         * @return {Boolean} True if array-like
         */
        _gpfIsArrayLike;
    /* istanbul ignore if */
    // Not tested with NodeJS
    if (_GPF_HOST_BROWSER === _gpfHost && (_gpfWebWindow.HTMLCollection || _gpfWebWindow.NodeList)) {
        _gpfIsArrayLike = function (obj) {
            return obj instanceof Array || obj instanceof _gpfWebWindow.HTMLCollection || obj instanceof _gpfWebWindow.NodeList;
        };
    } else {
        _gpfIsArrayLike = function (obj) {
            return obj instanceof Array;
        };
    }
    /**
     * Return true if the provided parameter looks like an array (i.e. it has a property length and each item can be
     * accessed with [])
     *
     * @param {Object} obj
     * @return {Boolean} True if array-like
     */
    gpf.isArrayLike = _gpfIsArrayLike;
    //endregion
    //region gpf.forEach
    /**
     * Similar to [].forEach but works on array-like
     *
     * @param {Array} array
     * @param {Function} callback Function to execute for each own property, taking three arguments:
     * - {*} currentValue The current element being processed
     * - {String} property The current index being processed
     * - {Object} array The array currently being processed
     * @param {*} [thisArg=undefined] thisArg Value to use as this when executing callback.
     */
    function _gpfArrayForEach(array, callback, thisArg) {
        var index, length = array.length;
        for (index = 0; index < length; ++index) {
            callback.apply(thisArg, [
                array[index],
                index,
                array
            ]);
        }
    }
    /**
     * Similar to [].forEach but for objects
     *
     * @param {Object} object
     * @param {Function} callback Function to execute for each own property, taking three arguments:
     * - {*} currentValue The current element being processed
     * - {String} property The name of the current property being processed
     * - {Object} object The object currently being processed
     * @param {*} [thisArg=undefined] thisArg Value to use as this when executing callback.
     */
    function _gpfObjectForEach(object, callback, thisArg) {
        for (var property in object) {
            /* istanbul ignore else */
            if (object.hasOwnProperty(property)) {
                callback.apply(thisArg, [
                    object[property],
                    property,
                    object
                ]);
            }
        }
    }
    /**
     * Executes a provided function once per structure element.
     *
     * @param {Array|Object} structure
     * @param {Function} callback Function to execute for each element, taking three arguments:
     * - {*} currentValue The current element being processed
     * - {String} property The name of the current property or the index being processed
     * - {Array|Object} structure The structure currently being processed
     * @param {*} [thisArg=undefined] thisArg Value to use as this when executing callback.
     */
    gpf.forEach = function (structure, callback, thisArg) {
        if (_gpfIsArrayLike(structure)) {
            _gpfArrayForEach(structure, callback, thisArg);
            return;
        }
        _gpfObjectForEach(structure, callback, thisArg);    /*gpf:inline(object)*/
    };
    //endregion
    //region String helpers (will be reused in string module)
    /**
     * Capitalize the string
     *
     * @param {String} that
     * @return {String}
     */
    function _gpfStringCapitalize(that) {
        return that.charAt(0).toUpperCase() + that.substr(1);
    }
    /**
     * String replacement using dictionary map
     *
     * @param {String} that
     * @param {Object} replacements map of strings to search and replace
     * @return {String}
     */
    function _gpfStringReplaceEx(that, replacements) {
        var result = that;
        _gpfObjectForEach(replacements, function (replacement, key) {
            /*gpf:inline(object)*/
            result = result.split(key).join(replacement);
        });
        return result;
    }
    var
        // Dictionary of language to escapes
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
                é: "&eacute;",
                è: "&egrave;",
                ê: "&ecirc;",
                á: "&aacute;",
                à: "&agrave;"
            }
        };
    /**
     * Make the string content compatible with lang
     *
     * @param {String} that
     * @param {String} language
     * @return {String}
     */
    function _gpfStringEscapeFor(that, language) {
        that = _gpfStringReplaceEx(that, _gpfStringEscapes[language]);
        if ("javascript" === language) {
            that = "\"" + that + "\"";
        }
        return that;
    }
    //endregion
    //region gpf.extend
    /**
     * gpf.extend implementation of assign with no callback
     *
     * @param {*} value
     * @param {String} member
     */
    function _gpfAssign(value, member) {
        /*jshint validthis:true*/
        // gpf.extend's arguments: this[0] is dst
        this[0][member] = value;
    }
    /**
     * gpf.extend implementation of assign with a callback
     *
     * @param {*} value
     * @param {String} member
     */
    function _gpfAssignOrCall(value, member) {
        /*jshint validthis:true*/
        // gpf.extend's arguments
        var dst = this[0], overwriteCallback = this[2];
        // TODO: see if in is faster
        if (undefined === dst[member]) {
            dst[member] = value;
        } else {
            overwriteCallback(dst, member, value);
        }
    }
    /**
     * Extends the destination object dst by copying own enumerable properties from the src object(s) to dst.
     * If a conflict has to be handled (i.e. member exists on both objects), the overwriteCallback has to handle it.
     *
     * @param {Object} dst
     * @param {Object} src
     * @param {Function} [overwriteCallback=undefined] overwriteCallback
     * @return {Object} the modified dst
     * @chainable
     */
    function _gpfExtend(dst, src, overwriteCallback) {
        var callbackToUse;
        if (undefined === overwriteCallback) {
            callbackToUse = _gpfAssign;
        } else {
            _gpfAssert("function" === typeof overwriteCallback, "Expected function");
            callbackToUse = _gpfAssignOrCall;
        }
        _gpfObjectForEach(src, callbackToUse, arguments);
        /*gpf:inline(object)*/
        return dst;
    }
    // @inheritdoc _gpfExtend
    gpf.extend = _gpfExtend;
    //endregion
    //region gpf.value
    var
        /**
         * gpf.value handlers per type.
         * Each handler signature is:
         * - {*} value the value to convert
         * - {String} valueType typeof value
         * - {*} defaultValue the expected default value if not convertible
         *
         * @type {Object}
         */
        _gpfValues = {
            "boolean": function (value, valueType, defaultValue) {
                _gpfIgnore(defaultValue);
                if ("string" === valueType) {
                    if ("yes" === value || "true" === value) {
                        return true;
                    }
                    return 0 !== parseInt(value, 10);
                }
                if ("number" === valueType) {
                    return 0 !== value;
                }
            },
            number: function (value, valueType, defaultValue) {
                _gpfIgnore(defaultValue);
                if ("string" === valueType) {
                    return parseFloat(value);
                }
            },
            string: function (value, valueType, defaultValue) {
                _gpfIgnore(valueType, defaultValue);
                return value.toString();
            },
            object: function (value, valueType, defaultValue) {
                _gpfIgnore(value, valueType, defaultValue);
            }
        };
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
    function _gpfValue(value, defaultValue, expectedType) {
        var valueType = typeof value, result;
        if (!expectedType) {
            expectedType = typeof defaultValue;
        }
        if (expectedType === valueType) {
            return value;
        }
        if ("undefined" === valueType) {
            return defaultValue;
        }
        result = _gpfValues[expectedType](value, valueType, defaultValue);
        if (undefined === result) {
            return defaultValue;
        }
        return result;
    }
    // @inheritdoc _gpfValue
    gpf.value = _gpfValue;
    //endregion
    _gpfExtend(gpf, {
        clone: function (obj) {
            // http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object/5344074#5344074
            return JSON.parse(JSON.stringify(obj));
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
            _gpfAssert(array instanceof Array, "gpf.set must be used with an Array");
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
                        delete dictionary[idx];
                    }
                }
            }
            return dictionary;
        },
        xor: function (a, b) {
            return a && !b || !a && b;
        }
    });
    /* istanbul ignore next */
    // Not testable
    /**
     * Exit function
     *
     * @paran {Number} [exitCode=0] exitCode
     */
    gpf.exit = function (exitCode) {
        if (undefined === exitCode) {
            exitCode = 0;
        }
        _gpfExit(exitCode);
    };
    //region NodeJS helpers
    /**
     * Converts a NodeJS buffer into a native array containing unsigned
     * bytes
     *
     * @param {Buffer} buffer
     * @return {Number[]}
     */
    function _gpfNodeBuffer2JsArray(buffer) {
        var result = [], len = buffer.length, idx;
        for (idx = 0; idx < len; ++idx) {
            result.push(buffer.readUInt8(idx));
        }
        return result;
    }    //endregion
    function _gpfStringTrim(string) {
        return string.trim();
    }
    /**
     * Function builder
     *
     * @class _GpfFunctionBuilder
     * @constructor
     */
    function _GpfFunctionBuilder(functionToAnalyze) {
        /*jshint validthis:true*/
        // constructor
        this.parameters = [];
        if (undefined !== functionToAnalyze) {
            this._extract(functionToAnalyze);
        }
    }
    _GpfFunctionBuilder.prototype = {
        isNative: false,
        name: "",
        parameters: [],
        body: "",
        replaceInBody: function (replacements) {
            this.body = _gpfStringReplaceEx(this.body, replacements);
        },
        _extract: function (functionObject) {
            this.name = functionObject.compatibleName();
            var source = Function.prototype.toString.call(functionObject).replace(_gpfJsCommentsRegExp, ""), start, end;
            if (0 < functionObject.length) {
                start = source.indexOf("(") + 1;
                end = source.indexOf(")", start) - 1;
                this.parameters = source.substr(start, end - start + 1).split(",").map(_gpfStringTrim);
            } else {
                this.parameters = [];
            }
            if (-1 < source.indexOf("[native")) {
                this.isNative = true;
            } else {
                start = source.indexOf("{") + 1;
                end = source.lastIndexOf("}") - 1;
                this.body = source.substr(start, end - start + 1);
            }
        },
        generate: function () {
            return _gpfFunc("return " + this._toSource())();
        },
        _toSource: function () {
            var name;
            if (this.name) {
                name = " " + this.name;
            } else {
                name = "";
            }
            return [
                "function",
                name,
                " ("
            ].concat(this.parameters).concat([
                ") {\n",
                this.body,
                "\n}"
            ]).join("");
        }
    };
    function _GpfLikeContext(alike) {
        /*jshint validthis:true*/
        // constructor
        this._pending = [];
        this._done = [];
        // Override for this instance only
        if (true === alike) {
            this._haveDifferentPrototypes = _gpfFalseFunc;
        } else {
            this._alike = _gpfFalseFunc;
        }
    }
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
            return a.constructor !== b.constructor;
        },
        explore: function () {
            var pending = this._pending, done = this._done, a, b;
            while (0 !== pending.length) {
                b = pending.pop();
                a = pending.pop();
                done.push(a, b);
                if (this._haveDifferentPrototypes(a, b)) {
                    return false;
                }
                if (this._checkMembersDifferences(a, b)) {
                    return false;
                }
            }
            return true;
        },
        _checkMembersDifferences: function (a, b) {
            var membersCount = 0, member;
            // a members
            for (member in a) {
                /* istanbul ignore else */
                if (a.hasOwnProperty(member)) {
                    ++membersCount;
                    if (!this.like(a[member], b[member])) {
                        return true;
                    }
                }
            }
            // b members
            for (member in b) {
                /* istanbul ignore else */
                if (b.hasOwnProperty(member)) {
                    --membersCount;
                }
            }
            // Difference on members count?
            return 0 !== membersCount;
        },
        _downcast: function (a) {
            if ("object" === typeof a) {
                if (a instanceof String) {
                    return a.toString();
                }
                return a.valueOf();
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
     * Compares a and b and return true if they are look-alike (all members have the same type and same value).
     *
     * NOTES:
     * 2013-04-14
     * Generates too much recursion, changed the algorithm to avoid recursion using document.body (and any kind of object
     * that references other objects) I found that it was necessary to keep track of already processed objects.
     *
     * 2015-02-26
     * Rewrote to be easier to maintain (and easier to understand).
     *
     * @param {*} a
     * @param {*} b
     * @param {Boolean} [alike=false] alike Allow to be tolerant on primitive types compared with their object equivalent
     * @return {Boolean}
     */
    gpf.like = function (a, b, alike) {
        var context = new _GpfLikeContext(alike);
        return context.like(a, b) && context.explore();
    };
    var _GpfError = gpf.Error = function () {
        };
    _GpfError.prototype = {
        constructor: _GpfError,
        code: 0,
        name: "Error",
        message: ""
    };
    function _gpfErrorFactory(code, name, message) {
        return function (context) {
            var error = new _GpfError(), finalMessage, replacements;
            /*gpf:constant*/
            error.code = code;
            /*gpf:constant*/
            error.name = name;
            if (context) {
                replacements = {};
                _gpfObjectForEach(context, function (value, key) {
                    /*gpf:inline(object)*/
                    replacements["{" + key + "}"] = value.toString();
                });
                finalMessage = _gpfStringReplaceEx(message, replacements);
            } else {
                finalMessage = message;
            }
            /*gpf:constant*/
            error.message = finalMessage;
            return error;
        };
    }
    /**
     * Generates an error function
     *
     * @param {Number} code
     * @param {String} name
     * @return {Function}
     * @closure
     */
    function _gpfGenenerateErrorFunction(code, name, message) {
        var result = _gpfErrorFactory(code, name, message);
        /*gpf:constant*/
        result.CODE = code;
        /*gpf:constant*/
        result.NAME = name;
        /*gpf:constant*/
        result.MESSAGE = message;
        return result;
    }
    // Last allocated error code
    var _gpfLastErrorCode = 0;
    /**
     * Declare error messages.
     * Each module declares its own errors.
     *
     * @param {String} module
     * @param {Object} list Dictionary of name to message
     */
    function _gpfErrorDeclare(module, list) {
        var name, code;
        _gpfIgnore(module);
        for (name in list) {
            /* istanbul ignore else */
            if (list.hasOwnProperty(name)) {
                code = ++_gpfLastErrorCode;
                gpf.Error["CODE_" + name.toUpperCase()] = code;
                gpf.Error[name] = _gpfGenenerateErrorFunction(code, name, list[name]);
            }
        }
    }
    _gpfErrorDeclare("boot", {
        notImplemented: "Not implemented",
        abstractMethod: "Abstract method",
        assertionFailed: "Assertion failed: {message}",
        invalidParameter: "Invalid parameter"
    });
    function _gpfAllocateEventDispatcherListeners(object) {
        var listeners = object._eventDispatcherListeners;
        if (!listeners) {
            listeners = object._eventDispatcherListeners = {};
        }
        return listeners;
    }
    /**
     * Add an event listener to the dispatcher
     *
     * @param {String} event name
     * @param {gpf.events.Handler} eventsHandler
     * @return {Object}
     * @chainable
     */
    function _gpfAddEventListener(event, eventsHandler) {
        /*jshint validthis:true*/
        // will be invoked as an object method
        var listeners = _gpfAllocateEventDispatcherListeners(this);
        if (undefined === listeners[event]) {
            listeners[event] = [];
        }
        listeners[event].push(eventsHandler);
        return this;
    }
    /**
     * Remove an event listener from the dispatcher
     *
     * @param {String} event name
     * @param {gpf.events.Handler} eventsHandler
     * @return {Object}
     * @chainable
     */
    function _gpfRemoveEventListener(event, eventsHandler) {
        /*jshint validthis:true*/
        // will be invoked as an object method
        var listeners = this._eventDispatcherListeners, eventListeners, index;
        if (listeners) {
            eventListeners = listeners[event];
            if (undefined !== eventListeners) {
                index = eventListeners.indexOf(eventsHandler);
                if (-1 !== index) {
                    eventListeners.splice(index, 1);
                }
            }
        }
        return this;
    }
    /**
     * Execute the listeners
     *
     * @param {gpf.events.Event} eventObj
     * @param {gpf.events.Handler[]} eventListeners
     */
    function _gpfTriggerListeners(eventObj, eventListeners) {
        var index, length = eventListeners.length;
        for (index = 0; index < length; ++index) {
            _gpfEventsFire.apply(eventObj.scope, [
                eventObj,
                {},
                eventListeners[index]
            ]);
        }
    }
    /**
     * Broadcast the event
     *
     * @param {String|gpf.events.Event} event name or object
     * @param {Object} [params={}] event parameters
     * @return {gpf.events.Event}
     */
    function _gpfDispatchEvent(event, params) {
        /*jshint validthis:true*/
        // will be invoked as an object method
        var listeners = this._eventDispatcherListeners, eventObj, type, eventListeners;
        if (!listeners) {
            return this;    // No listeners at all
        }
        if (event instanceof _GpfEvent) {
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
            eventObj = new _GpfEvent(type, params, this);
        }
        _gpfTriggerListeners(eventObj, eventListeners);
        return eventObj;
    }
    gpf.mixins = {
        EventDispatcher: {
            addEventListener: _gpfAddEventListener,
            removeEventListener: _gpfRemoveEventListener,
            dispatchEvent: _gpfDispatchEvent
        }
    };
    var
        /**
         * Dictionary used to generate _gpfMimeTypesFromExtension and _gpfMimeTypesToExtension
         *
         * @type {Object}
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
         */
        _gpfMimeTypesToExtension = null,
        /**
         * Dictionary of extension to mime type
         *
         * @type {Object}
         */
        _gpfMimeTypesFromExtension = null;
    function _createMimeTypeExtensionMapping(mimeType, fileExtension) {
        _gpfMimeTypesFromExtension[fileExtension] = mimeType;
        if (undefined === _gpfMimeTypesToExtension[mimeType]) {
            _gpfMimeTypesToExtension[mimeType] = fileExtension;
        }
    }
    /**
     * Recursive function that fills _gpfMimeTypesToExtension & _gpfMimeTypesFromExtension
     *
     * @param {String} path
     * @param {Object} mappings
     * @private
     */
    function _gpfBuildMimeTypeFromMappings(path, mappings) {
        /*gpf:inline(object)*/
        _gpfObjectForEach(mappings, function (extensions, key) {
            var mimeType = path + key;
            if (0 === extensions) {
                _createMimeTypeExtensionMapping(mimeType, "." + key);
            } else if ("string" === typeof extensions) {
                extensions.split(",").forEach(function (extension) {
                    _createMimeTypeExtensionMapping(mimeType, "." + extension);
                });
            } else {
                // Assuming extensions is an object
                _gpfBuildMimeTypeFromMappings(mimeType + "/", extensions);
            }
        });
    }
    /**
     * Retrieve the mime type associates with the file extension (default is "application/octet-stream")
     *
     * @param {String} fileExtension
     * @return {String}
     */
    function _gpfGetMimeType(fileExtension) {
        var mimeType = _gpfMimeTypesFromExtension[fileExtension.toLowerCase()];
        if (undefined === mimeType) {
            // Default
            mimeType = "application/octet-stream";
        }
        return mimeType;
    }
    /**
     * Retrieve the file extension associated with the mime type (default is ".bin")
     *
     * @param {String} mimeType
     * @return {String}
     */
    function _gpfGetFileExtension(mimeType) {
        var fileExtension = _gpfMimeTypesToExtension[mimeType.toLowerCase()];
        if (undefined === fileExtension) {
            // Default
            fileExtension = ".bin";
        }
        return fileExtension;
    }
    /**
     * Initialize _gpfMimeTypesFromExtension and _gpfMimeTypesToExtension
     *
     * @param {Function} callback
     * @param {Array] parameters
     * @private
     */
    function _gpfInitMimeTypes() {
        if (null === _gpfMimeTypesFromExtension) {
            _gpfMimeTypesFromExtension = {};
            _gpfMimeTypesToExtension = {};
            _gpfBuildMimeTypeFromMappings("", _gpfHardCodedMimeTypes);
        }
    }
    // @inheritdoc _gpfGetMimeType
    _gpfGetBootstrapMethod("gpf.web.getMimeType", function () {
        _gpfInitMimeTypes();
        return _gpfGetMimeType;
    });
    // @inheritdoc _gpfGetFileExtension
    _gpfGetBootstrapMethod("gpf.web.getFileExtension", function () {
        _gpfInitMimeTypes();
        return _gpfGetFileExtension;
    });
    var
        // List of pending callbacks (sorted by execution time)
        _gpfTimeoutQueue = [],
        // Last allocated timeoutID
        _gpfTimeoutID = 0,
        // Sleep function
        _gpfSleep = _gpfEmptyFunc;
    // Handle timeouts (mandatory for some environments)
    gpf.handleTimeout = _gpfEmptyFunc;
    /**
     * Sorting function used to reorder the async queue
     *
     * @param {Object} a
     * @param {Object} b
     * @return {Number}
     * @private
     */
    function _gpfSortOnDt(a, b) {
        return a.dt - b.dt;
    }
    function _gpSetTimeoutPolyfill(callback, timeout) {
        _gpfAssert("number" === typeof timeout, "Timeout is required");
        var timeoutItem = {
                id: ++_gpfTimeoutID,
                dt: new Date(new Date().getTime() + timeout),
                cb: callback
            };
        _gpfTimeoutQueue.push(timeoutItem);
        _gpfTimeoutQueue.sort(_gpfSortOnDt);
        return _gpfTimeoutID;
    }
    function _gpfClearTimeoutPolyfill(timeoutId) {
        var pos;
        /*gpf:inline(array)*/
        if (!_gpfTimeoutQueue.every(function (timeoutItem, index) {
                if (timeoutItem.id === timeoutId) {
                    pos = index;
                    return false;
                }
                return true;
            })) {
            _gpfTimeoutQueue.splice(pos, 1);
        }
    }
    function _gpfHandleTimeout() {
        var queue = _gpfTimeoutQueue, timeoutItem, now;
        while (queue.length) {
            timeoutItem = queue.shift();
            now = new Date();
            if (timeoutItem.dt > now) {
                _gpfSleep(timeoutItem.dt - now);
            }
            timeoutItem.cb();
        }
    }
    // Used only for WSCRIPT & RHINO environments
    /* istanbul ignore next */
    if ("undefined" === typeof setTimeout) {
        /*jshint wsh: true*/
        /*eslint-env wsh*/
        /*jshint rhino: true*/
        /*eslint-env rhino*/
        if (_GPF_HOST_WSCRIPT === _gpfHost) {
            _gpfSleep = function (t) {
                WScript.Sleep(t);    //eslint-disable-line new-cap
            };
        } else if (_GPF_HOST_RHINO === _gpfHost) {
            _gpfSleep = java.lang.Thread.sleep;
        } else {
            console.warn("No implementation for setTimeout");
        }
        _gpfMainContext.setTimeout = _gpSetTimeoutPolyfill;
        _gpfMainContext.clearTimeout = _gpfClearTimeoutPolyfill;
        gpf.handleTimeout = _gpfHandleTimeout;
    }
    var _gpfB64 = _gpfALPHA + _gpfAlpha + _gpfDigit + "+/", _gpfB16 = "0123456789ABCDEF", _gpfBinZ = 987654321, _gpfBinW = new Date().getTime() & _gpfMax32;
    function _gpfToBaseAnyEncodeUsingBitShifting(baseAndValue, pow, length) {
        var base = baseAndValue.base, value = baseAndValue.value, result = [], bits, mask, digit;
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
        return result;
    }
    function _gpfToBaseAnyEncodeUsingModulo(baseAndValue) {
        var base = baseAndValue.base, value = baseAndValue.value, result = [], baseLength = base.length, digit;
        while (0 !== value) {
            digit = value % baseLength;
            result.unshift(base.charAt(digit));
            value = (value - digit) / baseLength;
        }
        return result;
    }
    function _gpfToBaseAnyEncode(baseAndValue, length) {
        var pow = gpf.bin.isPow2(baseAndValue.base.length);
        if (-1 < pow && (undefined === length || length * pow <= 32)) {
            // Good conditions to use bits masking & shifting, will work with negative values and will be faster
            return _gpfToBaseAnyEncodeUsingBitShifting(baseAndValue, pow, length);
        }
        return _gpfToBaseAnyEncodeUsingModulo(baseAndValue);
    }
    /**
     * Encodes the value within the specified base.
     * Result string length can be defined (formattingOptions.length) and missing characters will be added from
     * formattingOptions.pad
     *
     * @param {String} base values
     * @param {Number} value to encode
     * @param {Object} formattingOptions
     * - {Number} [length=undefined] length of encoding
     * - {String} [pad="0"] pad
     * @return {String}
     */
    function _gpfToBaseANY(base, value, formattingOptions) {
        var length = formattingOptions.length, pad = formattingOptions.pad, result = _gpfToBaseAnyEncode({
                base: base,
                value: value
            }, length);
        // Padding
        if (undefined !== length) {
            if (undefined === pad) {
                pad = base.charAt(0);
            }
            while (result.length < length) {
                result.unshift(pad.charAt(result.length % pad.length));
            }
        } else if (0 === result.length) {
            result = [base.charAt(0)];    // 0
        }
        return result.join("");
    }
    /**
     * Decodes the text value using the specified base.
     *
     * @param {String} base
     * @param {String} text
     * @param {String} [pad=base.charAt(0)] pad
     * @return {Number}
     */
    function _gpfFromBaseANY(base, text, pad) {
        var baseLength = base.length, result = 0, idx = 0;
        if (undefined === pad) {
            pad = base.charAt(0);
        }
        while (idx < text.length) {
            if (-1 === pad.indexOf(text.charAt(idx))) {
                break;
            } else {
                ++idx;
            }
        }
        while (idx < text.length) {
            result = baseLength * result + base.indexOf(text.charAt(idx++));
        }
        return result;
    }
    gpf.bin = {
        pow2: function (n) {
            if (31 === n) {
                return _gpfMax31 + 1;
            }
            if (32 === n) {
                return _gpfMax32 + 1;
            }
            if (31 > n) {
                return 1 << n;
            }
            var result = _gpfMax32 + 1;
            n -= 31;
            while (--n) {
                result *= 2;
            }
            return result;
        },
        isPow2: function (value) {
            // http://en.wikipedia.org/wiki/Power_of_two
            if (0 < value && 0 === (value & value - 1)) {
                var result = 0;
                while (1 < value) {
                    ++result;
                    value /= 2;
                }
                return result;
            }
            return -1;
        },
        toHexa: function (value, length, pad) {
            return _gpfToBaseANY(_gpfB16, value, {
                length: length,
                pad: pad
            });
        },
        fromHexa: function (text, pad) {
            return _gpfFromBaseANY(_gpfB16, text, pad);
        },
        toBase64: function (value, length, pad) {
            return _gpfToBaseANY(_gpfB64, value, {
                length: length,
                pad: pad
            });
        },
        fromBase64: function (text, pad) {
            return _gpfFromBaseANY(_gpfB64, text, pad);
        },
        test: function (value, bitmask) {
            return (value & bitmask) === bitmask;
        },
        clear: function (value, bitmask) {
            return value & ~bitmask;
        },
        random: function () {
            _gpfBinZ = 36969 * (_gpfBinZ & 65535) + (_gpfBinZ >> 16) & _gpfMax32;
            _gpfBinW = 18000 * (_gpfBinW & 65535) + (_gpfBinW >> 16) & _gpfMax32;
            return ((_gpfBinZ << 16) + _gpfBinW & _gpfMax32) + _gpfMax31;
        }
    };
    var
        /**
         * The JSON.stringify() method converts a JavaScript value to a JSON string
         *
         * @param {*} value the value to convert to a JSON string
         * @return {String}
         */
        _gpfJsonStringify,
        /**
         * The JSON.parse() method parses a string as JSON
         *
         * @param {*} text The string to parse as JSON
         * @return {Object}
         */
        _gpfJsonParse;
    function _gpfObject2Json(object) {
        var isArray, results, property, value;
        isArray = object instanceof Array;
        results = [];
        /*jshint -W089*/
        // Actually, I want all properties
        for (property in object) {
            if ("function" === typeof object[property]) {
                continue;    // ignore
            }
            value = _gpfJsonStringifyPolyfill(object[property]);
            if (isArray) {
                results.push(value);
            } else {
                results.push(_gpfStringEscapeFor(property, "javascript") + ":" + value);
            }
        }
        if (isArray) {
            return "[" + results.join(",") + "]";
        }
        return "{" + results.join(",") + "}";    /*jshint +W089*/
    }
    function _gpfJsonStringifyObject(object) {
        return object.toString();
    }
    var _gpfJsonStringifyMapping = {
            undefined: _gpfEmptyFunc,
            "function": _gpfEmptyFunc,
            number: _gpfJsonStringifyObject,
            "boolean": _gpfJsonStringifyObject,
            string: function (object) {
                return _gpfStringEscapeFor(object, "javascript");
            }
        };
    /*jshint -W003*/
    // Circular reference _gpfJsonStringifyPolyfill <-> _gpfObject2Json
    function _gpfJsonStringifyPolyfill(object) {
        var mapper = _gpfJsonStringifyMapping[typeof object];
        if (undefined !== mapper) {
            return mapper(object);
        }
        if (null === object) {
            return "null";
        }
        return _gpfObject2Json(object);
    }
    /*jshint +W003*/
    function _gpfJsonParsePolyfill(test) {
        return _gpfFunc("return " + test)();
    }
    // Used only for environments where JSON is not defined
    /* istanbul ignore next */
    if ("undefined" === typeof JSON) {
        _gpfJsonStringify = _gpfJsonStringifyPolyfill;
        _gpfJsonParse = _gpfJsonParsePolyfill;
        // Creates the JSON global object
        _gpfMainContext.JSON = {
            stringify: _gpfJsonStringify,
            parse: _gpfJsonParse
        };
    } else {
        _gpfJsonStringify = JSON.stringify;
        _gpfJsonParse = JSON.parse;
    }
    function _gpfPathDecompose(path) {
        // Split on separator
        if (-1 < path.indexOf("/")) {
            path = path.split("/");
        } else if (-1 < path.indexOf("\\")) {
            // DOS path is case insensitive, hence lowercase it
            path = path.toLowerCase().split("\\");
        } else {
            // TODO what about _gpfDosPath?
            return [path];
        }
        // Remove trailing /
        if (path.length && !path[path.length - 1]) {
            path.pop();
        }
        return path;
    }
    /**
     * Normalize path
     *
     * @param {String} path
     * @return {string}
     */
    function _gpfPathNormalize(path) {
        return _gpfPathDecompose(path).join("/");
    }
    /**
     * Get the last name of a path
     *
     * @param {String} path
     * @return {String}
     */
    function _gpfPathName(path) {
        path = _gpfPathDecompose(path);
        return path[path.length - 1];
    }
    gpf.path = {
        join: function (path) {
            path = _gpfPathDecompose(path);
            var idx, len = arguments.length, relativePath;
            for (idx = 1; idx < len; ++idx) {
                relativePath = _gpfPathDecompose(arguments[idx]);
                while (relativePath[0] === "..") {
                    relativePath.shift();
                    if (path.length) {
                        path.pop();
                    } else {
                        return "";
                    }
                }
                if (relativePath.length) {
                    path = path.concat(relativePath);
                }
            }
            return path.join("/");
        },
        parent: function (path) {
            path = _gpfPathDecompose(path);
            path.pop();
            return path.join("/");
        },
        name: _gpfPathName,
        nameOnly: function (path) {
            var name = _gpfPathName(path), pos = name.lastIndexOf(".");
            if (-1 === pos) {
                return name;
            }
            return name.substr(0, pos);
        },
        extension: function (path) {
            var name = _gpfPathName(path), pos = name.lastIndexOf(".");
            if (-1 === pos) {
                return "";
            }
            return name.substr(pos);
        },
        relative: function (from, to) {
            from = _gpfPathDecompose(from);
            to = _gpfPathDecompose(to);
            var length;
            // First remove identical part
            while (from.length && to.length && from[0] === to[0]) {
                from.shift();
                to.shift();
            }
            // For each remaining part in from, unshift .. in to
            length = from.length + 1;
            while (--length) {
                to.unshift("..");
            }
            return to.join("/");
        }
    };
    function _gpfPatternPartSplit(part) {
        return part.split("*");
    }
    /**
     * @param {String} pattern
     *
     * @class _GpfLikeContext
     * @constructor
     */
    function _GpfPathMatcher(pattern) {
        /*jshint validthis:true*/
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
                _gpfAssert(pattern.charAt(pos - 1) === "/", "** must be preceded by /");
                this.start = pattern.substr(0, pos - 1).split("/").map(_gpfPatternPartSplit);
            }
            if (pos < pattern.length - 2) {
                _gpfAssert(pattern.charAt(pos + 2) === "/", "** must be followed by /");
                this.end = pattern.substr(pos + 3).split("/").map(_gpfPatternPartSplit).reverse();
            }
        }
    }
    /**
     * Convert - if necessary - the pattern parameter
     *
     * @param {_GpfPathMatcher|String} pattern
     * @return {_GpfPathMatcher}
     */
    function _gpfPathMatchCompilePattern(pattern) {
        if (pattern instanceof _GpfPathMatcher) {
            return pattern;
        }
        return new _GpfPathMatcher(pattern);
    }
    /**
     * Convert - if necessary - the pattern parameter
     *
     * @param {Array|String} pattern
     * @return {_GpfPathMatcher[]}
     */
    function _gpfPathMatchCompilePatterns(pattern) {
        if (pattern instanceof Array) {
            return pattern.map(_gpfPathMatchCompilePattern);
        }
        return [_gpfPathMatchCompilePattern(pattern)];
    }
    /**
     * Match a path item
     *
     * @param pathMatcher
     * @this An object containing
     * - {String[]} parts the path being tested split in parts
     * - {Boolean} [result=undefined] result the result
     */
    function _gpfPathMatchApply(pathMatcher) {
        /*jshint validthis:true*/
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
    }
    /**
     * Match the pattern with the path
     * @param {Array|String} pattern
     * @param {String} path
     * @return {Boolean|undefined}
     */
    function _gpfPathMatch(pattern, path) {
        var parts = _gpfPathDecompose(path), matchers = _gpfPathMatchCompilePatterns(pattern), scope = { parts: parts };
        matchers.every(_gpfPathMatchApply, scope);
        return scope.result;
    }
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
        _matchStart: function (context) {
            var parts = context.parts, partsLen = parts.length, startPos = context.startPos, array = this.start, len = array.length, idx;
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
            context.startPos = startPos;
            return undefined;
        },
        _matchEnd: function (context) {
            var parts = context.parts, startPos = context.startPos, endPos = parts.length - 1, array = this.end, len = array.length, idx;
            for (idx = 0; idx < len; ++idx) {
                if (-1 < endPos && this._matchName(array[idx], parts[endPos])) {
                    if (endPos-- < startPos) {
                        return false;
                    }
                } else {
                    return false;
                }
            }
            return undefined;
        },
        match: function (parts) {
            var result, context = {
                    parts: parts,
                    startPos: 0
                };
            if (this.start) {
                result = this._matchStart(context);
                if (undefined !== result) {
                    return result;
                }
            }
            if (this.end) {
                result = this._matchEnd(context);
                if (undefined !== result) {
                    return result;
                }
            }
            return true;
        }
    };
    _gpfExtend(gpf.path, {
        match: function (pattern, path) {
            return _gpfPathMatch(pattern, path) || false;
        },
        compileMatchPattern: function (pattern) {
            return _gpfPathMatchCompilePatterns(pattern);
        }
    });
    gpf.js = {
        keywords: function () {
            return [].concat(_gpfJsKeywords);
        }
    };
    _gpfErrorDeclare("csv", { csvInvalid: "Invalid CSV syntax (bad quote sequence or missing end of file)" });
    var
        // Usual CSV separators
        _gpfCsvSeparators = ";,\t ";
    /**
     * Deduce CSV separator from line (usually, the header)
     *
     * @param {String} header
     * @return {String}
     */
    function _gpfCsvComputeSeparator(header) {
        var len = _gpfCsvSeparators.length, idx, separator;
        for (idx = 0; idx < len; ++idx) {
            separator = _gpfCsvSeparators.charAt(idx);
            if (-1 !== header.indexOf(separator)) {
                return separator;
            }
        }
        // Default
        return _gpfCsvSeparators.charAt(0);
    }
    /**
     * Remove final \r from the line
     *
     * @param {String} line
     * @return {String}
     */
    function _gpfTrimFinalR(line) {
        var len = line.length - 1;
        if ("\r" === line.charAt(len)) {
            return line.substr(0, len);
        }
        return line;
    }
    /**
     * CSV Parser
     *
     * @param {String} content CSV content
     * @param {Object} options
     * - {String} [header=undefined] header
     * - {String} [separator=undefined] separator can be deduced from header
     * - {String} [quote="\""] quote
     * @class {_GpfCsvParse}
     * @constructor
     */
    function _GpfCsvParser(content, options) {
        /*jshint validthis:true*/
        // constructor
        options = options || {};
        // to have at least an empty object
        this._lines = content.split("\n").map(_gpfTrimFinalR);
        var header = options.header || this._lines.shift();
        this._separator = options.separator || _gpfCsvComputeSeparator(header);
        this._quote = options.quote || "\"";
        this._columns = header.split(this._separator);
    }
    _GpfCsvParser.prototype = {
        _lines: [],
        _separator: "",
        _quote: "",
        _columns: [],
        _unquote: function (value) {
            var quote = this._quote, pos = value.indexOf(quote), inQuotedString = true;
            while (-1 < pos) {
                if (pos === value.length - 1) {
                    // Last character of the string
                    value = value.substr(0, pos);
                    inQuotedString = false;
                    break;
                } else if (value.charAt(pos + 1) === quote) {
                    // Double quote means escaped one
                    value = value.substr(0, pos) + value.substr(pos + 1);
                } else {
                    throw gpf.Error.csvInvalid();
                }
                pos = value.indexOf(quote, pos + 1);
            }
            return [
                value,
                inQuotedString
            ];
        },
        _processQuotedLineValue: function (line, idx, flags) {
            var value = line[idx], unQuoted;
            // Concatenate with 'previous' item
            var previousValue = [line[idx - 1]];
            if (flags.includeCarriageReturn) {
                previousValue.push("\r\n");
            } else {
                // part of the escaped string
                previousValue.push(this._separator);
            }
            unQuoted = this._unquote(value);
            previousValue.push(unQuoted[0]);
            flags.inQuotedString = unQuoted[1];
            line[idx - 1] = previousValue.join("");
            flags.includeCarriageReturn = false;
            line.splice(idx, 1);
            return idx;
        },
        _processLineValue: function (line, idx, flags) {
            var value = line[idx], unQuoted;
            if (0 === value.indexOf(this._quote)) {
                flags.inQuotedString = true;
                unQuoted = this._unquote(value.substr(1));
                line[idx] = unQuoted[0];
                flags.inQuotedString = unQuoted[1];
            }
            return idx + 1;
        },
        _processLineValues: function (line, values, flags) {
            var idx;
            if (flags.inQuotedString) {
                flags.includeCarriageReturn = true;
                line.unshift(values.pop());
                // Last value is not completed
                idx = 1;
            } else {
                idx = 0;
                flags.includeCarriageReturn = false;
            }
            while (idx < line.length) {
                if (flags.inQuotedString) {
                    idx = this._processQuotedLineValue(line, idx, flags);
                } else {
                    idx = this._processLineValue(line, idx, flags);
                }
            }
            [].splice.apply(values, [
                values.length,
                0
            ].concat(line));
            return !flags.inQuotedString;
        },
        _readValues: function () {
            var lines = this._lines, separator = this._separator, values = [], flags = {
                    inQuotedString: false,
                    includeCarriageReturn: false
                }, line;
            while (lines.length) {
                line = lines.shift().split(separator);
                if (this._processLineValues(line, values, flags)) {
                    break;
                }
            }
            if (flags.inQuotedString) {
                throw gpf.Error.csvInvalid();
            }
            return values;
        },
        read: function () {
            var values = this._readValues(), record = {};
            this._columns.forEach(function (name, idx) {
                /*gpf:inline(array)*/
                record[name] = values[idx];
            });
            return record;
        },
        readAll: function () {
            var result = [];
            while (this._lines.length) {
                result.push(this.read());
            }
            return result;
        }
    };
    gpf.csv = {
        parse: function (content, options) {
            var csvParser = new _GpfCsvParser(content, options);
            return csvParser.readAll();
        }
    };
    _gpfErrorDeclare("define", {
        "classMemberOverloadWithTypeChange": "You can't overload a member and change its type",
        "classInvalidVisibility": "Invalid visibility keyword"
    });
    //region Helpers shared with attributes.js
    function _gpfEncodeAttributeMember(member) {
        if ("constructor" === member) {
            return "constructor ";
        }
        return member;
    }
    function _gpfDecodeAttributeMember(member) {
        if ("constructor " === member) {
            return "constructor";
        }
        return member;
    }
    //endregion
    //region Class constructor
    var
        // Critical section to prevent constructor call when creating inheritance relationship
        _gpfClassConstructorAllowed = true;
    /**
     * Template for new class constructor
     * - Uses closure to keep track of the class definition
     * - Class name will be injected at the right place
     *
     * @param {_GpfClassDefinition} classDef
     * @return {Function}
     * @closure
     */
    function _gpfNewClassConstructorTpl(classDef) {
        return function () {
            if (classDef.isConstructionAllowed()) {
                classDef._resolvedConstructor.apply(this, arguments);    //eslint-disable-line no-invalid-this
            }
        };
    }
    //endregion
    //region _super method
    /**
     * Detects if the method calls the _super method.
     * The method source is split on the "._super" key and it check first char after to see if it is not an identifier
     * character (meaning it is more than just _super).
     *
     * @param {Function} method
     * @return {Boolean}
     */
    function _gpfUsesSuper(method) {
        var parts = method.toString().split("._super");
        return !parts.every(function (part) {
            /*gpf:inline(array)*/
            return -1 !== _gpfIdentifierOtherChars.indexOf(part.charAt(0));
        });
    }
    /**
     * Generates a closure in which this._super points to the base method of the overridden member
     *
     * @param {Function} superMethod
     * @param {Function} method
     * @return {Function}
     * @closure
     */
    function _gpfGenSuperMember(superMethod, method) {
        return function GpfSuperableMethod() {
            var previousSuper = this._super, result;
            // Add a new ._super() method pointing to the base class member
            this._super = superMethod;
            try {
                // Execute the method
                result = method.apply(this, arguments);
            } finally {
                // Remove it after execution
                /* istanbul ignore else */
                // I don't expect to define a member named _super to avoid confusion
                if (undefined === previousSuper) {
                    delete this._super;
                } else {
                    this._super = previousSuper;
                }
            }
            return result;
        };
    }
    //endregion
    //region Class definition
    var
        // Global dictionary of known class definitions
        _gpfClassDefinitions = {},
        // Unique class definition ID
        _gpfClassDefUID = 0,
        // Tag to associate class definition to class
        _GPF_CLASSDEF_MARKER = "_gpf_" + gpf.bin.toHexa(gpf.bin.random(), 8);
    /**
     * An helper to create class and store its information
     *
     * @param {String|Function} name
     * @param {Function} Super
     * @param {Object} definition
     * @class gpf.ClassDefinition
     * @constructor
     */
    function _GpfClassDefinition(name, Super, definition) {
        /*jshint validthis:true*/
        // constructor
        this._uid = ++_gpfClassDefUID;
        _gpfClassDefinitions[this._uid] = this;
        this._Subs = [];
        if ("function" === typeof name) {
            this._name = name.compatibleName() || "anonymous";
            // TODO how do we grab the parent constructor (?)
            this._Constructor = name;
        } else {
            this._name = name;
            this._Super = Super;
            this._definition = definition;
            this._build();
        }
    }
    /**
     * Retrieves (or allocate) the class definition object
     *
     * @param {Function} constructor Class constructor
     * @return {gpf.ClassDefinition}
     */
    function _gpfGetClassDefinition(constructor) {
        var classDef, uid = constructor[_GPF_CLASSDEF_MARKER];
        if (undefined === uid) {
            classDef = new _GpfClassDefinition(constructor);
            /*gpf:constant*/
            constructor[_GPF_CLASSDEF_MARKER] = classDef._uid;
        } else {
            classDef = _gpfClassDefinitions[uid];
        }
        return classDef;
    }
    var _gpfVisibilityKeywords = "public|protected|private|static".split("|"), _GPF_VISIBILITY_UNKNOWN = -1, _GPF_VISIBILITY_PUBLIC = 0, _GPF_VISIBILITY_PROTECTED = 1,
        //  _GPF_VISIBILITY_PRIVATE     = 2,
        _GPF_VISIBILITY_STATIC = 3;
    _GpfClassDefinition.prototype = {
        constructor: _GpfClassDefinition,
        _uid: 0,
        _name: "",
        _Super: Object,
        _Subs: [],
        _definitionAttributes: null,
        _Constructor: _gpfEmptyFunc,
        _definitionConstructor: null,
        _resolvedConstructor: _gpfEmptyFunc,
        _definition: null,
        isConstructionAllowed: function () {
            return _gpfClassConstructorAllowed;
        },
        addMember: function (member, memberValue, visibility) {
            if (undefined === visibility) {
                visibility = _GPF_VISIBILITY_PUBLIC;
            } else {
                visibility = _gpfVisibilityKeywords.indexOf(visibility);
                if (-1 === visibility) {
                    throw gpf.Error.classInvalidVisibility();
                }
            }
            this._addMember(member, memberValue, visibility);
        },
        _addMember: function (member, memberValue, visibility) {
            if (_GPF_VISIBILITY_STATIC === visibility) {
                _gpfAssert(undefined === this._Constructor[member], "Static members can't be overridden");
                /*gpf:constant*/
                this._Constructor[member] = memberValue;
            } else if ("constructor" === member) {
                this._addConstructor(memberValue, visibility);
            } else {
                this._addNonStaticMember(member, memberValue, visibility);
            }
        },
        _addConstructor: function (memberValue, visibility) {
            _gpfAsserts({
                "Constructor must be a function": "function" === typeof memberValue,
                "Own constructor can't be overridden": null === this._definitionConstructor
            });
            if (_gpfUsesSuper(memberValue)) {
                memberValue = _gpfGenSuperMember(this._Super, memberValue);
            }
            _gpfIgnore(visibility);
            // TODO Handle constructor visibility
            this._definitionConstructor = memberValue;
        },
        _addNonStaticMember: function (member, memberValue, visibility) {
            var newType = typeof memberValue, baseMemberValue, baseType, prototype = this._Constructor.prototype;
            _gpfAssert(!prototype.hasOwnProperty(member), "Existing own member can't be overridden");
            baseMemberValue = this._Super.prototype[member];
            baseType = typeof baseMemberValue;
            if ("undefined" !== baseType) {
                if (null !== baseMemberValue && newType !== baseType) {
                    throw gpf.Error.classMemberOverloadWithTypeChange();
                }
                if ("function" === newType && _gpfUsesSuper(memberValue)) {
                    memberValue = _gpfGenSuperMember(baseMemberValue, memberValue);
                }
            }
            _gpfIgnore(visibility);
            // TODO Handle constructor visibility
            prototype[member] = memberValue;
        },
        _filterAttribute: function (member, memberValue) {
            var attributeArray;
            if ("[" !== member.charAt(0) || "]" !== member.charAt(member.length - 1)) {
                return false;
            }
            member = _gpfEncodeAttributeMember(member.substr(1, member.length - 2));
            // Extract & encode member name
            if (this._definitionAttributes) {
                attributeArray = this._definitionAttributes[member];
            } else {
                this._definitionAttributes = {};
            }
            if (undefined === attributeArray) {
                attributeArray = [];
            }
            this._definitionAttributes[member] = attributeArray.concat(memberValue);
            return true;
        },
        _defaultVisibility: _GPF_VISIBILITY_UNKNOWN,
        _deduceVisibility: function (memberName) {
            var visibility = this._defaultVisibility;
            if (_GPF_VISIBILITY_UNKNOWN === visibility) {
                if (memberName.charAt(0) === "_") {
                    visibility = _GPF_VISIBILITY_PROTECTED;
                } else {
                    visibility = _GPF_VISIBILITY_PUBLIC;
                }
            }
            return visibility;
        },
        _processDefinitionMember: function (memberValue, memberName) {
            if (this._filterAttribute(memberName, memberValue)) {
                return;
            }
            var newVisibility = _gpfVisibilityKeywords.indexOf(memberName);
            if (_GPF_VISIBILITY_UNKNOWN === newVisibility) {
                return this._addMember(memberName, memberValue, this._deduceVisibility(memberName));
            }
            if (_GPF_VISIBILITY_UNKNOWN !== this._defaultVisibility) {
                throw gpf.Error.classInvalidVisibility();
            }
            this._processDefinition(memberValue, newVisibility);
        },
        _processDefinition: function (definition, visibility) {
            this._defaultVisibility = visibility;
            _gpfObjectForEach(definition, this._processDefinitionMember, this);
            /*gpf:inline(object)*/
            this._defaultVisibility = _GPF_VISIBILITY_UNKNOWN;
            /* istanbul ignore next */
            // WSCRIPT specific
            // 2014-05-05 #14
            if (_GPF_HOST_WSCRIPT === _gpfHost && definition.constructor !== Object) {
                this._addConstructor(definition.constructor, this._defaultVisibility);
            }
        },
        _processAttributes: function () {
            var attributes = this._definitionAttributes, Constructor, newPrototype;
            if (attributes) {
                _gpfAssert("function" === typeof _gpfAttributesAdd, "Attributes can't be defined before they exist");
                Constructor = this._Constructor;
                newPrototype = Constructor.prototype;
                _gpfObjectForEach(attributes, function (attributeList, attributeName) {
                    /*gpf:inline(object)*/
                    attributeName = _gpfDecodeAttributeMember(attributeName);
                    if (attributeName in newPrototype || attributeName === "Class") {
                        _gpfAttributesAdd(Constructor, attributeName, attributeList);
                    } else {
                        // 2013-12-15 ABZ Exceptional, trace it only
                        console.error("gpf.define: Invalid attribute name '" + attributeName + "'");
                    }
                });
            }
        },
        _getNewClassConstructor: function (name) {
            var builder = new _GpfFunctionBuilder(_gpfNewClassConstructorTpl);
            builder.replaceInBody({ "function": "function " + name });
            return builder.generate()(this);
        },
        _safeNewSuper: function () {
            var result;
            _gpfClassConstructorAllowed = false;
            result = new this._Super();
            _gpfClassConstructorAllowed = true;
            return result;
        },
        _build: function () {
            var newClass, newPrototype, baseClassDef, constructorName;
            // Build the function name for the constructor
            constructorName = this._name.split(".").pop();
            // The new class constructor
            newClass = this._getNewClassConstructor(constructorName);
            /*gpf:constant*/
            this._Constructor = newClass;
            /*gpf:constant*/
            newClass[_GPF_CLASSDEF_MARKER] = this._uid;
            // Basic JavaScript inheritance mechanism: Defines the newClass prototype as an instance of the super class
            newPrototype = this._safeNewSuper();
            // Populate our constructed prototype object
            newClass.prototype = newPrototype;
            // Enforce the constructor to be what we expect
            newPrototype.constructor = newClass;
            /*
             * Defines the link between this class and its base one
             * (It is necessary to do it here because of the gpf.addAttributes that will test the parent class)
             */
            baseClassDef = _gpfGetClassDefinition(this._Super);
            baseClassDef._Subs.push(newClass);
            /*
             * 2014-04-28 ABZ Changed again from two passes on all members to two passes in which the first one also
             * collects attributes to simplify the second pass.
             */
            this._processDefinition(this._definition, _GPF_VISIBILITY_UNKNOWN);
            this._processAttributes();
            // Optimization for the constructor
            this._resolveConstructor();
        },
        _resolveConstructor: function () {
            if (this._definitionConstructor) {
                this._resolvedConstructor = this._definitionConstructor;
            } else if (Object !== this._Super) {
                this._resolvedConstructor = this._Super;
            }
        }
    };
    //endregion
    //region define
    /**
     * Defines a new class by setting a contextual name
     *
     * @param {String} name New class contextual name
     * @param {String} base Base class contextual name
     * @param {Object} definition Class definition
     * @return {Function}
     */
    function _gpfDefineCore(name, base, definition) {
        _gpfAsserts({
            "name is required (String)": "string" === typeof name,
            "base is required (String|Function)": "string" === typeof base || base instanceof Function,
            "definition is required (Object)": "object" === typeof definition
        });
        var result, path, ns, leafName, classDef;
        if (-1 < name.indexOf(".")) {
            path = name.split(".");
            leafName = path.pop();
            ns = _gpfContext(path, true);
        }
        if ("string" === typeof base) {
            // Convert base into the function
            base = _gpfContext(base.split("."));
            _gpfAssert(base instanceof Function, "base must resolve to a function");
        }
        classDef = new _GpfClassDefinition(name, base, definition);
        result = classDef._Constructor;
        if (undefined !== ns) {
            ns[leafName] = result;
        }
        return result;
    }
    // Replace the shortcut with the correct property name
    function _gpfCleanDefinition(name, shortcut) {
        /*jshint validthis:true*/
        // Bound to the definition below
        var shortcutValue = this[shortcut];
        if (undefined !== shortcutValue) {
            this[name] = shortcutValue;
            delete this[shortcut];
        }
    }
    var _gpfCleaningShortcuts = {
            "-": "private",
            "#": "protected",
            "+": "public",
            "~": "static"
        };
    /**
     * @inheritdoc _gpfDefineCore
     * Provides shortcuts for visibility:
     * - "-" for private
     * - "#" for protected
     * - "+" for public
     * - "~" for static
     */
    function _gpfDefine(name, base, definition) {
        _gpfObjectForEach(_gpfCleaningShortcuts, _gpfCleanDefinition, definition);
        return _gpfDefineCore(name, base, definition);
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
        if ("object" === typeof base) {
            definition = base;
            base = undefined;
        }
        if (undefined === base) {
            base = Object;    // Root class
        }
        return _gpfDefineCore(name, base, definition || {});
    };
    /**
     * Allocate a new class handler that is specific to a class type (used for interfaces & attributes)
     *
     * @param {String} ctxRoot Default context root (for intance: gpf.interfaces)
     * @param {String} defaultBase Default contextual root class (for instance: Interface)
     * @return {Function}
     * @closure
     */
    function _gpfGenDefHandler(ctxRoot, defaultBase) {
        ctxRoot += ".";
        defaultBase = ctxRoot + defaultBase;
        return function (name, base, definition) {
            if (undefined === definition && "object" === typeof base) {
                definition = base;
                base = defaultBase;
            }
            if (-1 === name.indexOf(".")) {
                name = ctxRoot + name;
            }
            return _gpfDefine(name, base || defaultBase, definition || {});
        };
    }    //endregion
    _GpfClassDefinition.prototype._attributes = null;
    var
        // gpf.attributes shortcut
        _gpfA = gpf.attributes = {},
        /**
         * Used for empty members
         *
         * @type {gpf.attributes.Array}
         */
        _gpfEmptyMemberArray;
    /**
     * Generates a factory capable of creating a new instance of a class
     *
     * @param {Function} objectClass Object constructor
     * @param {String} name Alias name (will be prefixed by $)
     * @closure
     */
    function _gpfAlias(objectClass, name) {
        name = "$" + name;
        gpf[name] = function () {
            var Proxy = _gpfFunc("return function " + name + "(args) {this.constructor.apply(this, args);};")();
            Proxy.prototype = objectClass.prototype;
            return function () {
                return new Proxy(arguments);
            };
        }();
    }
    // gpf.interfaces.IReadOnlyArray#getItemsCount factory
    function _gpfIArrayGetItemsCount(member) {
        return _gpfFunc("return this." + member + ".length;");
    }
    // gpf.interfaces.IReadOnlyArray#getItem factory
    function _gpfIArrayGetItem(member) {
        return _gpfFunc(["idx"], "return this." + member + "[idx];");
    }
    /**
     * gpf.define handler for attributes
     *
     * @type {Function}
     */
    var _gpfDefAttrBase = _gpfGenDefHandler("gpf.attributes", "Attribute");
    /**
     * gpf.define for attributes
     *
     * @param {String} name Attribute name. If it contains a dot, it is treated as absolute contextual.
     * Otherwise, it is relative to "gpf.attributes". If starting with $ (and no dot), the contextual name will be the
     * "gpf.attributes." + name(without $) + "Attribute" and an alias is automatically created
     * @param {Function|string} [base=undefined] base Base attribute (or contextual name)
     * @param {Object} [definition=undefined] definition Attribute definition
     * @return {Function}
     */
    function _gpfDefAttr(name, base, definition) {
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
    }
    /**
     * Base class for any attribute
     *
     * @class gpf.attributes.Attribute
     */
    var _gpfAttribute = _gpfDefine("gpf.attributes.Attribute", Object, {
            "#": {
                _member: "",
                _alterPrototype: function (objPrototype) {
                    _gpfIgnore(objPrototype);
                }
            },
            "+": {
                getMemberName: function () {
                    return this._member;
                }
            }
        });
    var _gpfAssertAttributeClassOnly, _gpfAssertAttributeOnly;
    // DEBUG specifics
    _gpfAssertAttributeClassOnly = function (value) {
        _gpfAsserts({
            "Expected a class parameter": "function" === typeof value,
            "Expected an Attribute-like class parameter": value.prototype instanceof _gpfAttribute
        });
    };
    _gpfAssertAttributeOnly = function (value) {
        _gpfAssert(value instanceof _gpfAttribute, "Expected an Attribute-like parameter");
    };
    /* istanbul ignore if */
    // Because tested in DEBUG
    if (!_gpfAssertAttributeClassOnly) {
    }
    /**
     * Attribute array, generally used to list attributes on a class member
     *
     * @class gpf.attributes.Array
     */
    _gpfDefine("gpf.attributes.Array", Object, {
        "-": { _array: [] },
        "+": {
            constructor: function () {
                this._array = [];    // Create a new instance of the array
            },
            getItemsCount: _gpfIArrayGetItemsCount("_array"),
            getItem: _gpfIArrayGetItem("_array"),
            has: function (expectedClass) {
                _gpfAssertAttributeClassOnly(expectedClass);
                return !this._array.every(function (attribute) {
                    /*gpf:inline(array)*/
                    return !(attribute instanceof expectedClass);
                });
            },
            filter: function (expectedClass) {
                _gpfAssertAttributeClassOnly(expectedClass);
                var result = new _gpfA.Array();
                result._array = this._array.filter(function (attribute) {
                    /*gpf:inline(array)*/
                    return attribute instanceof expectedClass;
                });
                return result;
            },
            forEach: function (callback, thisArg) {
                this._array.forEach(callback, thisArg);    /*gpf:inline(array)*/
            },
            every: function (callback, thisArg) {
                return this._array.every(callback, thisArg);    /*gpf:inline(array)*/
            }
        }
    });
    _gpfEmptyMemberArray = new _gpfA.Array();
    /**
     * Attribute map, generally used to list attributes of a class.
     *
     * There are two known particular cases:
     * - constructor: added as "constructor " to avoid collisions with JS member (wscript)
     * - Class: that represents class attributes
     *
     * @class gpf.attributes.Map
     */
    _gpfDefine("gpf.attributes.Map", Object, {
        "-": {
            _members: {},
            _count: 0,
            _copy: function (to, callback, param) {
                _gpfObjectForEach(this._members, function (attributeArray, member) {
                    /*gpf:inline(object)*/
                    member = _gpfDecodeAttributeMember(member);
                    attributeArray._array.forEach(function (attribute) {
                        /*gpf:inline(array)*/
                        if (!callback || callback(member, attribute, param)) {
                            to.add(member, attribute);
                        }
                    });
                });
                return to;
            },
            _filterCallback: function (member, attribute, expectedClass) {
                _gpfIgnore(member);
                return attribute instanceof expectedClass;
            }
        },
        "+": {
            constructor: function (object) {
                this._members = {};
                if (object instanceof Function) {
                    this.fillFromClassDef(_gpfGetClassDefinition(object));
                } else if (undefined !== object) {
                    this.fillFromObject(object);
                }
            },
            fillFromClassDef: function (classDef) {
                var attributes, Super;
                while (classDef) {
                    // !undefined && !null
                    attributes = classDef._attributes;
                    if (attributes) {
                        attributes._copy(this);
                    }
                    Super = classDef._Super;
                    if (Super === Object) {
                        // Can't go upper
                        break;
                    } else {
                        classDef = _gpfGetClassDefinition(Super);
                    }
                }
                return this;
            },
            fillFromObject: function (object) {
                var classDef = _gpfGetClassDefinition(object.constructor);
                return this.fillFromClassDef(classDef);
            },
            getCount: function () {
                return this._count;
            },
            add: function (member, attribute) {
                _gpfAssertAttributeOnly(attribute);
                member = _gpfEncodeAttributeMember(member);
                var array = this._members[member];
                if (undefined === array) {
                    array = this._members[member] = new _gpfA.Array();
                }
                array._array.push(attribute);
                ++this._count;
            },
            filter: function (expectedClass) {
                _gpfAssertAttributeClassOnly(expectedClass);
                return this._copy(new _gpfA.Map(), this._filterCallback, expectedClass);
            },
            getMemberAttributes: function (member) {
                member = _gpfEncodeAttributeMember(member);
                var result = this._members[member];
                if (undefined === result || !(result instanceof _gpfA.Array)) {
                    return _gpfEmptyMemberArray;
                }
                return result;
            },
            getMembers: function () {
                var result = [];
                _gpfObjectForEach(this._members, function (attributes, member) {
                    /*gpf:inline(object)*/
                    _gpfIgnore(attributes);
                    result.push(_gpfDecodeAttributeMember(member));
                });
                return result;
            },
            forEach: function (callback, thisArg) {
                _gpfObjectForEach(this._members, function (attributes, member, dictionary) {
                    /*gpf:inline(object)*/
                    callback.apply(thisArg, [
                        attributes,
                        _gpfDecodeAttributeMember(member),
                        dictionary
                    ]);
                });
            }
        }
    });
    /**
     * Add the attribute list to the given prototype associated with the provided member name
     *
     * @param {Function} objectClass class constructor
     * @param {String} name member name
     * @param {gpf.attributes.Array|gpf.attributes.Attribute|gpf.attributes.Attribute[]} attributes
     */
    var _gpfAttributesAdd = _gpfA.add = function (objectClass, name, attributes) {
            // Check attributes parameter
            if (attributes instanceof _gpfA.Array) {
                attributes = attributes._array;
            } else if (!(attributes instanceof Array)) {
                attributes = [attributes];
            }
            var classDef = _gpfGetClassDefinition(objectClass), objectClassOwnAttributes = classDef._attributes, len, idx, attribute;
            if (!objectClassOwnAttributes) {
                objectClassOwnAttributes = classDef._attributes = new _gpfA.Map();
            }
            len = attributes.length;
            for (idx = 0; idx < len; ++idx) {
                attribute = attributes[idx];
                _gpfAssert(attribute instanceof _gpfAttribute, "Expected attribute");
                attribute._member = name;
                // Assign member name
                objectClassOwnAttributes.add(name, attribute);
                attribute._alterPrototype(objectClass.prototype);
            }
        };
    _gpfErrorDeclare("a_attributes", {
        onlyForAttributeClass: "The attribute {attributeName} can be used only on an Attribute class",
        onlyOnClassForAttributeClass: "The attribute {attributeName} must be used on Class",
        classOnlyAttribute: "The attribute {attributeName} can be used only for Class",
        memberOnlyAttribute: "The attribute {attributeName} can be used only for members",
        uniqueAttributeConstraint: "Attribute {attributeName} already defined on {className}",
        uniqueMemberAttributeConstraint: "Attribute {attributeName} already defined on {className}::{memberName}"
    });
    /* istanbul ignore next */
    // Abstract method
    /**
     * Throws an exception if target attribute can't be applied to objPrototype
     *
     * @param {gpf.attributes.Attribute} targetAttribute
     * @param {Object} objPrototype
     */
    function _GpfAttrOnlyCheck(targetAttribute, objPrototype) {
        _gpfIgnore(targetAttribute, objPrototype);
        throw gpf.Error.abstractMethod();
    }
    var
        /**
         * Restricts the usage of an attribute to an attribute class only
         *
         * @class gpf.attributes.AttrClassOnlyAttribute
         * @extends gpf.attributes.Attribute
         */
        _GpfAttrOnly = _gpfDefAttr("AttrClassOnlyAttribute", {
            "#": {
                _alterPrototype: function (objPrototype) {
                    if (!(objPrototype instanceof _gpfAttribute)) {
                        throw gpf.Error.onlyForAttributeClass({ attributeName: _gpfGetClassDefinition(this.constructor)._name });
                    }
                    if (this._member !== "Class") {
                        throw gpf.Error.onlyOnClassForAttributeClass({ attributeName: _gpfGetClassDefinition(this.constructor)._name });
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
            "~": { originalAlterPrototype: "_alterPrototype:checked" },
            "-": {
                _checkAndAlterPrototype: function (objPrototype) {
                    var me = this, statics = _gpfA.AttrConstraintAttribute, originalAlterPrototype = statics.originalAlterPrototype, attributes = new _gpfA.Map(me);
                    // Get constraints set for THIS attribute
                    attributes.filter(_gpfAttrConstraint).forEach(function (constraintAttributes) {
                        constraintAttributes.forEach(function (attribute) {
                            attribute._check(me, objPrototype);
                        });
                    });
                    // OK, call _alterPrototype
                    me[originalAlterPrototype](objPrototype);
                }
            },
            "#": {
                _check: _GpfAttrOnlyCheck,
                _alterPrototype: function (objPrototype) {
                    var statics = _gpfA.AttrConstraintAttribute, originalAlterPrototype = statics.originalAlterPrototype;
                    // Inherited method will take care of checking attribute class
                    this._super(objPrototype);
                    /**
                     * Several constraint attributes might be defined, check if the _alterPrototype has already been
                     * overridden
                     */
                    if (undefined === objPrototype[originalAlterPrototype]) {
                        objPrototype[originalAlterPrototype] = objPrototype._alterPrototype;
                        objPrototype._alterPrototype = this._checkAndAlterPrototype;
                    }
                }
            }
        });
    /**
     * Used on attribute classes to mark them as class attribute (i.e. they can't be used on members)
     *
     * @class gpf.attributes.ClassAttributeAttribute
     * @extends gpf.attributes.AttrConstraintAttribute
     * @alias gpf.$ClassAttribute
     */
    _gpfDefAttr("$ClassAttribute", _gpfAttrConstraint, {
        "#": {
            _check: function (targetAttribute, objPrototype) {
                _gpfIgnore(objPrototype);
                if (targetAttribute._member !== "Class") {
                    var attributeClass = targetAttribute.constructor, attributeClassDef = _gpfGetClassDefinition(attributeClass);
                    throw gpf.Error.classOnlyAttribute({ attributeName: attributeClassDef._name });
                }
            }
        }
    });
    /**
     * Used on attribute classes to mark them as member attribute (i.e. they can't be used on Class)
     *
     * @class gpf.attributes.MemberAttributeAttribute
     * @extends gpf.attributes.AttrConstraintAttribute
     * @alias gpf.$MemberAttribute
     */
    _gpfDefAttr("$MemberAttribute", _gpfAttrConstraint, {
        "#": {
            _check: function (targetAttribute, objPrototype) {
                _gpfIgnore(objPrototype);
                if (targetAttribute._member === "Class") {
                    var attributeClass = targetAttribute.constructor, attributeClassDef = _gpfGetClassDefinition(attributeClass);
                    throw gpf.Error.memberOnlyAttribute({ attributeName: attributeClassDef._name });
                }
            }
        }
    });
    /**
     * Used on attribute classes to mark them as unique through the class hierarchy or per member.
     * If one try to define it more than once, an error is raised
     *
     * @class gpf.attributes.UniqueAttributeAttribute
     * @extends gpf.attributes.AttrConstraintAttribute
     * @alias gpf.$UniqueAttribute
     */
    _gpfDefAttr("$UniqueAttribute", _gpfAttrConstraint, {
        "-": { _classScope: true },
        "#": {
            _check: function (targetAttribute, objPrototype) {
                var objectClass, objectClassDef, objectClassAttributes, attributeClass, attributeClassDef, attributesInObj, member = targetAttribute._member;
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
                    if (1 < attributesInObj.getCount()) {
                        throw gpf.Error.uniqueAttributeConstraint({
                            attributeName: attributeClassDef._name,
                            className: objectClassDef._name
                        });
                    }
                } else if (1 < attributesInObj.getMemberAttributes(member).getItemsCount()) {
                    throw gpf.Error.uniqueMemberAttributeConstraint({
                        attributeName: attributeClassDef._name,
                        className: objectClassDef._name,
                        memberName: member
                    });
                }
            }
        },
        "+": {
            constructor: function (classScope) {
                if (undefined !== classScope) {
                    this._classScope = true === classScope;
                }
            }
        }
    });
    var
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
     * Read-only property accessor template
     *
     * @returns {*}
     * @this instance
     */
    function _gpfGetProperty() {
        /*jshint validthis:true*/
        return this._MEMBER_;
    }
    /**
     * Property accessor template
     *
     * @returns {*} former value
     * @this instance
     */
    function _gpfSetProperty(value) {
        /*jshint validthis:true*/
        var result = this._MEMBER_;
        this._MEMBER_ = value;
        return result;
    }
    /**
     * Builds a new property function
     *
     * @param {Boolean} template Template to be used
     * @param {String} member Value of _MEMBER_
     * @return {Function}
     */
    function _gpfBuildPropertyFunc(template, member) {
        var src, params, start, end;
        // Replace all occurrences of _MEMBER_ with the right name
        src = template.toString().split("_MEMBER_").join(member);
        // Extract parameters
        start = src.indexOf("(") + 1;
        end = src.indexOf(")", start) - 1;
        params = src.substr(start, end - start + 1).split(",").map(function (name) {
            return name.trim();
        });
        // Extract body
        start = src.indexOf("{") + 1;
        end = src.lastIndexOf("}") - 1;
        src = src.substr(start, end - start + 1);
        return _gpfFunc(params, src);
    }
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
        "-": {
            _writeAllowed: false,
            _publicName: undefined,
            _visibility: undefined
        },
        "#": {
            _alterPrototype: function (objPrototype) {
                var member = this._member, name = this._publicName, visibility = this._visibility, classDef = _gpfGetClassDefinition(objPrototype.constructor);
                if (!name) {
                    if ("_" === member.charAt(0)) {
                        name = member.substr(1);    // starts with _
                    } else {
                        name = member;
                    }
                }
                name = _gpfStringCapitalize(name);
                if (this._writeAllowed) {
                    classDef.addMember("set" + name, _gpfBuildPropertyFunc(_gpfSetProperty, member), visibility);
                }
                classDef.addMember("get" + name, _gpfBuildPropertyFunc(_gpfGetProperty, member), visibility);
            }
        },
        "+": {
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
    /* istanbul ignore next */
    // Used internally
    /**
     * Defines a class extension (internal)
     *
     * @param {String} ofClass
     * @param {String} [publicName=undefined] publicName When not specified, the original method name is used
     *
     * @class gpf.attributes.ClassExtensionAttribute
     * @extends gpf.attributes._gpfClassAttribute
     * @alias gpf.$ClassExtension
     */
    _gpfDefAttr("$ClassExtension", _gpfClassAttribute, {
        "-": {
            _ofClass: _gpfEmptyFunc,
            _publicName: ""
        },
        "+": {
            constructor: function (ofClass, publicName) {
                this._ofClass = ofClass;
                if ("string" === typeof publicName) {
                    this._publicName = publicName;
                }
            }
        }
    });
    _gpfErrorDeclare("interfaces", { interfaceExpected: "Expected interface not implemented: {name}" });
    /**
     * Verify that the object implements the current interface
     *
     * @param {Object} inspectedObject object (or class) to inspect
     * @param {gpf.interfaces.Interface} interfaceDefinition reference interface
     * @return {Boolean}
     */
    function _gpfIsImplementedBy(inspectedObject, interfaceDefinition) {
        var member, memberReference, memberValue, memberType;
        /*
         * IMPORTANT note: we test the object itself (i.e. own members and the prototype).
         * That's why the hasOwnProperty is skipped
         */
        /*jslint forin:true*/
        for (member in interfaceDefinition.prototype) {
            if ("constructor" === member) {
                // Object
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
        return true;
    }
    var
        /**
         * gpf.attributes shortcut
         *
         * @type {Object}
         * @private
         */
        _gpfI = gpf.interfaces = {
            isImplementedBy: function (inspectedObject, interfaceDefinition) {
                if (inspectedObject instanceof Function) {
                    inspectedObject = inspectedObject.prototype;
                }
                return _gpfIsImplementedBy(inspectedObject, interfaceDefinition);
            },
            query: function (objectInstance, interfaceDefinition, throwError) {
                var result = null;
                if (_gpfIsImplementedBy(objectInstance, interfaceDefinition)) {
                    return objectInstance;
                } else if (_gpfIsImplementedBy(objectInstance, gpf.interfaces.IUnknown)) {
                    result = objectInstance.queryInterface(interfaceDefinition);
                }
                if (null === result && (undefined === throwError || throwError)) {
                    throw gpf.Error.interfaceExpected({ name: _gpfGetClassDefinition(interfaceDefinition)._name });
                }
                return result;
            }
        };
    /**
     * Defines an interface (relies on gpf.define)
     *
     * @param {String} name Interface name. If it contains a dot, it is treated as absolute contextual.
     * Otherwise, it is relative to "gpf.interfaces"
     * @param {Function|string} [base=undefined] base Base interface (or contextual name)
     * @param {Object} [definition=undefined] definition Interface definition
     * @return {Function}
     */
    var _gpfDefIntrf = _gpfGenDefHandler("gpf.interfaces", "Interface");
    /**
     * Base class for any interface
     *
     * @class gpf.interfaces.Interface
     */
    _gpfDefine("gpf.interfaces.Interface", Object, {});
    //region IEventTarget
    /* istanbul ignore next */
    // Interface
    _gpfDefIntrf("IEventDispatcher", {
        addEventListener: function (event, eventsHandler) {
            _gpfIgnore(event, eventsHandler);
            return this;
        },
        removeEventListener: function (event, eventsHandler) {
            _gpfIgnore(event, eventsHandler);
            return this;
        },
        dispatchEvent: function (event, params) {
            _gpfIgnore(event, params);
        }
    });
    //endregion
    //region IUnknown
    /* istanbul ignore next */
    // Interface
    /**
     * Provide a way for any object to implement an interface using an intermediate object (this avoids overloading the
     * object with temporary / useless members)
     */
    var _gpfIUnknown = _gpfDefIntrf("IUnknown", {
            queryInterface: function (interfaceDefinition) {
                _gpfIgnore(interfaceDefinition);
                return null;
            }
        });
    //endregion
    //region InterfaceImplement attribute
    /**
     * Retrieves an object supporting the provided interface (maybe the object itself).
     * This function (added to any object declaring the attribute InterfaceImplementAttribute with a builder) uses the
     * InterfaceImplementAttribute attribute list to see if the one corresponding to the interface provides a builder and
     * calls it
     *
     * @param {gpf.interfaces.Interface} interfaceDefinition The expected interface
     * @return {Object|null} The object supporting the interface (or null)
     */
    function _queryInterface(interfaceDefinition) {
        /*jshint validthis:true*/
        // Called with apply
        var array = new gpf.attributes.Map(this).getMemberAttributes("Class").filter(gpf.attributes.InterfaceImplementAttribute), builder;
        if (!array.every(function (attribute) {
                builder = attribute._builder;
                return attribute._interfaceDefinition !== interfaceDefinition || !builder;
            })) {
            if ("function" === typeof builder) {
                return builder(this);
            }
            // Expects a member name
            return this[builder]();
        }
        // Otherwise
        return null;
    }
    /**
     * Creates a wrapper calling _queryInterface and, if no result is built, the original one defined in the object
     * prototype
     *
     * @param {Function} orgQueryInterface
     * @closure
     */
    function _wrapQueryInterface(orgQueryInterface) {
        /**
         * @inheritdoc gpf.interfaces.IUnknown#queryInterface
         * @this
         */
        return function (interfaceDefinition) {
            _gpfIgnore(interfaceDefinition);
            var result = _queryInterface.apply(this, arguments);
            if (null === result) {
                result = orgQueryInterface.apply(this, arguments);
            }
            return result;
        };
    }
    /**
     * Document the class by telling the interface is implemented and may provide a builder to access it
     *
     * @param {Function} interfaceDefinition Implemented interface definition
     * @param {Function|String} [queryInterfaceBuilder=undefined] queryInterfaceBuilder Function or member name to executed
     * if the implemented interface is requested
     *
     * @class gpf.attributes.InterfaceImplementAttribute
     * @extends gpf.attributes.ClassAttribute
     * @alias gpf.$InterfaceImplement
     */
    _gpfDefAttr("$InterfaceImplement", {
        "-": {
            "[_interfaceDefinition]": [gpf.$ClassProperty(false)],
            _interfaceDefinition: _gpfEmptyFunc,
            "[_builder]": [gpf.$ClassProperty(false)],
            _builder: null,
            _addMissingInterfaceMembers: function (objPrototype) {
                var iProto = this._interfaceDefinition.prototype, member;
                // Fill the missing methods
                /*jslint forin:true*/
                // Wants inherited members too
                for (member in iProto) {
                    if (!(member in objPrototype)) {
                        objPrototype[member] = iProto[member];
                    }
                }
            },
            _addQueryInterface: function (objPrototype) {
                if (undefined === objPrototype.queryInterface) {
                    objPrototype.queryInterface = _queryInterface;
                    _gpfAttributesAdd(objPrototype.constructor, "Class", [gpf.$InterfaceImplement(_gpfIUnknown)]);
                } else if (_queryInterface !== objPrototype.queryInterface) {
                    /*
                     * Two situations here:
                     * - Either the class (or one of its parent) already owns the $InterfaceImplement attribute
                     * - Or the class (or one of its parent) implements its own queryInterface
                     * In that last case, wrap it to use the attribute version first
                     *
                     * In both case, we take the assumption that the class already owns
                     * gpf.$InterfaceImplement(gpf.interfaces.IUnknown)
                     */
                    objPrototype.queryInterface = _wrapQueryInterface(objPrototype.queryInterface);
                }
            }
        },
        "#": {
            _alterPrototype: function (objPrototype) {
                if (this._builder) {
                    this._addQueryInterface(objPrototype);
                } else {
                    this._addMissingInterfaceMembers(objPrototype);
                    // Get the interface's attributes apply them to the obj
                    new gpf.attributes.Map().fillFromClassDef(_gpfGetClassDefinition(this._interfaceDefinition)).forEach(function (attributes, member) {
                        _gpfAttributesAdd(objPrototype.constructor, member, attributes);
                    });
                }
            }
        },
        "+": {
            constructor: function (interfaceDefinition, queryInterfaceBuilder) {
                this._interfaceDefinition = interfaceDefinition;
                if (queryInterfaceBuilder) {
                    this._builder = queryInterfaceBuilder;
                }
            }
        }
    });    //endregion
    _gpfErrorDeclare("i_enumerator", { enumerableInvalidMember: "$Enumerator can be associated to arrays only" });
    /**
     * Enumerates all elements of the enumerator and call the callback function.
     *
     * NOTE: reset is *not* called.
     * NOTE: if an error occurs during the enumeration, the process stops
     *
     * @param {gpf.interfaces.IEnumerator} enumerator
     * @param {Function} callback receive each item of the enumerator, signature is either:
     * - {*} element
     * or
     * - {*} element
     * - {gpf.events.Handler} eventsHandler
     *
     * If the signature supports two parameter, the last one will be used to control the iteration.
     * The callback function has to trigger
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
    // TODO secure callback to throw an ERROR event if any exception occur
    // "[each]": [gpf.$ClassEventHandler()],
    function _gpfEnumeratorEach(enumerator, callback, eventsHandler) {
        var iEnumerator = _gpfI.query(enumerator, _gpfI.IEnumerator), process;
        function end(event) {
            _gpfEventsFire.apply(enumerator, [
                event,
                {},
                eventsHandler
            ]);
        }
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
                    return end(event);
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
    /**
     * Builds an enumerable interface based on an array
     *
     * @param {Object[]} array Base of the enumeration
     * @return {Object} Object implementing the IEnumerable interface
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
                return array[pos];
            }
        };
    }
    /* istanbul ignore next */
    // Interface
    /**
     * Enumerable interface
     *
     * @class gpf.interfaces.IEnumerator
     * @extends gpf.interfaces.Interface
     */
    _gpfDefIntrf("IEnumerator", {
        reset: function () {
        },
        "[moveNext]": [gpf.$ClassEventHandler()],
        moveNext: function (eventsHandler) {
            _gpfIgnore(eventsHandler);
            return false;
        },
        current: function () {
            return null;
        },
        "~": {
            each: _gpfEnumeratorEach,
            fromArray: _gpfArrayEnumerator
        }
    });
    /**
     * Interface builder that connects to the EnumerableAttribute attribute
     *
     * @param {Object} object
     * @return {Object} Object implementing the IEnumerable interface
     */
    function _buildEnumeratorOnObjectArray(object) {
        var attributes = new _gpfA.Map(object).filter(_gpfA.EnumerableAttribute), members = attributes.getMembers();
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
        _alterPrototype: function (objPrototype) {
            if (!_gpfIsArrayLike(objPrototype[this._member])) {
                throw gpf.Error.enumerableInvalidMember();
            }
            _gpfAttributesAdd(objPrototype.constructor, "Class", [new _gpfA.InterfaceImplementAttribute(_gpfI.IEnumerator, _buildEnumeratorOnObjectArray)]);
        }
    });
    var iROArray = _gpfDefIntrf("IReadOnlyArray", {
            getItemsCount: function () {
                return 0;
            },
            getItem: function (idx) {
                _gpfIgnore(idx);
                return undefined;
            }
        });
    /* istanbul ignore next */
    // Interface
    /**
     * Mutable array interface
     *
     * @class gpf.interfaces.IArray
     * @extends gpf.interfaces.IReadOnlyArray
     */
    _gpfDefIntrf("IArray", iROArray, {
        setItemsCount: function (count) {
            _gpfIgnore(count);
            return 0;
        },
        setItem: function (idx, value) {
            _gpfIgnore(idx, value);
            return undefined;
        }
    });
    /**
     * Extend the class to provide an array-like interface
     *
     * @param {Boolean} [writeAllowed=false] writeAllowed Switch between read only array and writable one
     *
     * @class gpf.attributes.ClassArrayInterfaceAttribute
     * @extends gpf.attributes.ClassAttribute
     * @alias gpf.$ClassIArray
     */
    _gpfDefAttr("$ClassIArray", _gpfA.ClassAttribute, {
        "[Class]": [
            gpf.$UniqueAttribute(),
            gpf.$MemberAttribute()
        ],
        "-": { _writeAllowed: false },
        "#": {
            _alterPrototype: function (objPrototype) {
                var implementedInterface, member = this._member;
                if (this._writeAllowed) {
                    implementedInterface = _gpfI.IArray;
                } else {
                    implementedInterface = _gpfI.IReadOnlyArray;
                }
                _gpfAttributesAdd(objPrototype.constructor, "Class", [gpf.$InterfaceImplement(implementedInterface)]);
                objPrototype.getItemsCount = _gpfIArrayGetItemsCount(member);
                objPrototype.getItem = _gpfIArrayGetItem(member);
                if (this._writeAllowed) {
                    objPrototype.setItemsCount = _gpfFunc(["count"], [
                        "var oldValue = this.",
                        member,
                        ".length;",
                        "this.",
                        member,
                        ".length = count;",
                        "return oldValue;"
                    ].join(""));
                    objPrototype.setItem = _gpfFunc([
                        "idx",
                        "value"
                    ], [
                        "var oldValue = this.",
                        member,
                        "[idx];",
                        "this.",
                        member,
                        "[idx] = value;",
                        "return oldValue;"
                    ].join(""));
                }
            }
        },
        "+": {
            constructor: function (writeAllowed) {
                if (writeAllowed) {
                    this._writeAllowed = true;
                }
            }
        }
    });
    // Alter gpf.attributes.Array class definition
    _gpfAttributesAdd(_gpfA.Array, "_array", [gpf.$ClassIArray(false)]);
    _gpfDefIntrf("IReadableStream", {
        "[read]": [gpf.$ClassEventHandler()],
        read: function (size, eventsHandler) {
            _gpfIgnore(size, eventsHandler);
        }
    });
    /* istanbul ignore next */
    // Interface
    /**
     * The Writable stream interface is an abstraction for a destination that you are writing data to.
     *
     * @class gpf.interfaces.IReadableStream
     * @extends gpf.interfaces.Interface
     */
    _gpfDefIntrf("IWritableStream", {
        "[write]": [gpf.$ClassEventHandler()],
        write: function (buffer, eventsHandler) {
            _gpfIgnore(buffer, eventsHandler);
        }
    });
    /* istanbul ignore next */
    // Interface
    /**
     * The stream combines both IReadableStream and IWritableStream
     *
     * @class gpf.interfaces.IStream
     * @extends gpf.interfaces.Interface
     */
    _gpfDefIntrf("IStream", {
        "[read]": [gpf.$ClassEventHandler()],
        read: function (size, eventsHandler) {
            _gpfIgnore(size, eventsHandler);
        },
        "[write]": [gpf.$ClassEventHandler()],
        write: function (buffer, eventsHandler) {
            _gpfIgnore(buffer, eventsHandler);
        }
    });
    _gpfDefIntrf("IFileStorage", {
        "[getInfo]": [gpf.$ClassEventHandler()],
        getInfo: function (path, eventsHandler) {
            _gpfIgnore(path, eventsHandler);
        },
        "[readAsBinaryStream]": [gpf.$ClassEventHandler()],
        readAsBinaryStream: function (path, eventsHandler) {
            _gpfIgnore(path, eventsHandler);
        },
        "[writeAsBinaryStream]": [gpf.$ClassEventHandler()],
        writeAsBinaryStream: function (path, eventsHandler) {
            _gpfIgnore(path, eventsHandler);
        },
        close: function (stream, eventsHandler) {
            _gpfIgnore(stream, eventsHandler);
        },
        "[explore]": [gpf.$ClassEventHandler()],
        explore: function (path, eventsHandler) {
            _gpfIgnore(path, eventsHandler);
        },
        "[createFolder]": [gpf.$ClassEventHandler()],
        createFolder: function (path, eventsHandler) {
            _gpfIgnore(path, eventsHandler);
        },
        "[deleteFile]": [gpf.$ClassEventHandler()],
        deleteFile: function (path, eventsHandler) {
            _gpfIgnore(path, eventsHandler);
        },
        "[deleteFolder]": [gpf.$ClassEventHandler()],
        deleteFolder: function (path, eventsHandler) {
            _gpfIgnore(path, eventsHandler);
        }
    });
    _gpfErrorDeclare("fs", { "fileNotFound": "File not found" });
    /**
     * Automate the use of getInfo on a path array to implement IFileStorage.explore
     *
     * @param {gpf.interfaces.IFileStorage} iFileStorage
     * @param {String[]} listOfPaths
     * @return {gpf.interfaces.IEnumerator}
     */
    function _gpfFsExploreEnumerator(iFileStorage, listOfPaths) {
        var pos = -1, info;
        // Secure the array by creating a copy
        listOfPaths = [].concat(listOfPaths);
        return {
            reset: function () {
                pos = -1;
            },
            moveNext: function (eventsHandler) {
                var me = this;
                ++pos;
                info = undefined;
                if (eventsHandler) {
                    if (pos < listOfPaths.length) {
                        iFileStorage.getInfo(listOfPaths[pos], function (event) {
                            if (_GPF_EVENT_ERROR === event.type) {
                                // forward the event
                                _gpfEventsFire.apply(me, [
                                    event,
                                    {},
                                    eventsHandler
                                ]);
                                return;
                            }
                            info = event.get("info");
                            _gpfEventsFire.apply(me, [
                                _GPF_EVENT_DATA,
                                {},
                                eventsHandler
                            ]);
                        });
                    } else {
                        _gpfEventsFire.apply(me, [
                            _GPF_EVENT_END_OF_DATA,
                            {},
                            eventsHandler
                        ]);
                    }
                }
                return false;
            },
            current: function () {
                return info;
            }
        };
    }
    /**
     * Build a find method that is specific to a iFileStorage
     *
     * @param {gpf.interfaces.IFileStorage) iFileStorage
     * @return {Function} same signature than gpf.fs.find
     */
    function _gpfFsBuildFindMethod(iFileStorage) {
        // @inheritdoc gpf.fs#find
        return function (basePath, filters, eventsHandler) {
            var pendingCount = 0, match = gpf.path.match, compiledFilters = gpf.path.compileMatchPattern(filters);
            function _fire(event, params) {
                _gpfEventsFire(event, params || {}, eventsHandler);
            }
            function _done(event) {
                if (_GPF_EVENT_ERROR === event.type) {
                    _fire(event);    // Forward the error
                }
                if (0 === --pendingCount) {
                    _fire(_GPF_EVENT_END_OF_DATA);
                }
            }
            function _explore(fileInfo) {
                var filePath, relativePath, fileInfoType = fileInfo.type;
                if (_GPF_FS_TYPE_DIRECTORY === fileInfoType) {
                    ++pendingCount;
                    iFileStorage.explore(fileInfo.filePath, function (event) {
                        if (_GPF_EVENT_ERROR === event.type) {
                            _fire(event);
                        } else {
                            _gpfI.IEnumerator.each(event.get("enumerator"), _explore, _done);
                        }
                    });
                } else if (_GPF_FS_TYPE_FILE === fileInfoType) {
                    filePath = fileInfo.filePath;
                    relativePath = gpf.path.relative(basePath, filePath);
                    if (match(compiledFilters, relativePath)) {
                        _fire(_GPF_EVENT_DATA, { path: relativePath });
                    }
                }    // other cases are ignored
            }
            iFileStorage.getInfo(basePath, function (event) {
                if (_GPF_EVENT_ERROR === event.type) {
                    _fire(event);
                } else {
                    _explore(event.get("info"));
                }
            });
        };
    }
    gpf.fs = {
        host: function () {
            return null;
        },
        find: _gpfEmptyFunc
    };
    _gpfGetBootstrapMethod("gpf.fs.find", function () {
        return _gpfFsBuildFindMethod(gpf.fs.host());
    });
    _gpfCreateConstants(gpf.fs, {
        TYPE_NOT_FOUND: _GPF_FS_TYPE_NOT_FOUND,
        TYPE_FILE: _GPF_FS_TYPE_FILE,
        TYPE_DIRECTORY: _GPF_FS_TYPE_DIRECTORY,
        TYPE_UNKNOWN: _GPF_FS_TYPE_UNKNOWN
    });
}));
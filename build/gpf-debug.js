/*global define, exports*/
/*jshint -W098*/
// ignore unused gpf
/*jshint -W061*/
// eval can be harmful
/*eslint no-unused-vars: 0*/
// ignore unused gpf
/*eslint strict: [2, "function"]*/
// To be more modular
/*eslint no-new-func: 0*/
// the Function constructor is eval
/*eslint complexity: 0*/
/*global __gpf__*/
(function (factory) {
    "use strict";
    /**
     * Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
     * Rhino, and plain browser loading.
     *
     * 2014-12-04 ABZ Extended for PhantomJS
     * 2015-05-29 ABZ Modified to catch former value of gpf
     * 2018-02-06 ABZ Modified to get global context if missing
     */
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else if (typeof module !== "undefined" && module.exports) {
        factory(module.exports);
    } else {
        var root = Function("return this;")(), newGpf = {};
        factory(newGpf);
        root.gpf = newGpf;
    }
}(function (gpf) {
    "use strict";
    function _gpfEmptyFunc() {
    }
    var
        /**
         * GPF Version
         * @since 0.1.5
         */
        _gpfVersion = "1.0.0", _GPF_NOT_FOUND = -1, _GPF_START = 0, _GPF_FS_WSCRIPT_READING = 1,
        /**
         * Host constants
         * @since 0.1.5
         */
        _GPF_HOST = {
            BROWSER: "browser",
            NASHORN: "nashorn",
            NODEJS: "nodejs",
            PHANTOMJS: "phantomjs",
            RHINO: "rhino",
            UNKNOWN: "unknown",
            WSCRIPT: "wscript"
        },
        /**
         * Current host type
         *
         * @type {_GPF_HOST}
         * @since 0.1.5
         */
        _gpfHost = _GPF_HOST.UNKNOWN,
        /**
         * Indicates that paths are DOS-like (i.e. case insensitive with /)
         * @since 0.1.5
         */
        _gpfDosPath = false,
        // https://github.com/jshint/jshint/issues/525
        _GpfFunc = Function,
        // avoid JSHint error
        /*jshint -W040*/
        // This is the common way to get the global context
        /**
         * Main context object
         *
         * @type {Object}
         * @since 0.1.5
         */
        _gpfMainContext = new _GpfFunc("return this")(),
        // Non-strict function returns global context
        /*jshint +W040*/
        /**
         * Helper to ignore unused parameter
         *
         * @param {*} param
         * @since 0.1.5
         */
        /*gpf:nop*/
        _gpfIgnore = _gpfEmptyFunc,
        /**
         * Exit function
         *
         * @param {Number} code
         * @since 0.1.5
         */
        _gpfExit = _gpfEmptyFunc,
        /**
         * Browser window object
         *
         * @type {Object}
         * @since 0.1.5
         */
        _gpfWebWindow,
        /**
         * Browser [document](https://developer.mozilla.org/en-US/docs/Web/API/Document) object
         *
         * @type {Object}
         * @since 0.1.5
         */
        _gpfWebDocument,
        /**
         * [Scripting.FileSystemObject](https://msdn.microsoft.com/en-us/library/aa711216(v=vs.71).aspx) Object
         *
         * @type {Object}
         * @since 0.1.5
         */
        _gpfMsFSO,
        /**
         * Node [require("fs")](https://nodejs.org/api/fs.html)
         *
         * @type {Object}
         * @since 0.1.5
         */
        _gpfNodeFs;
    _gpfVersion += "-debug";
    /* Host detection */
    // Microsoft cscript / wscript
    if (typeof WScript !== "undefined") {
        _gpfHost = _GPF_HOST.WSCRIPT;
    } else if (typeof print !== "undefined" && typeof java !== "undefined") {
        if (typeof readFile === "undefined") {
            _gpfHost = _GPF_HOST.NASHORN;
        } else {
            _gpfHost = _GPF_HOST.RHINO;
        }    // PhantomJS - When used as a command line (otherwise considered as a browser)
    } else if (typeof phantom !== "undefined" && phantom.version && !document.currentScript) {
        _gpfHost = _GPF_HOST.PHANTOMJS;
        _gpfMainContext = window;    // Nodejs
    } else if (typeof module !== "undefined" && module.exports) {
        _gpfHost = _GPF_HOST.NODEJS;
        _gpfMainContext = global;    // Browser
                                     /* istanbul ignore else */
                                     // unknown.1
    } else if (typeof window !== "undefined") {
        _gpfHost = _GPF_HOST.BROWSER;
        _gpfMainContext = window;
    }
    gpf.version = function () {
        return _gpfVersion;
    };
    function _gpfConsoleGenerate(outputLine) {
        return {
            log: function (text) {
                outputLine("    " + text);
            },
            info: function (text) {
                outputLine("[?] " + text);
            },
            warn: function (text) {
                outputLine("/!\\ " + text);
            },
            error: function (text) {
                outputLine("(X) " + text);
            }
        };
    }
    if (_GPF_HOST.BROWSER === _gpfHost) {
        /* istanbul ignore next */
        // exit.1
        _gpfExit = function (code) {
            window.location = "https://arnaudbuchholz.github.io/gpf/exit.html?" + code;
        };
        _gpfWebWindow = window;
        _gpfWebDocument = document;
    }
    var
        /**
         * require("http")
         *
         * @type {Object}
         * @since 0.2.1
         */
        _gpfNodeHttp,
        /**
         * require("https")
         *
         * @type {Object}
         * @since 0.2.5
         */
        _gpfNodeHttps,
        /**
         * require("path")
         *
         * @type {Object}
         * @since 0.1.5
         */
        _gpfNodePath,
        /**
         * require("url")
         *
         * @type {Object}
         * @since 0.2.1
         */
        _gpfNodeUrl;
    /**
     * @namespace gpf.node
     * @description Root namespace for NodeJS specifics
     * @since 0.1.5
     */
    gpf.node = {};
    if (_GPF_HOST.NODEJS === _gpfHost) {
        _gpfNodePath = require("path");
        _gpfNodeFs = require("fs");
        _gpfNodeHttp = require("http");
        _gpfNodeHttps = require("https");
        _gpfNodeUrl = require("url");
        _gpfDosPath = _gpfNodePath.sep === "\\";
        /* istanbul ignore next */
        // exit.1
        _gpfExit = function (code) {
            process.exit(code);
        };
    }
    if (_GPF_HOST.PHANTOMJS === _gpfHost) {
        _gpfDosPath = require("fs").separator === "\\";
        /* istanbul ignore next */
        // exit.1
        _gpfExit = function (code) {
            phantom.exit(code);
        };
        _gpfWebWindow = window;
        _gpfWebDocument = document;
        _gpfNodeFs = require("fs");
    }
    gpf.java = {};
    /**
     * Common implementation for Java hosts
     * @since 0.2.4
     */
    function _gpfHostJava() {
        _gpfDosPath = String(java.lang.System.getProperty("file.separator")) === "\\";
        // Define console APIs
        _gpfMainContext.console = _gpfConsoleGenerate(print);
        /* istanbul ignore next */
        // exit.1
        _gpfExit = function (code) {
            java.lang.System.exit(code);
        };
    }
    gpf.rhino = gpf.java;
    if (_GPF_HOST.RHINO === _gpfHost) {
        _gpfHostJava();
    }
    if (_GPF_HOST.NASHORN === _gpfHost) {
        _gpfHostJava();
    }
    gpf.wscript = {};
    /* istanbul ignore next */
    // wscript.echo.1
    function _gpfWScriptEcho(text) {
        WScript.Echo(text);
    }
    if (_GPF_HOST.WSCRIPT === _gpfHost) {
        _gpfDosPath = true;
        _gpfMsFSO = new ActiveXObject("Scripting.FileSystemObject");
        // Define console APIs
        _gpfMainContext.console = _gpfConsoleGenerate(_gpfWScriptEcho);
        /* istanbul ignore next */
        // exit.1
        _gpfExit = function (code) {
            WScript.Quit(code);
        };
    }
    gpf.hosts = {
        /**
         * Any browser (phantomjs is recognized separately)
         * @since 0.1.5
         */
        browser: _GPF_HOST.BROWSER,
        /**
         * [Nashorn](https://en.wikipedia.org/wiki/Nashorn_%28JavaScript_engine%29)
         * @since 0.2.4
         */
        nashorn: _GPF_HOST.NASHORN,
        /**
         * [NodeJs](http://nodejs.org/)
         * @since 0.1.5
         */
        nodejs: _GPF_HOST.NODEJS,
        /**
         * [PhantomJS](http://phantomjs.org/)
         * @since 0.1.5
         */
        phantomjs: _GPF_HOST.PHANTOMJS,
        /**
         * [Rhino](http://developer.mozilla.org/en/docs/Rhino)
         * @since 0.1.5
         */
        rhino: _GPF_HOST.RHINO,
        /**
         * Unknown (detection failed or the host is unknown)
         * @since 0.1.5
         */
        unknown: _GPF_HOST.UNKNOWN,
        /**
         * [cscript/wscript](http://technet.microsoft.com/en-us/library/bb490887.aspx)
         * @since 0.1.5
         */
        wscript: _GPF_HOST.WSCRIPT
    };
    /**
     * Returns the detected host type
     *
     * @return {gpf.hosts} Host type
     * @since 0.1.5
     */
    gpf.host = function () {
        return _gpfHost;
    };
    function _gpfArraySlice(array, from, to) {
        return Array.prototype.slice.call(array, from, to || array.length);
    }
    var _GPF_ARRAYLIKE_TAIL_FROMINDEX = 1;
    function _gpfArrayTail(array) {
        return _gpfArraySlice(array, _GPF_ARRAYLIKE_TAIL_FROMINDEX);
    }
    /**
     * Return true if the parameter is an array
     *
     * @param {*} value Value to test
     * @return {Boolean} True if the value is an array
     * @since 0.2.1
     */
    var _gpfIsArray = Array.isArray;
    function _gpfArrayHasValidLengthProperty(obj) {
        if (obj) {
            return Math.floor(obj.length) === obj.length;
        }
        return false;
    }
    /**
     * Return true if the parameter looks like an array, meaning a property length is available and members can be
     * accessed through the [] operator. The length property does not have to be writable.
     *
     * @param {Object} obj Object to test
     * @return {Boolean} True if array-like
     * @since 0.1.5
     */
    function _gpfIsArrayLike(obj) {
        return _gpfIsArray(obj) || _gpfArrayHasValidLengthProperty(obj);
    }
    /**
     * @gpf:sameas _gpfIsArrayLike
     * @since 0.1.5
     */
    gpf.isArrayLike = _gpfIsArrayLike;
    function _gpfArrayForEach(array, callback, thisArg) {
        var index = 0, length = array.length;
        for (; index < length; ++index) {
            callback.call(thisArg, array[index], index, array);
        }
    }
    function _gpfObjectForEachOwnProperty(object, callback, thisArg) {
        for (var property in object) {
            /* istanbul ignore else */
            // hasOwnProperty.1
            if (Object.prototype.hasOwnProperty.call(object, property)) {
                callback.call(thisArg, object[property], property, object);
            }
        }
    }
    function _gpfObjectForEachOwnPropertyWScript(object, callback, thisArg) {
        _gpfObjectForEachOwnProperty(object, callback, thisArg);
        [
            "constructor",
            "toString"
        ].forEach(function (property) {
            if (Object.prototype.hasOwnProperty.call(object, property)) {
                callback.call(thisArg, object[property], property, object);
            }
        });
    }
    /**
     * _gpfArrayForEach that returns first truthy value computed by the callback
     *
     * @param {Array} array Array-like object
     * @param {gpf.typedef.forEachCallback} callback Callback function executed on each array item
     * @param {*} [thisArg] thisArg Value to use as this when executing callback
     * @return {*} first truthy value returned by the callback or undefined after all items were enumerated
     * @since 0.2.2
     */
    function _gpfArrayForEachFalsy(array, callback, thisArg) {
        var result, index = 0, length = array.length;
        for (; index < length && !result; ++index) {
            result = callback.call(thisArg, array[index], index, array);
        }
        return result;
    }
    /**
     * Similar to [].forEach but for objects
     *
     * @param {Object} object Object
     * @param {gpf.typedef.forEachCallback} callback Callback function executed on each own property
     * @param {*} [thisArg] thisArg Value to use as this when executing callback
     * @since 0.1.5
     */
    var _gpfObjectForEach;
    if (_GPF_HOST.WSCRIPT === _gpfHost) {
        _gpfObjectForEach = _gpfObjectForEachOwnPropertyWScript;
    } else {
        _gpfObjectForEach = _gpfObjectForEachOwnProperty;
    }
    /**
     * Executes a provided function once per structure element.
     * NOTE:
     * - For arrays: unlike [].forEach, non own properties are also enumerated.
     *   For instance: `gpf.forEach(new Array(3), callback)` will trigger the callback three times but
     *   `(new Array(3)).forEach(callback)` won't trigger any call
     * - For objects: only the [own
     *   properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty)
     *   are enumerated.
     *
     * @param {Array|Object} container Container to enumerate
     * @param {gpf.typedef.forEachCallback} callback Callback function executed on each item or own property
     * @param {*} [thisArg=undefined] thisArg Value to use as this when executing callback
     * @since 0.1.5
     */
    gpf.forEach = function (container, callback, thisArg) {
        if (_gpfIsArrayLike(container)) {
            _gpfArrayForEach(container, callback, thisArg);
            return;
        }
        _gpfObjectForEach(container, callback, thisArg);
    };
    var _gpfAssert, _gpfAsserts, _gpfAssertWarn = true;
    function _gpfAssertConsoleWarn(message) {
        if (_gpfAssertWarn) {
            console.warn("ASSERTION FAILED: " + message);
        }
    }
    function _gpfAssertFailIfConditionFalsy(condition, message) {
        if (!condition) {
            _gpfAssertConsoleWarn(message);
            gpf.Error.assertionFailed({ message: message });
        }
    }
    /**
     * Assertion helper
     *
     * @param {Boolean} condition Truthy / [Falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) value
     * @param {String} message Assertion message explaining the violation when the condition is false
     * @throws {gpf.Error.AssertionFailed}
     * @since 0.1.5
     */
    function _gpfAssertImpl(condition, message) {
        if (undefined === message) {
            _gpfAssertImpl(false, "Assertion with no message");
        }
        _gpfAssertFailIfConditionFalsy(condition, message);
    }
    /**
     * Batch assertion helper
     *
     * @param {Object} assertions Dictionary of messages associated to condition values
     * @throws {gpf.Error.AssertionFailed}
     * @since 0.1.5
     */
    function _gpfAssertsImpl(assertions) {
        _gpfObjectForEach(assertions, _gpfAssertFailIfConditionFalsy);
    }
    /**
     * @gpf:sameas _gpfAssertImpl
     * @since 0.1.5
     */
    gpf.assert = _gpfAssertImpl;
    /**
     * @gpf:sameas _gpfAssertsImpl
     * @since 0.1.5
     */
    gpf.asserts = _gpfAssertsImpl;
    /**
     * By default, a failing assert will generate a console warning.
     * Use this method to prevent console warnings to be generated.
     *
     * @param {Boolean} silent True to prevent console warnings on failing assertions
     * @since 0.1.8
     */
    gpf.preventAssertWarnings = function (silent) {
        _gpfAssertWarn = !silent;
    };
    // DEBUG specifics
    _gpfAssert = _gpfAssertImpl;
    _gpfAsserts = _gpfAssertsImpl;
    /* istanbul ignore if */
    // assert.1
    if (!_gpfAssert) {
    }
    var _gpfMaxUnsignedByte = 255,
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
        // Get the name of a function if bound to the call
        _gpfJsCommentsRegExp = new RegExp("//.*$|/\\*(?:[^\\*]*|\\*[^/]*)\\*/", "gm");
    // Unprotected version of _gpfFunc
    function _gpfFuncUnsafe(params, source) {
        var args;
        if (!params.length) {
            return _GpfFunc(source);
        }
        args = [].concat(params);
        args.push(source);
        return _GpfFunc.apply(null, args);
    }
    function _gpfFuncImplDocumentError(e, params, source) {
        e.params = params;
        e.source = source;
        return e;
    }
    // Protected version of _gpfFunc
    function _gpfFuncImpl(params, source) {
        _gpfAssert(typeof source === "string" && source.length, "Source expected (or use _gpfEmptyFunc)");
        try {
            return _gpfFuncUnsafe(params, source);
        } catch (e) {
            throw _gpfFuncImplDocumentError(e, params, source);
        }
    }
    /**
     * Create a new function from the source and parameter list.
     * In DEBUG mode, it catches any error to log the problem.
     *
     * @param {String[]} [params] params Parameter names list
     * @param {String} source Body of the function
     * @return {Function} New function
     * @since 0.1.5
     */
    function _gpfFunc(params, source) {
        if (undefined === source) {
            return _gpfFuncImpl([], params);
        }
        return _gpfFuncImpl(params, source);
    }
    /**
     * Check if the value is in the range defined by min and max
     *
     * @param {Number} value Value to check
     * @param {Number} min Minimum value (inclusive)
     * @param {Number} max Maximum value (inclusive)
     * @return {Boolean} True if the value is in the range
     * @since 0.1.6
     */
    function _gpfIsInRange(value, min, max) {
        return min <= value && value <= max;
    }
    /**
     * Check if the value is an unsigned byte
     *
     * @param {*} value
     * @returns {Boolean} True if the value is an unsigned byte
     * @since 0.1.6
     */
    // Returns true if the value is an unsigned byte
    function _gpfIsUnsignedByte(value) {
        var ZERO = 0;
        return typeof value === "number" && _gpfIsInRange(value, ZERO, _gpfMaxUnsignedByte);
    }
    /**
     * @namespace gpf.web
     * @description Root namespace for web-related tools (even if not in a browser)
     * @since 0.1.5
     */
    gpf.web = {};
    function _gpfStringCapitalize(that) {
        var REMAINDER = 1;
        return that.charAt(_GPF_START).toUpperCase() + that.substring(REMAINDER);
    }
    function _gpfStringReplaceEx(that, replacements) {
        var result = that;
        _gpfObjectForEach(replacements, function (replacement, key) {
            result = result.split(key).join(replacement);
        });
        return result;
    }
    var _gpfStringEscapes = {};
    function _gpfStringEscapePostProcessFor(that, language) {
        if (language === "javascript") {
            return "\"" + that + "\"";
        }
        return that;
    }
    /**
     *
     * Make the string content compatible with a given language
     *
     * @param {String} that String to escape
     * @param {String} language Language to escape the string for. Supported values are:
     * - **"javascript"**: escape \ and formatting characters then adds double quotes around the string
     * - **"xml"**: escape &, < and >
     * - **"html"**: xml + some accentuated characters
     * @return {String} Escaped string
     * @since 0.1.5
     */
    function _gpfStringEscapeFor(that, language) {
        _gpfAssert(undefined !== _gpfStringEscapes[language], "Unknown language");
        return _gpfStringEscapePostProcessFor(_gpfStringReplaceEx(that, _gpfStringEscapes[language]), language);
    }
    var _GPF_STRING_ESCAPE_JAVASCRIPT = "javascript";
    _gpfStringEscapes[_GPF_STRING_ESCAPE_JAVASCRIPT] = {
        "\\": "\\\\",
        "\"": "\\\"",
        "\n": "\\n",
        "\r": "\\r",
        "\t": "\\t"
    };
    function _gpfStringEscapeForJavascript(that) {
        return _gpfStringEscapeFor(that, _GPF_STRING_ESCAPE_JAVASCRIPT);
    }
    var _GPF_STRING_ESCAPE_XML = "xml";
    _gpfStringEscapes[_GPF_STRING_ESCAPE_XML] = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;"
    };
    function _gpfStringEscapeForXml(that) {
        return _gpfStringEscapeFor(that, _GPF_STRING_ESCAPE_XML);
    }
    function _gpfInstallMissingMembers(on, members) {
        _gpfObjectForEach(members, function (value, memberName) {
            if (on[memberName] === undefined) {
                on[memberName] = value;
            }
        });
    }
    function _gpfInstallCompatibleMethods(on, methods) {
        if (methods) {
            _gpfInstallMissingMembers(on.prototype, methods);
        }
    }
    function _gpfInstallCompatibleStatics(on, statics) {
        if (statics) {
            _gpfInstallMissingMembers(on, statics);
        }
    }
    /**
     * Define and install compatible methods on standard objects
     *
     * @param {String} typeName Type name ("Object", "String"...)
     * @param {_GpfCompatibilityDescription} description Description of compatible methods
     * @since 0.1.5
     */
    function _gpfCompatibilityInstallMethods(typeName, description) {
        var on = description.on;
        _gpfInstallCompatibleMethods(on, description.methods);
        _gpfInstallCompatibleStatics(on, description.statics);
    }
    /**
     * Install compatible global if missing
     *
     * @param {String} name Object name ("JSON", "Promise"...)
     * @param {*} polyfill Polyfill implementation of the object
     * @since 0.2.5
     */
    function _gpfCompatibilityInstallGlobal(name, polyfill) {
        if (!_gpfMainContext[name]) {
            _gpfMainContext[name] = polyfill;
        }
    }
    var _GPF_COMPATIBILITY_ARRAY_THIS_ARG_INDEX = 1;
    function _gpfArrayGetThisArg(args) {
        return args[_GPF_COMPATIBILITY_ARRAY_THIS_ARG_INDEX];
    }
    function _gpfArrayBind(callback, args) {
        var thisArg = _gpfArrayGetThisArg(args);
        if (undefined !== thisArg) {
            return callback.bind(thisArg);
        }
        return callback;
    }
    function _gpfArrayForEachOwn(array, callback) {
        var len = array.length, idx = 0;
        while (idx < len) {
            if (Object.prototype.hasOwnProperty.call(array, idx)) {
                callback(array[idx], idx, array);
            }
            ++idx;
        }
    }
    function _gpfArrayEveryOwn(array, callback, startIdx) {
        var len = array.length, idx = startIdx;
        while (idx < len) {
            if (Object.prototype.hasOwnProperty.call(array, idx) && callback(array[idx], idx, array) !== true) {
                return false;
            }
            ++idx;
        }
        return true;
    }
    function _gpfArrayEveryOwnFrom0(array, callback) {
        return _gpfArrayEveryOwn(array, callback, _GPF_START);
    }
    //endregion
    //region Array.from
    function _gpfArrayFromString(array, string) {
        var length = string.length, index = 0;
        for (; index < length; ++index) {
            array.push(string.charAt(index));
        }
    }
    function _gpfArrayConvertFrom(arrayLike) {
        var array = [];
        if (typeof arrayLike === "string") {
            // Required for cscript
            _gpfArrayFromString(array, arrayLike);
        } else {
            _gpfArrayForEach(arrayLike, function (value) {
                array.push(value);
            });
        }
        return array;
    }
    function _gpfArrayFrom(arrayLike, callback, thisArg) {
        var array = _gpfArrayConvertFrom(arrayLike);
        if (typeof callback === "function") {
            array = array.map(callback, thisArg);
        }
        return array;
    }
    var _GPF_COMPATIBILITY_ARRAY_FROM_INDEX_INDEX = 1;
    function _gpfArrayGetFromIndex(args) {
        var fromIndex = args[_GPF_COMPATIBILITY_ARRAY_FROM_INDEX_INDEX];
        if (undefined === fromIndex) {
            return _GPF_START;
        }
        return fromIndex;
    }
    //endregion
    _gpfCompatibilityInstallMethods("Array", {
        on: Array,
        methods: {
            // Introduced with JavaScript 1.6
            every: function (callback) {
                return _gpfArrayEveryOwnFrom0(this, _gpfArrayBind(callback, arguments));
            },
            // Introduced with JavaScript 1.6
            filter: function (callback) {
                var result = [], boundCallback = _gpfArrayBind(callback, arguments);
                _gpfArrayForEachOwn(this, function (item, idx, array) {
                    if (boundCallback(item, idx, array)) {
                        result.push(item);
                    }
                });
                return result;
            },
            // Introduced with JavaScript 1.6
            forEach: function (callback) {
                _gpfArrayForEachOwn(this, _gpfArrayBind(callback, arguments));
            },
            // Introduced with ECMAScript 2016
            includes: function (searchElement) {
                return !_gpfArrayEveryOwn(this, function (value) {
                    return value !== searchElement;
                }, _gpfArrayGetFromIndex(arguments));
            },
            // Introduced with JavaScript 1.5
            indexOf: function (searchElement) {
                var result = -1;
                _gpfArrayEveryOwn(this, function (value, index) {
                    if (value === searchElement) {
                        result = index;
                        return false;
                    }
                    return true;
                }, _gpfArrayGetFromIndex(arguments));
                return result;
            },
            // Introduced with JavaScript 1.6
            map: function (callback) {
                var result = new Array(this.length), boundCallback = _gpfArrayBind(callback, arguments);
                _gpfArrayForEachOwn(this, function (item, index, array) {
                    result[index] = boundCallback(item, index, array);
                });
                return result;
            },
            // Introduced with JavaScript 1.6
            some: function (callback) {
                var boundCallback = _gpfArrayBind(callback, arguments);
                return !_gpfArrayEveryOwnFrom0(this, function (item, index, array) {
                    return !boundCallback(item, index, array);
                });
            },
            // Introduced with JavaScript 1.8
            reduce: function (callback) {
                var REDUCE_INITIAL_VALUE_INDEX = 1, initialValue = arguments[REDUCE_INITIAL_VALUE_INDEX], thisLength = this.length, index = 0, value;
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
        statics: {
            // Introduced with ECMAScript 2015
            from: function (arrayLike) {
                _gpfIgnore(arrayLike);
                return _gpfArrayFrom.apply(this, arguments);
            },
            // Introduced with JavaScript 1.8.5
            isArray: function (arrayLike) {
                return {}.toString.call(arrayLike) === "[object Array]";
            }
        }
    });
    _gpfIsArray = Array.isArray;
    function _gpfBuildFunctionParameterList(count) {
        if (!count) {
            return [];
        }
        return new Array(count).join(" ").split(" ").map(function (value, index) {
            return "p" + index;
        });
    }
    function _gpfGenerateGenericFactorySource(parameters) {
        var src = [
            "var C = this, l = arguments.length;",
            "if (0 === l) { return new C();}"
        ];
        parameters.forEach(function (value, index) {
            var count = 1;
            count += index;
            src.push("if (" + count + " === l) { return new C(" + parameters.slice(_GPF_START, count).join(", ") + ");}");
        });
        return src.join("\n");
    }
    function _gpfGenerateGenericFactory(maxParameters) {
        var parameters = _gpfBuildFunctionParameterList(maxParameters);
        return _gpfFunc(parameters, _gpfGenerateGenericFactorySource(parameters));
    }
    /**
     * Create any class by passing the right number of parameters
     *
     * @this {Function} constructor to invoke
     * @since 0.1.5
     */
    var _GPF_FACTORY_DEFAULT_PARAMETERS_COUNT = 10, _gpfGenericFactory = _gpfGenerateGenericFactory(_GPF_FACTORY_DEFAULT_PARAMETERS_COUNT);
    /**
     * Call a constructor with an array of parameters.
     *
     * It is impossible to mix [new](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new)
     * and [apply](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)
     * in the same call.
     *
     * This helper workarounds this problem.
     *
     * @param {Function} Constructor Class constructor
     * @param {Array} parameters Parameters to pass to the constructor
     * @return {Object} New object
     * @since 0.1.5
     */
    function _gpfNewApply(Constructor, parameters) {
        if (parameters.length > _gpfGenericFactory.length) {
            _gpfGenericFactory = _gpfGenerateGenericFactory(parameters.length);
        }
        return _gpfGenericFactory.apply(Constructor, parameters);
    }
    function _generateBindBuilderSource(length) {
        return "var me = this;\n" + "return function (" + _gpfBuildFunctionParameterList(length).join(", ") + ") {\n" + "    var args = _gpfArraySlice(arguments);\n" + "    return me.apply(thisArg, prependArgs.concat(args));\n" + "};";
    }
    function _generateSimpleBindBuilderSource(length) {
        return "var me = this;\n" + "return function (" + _gpfBuildFunctionParameterList(length).join(", ") + ") {\n" + "    return me.apply(thisArg, arguments);\n" + "};";
    }
    var _GPF_COMPATIBILITY_FUNCTION_MIN_LENGTH = 0;
    _gpfCompatibilityInstallMethods("Function", {
        on: Function,
        methods: {
            // Introduced with JavaScript 1.8.5
            bind: function (thisArg) {
                var me = this, prependArgs = _gpfArrayTail(arguments), length = Math.max(this.length - prependArgs.length, _GPF_COMPATIBILITY_FUNCTION_MIN_LENGTH), builderSource;
                if (prependArgs.length) {
                    builderSource = _generateBindBuilderSource(length);
                    return _gpfFunc([
                        "thisArg",
                        "prependArgs",
                        "_gpfArraySlice"
                    ], builderSource).call(me, thisArg, prependArgs, _gpfArraySlice);
                }
                builderSource = _generateSimpleBindBuilderSource(length);
                return _gpfFunc(["thisArg"], builderSource).call(me, thisArg);
            }
        }
    });
    function _gpfObjectAssign(value, memberName) {
        /*jshint validthis:true*/
        this[memberName] = value;    //eslint-disable-line no-invalid-this
    }
    var _gpfStandardObjects = [
        Array,
        Date,
        Error,
        Function,
        Number,
        RegExp,
        String
    ];
    _gpfCompatibilityInstallMethods("Object", {
        on: Object,
        statics: {
            // Introduced with ECMAScript 2015
            assign: function (destination, source) {
                _gpfIgnore(source);
                _gpfArrayTail(arguments).forEach(function (nthSource) {
                    _gpfObjectForEach(nthSource, _gpfObjectAssign, destination);
                });
                return destination;
            },
            // Introduced with JavaScript 1.8.5
            create: function () {
                function Proto(Constructor) {
                    this.constructor = Constructor;
                    this.__proto__ = Proto.prototype;
                }
                function Temp() {
                }
                return function (O) {
                    Proto.prototype = O;
                    Temp.prototype = new Proto(Temp);
                    var obj = new Temp();
                    return obj;
                };
            }(),
            // Introduced with JavaScript 1.8.5
            getPrototypeOf: function (object) {
                /* istanbul ignore else */
                // wscript.node.1
                if (object.__proto__) {
                    return object.__proto__;
                }
                for (var index = 0; index < _gpfStandardObjects.length; ++index) {
                    if (object === _gpfStandardObjects[index].prototype) {
                        return Object.prototype;
                    }
                }
                // May break if the constructor has been tampered with
                /* istanbul ignore next */
                // wscript.node.1
                return object.constructor.prototype;
            },
            // Introduced with JavaScript 1.8.5
            keys: function (object) {
                var result = [], key;
                for (key in object) {
                    if (Object.prototype.hasOwnProperty.call(object, key)) {
                        result.push(key);
                    }
                }
                return result;
            },
            // Introduced with JavaScript 1.8.5
            values: function (object) {
                var result = [], key;
                for (key in object) {
                    if (Object.prototype.hasOwnProperty.call(object, key)) {
                        result.push(object[key]);
                    }
                }
                return result;
            }
        }
    });
    var _GPF_COMPATIBILITY_STRING_OPTIONAL_PARAM_INDEX = 1;
    function _gpfStringGetOptionalParam(args, defaultValue) {
        var value = args[_GPF_COMPATIBILITY_STRING_OPTIONAL_PARAM_INDEX];
        if (!value) {
            return defaultValue;
        }
        return value;
    }
    var _GPF_COMPATIBILITY_STRING_ARRAY_LENGTH_OFFSET = 1;
    function _gpfStringBuildPaddingString(length, targetLength, padString) {
        if (length < targetLength) {
            return new Array(targetLength - length + _GPF_COMPATIBILITY_STRING_ARRAY_LENGTH_OFFSET).join(padString);
        }
        return "";
    }
    _gpfCompatibilityInstallMethods("String", {
        on: String,
        methods: {
            // Introduced with ECMAScript 2015
            endsWith: function (search) {
                var len = Math.min(_gpfStringGetOptionalParam(arguments, this.length), this.length);
                return this.substring(len - search.length, len) === search;
            },
            // Introduced with ECMAScript 2015
            includes: function (search) {
                var position = _gpfStringGetOptionalParam(arguments, _GPF_START);
                return this.indexOf(search, position) !== _GPF_NOT_FOUND;
            },
            padEnd: function (targetLength) {
                var padString = _gpfStringGetOptionalParam(arguments, " "), padding = _gpfStringBuildPaddingString(this.length, targetLength, padString);
                return this + padding;
            },
            padStart: function (targetLength) {
                var padString = _gpfStringGetOptionalParam(arguments, " "), padding = _gpfStringBuildPaddingString(this.length, targetLength, padString);
                return padding + this;
            },
            // Introduced with ECMAScript 2015
            startsWith: function (search) {
                var position = _gpfStringGetOptionalParam(arguments, _GPF_START);
                return this.substring(position, position + search.length) === search;
            },
            // Introduced with JavaScript 1.8.1
            trim: function () {
                var rtrim = new RegExp("^[\\s\uFEFF\xA0]+|[\\s\uFEFF\xA0]+$", "g");
                return function () {
                    return this.replace(rtrim, "");
                };
            }()
        }
    });
    var _GPF_COMPATIBILITY_DATE_MONTH_OFFSET = 1, _GPF_COMPATIBILITY_DATE_2_DIGITS = 2, _GPF_COMPATIBILITY_DATE_3_DIGITS = 3;
    function _gpfDatePad(value, count) {
        return value.toString().padStart(count, "0");
    }
    function _gpfDateToISOString(date) {
        return date.getUTCFullYear() + "-" + _gpfDatePad(date.getUTCMonth() + _GPF_COMPATIBILITY_DATE_MONTH_OFFSET, _GPF_COMPATIBILITY_DATE_2_DIGITS) + "-" + _gpfDatePad(date.getUTCDate(), _GPF_COMPATIBILITY_DATE_2_DIGITS) + "T" + _gpfDatePad(date.getUTCHours(), _GPF_COMPATIBILITY_DATE_2_DIGITS) + ":" + _gpfDatePad(date.getUTCMinutes(), _GPF_COMPATIBILITY_DATE_2_DIGITS) + ":" + _gpfDatePad(date.getUTCSeconds(), _GPF_COMPATIBILITY_DATE_2_DIGITS) + "." + _gpfDatePad(date.getUTCMilliseconds(), _GPF_COMPATIBILITY_DATE_3_DIGITS) + "Z";
    }
    _gpfCompatibilityInstallMethods("Date", {
        on: Date,
        methods: {
            // Introduced with JavaScript 1.8
            toISOString: function () {
                return _gpfDateToISOString(this);
            }
        },
        statics: {
            now: function () {
                return new Date().getTime();
            }
        }
    });
    //region Date override
    var _gpfISO8601RegExp = new RegExp("^([0-9][0-9][0-9][0-9])\\-([0-9][0-9])\\-([0-9][0-9])" + "(?:T([0-9][0-9])\\:([0-9][0-9])\\:([0-9][0-9])(?:\\.([0-9][0-9][0-9])Z)?)?$"), _GPF_COMPATIBILITY_DATE_MONTH_PART = 1, _GPF_COMPATIBILITY_DATE_MAX_MONTH = 11, _GPF_COMPATIBILITY_DATE_DATE_PART = 2, _GPF_COMPATIBILITY_DATE_MAX_DATE = 31, _GPF_COMPATIBILITY_DATE_HOURS_PART = 3, _GPF_COMPATIBILITY_DATE_MAX_HOURS = 23, _GPF_COMPATIBILITY_DATE_MINUTES_PART = 4, _GPF_COMPATIBILITY_DATE_MAX_MINUTES = 59, _GPF_COMPATIBILITY_DATE_SECONDS_PART = 5, _GPF_COMPATIBILITY_DATE_MAX_SECONDS = 59;
    function _gpfIsValidDateInDateArray(dateArray) {
        return dateArray[_GPF_COMPATIBILITY_DATE_MONTH_PART] <= _GPF_COMPATIBILITY_DATE_MAX_MONTH && dateArray[_GPF_COMPATIBILITY_DATE_DATE_PART] <= _GPF_COMPATIBILITY_DATE_MAX_DATE;
    }
    function _gpfIsValidTimeInDateArray(dateArray) {
        return dateArray[_GPF_COMPATIBILITY_DATE_HOURS_PART] <= _GPF_COMPATIBILITY_DATE_MAX_HOURS && dateArray[_GPF_COMPATIBILITY_DATE_MINUTES_PART] <= _GPF_COMPATIBILITY_DATE_MAX_MINUTES && dateArray[_GPF_COMPATIBILITY_DATE_SECONDS_PART] <= _GPF_COMPATIBILITY_DATE_MAX_SECONDS;
    }
    function _gpfCheckDateArray(dateArray) {
        if (_gpfIsValidDateInDateArray(dateArray) && _gpfIsValidTimeInDateArray(dateArray)) {
            return dateArray;
        }
    }
    var _GPF_COMPATIBILITY_DATE_PART_NOT_SET = 0;
    function _gpfAddDatePartToArray(dateArray, datePart) {
        if (datePart) {
            dateArray.push(parseInt(datePart, 10));
        } else {
            dateArray.push(_GPF_COMPATIBILITY_DATE_PART_NOT_SET);
        }
    }
    function _gpfToDateArray(matchResult) {
        var dateArray = [], len = matchResult.length,
            // 0 is the recognized string
            idx = 1;
        for (; idx < len; ++idx) {
            _gpfAddDatePartToArray(dateArray, matchResult[idx]);
        }
        return dateArray;
    }
    var _GPF_COMPATIBILITY_DATE_MONTH_INDEX = 1;
    function _gpfProcessISO8601MatchResult(matchResult) {
        var dateArray;
        if (matchResult) {
            dateArray = _gpfToDateArray(matchResult);
            // Month must be corrected (0-based)
            --dateArray[_GPF_COMPATIBILITY_DATE_MONTH_INDEX];
            // Some validation
            return _gpfCheckDateArray(dateArray);
        }
    }
    /**
     * Check if the value is a string respecting the ISO 8601 representation of a date. If so, the string is parsed and the
     * date details is returned.
     *
     * The function supports supports long and short syntax.
     *
     * @param {*} value Value to test
     * @return {Number[]|undefined} 7 numbers composing the date (Month is 0-based). undefined if not matching.
     * @since 0.1.5
     */
    function _gpfIsISO8601String(value) {
        if (typeof value === "string") {
            _gpfISO8601RegExp.lastIndex = 0;
            return _gpfProcessISO8601MatchResult(_gpfISO8601RegExp.exec(value));
        }
    }
    // Backup original Date constructor
    var _GpfGenuineDate = _gpfMainContext.Date;
    /**
     * Date constructor supporting ISO 8601 format
     *
     * @constructor
     * @since 0.1.5
     */
    function _GpfDate() {
        var firstArgument = arguments[_GPF_START], values = _gpfIsISO8601String(firstArgument);
        if (values) {
            return new _GpfGenuineDate(_GpfGenuineDate.UTC.apply(_GpfGenuineDate.UTC, values));
        }
        return _gpfNewApply(_GpfGenuineDate, arguments);
    }
    function _gpfCopyDateStatics() {
        _gpfArrayForEach([
            "prototype",
            // Ensure instanceof
            "UTC",
            "parse",
            "now"
        ], function (member) {
            _GpfDate[member] = _GpfGenuineDate[member];
        });
    }
    var _GPF_COMPATIBILITY_DATE_ISO_TEST = "2003-01-22T22:45:34.075Z", _GPF_COMPATIBILITY_DATE_SHORT_TEST = "2003-01-22";
    function _gpfInstallCompatibleDate() {
        _gpfCopyDateStatics();
        // Test if ISO 8601 format variations are supported
        var longDateAsString, shortDateAsString;
        try {
            longDateAsString = _gpfDateToISOString(new Date(_GPF_COMPATIBILITY_DATE_ISO_TEST));
            shortDateAsString = _gpfDateToISOString(new Date(_GPF_COMPATIBILITY_DATE_SHORT_TEST));
        } catch (e) {
        }
        //eslint-disable-line no-empty
        if (longDateAsString !== _GPF_COMPATIBILITY_DATE_ISO_TEST || shortDateAsString !== _GPF_COMPATIBILITY_DATE_SHORT_TEST + "T00:00:00.000Z") {
            // Replace constructor with new one
            _gpfMainContext.Date = _GpfDate;
        }
    }
    _gpfInstallCompatibleDate();    //endregion
    function _gpfPromiseSafeResolve(fn, onFulfilled, onRejected) {
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
            /* istanbul ignore else */
            // compability.promise.1
            if (safe) {
                safe = false;
                onRejected(e);
            }
        }
    }
    function _gpfPromiseFinale() {
        /*jshint validthis:true*/
        var me = this;
        //eslint-disable-line no-invalid-this
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
        _gpfPromiseFinale.call(me);
    }
    var _gpfPromiseResolve;
    function _gpfPromiseResolveChainIfFunction(newValue, then) {
        /*jshint validthis:true*/
        var me = this;
        //eslint-disable-line no-invalid-this
        if (typeof then === "function") {
            _gpfPromiseSafeResolve(then.bind(newValue), _gpfPromiseResolve.bind(me), _gpfPromiseReject.bind(me));
            return true;
        }
    }
    function _gpfPromiseResolveChain(newValue) {
        /*jshint validthis:true*/
        var me = this;
        //eslint-disable-line no-invalid-this
        if (newValue && [
                "object",
                "function"
            ].includes(typeof newValue)) {
            return _gpfPromiseResolveChainIfFunction.call(me, newValue, newValue.then);
        }
    }
    //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    _gpfPromiseResolve = function (newValue) {
        /*jshint validthis:true*/
        var me = this;
        //eslint-disable-line no-invalid-this
        try {
            _gpfAssert(newValue !== me, "A promise cannot be resolved with itself.");
            if (_gpfPromiseResolveChain.call(me, newValue)) {
                return;
            }
            me._state = true;
            me._value = newValue;
            _gpfPromiseFinale.call(me);
        } catch (e) {
            /* istanbul ignore next */
            // compability.promise.1
            _gpfPromiseReject.call(me, e);
        }
    };
    var _GpfPromise = gpf.Promise = function (fn) {
        this._handlers = [];
        _gpfPromiseSafeResolve(fn, _gpfPromiseResolve.bind(this), _gpfPromiseReject.bind(this));
    };
    function _gpfPromiseHandler() {
    }
    function _gpfPromiseGetCallbackFromState(handler, promise) {
        if (promise._state) {
            return handler.onFulfilled;
        }
        return handler.onRejected;
    }
    function _gpfPromiseSettleFromState(handler, promise) {
        if (promise._state) {
            handler.resolve(promise._value);
        } else {
            handler.reject(promise._value);
        }
    }
    function _gpfPromiseAsyncProcess(promise) {
        /*jshint validthis:true*/
        var me = this;
        //eslint-disable-line no-invalid-this
        var callback = _gpfPromiseGetCallbackFromState(me, promise), result;
        if (callback === null) {
            return _gpfPromiseSettleFromState(me, promise);
        }
        try {
            result = callback(promise._value);
        } catch (e) {
            me.reject(e);
            return;
        }
        me.resolve(result);
    }
    var _GPF_COMPATIBILITY_PROMISE_NODELAY = 0;
    var _gpfPromiseHandlersToProcess = [];
    function _gpfPromiseProcessHandlers() {
        while (_gpfPromiseHandlersToProcess.length) {
            var that = _gpfPromiseHandlersToProcess.shift(), promise = _gpfPromiseHandlersToProcess.shift();
            _gpfPromiseAsyncProcess.call(that, promise);
        }
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
                promise._handlers.push(me);
                return;
            }
            if (!_gpfPromiseHandlersToProcess.length) {
                setTimeout(_gpfPromiseProcessHandlers, _GPF_COMPATIBILITY_PROMISE_NODELAY);
            }
            _gpfPromiseHandlersToProcess.push(me, promise);
        }
    };
    _GpfPromise.prototype = {
        // @property {Boolean|null} state of the promise
        _state: null,
        // @property {*} fufilment value
        _value: null,
        // @property {Handler[]} list of handlers
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
    function _gpfPromiseAllAssign(state, index, result) {
        state.promises[index] = result;
        if (!--state.remaining) {
            state.resolve(state.promises);
        }
    }
    function _gpfPromiseAllHandle(result, index) {
        /*jshint validthis:true*/
        var me = this;
        //eslint-disable-line no-invalid-this
        try {
            if (result instanceof _GpfPromise) {
                result.then(function (value) {
                    _gpfPromiseAllHandle.call(me, value, index);
                }, me.reject);
                return;
            }
            _gpfPromiseAllAssign(me, index, result);
        } catch (e) {
            /* istanbul ignore next */
            // compability.promise.1
            me.reject(e);
        }
    }
    _GpfPromise.all = function (promises) {
        if (!promises.length) {
            return _GpfPromise.resolve([]);
        }
        return new _GpfPromise(function (resolve, reject) {
            promises.forEach(_gpfPromiseAllHandle.bind({
                resolve: resolve,
                reject: reject,
                remaining: promises.length,
                promises: promises
            }));
        });
    };
    _GpfPromise.race = function (promises) {
        return new _GpfPromise(function (resolve, reject) {
            promises.forEach(function (promise) {
                promise.then(resolve, reject);
            });
        });
    };
    _gpfCompatibilityInstallGlobal("Promise", _GpfPromise);
    var _gpfTimeoutImpl = {};
    _gpfTimeoutImpl[_GPF_HOST.WSCRIPT] = function (t) {
        WScript.Sleep(t);    //eslint-disable-line new-cap
    };
    function _gpfTimeoutJavaImpl(t) {
        java.lang.Thread.sleep(t);
    }
    _gpfTimeoutImpl[_GPF_HOST.RHINO] = _gpfTimeoutJavaImpl;
    _gpfTimeoutImpl[_GPF_HOST.NASHORN] = _gpfTimeoutJavaImpl;
    var
        // List of pending callbacks (sorted by execution time)
        _gpfTimeoutQueue = [],
        // Last allocated timeoutID
        _gpfTimeoutID = 0,
        // Sleep function
        _gpfSleep = _gpfTimeoutImpl[_gpfHost] || _gpfEmptyFunc;
    // Sorting function used to reorder the async queue
    function _gpfSortOnDt(a, b) {
        if (a.dt === b.dt) {
            return a.id - b.id;
        }
        return a.dt - b.dt;
    }
    function _gpSetTimeoutPolyfill(callback, timeout) {
        _gpfAssert(typeof timeout === "number", "Timeout is required");
        var timeoutItem = {
            id: ++_gpfTimeoutID,
            dt: new Date().getTime() + timeout,
            cb: callback
        };
        _gpfTimeoutQueue.push(timeoutItem);
        _gpfTimeoutQueue.sort(_gpfSortOnDt);
        return _gpfTimeoutID;
    }
    function _gpfClearTimeoutPolyfill(timeoutId) {
        _gpfTimeoutQueue = _gpfTimeoutQueue.filter(function (timeoutItem) {
            return timeoutItem.id !== timeoutId;
        });
    }
    /**
     * For WSCRIPT, RHINO and NASHORN environments, this function must be used to process the timeout queue when using
     * [setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setTimeout).
     * For the other environments, this function has no effect.
     * @since 0.1.5
     */
    function _gpfHandleTimeout() {
        var timeoutItem, now;
        while (_gpfTimeoutQueue.length) {
            timeoutItem = _gpfTimeoutQueue.shift();
            now = new Date().getTime();
            while (timeoutItem.dt > now) {
                _gpfSleep(timeoutItem.dt - now);
                now = new Date().getTime();
            }
            timeoutItem.cb();
        }
    }
    /**
     * @gpf:sameas _gpfHandleTimeout
     * @since 0.1.5
     */
    gpf.handleTimeout = _gpfHandleTimeout;
    _gpfCompatibilityInstallGlobal("setTimeout", _gpSetTimeoutPolyfill);
    _gpfCompatibilityInstallGlobal("clearTimeout", _gpfClearTimeoutPolyfill);
    function _gpfJsonParseApplyReviver(value, name, reviver) {
        if (typeof value === "object") {
            _gpfObjectForEach(value, function (propertyValue, propertyName) {
                value[propertyName] = _gpfJsonParseApplyReviver(propertyValue, propertyName, reviver);
            });
        }
        return reviver(name, value);
    }
    /**
     * JSON.parse polyfill
     *
     * @param {*} text The string to parse as JSON
     * @param {Function} [reviver] Describes how the value originally produced by parsing is transformed,
     * before being returned
     * @return {Object} Parsed value
     * @since 0.1.5
     */
    function _gpfJsonParsePolyfill(text, reviver) {
        var result = _gpfFunc("return " + text)();
        if (reviver) {
            return _gpfJsonParseApplyReviver(result, "", reviver);
        }
        return result;
    }
    var _gpfJsonStringifyMapping;
    function _gpfJsonStringifyGeneric(object) {
        return object.toString();
    }
    function _gpfJsonStringifyFormat(values, space) {
        if (space) {
            return "\n" + space + values.join(",\n" + space) + "\n";
        }
        return values.join(",");
    }
    function _gpfJsonStringifyArray(array, replacer, space) {
        var values = [];
        _gpfArrayForEach(array, function (value, index) {
            var replacedValue = replacer(index.toString(), value);
            if (undefined === replacedValue) {
                replacedValue = "null";
            } else {
                replacedValue = _gpfJsonStringifyMapping[typeof replacedValue](replacedValue, replacer, space);
            }
            values.push(replacedValue);
        });
        return "[" + _gpfJsonStringifyFormat(values, space) + "]";
    }
    function _gpfJsonStringifyObjectMembers(object, replacer, space) {
        var values = [], separator;
        if (space) {
            separator = ": ";
        } else {
            separator = ":";
        }
        _gpfObjectForEach(object, function (value, name) {
            var replacedValue = replacer(name, value);
            replacedValue = _gpfJsonStringifyMapping[typeof replacedValue](value, replacer, space);
            if (undefined === replacedValue) {
                return;
            }
            values.push(_gpfStringEscapeForJavascript(name) + separator + replacedValue);
        });
        return "{" + _gpfJsonStringifyFormat(values, space) + "}";
    }
    function _gpfJsonStringifyObject(object, replacer, space) {
        if (object === null) {
            return "null";
        }
        return _gpfJsonStringifyObjectMembers(object, replacer, space);
    }
    _gpfJsonStringifyMapping = {
        undefined: _gpfEmptyFunc,
        "function": _gpfEmptyFunc,
        number: _gpfJsonStringifyGeneric,
        "boolean": _gpfJsonStringifyGeneric,
        string: function (object) {
            return _gpfStringEscapeForJavascript(object);
        },
        object: function (object, replacer, space) {
            if (_gpfIsArray(object)) {
                return _gpfJsonStringifyArray(object, replacer, space);
            }
            return _gpfJsonStringifyObject(object, replacer, space);
        }
    };
    function _gpfJsonStringifyGetReplacerFunction(replacer) {
        if (typeof replacer === "function") {
            return replacer;
        }
        return function (key, value) {
            return value;
        };
    }
    function _gpfJsonStringifyCheckReplacer(replacer) {
        if (_gpfIsArray(replacer)) {
            // whitelist
            return function (key, value) {
                if (replacer.includes(key)) {
                    return value;
                }
            };
        }
        return _gpfJsonStringifyGetReplacerFunction(replacer);
    }
    var _GPF_COMPATIBILITY_JSON_STRINGIFY_MAX_SPACE = 10;
    function _gpfJsonStringifyCheckSpaceValue(space) {
        if (typeof space === "number") {
            return "".padEnd(Math.min(space, _GPF_COMPATIBILITY_JSON_STRINGIFY_MAX_SPACE), " ");
        }
        return space || "";
    }
    /**
     * JSON.stringify polyfill
     *
     * @param {*} value The value to convert to a JSON string
     * @param {Function|Array} [replacer] A function that alters the behavior of the stringification process, or an array of
     * String and Number objects that serve as a whitelist for selecting/filtering the properties of the value object to be
     * included in the JSON string
     * @param {String|Number} [space] A String or Number object that's used to insert white space into the output JSON
     * string for readability purposes. If this is a Number, it indicates the number of space characters to use as white
     * space; this number is capped at 10 (if it is greater, the value is just 10).
     * @return {String} JSON representation of the value
     * @since 0.1.5
     */
    function _gpfJsonStringifyPolyfill(value, replacer, space) {
        return _gpfJsonStringifyMapping[typeof value](value, _gpfJsonStringifyCheckReplacer(replacer), _gpfJsonStringifyCheckSpaceValue(space));
    }
    _gpfCompatibilityInstallGlobal("JSON", {
        parse: _gpfJsonParsePolyfill,
        stringify: _gpfJsonStringifyPolyfill
    });
    var _gpfBase64 = _gpfALPHA + _gpfAlpha + _gpfDigit + "+/=", _GPF_6_BITS_MASK = 63, _GPF_18_BITS = 18, _GPF_16_BITS = 18, _GPF_12_BITS = 12, _GPF_6_BITS = 6, _GPF_1_BYTE = 8, _GPF_2_BYTES = 16, _GPF_PADDING_CHAR = 64;
    var _gpfRegExpBase64 = /^(?:[A-Za-z\d+/]{4})*?(?:[A-Za-z\d+/]{2}(?:==)?|[A-Za-z\d+/]{3}=?)?$/, _GPF_ATOB_INDEX_INCREMENT = 4;
    function _gpfAtobCheckInput(encodedData) {
        var string = encodedData.replace(/[\t\n\f\r ]+/g, "");
        if (!_gpfRegExpBase64.test(string)) {
            throw new TypeError("The string to be decoded is not correctly encoded.");
        }
        return string;
    }
    function _gpfAtobDecodeLeadingBytes(bitmap, r2) {
        if (r2 === _GPF_PADDING_CHAR) {
            return String.fromCharCode(bitmap >> _GPF_1_BYTE & _gpfMaxUnsignedByte);
        }
        return String.fromCharCode(bitmap >> _GPF_1_BYTE & _gpfMaxUnsignedByte, bitmap & _gpfMaxUnsignedByte);
    }
    function _gpfAtobDecode(bitmap, r1, r2) {
        var result = String.fromCharCode(bitmap >> _GPF_2_BYTES & _gpfMaxUnsignedByte);
        if (r1 !== _GPF_PADDING_CHAR) {
            return result + _gpfAtobDecodeLeadingBytes(bitmap, r2);
        }
        return result;
    }
    function _gpfAtobTranslate(input, index) {
        return _gpfBase64.indexOf(input.charAt(index));
    }
    function _gpfAtobRead(input, from) {
        var index = from, bitmap, r1, r2;
        bitmap = _gpfAtobTranslate(input, index++) << _GPF_18_BITS | _gpfAtobTranslate(input, index++) << _GPF_12_BITS;
        r1 = _gpfAtobTranslate(input, index++);
        r2 = _gpfAtobTranslate(input, index++);
        bitmap |= r1 << _GPF_6_BITS | r2;
        return _gpfAtobDecode(bitmap, r1, r2);
    }
    function _gpfAtob(encodedData) {
        var input = _gpfAtobCheckInput(encodedData), length = input.length, index = 0, result = "";
        input += "==";
        // Pad leading bytes
        for (; index < length; index += _GPF_ATOB_INDEX_INCREMENT) {
            result += _gpfAtobRead(input, index);
        }
        return result;
    }
    var _GPF_BTOA_MAX_PADDING = 3, _GPF_BTOA_INDEX_INCREMENT = 3;
    function _gpfBtoaCheck(stringToEncode, index) {
        var value = stringToEncode.charCodeAt(index);
        if (value > _gpfMaxUnsignedByte) {
            throw new TypeError("The string to be encoded contains characters outside of the Latin1 range.");
        }
        return value;
    }
    function _gpfBtoaRead(input, from) {
        var index = from, a, b, c;
        a = _gpfBtoaCheck(input, index++);
        b = _gpfBtoaCheck(input, index++);
        c = _gpfBtoaCheck(input, index++);
        return a << _GPF_2_BYTES | b << _GPF_1_BYTE | c;
    }
    function _gpfBtoaEncodeChar(bitmap, shift, mask) {
        return _gpfBase64.charAt(bitmap >> shift & mask);
    }
    function _gpfBtoaEncode(bitmap) {
        return _gpfBtoaEncodeChar(bitmap, _GPF_18_BITS, _GPF_6_BITS_MASK) + _gpfBtoaEncodeChar(bitmap, _GPF_12_BITS, _GPF_6_BITS_MASK) + _gpfBtoaEncodeChar(bitmap, _GPF_6_BITS, _GPF_6_BITS_MASK) + _gpfBtoaEncodeChar(bitmap, _GPF_START, _GPF_6_BITS_MASK);
    }
    function _gpfBtoa(stringToEncode) {
        var index = 0, result = "", rest = stringToEncode.length % _GPF_BTOA_MAX_PADDING;
        // To determine the final padding
        for (; index < stringToEncode.length; index += _GPF_BTOA_INDEX_INCREMENT) {
            result += _gpfBtoaEncode(_gpfBtoaRead(stringToEncode, index));
        }
        // If there's need of padding, replace the last 'A's with equal signs
        if (rest) {
            return result.slice(_GPF_START, rest - _GPF_BTOA_MAX_PADDING) + "===".substring(rest);
        }
        return result;
    }
    _gpfCompatibilityInstallGlobal("atob", _gpfAtob);
    _gpfCompatibilityInstallGlobal("btoa", _gpfBtoa);
    function _gpfGetObjectProperty(parent, name) {
        if (undefined !== parent) {
            return parent[name];
        }
    }
    function _gpfGetOrCreateObjectProperty(parent, name) {
        var result = parent[name];
        if (undefined === result) {
            result = parent[name] = {};
        }
        return result;
    }
    // Apply reducer on path
    function _gpfReduceContext(path, reducer) {
        var rootContext, pathToReduce;
        if (path[_GPF_START] === "gpf") {
            rootContext = gpf;
            pathToReduce = _gpfArrayTail(path);
        } else {
            rootContext = _gpfMainContext;
            pathToReduce = path;
        }
        return pathToReduce.reduce(reducer, rootContext);
    }
    /**
     * Result of {@link gpf.context} call, depends on the specified path
     * - when not specified, it returns the current host main context object
     * - when `"gpf"`, it **always** returns the GPF object
     * - when it leads to nothing, `undefined` is returned
    
     * @typedef {*} gpf.typedef.contextResult
     * @since 0.1.5
     */
    /**
     * Resolve the provided contextual path and returns the result
     *
     * @param {String[]} path Array of identifiers
     * @param {Boolean} [createMissingParts=false] If the path includes undefined parts and createMissingParts is true,
     * it allocates a default empty object. This allows building namespaces on the fly.
     *
     * @return {gpf.typedef.contextResult} Resolved path
     * @since 0.1.5
     */
    function _gpfContext(path, createMissingParts) {
        var reducer;
        if (createMissingParts) {
            reducer = _gpfGetOrCreateObjectProperty;
        } else {
            reducer = _gpfGetObjectProperty;
        }
        return _gpfReduceContext(path, reducer);
    }
    /**
     * Resolve the provided contextual path and returns the result.
     *
     * @param {String} path Dot separated list of identifiers
     *
     * @return {gpf.typedef.contextResult} Resolved path
     * @since 0.1.5
     */
    gpf.context = function (path) {
        if (undefined === path) {
            return _gpfMainContext;
        }
        return _gpfContext(path.split("."));
    };
    var _GPF_STRING_ESCAPE_HTML = "html";
    _gpfStringEscapes.html = Object.assign({}, _gpfStringEscapes[_GPF_STRING_ESCAPE_XML], {
        "à": "&agrave;",
        "á": "&aacute;",
        "è": "&egrave;",
        "é": "&eacute;",
        "ê": "&ecirc;"
    });
    function _gpfStringEscapeForHtml(that) {
        return _gpfStringEscapeFor(that, _GPF_STRING_ESCAPE_HTML);
    }
    function _gpfStringTrim(that) {
        return that.trim();
    }
    var _GPF_FUNCTION_KEYWORD = "function";
    function _gpfExtractFunctionName(func) {
        // Use simple parsing
        var functionSource = _gpfEmptyFunc.toString.call(func), functionKeywordPos = functionSource.indexOf(_GPF_FUNCTION_KEYWORD) + _GPF_FUNCTION_KEYWORD.length, parameterListStartPos = functionSource.indexOf("(", functionKeywordPos);
        return functionSource.substring(functionKeywordPos, parameterListStartPos).replace(_gpfJsCommentsRegExp, "")    // remove comments
.trim();
    }
    /**
     * Get the function name
     *
     * @param {Function} func Function
     * @return {String} Function name
     * @since 0.2.9
     */
    var _gpfGetFunctionName;
    // Handling function name properly
    if (function () {
            // Trick source minification
            var testFunction = _gpfFunc("return function functionName () {};")();
            return testFunction.name !== "functionName";
        }()) {
        _gpfGetFunctionName = _gpfExtractFunctionName;
    } else {
        _gpfGetFunctionName = function (func) {
            return func.name;
        };
    }
    //endregion
    /**
     * @typedef {Object} gpf.typedef._functionDescription
     * @property {String} [name] Function name
     * @property {String[]} [parameters] Function parameters
     * @property {String} [body] Function body
     * @since 0.1.6
     */
    function _gpfFunctionDescribeName(functionToDescribe, resultDescription) {
        var name = _gpfGetFunctionName(functionToDescribe);
        if (name) {
            resultDescription.name = name;
        }
    }
    function _gpfFunctionDescribeParameters(functionToDescribe, functionSource, resultDescription) {
        if (functionToDescribe.length) {
            var match = new RegExp("\\(\\s*(\\w+(?:\\s*,\\s*\\w+)*)\\s*\\)").exec(functionSource), PARAMETERS = 1;
            resultDescription.parameters = match[PARAMETERS].split(",").map(_gpfStringTrim);
        }
    }
    function _gpfFunctionDescribeBody(functionSource, resultDescription) {
        var match = new RegExp("{((?:.*\\r?\\n)*.*)}").exec(functionSource), BODY = 1, body = _gpfStringTrim(match[BODY]);
        if (body) {
            resultDescription.body = body;
        }
    }
    function _gpfFunctionDescribeSource(functionToDescribe, resultDescription) {
        var source = _gpfEmptyFunc.toString.call(functionToDescribe).replace(_gpfJsCommentsRegExp, "");
        _gpfFunctionDescribeParameters(functionToDescribe, source, resultDescription);
        _gpfFunctionDescribeBody(source, resultDescription);
    }
    /**
     * Extract function description
     *
     * @param {Function} functionToDescribe Function to describe
     * @return {gpf.typedef._functionDescription} Function description
     * @since 0.1.6
     */
    function _gpfFunctionDescribe(functionToDescribe) {
        var result = {};
        _gpfFunctionDescribeName(functionToDescribe, result);
        _gpfFunctionDescribeSource(functionToDescribe, result);
        return result;
    }
    function _gpfFunctionBuildSourceName(functionDescription) {
        if (functionDescription.name) {
            return " " + functionDescription.name;
        }
        return "";
    }
    function _gpfFunctionBuildSourceParameters(functionDescription) {
        if (functionDescription.parameters) {
            return functionDescription.parameters.join(", ");
        }
        return "";
    }
    function _gpfFunctionBuildSourceBody(functionDescription) {
        if (functionDescription.body) {
            return functionDescription.body.toString();
        }
        return "";
    }
    /**
     * Build function source from description
     *
     * @param {gpf.typedef._functionDescription} functionDescription Function description
     * @return {String} Function source
     * @since 0.1.6
     */
    function _gpfFunctionBuildSource(functionDescription) {
        return "function" + _gpfFunctionBuildSourceName(functionDescription) + "(" + _gpfFunctionBuildSourceParameters(functionDescription) + ") {\n\t\"use strict\"\n" + _gpfFunctionBuildSourceBody(functionDescription) + "\n}";
    }
    function _gpfFunctionBuildWithContext(functionSource, context) {
        var parameterNames = Object.keys(context), parameterValues = parameterNames.map(function (name) {
                return context[name];
            });
        return _gpfFunc(parameterNames, "return " + functionSource).apply(null, parameterValues);
    }
    /**
     * Build function from description and context
     *
     * @param {gpf.typedef._functionDescription} functionDescription Function description
     * @param {Object} [context] Function context
     * @return {Function} Function
     * @since 0.1.6
     */
    function _gpfFunctionBuild(functionDescription, context) {
        return _gpfFunctionBuildWithContext(_gpfFunctionBuildSource(functionDescription), context || {});
    }
    var _GpfError = gpf.Error = function () {
    };
    _GpfError.prototype = new Error();
    Object.assign(_GpfError.prototype, /** @lends gpf.Error.prototype */
    {
        constructor: _GpfError,
        /**
         * Error code
         *
         * @readonly
         * @since 0.1.5
         */
        code: 0,
        /**
         * Error name
         *
         * @readonly
         * @since 0.1.5
         */
        name: "Error",
        /**
         * Error message
         *
         * @readonly
         * @since 0.1.5
         */
        message: "",
        /**
         * Build message by substituting context variables
         *
         * @param {Object} context Dictionary of named keys
         * @since 0.1.5
         */
        _buildMessage: function (context) {
            var replacements;
            if (context) {
                replacements = {};
                _gpfObjectForEach(context, function (value, key) {
                    replacements["{" + key + "}"] = value.toString();
                });
                this.message = _gpfStringReplaceEx(this.message, replacements);
            }
        }
    });
    function _gpfErrorFactory(code, name, message) {
        var capitalizedName = _gpfStringCapitalize(name), NewErrorClass = _gpfFunctionBuild({
                name: capitalizedName,
                parameters: ["context"],
                body: "this._buildMessage(context);"
            });
        NewErrorClass.prototype = new _GpfError();
        Object.assign(NewErrorClass.prototype, {
            code: code,
            name: name,
            message: message
        });
        // constructor can't be enumerated with wscript
        NewErrorClass.prototype.constructor = NewErrorClass;
        _GpfError[capitalizedName] = NewErrorClass;
        return function (context) {
            throw new NewErrorClass(context);
        };
    }
    /**
     * Generates an error class
     *
     * @param {Number} code Error code
     * @param {String} name Error name
     * @param {String} message Error message
     * @return {Function} New error class
     * @gpf:closure
     * @since 0.1.5
     */
    function _gpfGenenerateErrorFunction(code, name, message) {
        var result = _gpfErrorFactory(code, name, message);
        result.CODE = code;
        result.NAME = name;
        result.MESSAGE = message;
        return result;
    }
    // Last allocated error code
    var _gpfLastErrorCode = 0;
    /**
     * Declare error messages.
     * Each source declares its own errors.
     *
     * @param {String} source Source name
     * @param {Object} dictionary Dictionary of error name to message
     * @since 0.1.5
     */
    function _gpfErrorDeclare(source, dictionary) {
        _gpfIgnore(source);
        _gpfObjectForEach(dictionary, function (message, name) {
            var code = ++_gpfLastErrorCode;
            gpf.Error["CODE_" + name.toUpperCase()] = code;
            gpf.Error[name] = _gpfGenenerateErrorFunction(code, name, message);
        });
    }
    _gpfErrorDeclare("error", {
        /**
         * ### Summary
         *
         * Method or function is not implemented
         *
         * ### Description
         *
         * This error is used to flag methods or functions that are not yet implemented.
         * @since 0.1.5
         */
        notImplemented: "Not implemented",
        /**
         * ### Summary
         *
         * An assertion failed
         *
         * ### Description
         *
         * This error is triggered when an assertion fails
         *
         * @see {@link gpf.assert}
         * @see {@link gpf.asserts}
         * @since 0.1.5
         */
        assertionFailed: "Assertion failed: {message}",
        /**
         * ### Summary
         *
         * Method or function was called with an invalid parameter
         *
         * ### Description
         *
         * This error is used when a parameter is invalid
         * @since 0.1.5
         */
        invalidParameter: "Invalid parameter"
    });
    function _gpfIsClassFunction(value) {
        return value.toString().startsWith("class");
    }
    /**
     * Check if the parameter is an ES6 class
     *
     * @param {*} value Value to test
     * @return {Boolean} true if the parameter is an ES6 class
     * @since 0.2.9
     */
    function _gpfIsClass(value) {
        if (typeof value === "function") {
            return _gpfIsClassFunction(value);
        }
        return false;
    }
    /**
     * @gpf:sameas _gpfIsClass
     * @since 0.2.9
     */
    gpf.isClass = _gpfIsClass;
    _gpfErrorDeclare("define/detect", {
        /**
         * ### Summary
         *
         * Entity type is invalid in the definition passed to {@link gpf.define}
         *
         * ### Description
         *
         * The entity type is either passed explicitly using the $type property or deduced from the type $ property
         * (for instance $class). This error is thrown when the entity type is either missing or invalid.
         * @since 0.1.6
         */
        invalidEntityType: "Invalid entity type"
    });
    /**
     * Dictionary mapping type (class...) to the corresponding typed Entity constructor.
     *
     * This dictionary is filled by subsequent entity types.
     * @since 0.1.6
     */
    var _gpfDefineTypedBuilders = {};
    /**
     * Search for type specific properties ($class...) and return associated builder function
     *
     * @param {Object} definition Entity definition literal object
     * @return {Function|undefined} Entity builder or undefined
     * @since 0.1.6
     */
    function _gpfDefineRead$TypedProperties(definition) {
        var ResultEntityBuilder;
        _gpfObjectForEach(_gpfDefineTypedBuilders, function (TypedEntityBuilder, type) {
            if (definition["$" + type]) {
                ResultEntityBuilder = TypedEntityBuilder;
            }
        });
        return ResultEntityBuilder;
    }
    /**
     * Check the $type property to return the associated builder function
     *
     * @param {Object} definition Entity definition literal object
     * @return {Function} Entity builder
     * @throws {gpf.Error.InvalidEntityType}
     * @since 0.1.6
     */
    function _gpfDefineCheck$TypeProperty(definition) {
        var typedEntityBuilder = _gpfDefineTypedBuilders[definition.$type];
        if (undefined === typedEntityBuilder) {
            gpf.Error.invalidEntityType();
        }
        return typedEntityBuilder;
    }
    /**
     * Factory to create the correct entity type
     *
     * @param {Object} definition Entity definition literal object
     * @return {_GpfEntityDefinition} Entity definition instance
     * @throws {gpf.Error.InvalidEntityType}
     * @since 0.1.6
     */
    function _gpfDefineBuildTypedEntity(definition) {
        var EntityBuilder = _gpfDefineRead$TypedProperties(definition), entityDefinition;
        if (!EntityBuilder) {
            EntityBuilder = _gpfDefineCheck$TypeProperty(definition);
        }
        entityDefinition = new EntityBuilder(definition);
        entityDefinition.check();
        return entityDefinition;
    }
    function _gpfRegExpGetNextMatch(regexp, string) {
        return regexp.exec(string);
    }
    function _gpfRegExpGetFirstMatch(regexp, string) {
        regexp.lastIndex = 0;
        return _gpfRegExpGetNextMatch(regexp, string);
    }
    /**
     * Executes the callback for each match of the regular expression.
     * When configured with /g and used before,
     * the [lastIndex](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/lastIndex)
     * must be first reset
     *
     * @param {RegExp} regexp Regular expression to execute
     * @param {String} string String to match
     * @return {Array} Array of matches
     * @since 0.2.1
     * @version 0.2.2 Reset lastIndex and returns the array of matches
     */
    function _gpfRegExpForEach(regexp, string) {
        var matches = [], match = _gpfRegExpGetFirstMatch(regexp, string);
        while (match) {
            matches.push(match);
            match = _gpfRegExpGetNextMatch(regexp, string);
        }
        return matches;
    }
    function _GpfEntityDefinition(definition) {
        _gpfAssert(definition && typeof definition === "object", "Expected an entity definition");
        /*jshint validthis:true*/
        // constructor
        /*eslint-disable no-invalid-this*/
        this._initialDefinition = definition;    /*eslint-enable no-invalid-this*/
    }
    _GpfEntityDefinition.prototype = {
        constructor: _GpfEntityDefinition,
        /**
         * Entity initial definition passed to {@link gpf.define}
         *
         * @readonly
         * @constant
         * @since 0.1.6
         */
        _initialDefinition: {}
    };
    _gpfErrorDeclare("abstract", {
        /**
         * ### Summary
         *
         * Method is abstract
         *
         * ### Description
         *
         * This error is used to implement abstract methods. Mostly used for interfaces.
         * @since 0.1.5
         */
        abstractMethod: "Abstract method"
    });
    /**
     * Build a function that throws the abstractMethod exception
     *
     * @param {Number} numberOfParameters Defines the signature of the resulting function
     * @return {Function} Function that throws the abstractMethod exception
     * @since 0.1.8
     */
    function _gpfCreateAbstractFunction(numberOfParameters) {
        return _gpfFunctionBuild({
            parameters: _gpfBuildFunctionParameterList(numberOfParameters),
            body: "_throw_();"
        }, { _throw_: gpf.Error.abstractMethod });
    }
    var _gpfDefinedEntities = [];
    /**
     * Retrieve entity definition from Constructor.
     * NOTE: This is an internal solution that has the advantage of not exposing the entity definitions.
     *       For performance reasons, this may change in the future.
     *
     * @param {Function} Constructor Constructor function
     * @return {_GpfEntityDefinition|undefined} Entity definition (if found)
     * @since 0.2.9
     */
    function _gpfDefineEntitiesFindByConstructor(Constructor) {
        return _gpfDefinedEntities.filter(function (entityDefinition) {
            return entityDefinition.getInstanceBuilder() === Constructor;
        })[_GPF_START];
    }
    /**
     * Store the entity definition to be retreived later
     *
     * @param  {_GpfEntityDefinition} entityDefinition Entity definition
     * @since 0.2.9
     */
    function _gpfDefineEntitiesAdd(entityDefinition) {
        _gpfAssert(entityDefinition._instanceBuilder !== null, "Instance builder must be set");
        _gpfAssert(!_gpfDefineEntitiesFindByConstructor(entityDefinition.getInstanceBuilder()), "Already added");
        _gpfDefinedEntities.push(entityDefinition);
    }
    _gpfErrorDeclare("define/check", {
        /**
         * ### Summary
         *
         * One of the $ properties is invalid in the definition passed to {@link gpf.define}
         *
         * ### Description
         *
         * The list of possible $ properties is fixed and depends on the entity type.
         * This error is thrown when one $ property is not allowed.
         * @since 0.1.6
         */
        invalidEntity$Property: "Invalid entity $ property",
        /**
         * ### Summary
         *
         * Entity name is missing in the definition passed to {@link gpf.define}
         *
         * ### Description
         *
         * This error is thrown when the entity name is missing
         * @since 0.1.6
         */
        missingEntityName: "Missing entity name",
        /**
         * ### Summary
         *
         * Entity namespace is invalid in the definition passed to {@link gpf.define}
         *
         * ### Description
         *
         * This error is thrown when the namespace is invalid
         * @since 0.1.6
         */
        invalidEntityNamespace: "Invalid entity namespace"
    });
    function _gpfDefineEntityCheck$PropertyInAllowed$Properties(name, allowedList) {
        if (!allowedList.includes(name)) {
            gpf.Error.invalidEntity$Property();
        }
    }
    var _GPF_DEFINE_SPECIAL_PROPERTY_PREFIX = "$";
    function _gpfDefineEntityCheckProperty(value, name) {
        /*jshint -W040*/
        /*eslint-disable no-invalid-this*/
        // bound through thisArg
        if (name.startsWith(_GPF_DEFINE_SPECIAL_PROPERTY_PREFIX)) {
            this._check$Property(name.substring(_GPF_DEFINE_SPECIAL_PROPERTY_PREFIX.length), value);
        } else {
            this._checkProperty(name, value);
        }    /*jshint -W040*/
             /*eslint-enable no-invalid-this*/
    }
    Object.assign(_GpfEntityDefinition.prototype, {
        /**
         * Entity type (class...)
         *
         * @readonly
         * @since 0.1.6
         */
        _type: "",
        /**
         * List of allowed $ properties
         *
         * @type {String[]}
         * @readonly
         * @since 0.1.6
         */
        _allowed$Properties: "type,name,namespace".split(","),
        /**
         * Check if the $ property is allowed
         *
         * @param {String} name $ Property name (without the starting $)
         * @param {*} value $ Property value
         * @since 0.1.6
         */
        _check$Property: function (name, value) {
            _gpfIgnore(value);
            if (name !== this._type) {
                _gpfDefineEntityCheck$PropertyInAllowed$Properties(name, this._allowed$Properties);
            }
        },
        /**
         * Throw the invalid property error
         *
         * @abstract
         * @protected
         * @since 0.1.8
         */
        _throwInvalidProperty: _gpfCreateAbstractFunction(),
        /**
         * Regular expression used to validate member name
         *
         * @type {RegExp}
         * @readonly
         * @protected
         * @since 0.1.8
         */
        _reMemberName: new RegExp(".*"),
        /**
         * Check that the member name is a valid one
         *
         * @param {String} name Member name
         * @since 0.1.8
         */
        _checkMemberName: function (name) {
            if (!this._reMemberName.exec(name)) {
                this._throwInvalidProperty();
            }
        },
        /**
         * List of reserved member names
         *
         * @type {String[]}
         * @readonly
         * @constant
         * @since 0.1.8
         */
        _reservedNames: "super,class,public,private,protected,static,mixin".split(","),
        /**
         * Check that the member name is not a reserved one
         *
         * @param {String} name Member name
         * @since 0.1.6
         */
        _checkReservedMemberName: function (name) {
            if (this._reservedNames.includes(name)) {
                this._throwInvalidProperty();
            }
        },
        /**
         * Check the value of the member
         *
         * @param {String} name Property name
         * @param {*} value Property value
         * @protected
         * @since 0.1.8
         */
        _checkMemberValue: _gpfFunc([
            "name",
            "value"
        ], " "),
        /**
         * Check if the property is allowed
         * NOTE: $ properties are handled by {@link _check$Property}
         *
         * @param {String} name Property name
         * @param {*} value Property value
         * @since 0.1.6
         */
        _checkProperty: function (name, value) {
            this._checkMemberName(name);
            this._checkReservedMemberName(name);
            this._checkMemberValue(name, value);
        },
        /**
         * Check the properties contained in the definition passed to {@link gpf.define}
         * @since 0.1.6
         */
        _checkProperties: function () {
            _gpfObjectForEach(this._initialDefinition, _gpfDefineEntityCheckProperty, this);
        },
        /**
         * Entity name
         * @since 0.1.6
         */
        _name: "",
        /**
         * Compute name property
         * @since 0.1.6
         */
        _readName: function () {
            var definition = this._initialDefinition;
            this._name = definition["$" + this._type] || definition.$name;
        },
        /**
         * Check if name property is not empty (throw the error otherwise)
         *
         * @throws {gpf.Error.MissingEntityName}
         * @since 0.1.6
         */
        _checkNameIsNotEmpty: function () {
            if (!this._name) {
                gpf.Error.missingEntityName();
            }
        },
        /**
         * Throw the invalid name error
         *
         * @abstract
         * @protected
         * @since 0.1.8
         */
        _throwInvalidName: _gpfCreateAbstractFunction(),
        /**
         * Regular expression used to validate entity name
         *
         * @type {RegExp}
         * @readonly
         * @protected
         * @since 0.1.8
         */
        _reName: new RegExp(".*"),
        /**
         * Check name property (content)
         *
         * @since 0.1.6
         */
        _checkName: function () {
            if (!this._reName.exec(this._name)) {
                this._throwInvalidName();
            }
        },
        /**
         * Entity namespace
         * @since 0.1.6
         */
        _namespace: "",
        /**
         * If the name is prefixed with a namespace, isolate it and update name property
         *
         * @return {String|undefined} Namespace contained in the name or undefined if none
         * @since 0.1.6
         */
        _extractRelativeNamespaceFromName: function () {
            var parts = new RegExp("(.*)\\.([^\\.]+)$").exec(this._name), NAME_PART = 2, NAMESPACE_PART = 1;
            if (parts) {
                this._name = parts[NAME_PART];
                return parts[NAMESPACE_PART];
            }
        },
        /**
         * Compute namespace property
         * @since 0.1.6
         */
        _readNamespace: function () {
            var namespaces = [
                this._initialDefinition.$namespace,
                this._extractRelativeNamespaceFromName()
            ].filter(function (namespacePart) {
                return namespacePart;
            });
            if (namespaces.length) {
                this._namespace = namespaces.join(".");
            }
        },
        /**
         * Check namespace property
         *
         * @throws {gpf.Error.InvalidEntityNamespace}
         * @since 0.1.6
         */
        _checkNamespace: function () {
            if (!new RegExp("^(:?[a-z_$][a-zA-Z0-9]+(:?\\.[a-z_$][a-zA-Z0-9]+)*)?$").exec(this._namespace)) {
                gpf.Error.invalidEntityNamespace();
            }
        },
        check: function () {
            this._checkProperties();
            this._readName();
            this._checkNameIsNotEmpty();
            this._readNamespace();
            this._checkName();
            this._checkNamespace();
        }
    });
    Object.assign(_GpfEntityDefinition.prototype, {
        /**
         * Instance builder function (a.k.a. public constructor)
         *
         * @type {Function}
         * @since 0.1.6
         */
        _instanceBuilder: null,
        /**
         * @gpf:read _instanceBuilder
         * @since 0.1.6
         */
        getInstanceBuilder: function () {
            /* istanbul ignore else */
            // define.build.1
            if (!this._instanceBuilder) {
                this._setInstanceBuilder(this._build());
            }
            return this._instanceBuilder;
        },
        /**
         * @gpf:write _instanceBuilder
         * @since 0.1.6
         */
        _setInstanceBuilder: function (value) {
            if (this._namespace) {
                _gpfContext(this._namespace.split("."), true)[this._name] = value;
            }
            this._instanceBuilder = value;
            _gpfDefineEntitiesAdd(this);
        },
        /**
         * Process initial definition and generate instance builder function
         *
         * @return {Function} Instance builder function
         * @protected
         * @since 0.1.6
         */
        _build: _gpfEmptyFunc
    });
    function _GpfClassDefinition(definition) {
        /*jshint validthis:true*/
        // constructor
        /*eslint-disable no-invalid-this*/
        _GpfEntityDefinition.call(this, definition);    /*eslint-enable no-invalid-this*/
    }
    _GpfClassDefinition.prototype = Object.create(_GpfEntityDefinition.prototype);
    Object.assign(_GpfClassDefinition.prototype, {
        constructor: _GpfClassDefinition,
        /**
         * @inheritdoc
         * @since 0.1.6
         */
        _type: "class"
    });
    _gpfDefineTypedBuilders["class"] = _GpfClassDefinition;
    function _GpfImportedClassDefinition(InstanceBuilder, definition) {
        /*jshint validthis:true*/
        // constructor
        /*eslint-disable no-invalid-this*/
        _GpfClassDefinition.call(this, definition);
        this._instanceBuilder = InstanceBuilder;    /*eslint-enable no-invalid-this*/
    }
    _GpfImportedClassDefinition.prototype = Object.create(_GpfClassDefinition.prototype);
    Object.assign(_GpfImportedClassDefinition.prototype, {
        // Since it might not even have a name
        _checkNameIsNotEmpty: _gpfEmptyFunc,
        _checkName: _gpfEmptyFunc
    });
    function _gpfDefineClassImportGetDefinition(InstanceBuilder) {
        var extendPrototype = Object.getPrototypeOf(InstanceBuilder.prototype);
        return {
            $name: _gpfGetFunctionName(InstanceBuilder),
            $extend: extendPrototype.constructor
        };
    }
    function _gpfDefineClassImportFrom(InstanceBuilder, definition) {
        var entityDefinition = new _GpfImportedClassDefinition(InstanceBuilder, definition);
        _gpfDefineEntitiesAdd(entityDefinition);
        entityDefinition.check();
        return entityDefinition;
    }
    /**
     * Import a class as an entity definition
     *
     * @param {Function} InstanceBuilder Instance builder (must be an ES6 class)
     * @return {_GpfEntityDefinition} Entity definition
     * @since 0.2.9
     */
    function _gpfDefineClassImport(InstanceBuilder) {
        var entityDefinition = _gpfDefineEntitiesFindByConstructor(InstanceBuilder);
        if (entityDefinition) {
            return entityDefinition;
        }
        return _gpfDefineClassImportFrom(InstanceBuilder, _gpfDefineClassImportGetDefinition(InstanceBuilder));
    }
    _gpfErrorDeclare("define/class/check", {
        /**
         * ### Summary
         *
         * The class name is invalid
         *
         * ### Description
         *
         * Only a valid JavaScript identifier (starting with an uppercase letter, $ or _) is allowed
         * @since 0.1.6
         */
        invalidClassName: "Invalid class name",
        /**
         * ### Summary
         *
         * The class definition contains an invalid property
         *
         * ### Description
         *
         * Some keywords are reserved
         * @since 0.1.6
         */
        invalidClassProperty: "Invalid class property",
        /**
         * ### Summary
         *
         * The class definition contains an invalid $extend
         *
         * ### Description
         *
         * $extend can be either a class or a string that must resolve to a class using {@see gpf.context}
         * @since 0.1.6
         */
        invalidClassExtend: "Invalid class extend",
        /**
         * ### Summary
         *
         * The class constructor must be a method
         *
         * ### Description
         *
         * The constructor member is a special one, see {@tutorial DEFINE}
         *
         * @since 0.1.7
         */
        invalidClassConstructor: "Invalid class constructor",
        /**
         * ### Summary
         *
         * A member override is changing the type
         *
         * ### Description
         *
         * The constructor member is a special one, see {@tutorial DEFINE}
         *
         * @since 0.1.7
         */
        invalidClassOverride: "Invalid class override"
    });
    /**
     * If extend is a string, apply _gpfContext on it
     *
     * @param {*} extend Extend value
     * @return {*} The initial value or the context one
     * @since 0.1.6
     */
    function _gpfDefineClassDecontextifyExtend(extend) {
        if (typeof extend === "string") {
            return _gpfContext(extend.split("."));
        }
        return extend;
    }
    Object.assign(_GpfClassDefinition.prototype, {
        /**
         * @inheritdoc
         * @since 0.1.6
         */
        _allowed$Properties: _GpfEntityDefinition.prototype._allowed$Properties.concat(["extend"]),
        /**
         * @iheritdoc
         * @since 0.1.8
         */
        _throwInvalidProperty: gpf.Error.invalidClassProperty,
        /**
         * @inheritdoc
         * @since 0.1.8
         */
        _reMemberName: new RegExp("^[a-z_][a-zA-Z0-9]*$"),
        /**
         * Check that the constructor is a method
         *
         * @param {*} constructorValue Value read from definition dictionary
         * @throws {gpf.Error.InvalidClassConstructor}
         * @since 0.1.7
         */
        _checkConstructorMember: function (constructorValue) {
            if (typeof constructorValue !== "function") {
                gpf.Error.invalidClassConstructor();
            }
        },
        /**
         * Check if the value correspond to the overridden value
         *
         * @param {*} value Member value
         * @param {*} overriddenValue Overridden member value
         * @throws {gpf.Error.InvalidClassOverride}
         * @since 0.1.7
         */
        _checkOverridenMember: function (value, overriddenValue) {
            if (typeof value !== typeof overriddenValue) {
                gpf.Error.invalidClassOverride();
            }
        },
        /**
         * Check if the member overrides an inherited one
         *
         * @param {String} name Member name
         * @param {*} value Member value
         * @throws {gpf.Error.InvalidClassOverride}
         * @since 0.1.7
         */
        _checkIfOverriddenMember: function (name, value) {
            var overriddenMember = this._extend.prototype[name];
            if (undefined !== overriddenMember) {
                this._checkOverridenMember(value, overriddenMember);
            }
        },
        /**
         * Check the value of the member:
         * - If the member name is "constructor", it must be a function
         *
         * @param {String} name Property name
         * @param {*} value Property value
         * @since 0.1.7
         */
        _checkMemberValue: function (name, value) {
            if (name === "constructor") {
                this._checkConstructorMember(value);
            } else {
                this._checkIfOverriddenMember(name, value);
            }
        },
        /**
         * @inheritdoc
         * @since 0.1.8
         */
        _reName: new RegExp("^[A-Z_$][a-zA-Z0-9]*$"),
        /**
         * @iheritdoc
         * @since 0.1.8
         */
        _throwInvalidName: gpf.Error.invalidClassName,
        /**
         * Base class
         *
         * @type {Function}
         * @since 0.1.6
         */
        _extend: Object,
        /**
         * Base class definition
         *
         * @type {_GpfClassDefinition}
         * @since 0.2.4
         */
        _extendDefinition: undefined,
        /**
         * Read extend property
         * @since 0.1.6
         */
        _readExtend: function () {
            var extend = _gpfDefineClassDecontextifyExtend(this._initialDefinition.$extend);
            if (extend) {
                this._extend = extend;
            }
        },
        /**
         * Check if the extend property points to an interface
         *
         * @throws {gpf.Error.InvalidClassExtend}
         * @since 0.1.8
         */
        _checkExtendIsNotAnInterface: function () {
            if (_gpfEmptyFunc.toString.call(this._extend).includes("interfaceConstructorFunction")) {
                gpf.Error.invalidClassExtend();
            }
        },
        /**
         * Check extend property
         *
         * @throws {gpf.Error.InvalidClassExtend}
         * @since 0.1.6
         */
        _checkExtend: function () {
            if (typeof this._extend !== "function") {
                gpf.Error.invalidClassExtend();
            }
            this._checkExtendIsNotAnInterface();
        },
        /**
         * @inheritdoc
         * @since 0.1.6
         */
        check: function () {
            this._readExtend();
            this._checkExtend();
            this._extendDefinition = _gpfDefineClassImport(this._extend);
            _GpfEntityDefinition.prototype.check.call(this);
        }
    });
    _gpfErrorDeclare("define/class/constructor", {
        /**
         * ### Summary
         *
         * This is a class constructor function, use with new
         *
         * ### Description
         *
         * Class constructors are not designed to be called without `new`
         *
         * @since 0.1.6
         */
        classConstructorFunction: "This is a class constructor function, use with new"
    });
    Object.assign(_GpfClassDefinition.prototype, {
        /**
         * Resolved constructor
         *
         * @type {Function}
         * @since 0.1.6
         */
        _resolvedConstructor: _gpfEmptyFunc
    });
    var _gpfDefineClassConstructorCodeWrappers = [];
    /**
     * Adds a constructor code wrapper
     *
     * @param {Function} codeWrapper Function receiving class definition and current code
     * @since 0.2.8
     */
    function _gpfDefineClassConstructorAddCodeWrapper(codeWrapper) {
        _gpfDefineClassConstructorCodeWrappers.push(codeWrapper);
    }
    function _gpfDefineGetClassSecuredConstructorGetES6ConstructionBody(classDefinition) {
        if (classDefinition._extend === classDefinition._resolvedConstructor) {
            return "var that = Reflect.construct(_classDef_._extend, arguments, _classDef_._instanceBuilder);\n";
        }
        return "var that,\n" + "    $super = function () {\n" + "        that = Reflect.construct(_classDef_._extend, arguments, _classDef_._instanceBuilder);\n" + "    },\n" + "    hasOwnProperty = function (name) {\n" + "        return !!that && Object.prototype.hasOwnProperty.call(that, name);\n" + "    },\n" + "    proxy = new Proxy({}, {\n" + "        get: function (obj, property) {\n" + "            if (property === \"hasOwnProperty\") {\n" + "              return hasOwnProperty;\n" + "            }\n" + "            if (!that && property === \"$super\") {\n" + "              return $super;\n" + "            }\n" + "            return that[property];\n" + "        },\n" + "        set: function (obj, property, value) {\n" + "            if (property !== \"$super\") {\n" + "                that[property] = value;\n" + "            }\n" + "            return true;\n" + "        }\n" + "    });\n" + "_classDef_._resolvedConstructor.apply(proxy, arguments);\n";
    }
    function _gpfDefineGetClassSecuredConstructorGetMainConstructionPattern(classDefinition) {
        if (_gpfIsClass(classDefinition._extend)) {
            return {
                instance: "that",
                body: _gpfDefineGetClassSecuredConstructorGetES6ConstructionBody(classDefinition)
            };
        }
        return {
            instance: "this",
            body: "_classDef_._resolvedConstructor.apply(this, arguments);"
        };
    }
    function _gpfDefineGetClassSecuredConstructorBody(classDefinition) {
        var construction = _gpfDefineGetClassSecuredConstructorGetMainConstructionPattern(classDefinition), constructorBody = "if (!(this instanceof _classDef_._instanceBuilder)) gpf.Error.classConstructorFunction();\n" + _gpfDefineClassConstructorCodeWrappers.reduce(function (body, codeWrapper) {
                return codeWrapper(classDefinition, body, construction.instance);
            }, construction.body);
        if (construction.instance !== "this") {
            constructorBody += "\nreturn " + construction.instance + ";";
        }
        return constructorBody;
    }
    function _gpfDefineGetClassSecuredConstructorDefinition(classDefinition) {
        return {
            name: classDefinition._name,
            parameters: _gpfFunctionDescribe(classDefinition._resolvedConstructor).parameters,
            body: _gpfDefineGetClassSecuredConstructorBody(classDefinition)
        };
    }
    function _gpfDefineGetClassSecuredConstructorContext(classDefinition) {
        return {
            gpf: gpf,
            _classDef_: classDefinition
        };
    }
    /**
     * Allocate a secured named constructor
     *
     * @param {_GpfClassDefinition} classDefinition Class definition
     * @return {Function} Secured named constructor
     * @gpf:closure
     * @since 0.1.6
     */
    function _gpfDefineGetClassSecuredConstructor(classDefinition) {
        return _gpfFunctionBuild(_gpfDefineGetClassSecuredConstructorDefinition(classDefinition), _gpfDefineGetClassSecuredConstructorContext(classDefinition));
    }
    _gpfErrorDeclare("define/class/super", {
        /**
         * ### Summary
         *
         * $super used in a member that doesn't override a method
         *
         * ### Description
         *
         * $super can't be used if the method does not override an inherited one
         * @since 0.1.7
         */
        invalidClassSuper: "Invalid class super",
        /**
         * ### Summary
         *
         * An invalid member of $super was used
         *
         * ### Description
         *
         * $super members must point to a method exposed by the inherited prototype.
         * @since 0.1.7
         */
        invalidClassSuperMember: "Invalid class super member"
    });
    /**
     * Used when $super points to a non existent member
     *
     * @throws {gpf.Error.InvalidClassSuper}
     * @since 0.1.7
     */
    function _gpfClassNoSuper() {
        gpf.Error.invalidClassSuper();
    }
    /**
     * Copy super method signature and invokes it.
     * NOTE: it is required to create a new function as it will receive additional members
     *
     * @param {Function} superMethod Super method to copy
     * @return {Function} New function that wraps the super method
     * @since 0.1.7
     */
    function _gpfClassSuperCreateWithSameSignature(superMethod) {
        var definition = _gpfFunctionDescribe(superMethod);
        definition.body = "return _superMethod_.apply(this, arguments);";
        return _gpfFunctionBuild(definition, { _superMethod_: superMethod });
    }
    /**
     * Create $super function, either based on super method or triggering an error
     *
     * @param {*} superMember Member extracted from inherited prototype
     * @return {Function} $super function
     * @since 0.1.7
     */
    function _gpfClassSuperCreate(superMember) {
        var superMethod;
        if (typeof superMember === "function") {
            superMethod = superMember;
        } else {
            superMethod = _gpfClassNoSuper;
        }
        return _gpfClassSuperCreateWithSameSignature(superMethod);
    }
    /**
     * Copy super method signature and apply weak binding.
     *
     * @param {Object} that Object instance
     * @param {Function} $super $super member
     * @param {*} superMethod superMember Member extracted from inherited prototype
     * @return {Function} $super method
     * @since 0.1.7
     */
    function _gpfClassSuperCreateWeakBoundWithSameSignature(that, $super, superMethod) {
        var definition = _gpfFunctionDescribe(superMethod);
        definition.body = "return _superMethod_.apply(this === _$super_ ? _that_ : this, arguments);";
        return _gpfFunctionBuild(definition, {
            _that_: that,
            _$super_: $super,
            _superMethod_: superMethod
        });
    }
    /**
     * Create $super method
     * NOTE: if the super method is not a function, an exception is thrown
     *
     * @param {Object} that Object instance
     * @param {Function} $super $super member
     * @param {*} superMethod superMember Member extracted from inherited prototype
     * @return {Function} $super method
     * @throws {gpf.Error.InvalidClassSuperMember}
     * @since 0.1.7
     */
    function _gpfClassSuperCreateMember(that, $super, superMethod) {
        if (typeof superMethod !== "function") {
            gpf.Error.invalidClassSuperMember();
        }
        return _gpfClassSuperCreateWeakBoundWithSameSignature(that, $super, superMethod);
    }
    /**
     * Regular expression detecting .$super use
     *
     * @type {RegExp}
     * @since 0.2.1
     */
    var _gpfClassSuperRegExp = new RegExp("\\.\\$super\\.(\\w+)\\b", "g"), _GPF_CLASS_SUPER_MATCH_MEMBER = 1;
    /**
     * Extract all 'members' that are used on $super
     *
     * @param {Function} method Method to analyze
     * @return {String[]} Member names that are used
     * @since 0.1.7
     */
    function _gpfClassMethodExtractSuperMembers(method) {
        return _gpfRegExpForEach(_gpfClassSuperRegExp, method).map(function (match) {
            return match[_GPF_CLASS_SUPER_MATCH_MEMBER];
        });
    }
    Object.assign(_GpfClassDefinition.prototype, {
        /**
         * Called before invoking a that contains $super method, it is responsible of allocating the $super object
         *
         * @param {Object} that Object instance
         * @param {String} methodName Name of the method that uses $super
         * @param {String[]} superMembers Expected member names on $super
         * @return {Function} $super method
         * @since 0.1.7
         */
        _get$Super: function (that, methodName, superMembers) {
            var superProto = this._extend.prototype, $super = _gpfClassSuperCreate(superProto[methodName]);
            superMembers.forEach(function (memberName) {
                $super[memberName] = _gpfClassSuperCreateMember(that, $super, superProto[memberName]);
            });
            return $super;
        },
        /**
         * Body of superified method
         * @since 0.1.7
         */
        _superifiedBody: "var _super_;\n" + "if (Object.prototype.hasOwnProperty.call(this, \"$super\")) {\n" + "    _super_ = this.$super;\n" + "}\n" + "this.$super = _classDef_._get$Super(this, _methodName_, _superMembers_);\n" + "try{\n" + "    var _result_ = _method_.apply(this, arguments);\n" + "} finally {\n" + "    if (undefined === _super_) {\n" + "        delete this.$super;\n" + "    } else {\n" + "        this.$super = _super_;\n" + "    }\n" + "}\n" + "return _result_;",
        /**
         * Generates context for the superified method
         *
         * @param {Function} method Method to superify
         * @param {String} methodName Name of the method (used to search in object prototype)
         * @param {String[]} superMembers Detected $super members used in the method
         * @return {Object} Context of superified method
         * @since 0.1.7
         */
        _getSuperifiedContext: function (method, methodName, superMembers) {
            return {
                _method_: method,
                _methodName_: methodName,
                _superMembers_: superMembers,
                _classDef_: this
            };
        },
        /**
         * Generates the superified version of the method
         *
         * @param {Function} method Method to superify
         * @param {String} methodName Name of the method (used to search in object prototype)
         * @param {String[]} superMembers Detected $super members used in the method
         * @return {Function} Superified method
         * @since 0.1.7
         */
        _createSuperified: function (method, methodName, superMembers) {
            // Keep signature
            var description = _gpfFunctionDescribe(method);
            description.body = this._superifiedBody;
            return _gpfFunctionBuild(description, this._getSuperifiedContext(method, methodName, superMembers));
        },
        /**
         * Create a method that can use this.$super
         *
         * @param {Function} method Method to superify
         * @param {String} methodName Name of the method (used to search in object prototype)
         * @return {Function} Superified method
         * @since 0.1.7
         */
        _superify: function (method, methodName) {
            if (new RegExp("\\.\\$super\\b").exec(method)) {
                return this._createSuperified(method, methodName, _gpfClassMethodExtractSuperMembers(method));
            }
            return method;
        }
    });
    Object.assign(_GpfClassDefinition.prototype, {
        /**
         * @inheritdoc
         * @since 0.1.6
         */
        _build: function () {
            var newClass, newPrototype;
            this._resolveConstructor();
            newClass = _gpfDefineGetClassSecuredConstructor(this);
            // Basic JavaScript inheritance mechanism: Defines the newClass prototype as an instance of the super class
            newPrototype = Object.create(this._extend.prototype);
            // Populate our constructed prototype object
            newClass.prototype = newPrototype;
            // Enforce the constructor to be what we expect
            newPrototype.constructor = newClass;
            this._buildPrototype(newPrototype);
            return newClass;
        },
        /**
         * Add method to the new class prototype
         *
         * @param {Object} newPrototype New class prototype
         * @param {String} methodName Method name
         * @param {Function} method Method
         * @since 0.1.7
         */
        _addMethodToPrototype: function (newPrototype, methodName, method) {
            newPrototype[methodName] = this._superify(method, methodName);
        },
        /**
         * Add member to the new class prototype
         *
         * @param {Object} newPrototype New class prototype
         * @param {String} memberName Member name
         * @param {*} value Member value
         * @since 0.1.7
         */
        _addMemberToPrototype: function (newPrototype, memberName, value) {
            if (typeof value === "function") {
                this._addMethodToPrototype(newPrototype, memberName, value);
            } else {
                newPrototype[memberName] = value;
            }
        },
        /**
         * Build the new class prototype
         *
         * @param {Object} newPrototype New class prototype
         * @since 0.1.7
         */
        _buildPrototype: function (newPrototype) {
            _gpfObjectForEach(this._initialDefinition, function (value, memberName) {
                if (!memberName.startsWith("$") && memberName !== "constructor") {
                    this._addMemberToPrototype(newPrototype, memberName, value);    //eslint-disable-line no-invalid-this
                }
            }, this);
        },
        /**
         * Set the inherited constructor if not Object
         * @since 0.1.7
         */
        _setResolvedConstructorToInherited: function () {
            if (this._extend !== Object) {
                this._resolvedConstructor = this._extend;
            }
        },
        /**
         * Assign the proper constructor to _resolvedConstructor
         * @since 0.1.7
         */
        _resolveConstructor: function () {
            if (Object.prototype.hasOwnProperty.call(this._initialDefinition, "constructor")) {
                /* jshint -W069*/
                /*eslint-disable dot-notation*/
                this._resolvedConstructor = this._superify(this._initialDefinition["constructor"], "constructor");    /* jshint +W069*/
                                                                                                                      /*eslint-enable dot-notation*/
            } else {
                this._setResolvedConstructorToInherited();
            }
        }
    });
    function _gpfDefineClassStandardGetDictionary(name) {
        return { $name: name };
    }
    function _gpfDefineClassStandardPatchDefinition(entityDefinition) {
        Object.assign(entityDefinition, {
            _extend: null,
            _extendDefinition: null
        });
    }
    function _gpfDefineClassStandardInstallEntityDefinition(InstanceBuilder, name) {
        var entityDefinition = _gpfDefineClassImportFrom(InstanceBuilder, _gpfDefineClassStandardGetDictionary(name));
        _gpfDefineClassStandardPatchDefinition(entityDefinition);
    }
    _gpfDefineClassStandardInstallEntityDefinition(Object, "Object");
    _gpfObjectForEach({
        "Array": Array,
        "Date": Date,
        "Error": Error,
        "Function": Function,
        "Number": Number,
        "RegExp": RegExp,
        "String": String
    }, _gpfDefineClassStandardInstallEntityDefinition);
    _gpfErrorDeclare("define/class/abstract", {
        /**
         * ### Summary
         *
         * Invalid Class $abstract specification
         *
         * ### Description
         *
         * The property $abstract only accepts the value true
         * @since 0.2.7
         */
        invalidClass$AbstractSpecification: "Invalid class $abstract specification",
        /**
         * ### Summary
         *
         * Abstract Class
         *
         * ### Description
         *
         * An abstract class can not be instantiated
         * @since 0.2.7
         */
        abstractClass: "Abstract Class"
    });
    _GpfClassDefinition.prototype._allowed$Properties.push("abstract");
    var _gpfDefClassAbstractClassCheck$Property = _GpfClassDefinition.prototype._check$Property;
    Object.assign(_GpfClassDefinition.prototype, {
        /**
         * Class is abstract
         * @since 0.2.7
         */
        _abstract: false,
        _check$abstract: function (value) {
            if (value !== true) {
                gpf.Error.invalidClass$AbstractSpecification();
            }
        },
        /**
         * @inheritdoc
         * @since 0.2.7
         */
        _check$Property: function (name, value) {
            if (name === "abstract") {
                this._check$abstract(value);
                this._abstract = true;
            } else {
                _gpfDefClassAbstractClassCheck$Property.call(this, name, value);
            }
        }
    });
    _gpfDefineClassConstructorAddCodeWrapper(function (classDefinition, body, instance) {
        _gpfIgnore(instance);
        if (classDefinition._abstract) {
            return "if (this.constructor === _classDef_._instanceBuilder) gpf.Error.abstractClass();\n" + body;
        }
        return body;
    });
    _gpfErrorDeclare("define/class/singleton", {
        /**
         * ### Summary
         *
         * Invalid Class $singleton specification
         *
         * ### Description
         *
         * The property $singleton only accepts the value true
         * @since 0.2.8
         */
        invalidClass$SingletonSpecification: "Invalid class $singleton specification"
    });
    _GpfClassDefinition.prototype._allowed$Properties.push("singleton");
    var _gpfDefClassSingletonClassCheck$Property = _GpfClassDefinition.prototype._check$Property;
    Object.assign(_GpfClassDefinition.prototype, {
        /**
         * Class is used as a singleton
         * @since 0.2.8
         */
        _singleton: false,
        /**
         * Unique instance of the singleton
         * @type {Object}
         * @since 0.2.8
         */
        _singletonInstance: null,
        _check$singleton: function (value) {
            if (value !== true) {
                gpf.Error.invalidClass$SingletonSpecification();
            }
        },
        /**
         * @inheritdoc
         * @since 0.2.8
         */
        _check$Property: function (name, value) {
            if (name === "singleton") {
                this._check$singleton(value);
                this._singleton = true;
            } else {
                _gpfDefClassSingletonClassCheck$Property.call(this, name, value);
            }
        }
    });
    _gpfDefineClassConstructorAddCodeWrapper(function (classDefinition, body, instance) {
        if (classDefinition._singleton) {
            return "if (!_classDef_._singletonInstance) {\n" + body + "\n" + "_classDef_._singletonInstance = " + instance + ";\n" + "}\n" + "return _classDef_._singletonInstance;";
        }
        return body;
    });
    function _GpfInterfaceDefinition(definition) {
        /*jshint validthis:true*/
        // constructor
        /*eslint-disable no-invalid-this*/
        _GpfEntityDefinition.call(this, definition);    /*eslint-enable no-invalid-this*/
    }
    _GpfInterfaceDefinition.prototype = Object.create(_GpfEntityDefinition.prototype);
    Object.assign(_GpfInterfaceDefinition.prototype, {
        constructor: _GpfInterfaceDefinition,
        /**
         * @inheritdoc
         * @since 0.1.8
         */
        _type: "interface"
    });
    _gpfDefineTypedBuilders["interface"] = _GpfInterfaceDefinition;
    _gpfErrorDeclare("define/interface/check", {
        /**
         * ### Summary
         *
         * The interface name is invalid
         *
         * ### Description
         *
         * Only a valid JavaScript identifier (starting with an uppercase I) is allowed
         * @since 0.1.8
         */
        invalidInterfaceName: "Invalid interface name",
        /**
         * ### Summary
         *
         * The interface definition contains an invalid property
         *
         * ### Description
         *
         * An interface can contain only methods and no constructor
         * @since 0.1.8
         */
        invalidInterfaceProperty: "Invalid interface property"
    });
    Object.assign(_GpfInterfaceDefinition.prototype, {
        /**
         * @iheritdoc
         * @since 0.1.8
         */
        _throwInvalidProperty: gpf.Error.invalidInterfaceProperty,
        /**
         * @inheritdoc
         * @since 0.1.8
         */
        _reMemberName: new RegExp("^[a-z][a-zA-Z0-9]*$"),
        /**
         * @inheritdoc
         * @since 0.1.8
         */
        _reservedNames: _GpfEntityDefinition.prototype._reservedNames.concat("constructor"),
        /**
         * @inheritdoc
         * @since 0.1.8
         */
        _checkMemberValue: function (name, value) {
            if (typeof value !== "function") {
                gpf.Error.invalidInterfaceProperty();
            }
        },
        /**
         * @inheritdoc
         * @since 0.1.8
         */
        _reName: new RegExp("^I[a-zA-Z0-9]*$"),
        /**
         * @iheritdoc
         * @since 0.1.8
         */
        _throwInvalidName: gpf.Error.invalidInterfaceName
    });
    _gpfErrorDeclare("define/interface/constructor", { "interfaceConstructorFunction": "This is an interface constructor function, do not invoke" });
    function _gpfDefineGetInterfaceConstructorDefinition(interfaceDefinition) {
        var name = interfaceDefinition._name;
        return {
            name: name,
            body: "gpf.Error.interfaceConstructorFunction();"
        };
    }
    function _gpfDefineGetInterfaceConstructorContext(interfaceDefinition) {
        return {
            gpf: gpf,
            _classDef_: interfaceDefinition
        };
    }
    /**
     * Allocate a secured named constructor
     *
     * @param {_GpfInterfaceDefinition} interfaceDefinition Interface definition
     * @return {Function} Secured named constructor
     * @gpf:closure
     * @since 0.1.8
     */
    function _gpfDefineGetInterfaceConstructor(interfaceDefinition) {
        return _gpfFunctionBuild(_gpfDefineGetInterfaceConstructorDefinition(interfaceDefinition), _gpfDefineGetInterfaceConstructorContext(interfaceDefinition));
    }
    Object.assign(_GpfInterfaceDefinition.prototype, {
        /**
         * @inheritdoc
         * @since 0.1.8
         */
        _build: function () {
            var newClass, newPrototype;
            newClass = _gpfDefineGetInterfaceConstructor(this);
            // Populate our constructed prototype object
            newPrototype = newClass.prototype;
            // Ensure no constructor on prototype (because of interface)
            delete newPrototype.constructor;
            this._buildPrototype(newPrototype);
            return newClass;
        },
        /**
         * Build the new class prototype
         *
         * @param {Object} newPrototype New class prototype
         * @since 0.1.7
         */
        _buildPrototype: function (newPrototype) {
            _gpfObjectForEach(this._initialDefinition, function (value, memberName) {
                if (!memberName.startsWith("$")) {
                    newPrototype[memberName] = value;
                }
            }, this);
        }
    });
    function _gpfDefine(definition) {
        var entityDefinition = _gpfDefineBuildTypedEntity(definition);
        return entityDefinition.getInstanceBuilder();
    }
    /**
     * @gpf:sameas _gpfDefine
     * @since 0.1.6
     */
    gpf.define = _gpfDefine;
    _gpfErrorDeclare("interfaces", {
        /**
         * ### Summary
         *
         * Expected interface not implemented
         *
         * ### Description
         *
         * This error is used when a function expects a specific interface and it can't be resolved with the provided
         * parameter.
         * @since 0.1.8
         */
        interfaceExpected: "Expected interface not implemented: {name}"
    });
    function _gpfInterfaceIsInvalidMethod(referenceMethod, method) {
        return typeof method !== "function" || referenceMethod.length !== method.length;
    }
    /**
     * Verify that the object implements the specified interface
     *
     * @param {Function} interfaceSpecifier Reference interface
     * @param {Object} inspectedObject Object (or class prototype) to inspect
     * @return {Boolean} True if implemented
     * @since 0.1.8
     */
    function _gpfInterfaceIsImplementedBy(interfaceSpecifier, inspectedObject) {
        var result = true;
        _gpfObjectForEach(interfaceSpecifier.prototype, function (referenceMethod, name) {
            if (name === "constructor") {
                // ignore
                return;
            }
            if (_gpfInterfaceIsInvalidMethod(referenceMethod, inspectedObject[name])) {
                result = false;
            }
        });
        return result;
    }
    /**
     * Retrieve an object implementing the expected interface from an object using the IUnknown interface
     *
     * @param {Function} interfaceSpecifier Reference interface
     * @param {Object} queriedObject Object to query
     * @return {Object|null} Object implementing the interface or null
     * @since 0.1.8
     */
    function _gpfInterfaceQueryThroughIUnknown(interfaceSpecifier, queriedObject) {
        var result = queriedObject.queryInterface(interfaceSpecifier);
        _gpfAssert(result === null || _gpfInterfaceIsImplementedBy(interfaceSpecifier, result), "Invalid result of queryInterface (must be null or an object implementing the interface)");
        return result;
    }
    /**
     * Retrieve an object implementing the expected interface from an object trying the IUnknown interface
     *
     * @param {Function} interfaceSpecifier Reference interface
     * @param {Object} queriedObject Object to query
     * @return {Object|null|undefined} Object implementing the interface or null,
     * undefined is returned when IUnknown is not implemented
     * @since 0.1.8
     */
    function _gpfInterfaceQueryTryIUnknown(interfaceSpecifier, queriedObject) {
        if (_gpfInterfaceIsImplementedBy(gpf.interfaces.IUnknown, queriedObject)) {
            return _gpfInterfaceQueryThroughIUnknown(interfaceSpecifier, queriedObject);
        }
    }
    /**
     * Retrieve an object implementing the expected interface from an object:
     * - Either the object implements the interface, it is returned
     * - Or the object implements IUnknown, then queryInterface is used
     *
     * @param {Function} interfaceSpecifier Reference interface
     * @param {Object} queriedObject Object to query
     * @return {Object|null|undefined} Object implementing the interface or null,
     * undefined is returned when IUnknown is not implemented
     * @since 0.1.8
     */
    function _gpfInterfaceQuery(interfaceSpecifier, queriedObject) {
        if (_gpfInterfaceIsImplementedBy(interfaceSpecifier, queriedObject)) {
            return queriedObject;
        }
        return _gpfInterfaceQueryTryIUnknown(interfaceSpecifier, queriedObject);
    }
    function _gpfInterfaceResolveSpecifier(interfaceSpecifier) {
        if (typeof interfaceSpecifier === "string") {
            return _gpfContext(interfaceSpecifier.split("."));
        }
        return interfaceSpecifier;
    }
    function _gpfInterfaceToInspectableObject(inspectedObject) {
        if (inspectedObject instanceof Function) {
            return inspectedObject.prototype;
        }
        return inspectedObject;
    }
    /**
     * @namespace gpf.interfaces
     * @description Root namespace for GPF interfaces
     * @since 0.1.8
     */
    var _gpfI = gpf.interfaces = {
        /**
         * Verify that the object (or class) implements the current interface
         *
         * @param {Function|String} interfaceSpecifier Interface specifier
         * @param {Object|Function} inspectedObject object (or class) to inspect.
         * @return {Boolean} True if implemented
         * @since 0.1.8
         */
        isImplementedBy: function (interfaceSpecifier, inspectedObject) {
            if (!inspectedObject) {
                return false;
            }
            return _gpfInterfaceIsImplementedBy(_gpfInterfaceResolveSpecifier(interfaceSpecifier), _gpfInterfaceToInspectableObject(inspectedObject));
        },
        /**
         * Retrieve an object implementing the expected interface from an object:
         * - Either the object implements the interface, it is returned
         * - Or the object implements IUnknown, then queryInterface is used
         *
         * @param {Function|String} interfaceSpecifier Interface specifier
         * @param {Object} queriedObject Object to query
         * @return {Object|null|undefined} Object implementing the interface or null,
         * undefined is returned when IUnknown is not implemented
         * @since 0.1.8
         */
        query: function (interfaceSpecifier, queriedObject) {
            return _gpfInterfaceQuery(_gpfInterfaceResolveSpecifier(interfaceSpecifier), queriedObject);
        }
    };
    /**
     * Internal interface definition helper
     *
     * @param {String} name Interface name
     * @param {Object} definition Interface definition association method names to the number
     * of parameters
     * @return {Function} Interface specifier
     * @since 0.1.9
     */
    function _gpfDefineInterface(name, definition) {
        var interfaceDefinition = { $interface: "gpf.interfaces.I" + name };
        Object.keys(definition).forEach(function (methodName) {
            interfaceDefinition[methodName] = _gpfCreateAbstractFunction(definition[methodName]);
        });
        return _gpfDefine(interfaceDefinition);
    }
    _gpfDefineInterface("Unknown", { "queryInterface": 1 });
    function _gpfCreateSortVariables(specifications) {
        return "var " + specifications.map(function (specification, index) {
            return "a" + index + "=a." + specification.property + ",b" + index + "=b." + specification.property;
        }).join(",") + ";";
    }
    function _gpfCreateSortComparison(type, left, right) {
        if (type === "string") {
            return left + ".localeCompare(" + right + ")";
        }
        // default is number
        return left + "-" + right;
    }
    function _gpfCreateSortCondition(specification, index) {
        var left, right;
        if (specification.ascending === false) {
            left = "b" + index;
            right = "a" + index;
        } else {
            left = "a" + index;
            right = "b" + index;
        }
        return "if(" + left + "!==" + right + ")return " + _gpfCreateSortComparison(specification.type, left, right) + ";";
    }
    function _gpfCreateSortBody(specifications) {
        return _gpfCreateSortVariables(specifications) + specifications.map(_gpfCreateSortCondition).join("") + "return 0;";
    }
    /**
     * Create a sorting function based on the given specification
     *
     * @param {gpf.typedef.sortItem[]} specifications Sort specification
     * @return {Function} Function that can compare two objects
     * @since 0.1.9
     */
    function _gpfCreateSortFunction(specifications) {
        return _gpfFunc([
            "a",
            "b"
        ], _gpfCreateSortBody(specifications));
    }
    /**
     * Create a sorting function based on the given specification
     *
     * @param {gpf.typedef.sortItem|gpf.typedef.sortItem[]} specifications Sort specification
     * @return {Function} Function that can compare two objects
     * @since 0.1.9
     */
    gpf.createSortFunction = function (specifications) {
        var arrayOfSpecifications;
        if (_gpfIsArray(specifications)) {
            arrayOfSpecifications = specifications;
        } else {
            arrayOfSpecifications = [specifications];
        }
        return _gpfCreateSortFunction(arrayOfSpecifications);
    };
    var _gpfCreateFilterConvert;
    function _gpfCreateFilterArrayConverter(member, operator) {
        return function (specification) {
            return "(" + specification[member].map(_gpfCreateFilterConvert).join(operator) + ")";
        };
    }
    function _gpfCreateFilterLike(specification) {
        return "/" + specification.regexp + "/.exec(" + _gpfCreateFilterConvert(specification.like) + ")";
    }
    var
        // List of converters
        _gpfCreateFilterConverters = {
            property: function (specification) {
                return "i." + specification.property;
            },
            eq: _gpfCreateFilterArrayConverter("eq", "==="),
            ne: _gpfCreateFilterArrayConverter("ne", "!=="),
            lt: _gpfCreateFilterArrayConverter("lt", "<"),
            lte: _gpfCreateFilterArrayConverter("lte", "<="),
            gt: _gpfCreateFilterArrayConverter("gt", ">"),
            gte: _gpfCreateFilterArrayConverter("gte", ">="),
            not: function (specification) {
                return "!" + _gpfCreateFilterConvert(specification.not);
            },
            like: function (specification) {
                var like = _gpfCreateFilterLike(specification);
                if (specification.group) {
                    return "(" + like + "||[])[" + specification.group + "]";
                }
                return like;
            },
            or: _gpfCreateFilterArrayConverter("or", "||"),
            and: _gpfCreateFilterArrayConverter("and", "&&"),
            undefined: function (specification) {
                return JSON.stringify(specification);
            }
        }, _gpfCreateFilterTypes = Object.keys(_gpfCreateFilterConverters);
    function _gpfCreateFilterGetType(specification) {
        if (typeof specification === "object") {
            return Object.keys(specification).filter(function (property) {
                return _gpfCreateFilterTypes.includes(property);
            })[_GPF_START];
        }
    }
    _gpfCreateFilterConvert = function (specification) {
        var type = _gpfCreateFilterGetType(specification), converter = _gpfCreateFilterConverters[type];
        return converter(specification);
    };
    function _gpfCreateFilterBody(specification) {
        return "return " + _gpfCreateFilterConvert(specification);
    }
    /**
     * Create a filtering function based on the given specification.
     *
     * @param {gpf.typedef.filterItem} specification Filter specification
     * @return {gpf.typedef.filterFunc} Function that takes an object and return a truthy / falsy value indicating if the
     * object matches the filter
     * @since 0.1.9
     */
    gpf.createFilterFunction = function (specification) {
        return _gpfFunc(["i"], _gpfCreateFilterBody(specification));
    };
    var _gpfIReadableStream = _gpfDefineInterface("ReadableStream", { "read": 1 });
    var _gpfIWritableStream = _gpfDefineInterface("WritableStream", { "write": 1 });
    _gpfDefineInterface("Enumerator", {
        "reset": 0,
        "moveNext": 0,
        "getCurrent": 0
    });
    _gpfDefineInterface("FileStorage", {
        "getInfo": 1,
        "openTextStream": 2,
        "close": 1,
        "explore": 1,
        "createDirectory": 1,
        "deleteFile": 1,
        "deleteDirectory": 1
    });
    _gpfErrorDeclare("stream", {
        /**
         * ### Summary
         *
         * A read operation is already in progress
         *
         * ### Description
         *
         * This error is triggered if two reads are made simultaneously on the stream
         * @since 0.1.9
         */
        readInProgress: "A read operation is already in progress",
        /**
         * ### Summary
         *
         * A write operation is already in progress
         *
         * ### Description
         *
         * This error is triggered if two writes are made simultaneously on the stream
         * @since 0.1.9
         */
        writeInProgress: "A write operation is already in progress",
        /**
         * ### Summary
         *
         * Stream is in an invalid state
         *
         * ### Description
         *
         * If an error occurred while using the stream, no additional operations can be made
         * @since 0.1.9
         */
        invalidStreamState: "Stream is in an invalid state"
    });
    /**
     * @namespace gpf.stream
     * @description Root namespace for GPF streams
     * @since 0.1.9
     */
    gpf.stream = {};
    function _gpfStreamQuery(queriedObject, interfaceSpecifier, interfaceName) {
        var iStream = _gpfInterfaceQuery(interfaceSpecifier, queriedObject);
        if (!iStream) {
            gpf.Error.interfaceExpected({ name: interfaceName });
        }
        return iStream;
    }
    function _gpfStreamQueryCommon(queriedObject, interfaceSpecifier, interfaceName) {
        if (!queriedObject) {
            gpf.Error.interfaceExpected({ name: interfaceName });
        }
        return _gpfStreamQuery(queriedObject, interfaceSpecifier, interfaceName);
    }
    /**
     * Get an IReadableStream or fail if not implemented
     *
     * @param {Object} queriedObject Object to query
     * @return {gpf.interfaces.IReadableStream} IReadableStream interface
     * @throws {gpf.Error.InterfaceExpected}
     * @since 0.1.9
     */
    function _gpfStreamQueryReadable(queriedObject) {
        return _gpfStreamQueryCommon(queriedObject, _gpfIReadableStream, "gpf.interfaces.IReadableStream");
    }
    /**
     * Get an IWritableStream or fail if not implemented
     *
     * @param {Object} queriedObject Object to query
     * @return {gpf.interfaces.IWritableStream} IWritableStream interface
     * @throws {gpf.Error.InterfaceExpected}
     * @since 0.1.9
     */
    function _gpfStreamQueryWritable(queriedObject) {
        return _gpfStreamQueryCommon(queriedObject, _gpfIWritableStream, "gpf.interfaces.IWritableStream");
    }
    /* 'Hidden' properties used to secure Read / Write operations */
    var _gpfStreamProgressPropertyNamePrefix = "gpf.stream#progress", _gpfStreamProgressRead = _gpfStreamProgressPropertyNamePrefix + "/read", _gpfStreamProgressWrite = _gpfStreamProgressPropertyNamePrefix + "/write";
    /**
     * Install the progress flag used by _gpfStreamSecureRead and Write
     *
     * @param {Function} constructor Class constructor
     * @since 0.1.9
     */
    function _gpfStreamSecureInstallProgressFlag(constructor) {
        constructor.prototype[_gpfStreamProgressRead] = false;
        constructor.prototype[_gpfStreamProgressWrite] = false;
    }
    function _gpfStreamSecureStart(stream, flag, error) {
        if (stream[flag]) {
            gpf.Error[error]();
        }
        stream[flag] = true;
    }
    /**
     * Starts a secured read operation (if possible)
     *
     * @param {Object} stream configured with {@see _gpfStreamSecureInstallProgressFlag}
     * @throws {gpf.Error.ReadInProgress}
     * @since 0.2.3
     */
    function _gpfStreamProgressStartRead(stream) {
        _gpfStreamSecureStart(stream, _gpfStreamProgressRead, "readInProgress");
    }
    /**
     * Ends a read operation
     *
     * @param {Object} stream configured with {@see _gpfStreamSecureInstallProgressFlag}
     * @since 0.2.3
     */
    function _gpfStreamProgressEndRead(stream) {
        stream[_gpfStreamProgressRead] = false;
    }
    /**
     * Starts a secured write operation (if possible)
     *
     * @param {Object} stream configured with {@see _gpfStreamSecureInstallProgressFlag}
     * @throws {gpf.Error.WriteInProgress}
     * @since 0.2.3
     */
    function _gpfStreamProgressStartWrite(stream) {
        _gpfStreamSecureStart(stream, _gpfStreamProgressWrite, "writeInProgress");
    }
    /**
     * Ends a write operation
     *
     * @param {Object} stream configured with {@see _gpfStreamSecureInstallProgressFlag}
     * @since 0.2.3
     */
    function _gpfStreamProgressEndWrite(stream) {
        stream[_gpfStreamProgressWrite] = false;
    }
    function _gpfStreamSecureEnd(promise, stream, endMethod) {
        return promise.then(function (result) {
            endMethod(stream);
            return Promise.resolve(result);
        }, function (reason) {
            endMethod(stream);
            return Promise.reject(reason);
        });
    }
    /**
     * Generate a wrapper to query IWritableStream from the parameter and secure multiple calls to stream#read
     *
     * @param {Function} read Read function
     * @return {Function} Function exposing {@see gpf.interfaces.IReadableStream#read}
     * @gpf:closure
     * @since 0.1.9
     */
    function _gpfStreamSecureRead(read) {
        return function (output) {
            var me = this,
                //eslint-disable-line no-invalid-this
                iWritableStream = _gpfStreamQueryWritable(output);
            _gpfStreamProgressStartRead(me);
            return _gpfStreamSecureEnd(read.call(me, iWritableStream), me, _gpfStreamProgressEndRead);
        };
    }
    /**
     * Generate a wrapper to secure multiple calls to stream#write
     *
     * @param {Function} write Write function
     * @return {Function} Function exposing {@see gpf.interfaces.IWritableStream#write}
     * @gpf:closure
     * @since 0.1.9
     */
    function _gpfStreamSecureWrite(write) {
        return function (buffer) {
            var me = this;
            //eslint-disable-line no-invalid-this
            _gpfStreamProgressStartWrite(me);
            return _gpfStreamSecureEnd(write.call(me, buffer), me, _gpfStreamProgressEndWrite);
        };
    }
    var _GpfStreamReadableString = _gpfDefine({
            $class: "gpf.stream.ReadableString",
            /**
             * Wraps a string inside a readable stream
             *
             * @constructor gpf.stream.ReadableString
             * @implements {gpf.interfaces.IReadableStream}
             * @param {String} buffer String buffer
             * @since 0.1.9
             */
            constructor: function (buffer) {
                this._buffer = buffer;
            },
            //region gpf.interfaces.IReadableStream
            /**
             * @gpf:sameas gpf.interfaces.IReadableStream#read
             * @since 0.1.9
             */
            read: _gpfStreamSecureRead(function (output) {
                return output.write(this._buffer);    //eslint-disable-line no-invalid-this
            }),
            //endregion
            /**
             * Buffer
             * @since 0.1.9
             */
            _buffer: ""
        }),
        /**
         * @since 0.1.9
         */
        _GpfStreamWritableString = _gpfDefine({
            $class: "gpf.stream.WritableString",
            /**
             * Creates a writable stream that can be converted to string
             *
             * @constructor gpf.stream.WritableString
             * @implements {gpf.interfaces.IWritableStream}
             * @since 0.1.9
             */
            constructor: function () {
                this._buffer = [];
            },
            //region gpf.interfaces.IReadableStream
            /**
             * @gpf:sameas gpf.interfaces.IWritableStream#write
             * @since 0.1.9
             */
            write: _gpfStreamSecureWrite(function (buffer) {
                this._buffer.push(buffer.toString());
                //eslint-disable-line no-invalid-this
                return Promise.resolve();
            }),
            //endregion
            toString: function () {
                return this._buffer.join("");
            },
            /**
             * Buffer
             *
             * @type {String[]}
             * @since 0.1.9
             */
            _buffer: []
        });
    _gpfStreamSecureInstallProgressFlag(_GpfStreamReadableString);
    _gpfStreamSecureInstallProgressFlag(_GpfStreamWritableString);
    _gpfErrorDeclare("fs", {
        /**
         * ### Summary
         *
         * Incompatible stream
         *
         * ### Description
         *
         * This error is used when a file storage tries to close a stream that was not allocaetd by itself.
         * @since 0.1.9
         */
        incompatibleStream: "Incompatible stream"
    });
    var
        /**
         * File system type constants
         * @since 0.1.9
         */
        _GPF_FS_TYPES = {
            NOT_FOUND: 0,
            DIRECTORY: 1,
            FILE: 2,
            UNKNOWN: 3
        },
        /**
         * File system stream opening mode
         * @since 0.1.9
         */
        _GPF_FS_OPENFOR = {
            READING: 0,
            APPENDING: 1
        },
        /**
         * Host {@see gpf.interfaces.IFileStorage} implementation
         *
         * @type {gpf.interfaces.IFileStorage}
         * @since 0.2.1
         */
        _gpfFileStorageImpl = null;
    /**
     * Set the file storage implementation if the host matches
     *
     * @param {String} host host to test, if matching with the current one, an instance of the FileStorageClass is created
     * @param {Function} FileStorageClass Class of the host specific file storage implementation
     * @since 0.2.6
     */
    function _gpfFsSetFileStorageIf(host, FileStorageClass) {
        if (host === _gpfHost) {
            _gpfFileStorageImpl = new FileStorageClass();
        }
    }
    /**
     * @namespace gpf.fs
     * @description Root namespace for filesystem specifics
     * @since 0.1.9
     */
    gpf.fs = {
        /**
         * File system object type enumeration
         *
         * @enum {Number}
         * @readonly
         * @since 0.1.9
         */
        types: {
            /**
             * Storage path does not exist
             * @since 0.1.9
             */
            notFound: _GPF_FS_TYPES.NOT_FOUND,
            /**
             * Storage path points to a container of files
             * @since 0.1.9
             */
            directory: _GPF_FS_TYPES.DIRECTORY,
            /**
             * Storage path points to a stream-able file
             * @since 0.1.9
             */
            file: _GPF_FS_TYPES.FILE,
            /**
             * Storage path points to an object but it can't be handled
             * @since 0.1.9
             */
            unknown: _GPF_FS_TYPES.UNKNOWN
        },
        /**
         * File system open mode enumeration
         *
         * @enum {Number}
         * @readonly
         * @since 0.1.9
         */
        openFor: {
            /**
             * Read as a IReadableStream from the beginning of the file
             * @since 0.1.9
             */
            reading: _GPF_FS_OPENFOR.READING,
            /**
             * Append as a IWritableStream to the end of the file.
             * NOTE: if you want to overwrite a file, delete it first
             * @since 0.1.9
             */
            appending: _GPF_FS_OPENFOR.APPENDING
        },
        /**
         * Get the current host file storage (null if none)
         *
         * @return {gpf.interfaces.IFileStorage|null} IFileStorage interface
         * @since 0.1.9
         */
        getFileStorage: function () {
            return _gpfFileStorageImpl;
        }
    };
    _gpfErrorDeclare("path", {
        /**
         * ### Summary
         *
         * Unreachable path
         *
         * ### Description
         *
         * This error is triggered when trying to get the parent of a root path using gpf.path.parent or
         * gpf.path.join with ..
         * @see gpf.path.join
         * @see gpf.path.parent
         * @since 0.1.9
         */
        unreachablePath: "Unreachable path"
    });
    //region _gpfPathDecompose
    function _gpfPathSplit(path) {
        if (path.includes("\\")) {
            // DOS path is case insensitive, hence lowercase it
            return path.toLowerCase().split("\\");
        }
        // Assuming a Unix-like path
        return path.split("/");
    }
    function _gpfPathRemoveTrailingBlank(splitPath) {
        var last = splitPath.pop();
        if (last) {
            splitPath.push(last);    // Put it back
        }
    }
    function _gpfPathUp(splitPath) {
        if (splitPath.length) {
            splitPath.pop();
        } else {
            gpf.Error.unreachablePath();
        }
    }
    /**
     * Normalize paths and returns an array of parts.
     * If a DOS-like path is detected (use of \), it is lower-cased
     *
     * @param {String} path Path to normalize
     * @return {String[]} Normalized path represented as an array of parts
     * @since 0.1.9
     */
    function _gpfPathDecompose(path) {
        var splitPath = _gpfPathSplit(path);
        _gpfPathRemoveTrailingBlank(splitPath);
        return splitPath;
    }
    //endregion
    /**
     * Normalize path
     *
     * @param {String} path Path to normalize
     * @return {String} Normalized path
     * @since 0.1.9
     */
    function _gpfPathNormalize(path) {
        return _gpfPathDecompose(path).join("/");
    }
    /**
     * Get the last name of a path
     *
     * @param {String} path Path to analyze
     * @return {String} Name
     * @since 0.1.9
     */
    function _gpfPathName(path) {
        if (path) {
            return _gpfPathDecompose(path).pop();
        }
        return "";
    }
    /**
     * Get the extension of the last name of a path (including dot)
     *
     * @param {String} path Path to analyze
     * @return {String} Extension (including dot)
     * @since 0.1.9
     */
    function _gpfPathExtension(path) {
        var name = _gpfPathName(path), pos = name.lastIndexOf(".");
        if (pos === _GPF_NOT_FOUND) {
            return "";
        }
        return name.substring(pos);
    }
    var _gpfPathAppendPatterns = {
        "": function (splitPath) {
            splitPath.length = 0;
            splitPath.push("");    // Will start with /
        },
        ".": _gpfEmptyFunc,
        "..": function (splitPath) {
            _gpfPathUp(splitPath);
        }
    };
    function _gpfPathAppend(splitPath, relativePath) {
        _gpfArrayForEach(_gpfPathDecompose(relativePath), function (relativeItem) {
            var pattern = _gpfPathAppendPatterns[relativeItem];
            if (pattern) {
                pattern(splitPath);
            } else {
                splitPath.push(relativeItem);
            }
        });
    }
    /**
     * Join all arguments together and normalize the resulting path
     *
     * @param {String} path Base path
     * @param {...String} relativePath Relative parts to append to the base path
     * @return {String} Joined path
     * @throws {gpf.Error.UnreachablePath}
     * @since 0.1.9
     */
    function _gpfPathJoin(path) {
        var splitPath = _gpfPathDecompose(path);
        _gpfArrayTail(arguments).forEach(_gpfPathAppend.bind(null, splitPath));
        return splitPath.join("/");
    }
    function _gpfPathSafeShiftIdenticalBeginning(splitFromPath, splitToPath) {
        while (splitFromPath[_GPF_START] === splitToPath[_GPF_START]) {
            splitFromPath.shift();
            splitToPath.shift();
        }
    }
    function _gpfPathShiftIdenticalBeginning(splitFromPath, splitToPath) {
        if (splitFromPath.length * splitToPath.length) {
            // equivalent to splitFromPath.length && splitToPath.length
            _gpfPathSafeShiftIdenticalBeginning(splitFromPath, splitToPath);
        }
    }
    /**
     * Get the parent of a path
     *
     * @param {String} path Path to analyze
     * @return {String} Parent path
     * @throws {gpf.Error.UnreachablePath}
     * @since 0.1.9
     */
    function _gpfPathParent(path) {
        var splitPath = _gpfPathDecompose(path);
        _gpfPathUp(splitPath);
        return splitPath.join("/");
    }
    /**
     * Solve the relative path from from to to
     *
     * @param {String} from From path
     * @param {String} to To path
     * @return {String} Relative path
     * @since 0.1.9
     */
    function _gpfPathRelative(from, to) {
        var length, splitFrom = _gpfPathDecompose(from), splitTo = _gpfPathDecompose(to);
        _gpfPathShiftIdenticalBeginning(splitFrom, splitTo);
        // For each remaining part in from, unshift .. in to
        length = splitFrom.length;
        while (length--) {
            splitTo.unshift("..");
        }
        return splitTo.join("/");
    }
    /**
     * @namespace gpf.path
     * @description Root namespace for path manipulation.
     *
     * As the library works with several hosts (Windows and Unix-like, see {@tutorial LOADING}),
     * the API accepts any kind of [path separator](https://en.wikipedia.org/wiki/Path_%28computing%29).
     * However, they can't be mixed.
     *
     * When giving a path, the rule is:
     * - If the path contains at least one \, it is considered a Windows one
     * - Otherwise, the path is considered a Unix one
     *
     * On the other hand, all path returned by the API are using the Unix-like formalism.
     *
     * @since 0.1.9
     */
    gpf.path = {
        /**
         * @gpf:sameas _gpfPathJoin
         * @since 0.1.9
         */
        join: _gpfPathJoin,
        /**
         * @gpf:sameas _gpfPathParent
         * @since 0.1.9
         */
        parent: _gpfPathParent,
        /**
         * @gpf:sameas _gpfPathName
         * @since 0.1.9
         */
        name: _gpfPathName,
        /**
         * Get the last name of a path without the extension
         *
         * @param {String} path Path to analyze
         * @return {String} Name without the extension
         * @since 0.1.9
         */
        nameOnly: function (path) {
            var name = _gpfPathName(path), pos = name.lastIndexOf(".");
            if (pos === _GPF_NOT_FOUND) {
                return name;
            }
            return name.substring(_GPF_START, pos);
        },
        /**
         * @gpf:sameas _gpfPathExtension
         * @since 0.1.9
         */
        extension: _gpfPathExtension,
        /**
         * @gpf:sameas _gpfPathRelative
         * @since 0.1.9
         */
        relative: _gpfPathRelative
    };
    var GPF_FS_EXPLORE_BEFORE_START = -1;
    /**
     * Automate the use of getInfo on a path array to implement IFileStorage.explore
     *
     * @param {gpf.interfaces.IFileStorage} iFileStorage File storage to get info from
     * @param {String[]} listOfPaths List of paths to return
     * @return {gpf.interfaces.IEnumerator} IEnumerator interface
     * @gpf:closure
     * @since 0.1.9
     */
    function _gpfFsExploreEnumerator(iFileStorage, listOfPaths) {
        var pos = GPF_FS_EXPLORE_BEFORE_START, info;
        return {
            reset: function () {
                pos = GPF_FS_EXPLORE_BEFORE_START;
                return Promise.resolve();
            },
            moveNext: function () {
                ++pos;
                info = undefined;
                if (pos < listOfPaths.length) {
                    return iFileStorage.getInfo(listOfPaths[pos]).then(function (fsInfo) {
                        info = fsInfo;
                        return info;
                    });
                }
                return Promise.resolve();
            },
            getCurrent: function () {
                return info;
            }
        };
    }
    var _GpfNodeBaseStream = _gpfDefine({
            $class: "gpf.node.BaseStream",
            /**
             * Base class wrapping NodeJS streams
             *
             * @param {Object} stream NodeJS stream object
             * @param {Function} [close] Close handler
             *
             * @constructor gpf.node.BaseStream
             * @since 0.1.9
             */
            constructor: function (stream, close) {
                this._stream = stream;
                if (typeof close === "function") {
                    this._close = close;
                }
                stream.on("error", this._onError.bind(this));
            },
            /**
             * Function to be called when the stream is closed
             * @type {Function}
             * @since 0.1.9
             */
            _close: _gpfEmptyFunc,
            /**
             * Close the stream
             *
             * @return {Promise} Resolved when closed
             * @since 0.1.9
             */
            close: function () {
                return this._close();
            },
            //region Error handling
            /**
             * NodeJS stream object
             * @since 0.1.9
             */
            _stream: null,
            /**
             * The stream has an invalid state and can't be used anymore
             * @since 0.1.9
             */
            _invalid: false,
            /**
             * Current promise rejection callback
             * @type {Function}
             * @since 0.1.9
             */
            _reject: gpf.Error.invalidStreamState,
            /**
             * If the stream has an invalid state, the exception {@see gpf.Error.InvalidStreamState} is thrown
             *
             * @throws {gpf.Error.InvalidStreamState}
             * @since 0.1.9
             */
            _checkIfValid: function () {
                if (this._invalid) {
                    gpf.Error.invalidStreamState();
                }
            },
            /**
             * Bound to the error event of the stream, reject the current promise if it occurs.
             *
             * @param {*} error Stream error
             * @since 0.1.9
             */
            _onError: function (error) {
                this._invalid = true;
                this._reject(error);
            }    //endregion
        }),
        /**
         * Wraps a readable stream from NodeJS into a IReadableStream
         *
         * @param {Object} stream NodeJS stream object
         * @param {Function} [close] Close handler
         *
         * @class gpf.node.ReadableStream
         * @extends gpf.node.BaseStream
         * @implements {gpf.interfaces.IReadableStream}
         * @since 0.1.9
         */
        _GpfNodeReadableStream = _gpfDefine({
            $class: "gpf.node.ReadableStream",
            $extend: "gpf.node.BaseStream",
            //region gpf.interfaces.IReadableStream
            /**
             * @gpf:sameas gpf.interfaces.IReadableStream#read
             * @since 0.1.9
             */
            read: _gpfStreamSecureRead(function (output) {
                var me = this,
                    //eslint-disable-line no-invalid-this
                    stream = me._stream;
                return new Promise(function (resolve, reject) {
                    me._reject = reject;
                    me._checkIfValid();
                    stream.on("data", me._onData.bind(me, output)).on("end", function () {
                        me._invalid = true;
                        resolve();
                    });
                });
            }),
            //endregion
            /**
             * Stream 'data' event handler
             *
             * @param {gpf.interfaces.IWritableStream} output Output stream
             * @param {Object} chunk Buffer
             * @since 0.1.9
             */
            _onData: function (output, chunk) {
                var me = this, stream = me._stream;
                stream.pause();
                output.write(chunk).then(function () {
                    stream.resume();
                }, me._reject);
            }
        }),
        /**
         * Wraps a writable stream from NodeJS into a IWritableStream
         *
         * @param {Object} stream NodeJS stream object
         * @param {Function} [close] Close handler
         *
         * @class gpf.node.WritableStream
         * @extends gpf.node.BaseStream
         * @implements {gpf.interfaces.IWritableStream}
         * @since 0.1.9
         */
        _GpfNodeWritableStream = _gpfDefine({
            $class: "gpf.node.WritableStream",
            $extend: "gpf.node.BaseStream",
            //region gpf.interfaces.IWritableStream
            /**
             * @gpf:sameas gpf.interfaces.IWritableStream#write
             * @since 0.1.9
             */
            write: _gpfStreamSecureWrite(function (buffer) {
                var me = this,
                    //eslint-disable-line no-invalid-this
                    stream = me._stream;
                return new Promise(function (resolve, reject) {
                    var noDrain;
                    me._reject = reject;
                    me._checkIfValid();
                    noDrain = stream.write(buffer, function (error) {
                        if (!error && noDrain) {
                            resolve();
                        }
                    });
                    if (!noDrain) {
                        stream.once("drain", function () {
                            resolve();
                        });
                    }
                });
            })    //endregion
        });
    function _gpfFsCloseBuild(ExpectedBaseClass) {
        return function (stream) {
            if (stream instanceof ExpectedBaseClass) {
                return stream.close();
            }
            return Promise.reject(new gpf.Error.IncompatibleStream());
        };
    }
    function _gpfFsNodeFsCall(methodName, args) {
        return new Promise(function (resolve, reject) {
            _gpfNodeFs[methodName].apply(_gpfNodeFs, args.concat([function (err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }]));
        });
    }
    /**
     * Encapsulate fs API taking a path parameter inside a Promise
     *
     * @param {String} methodName fs method name
     * @param {String} path file path
     * @return {Promise<*>} Resolved with API result
     * @gpf:closure
     * @since 0.1.9
     */
    function _gpfFsNodeFsCallWithPath(methodName, path) {
        return _gpfFsNodeFsCall(methodName, [_gpfPathNormalize(path)]);
    }
    function _gpfFsNodeOpenTextStream(path, options) {
        return _gpfFsNodeFsCall("open", [
            _gpfPathNormalize(path),
            options.flags
        ]).then(function (fd) {
            return new options.GpfStream(_gpfNodeFs[options.nodeStream]("", {
                fd: fd,
                autoClose: false
            }), _gpfFsNodeFsCall.bind(null, "close", [fd]));
        });
    }
    /**
     * Open a text stream for reading
     *
     * @param {String} path File path
     * @return {Promise<gpf.interfaces.IReadableStream>} gpf.node.ReadableStream
     * @since 0.1.9
     */
    function _gpfFsNodeOpenTextStreamForReading(path) {
        return _gpfFsNodeOpenTextStream(path, {
            flags: "r",
            GpfStream: _GpfNodeReadableStream,
            nodeStream: "createReadStream"
        });
    }
    /**
     * Open a text stream for appending
     *
     * @param {String} path File path
     * @return {Promise<gpf.interfaces.IWritableStream>} gpf.node.WritableStream
     * @since 0.1.9
     */
    function _gpfFsNodeOpenTextStreamForAppending(path) {
        return _gpfFsNodeOpenTextStream(path, {
            flags: "a",
            GpfStream: _GpfNodeWritableStream,
            nodeStream: "createWriteStream"
        });
    }
    function _gpfFsNodeGetFileType(stats) {
        if (stats.isFile()) {
            return _GPF_FS_TYPES.FILE;
        }
        return _GPF_FS_TYPES.UNKNOWN;
    }
    function _gpfFsNodeGetType(stats) {
        if (stats.isDirectory()) {
            return _GPF_FS_TYPES.DIRECTORY;
        }
        return _gpfFsNodeGetFileType(stats);
    }
    /**
     * NodeJS specific IFileStorage implementation
     *
     * @class gpf.node.FileStorage
     * @implements {gpf.interfaces.IFileStorage}
     * @private
     * @since 0.1.9
     */
    var _GpfNodeFileStorage = _gpfDefine({
        $class: "gpf.node.FileStorage",
        //region gpf.interfaces.IFileStorage
        /**
         * @gpf:sameas gpf.interfaces.IFileStorage#getInfo
         * @since 0.1.9
         */
        getInfo: function (unnormalizedPath) {
            var path = _gpfPathNormalize(unnormalizedPath);
            return new Promise(function (resolve) {
                _gpfNodeFs.exists(path, resolve);
            }).then(function (exists) {
                if (exists) {
                    return _gpfFsNodeFsCallWithPath("stat", path).then(function (stats) {
                        return {
                            fileName: _gpfNodePath.basename(path),
                            filePath: _gpfPathNormalize(_gpfNodePath.resolve(path)),
                            size: stats.size,
                            createdDateTime: stats.ctime,
                            modifiedDateTime: stats.mtime,
                            type: _gpfFsNodeGetType(stats)
                        };
                    });
                }
                return { type: _GPF_FS_TYPES.NOT_FOUND };
            });
        },
        /**
         * @gpf:sameas gpf.interfaces.IFileStorage#openTextStream
         * @since 0.1.9
         */
        openTextStream: function (path, mode) {
            if (_GPF_FS_OPENFOR.READING === mode) {
                return _gpfFsNodeOpenTextStreamForReading(path);
            }
            return _gpfFsNodeOpenTextStreamForAppending(path);
        },
        /**
         * @gpf:sameas gpf.interfaces.IFileStorage#close
         * @since 0.1.9
         */
        close: _gpfFsCloseBuild(_GpfNodeBaseStream),
        /**
         * @gpf:sameas gpf.interfaces.IFileStorage#explore
         * @since 0.1.9
         */
        explore: function (path) {
            var me = this;
            return _gpfFsNodeFsCallWithPath("readdir", path).then(function (content) {
                return _gpfFsExploreEnumerator(me, content.map(function (name) {
                    return _gpfPathJoin(path, name);
                }));
            });
        },
        /**
         * @gpf:sameas gpf.interfaces.IFileStorage#createDirectory
         * @since 0.1.9
         */
        createDirectory: _gpfFsNodeFsCallWithPath.bind(null, "mkdir"),
        /**
         * @gpf:sameas gpf.interfaces.IFileStorage#deleteFile
         * @since 0.1.9
         */
        deleteFile: _gpfFsNodeFsCallWithPath.bind(null, "unlink"),
        /**
         * @gpf:sameas gpf.interfaces.IFileStorage#deleteDirectory
         * @since 0.1.9
         */
        deleteDirectory: _gpfFsNodeFsCallWithPath.bind(null, "rmdir")    //endregion
    });
    _gpfFsSetFileStorageIf(_GPF_HOST.NODEJS, _GpfNodeFileStorage);
    var _GPF_STREAM_WSCRIPT_BUFFER_SIZE = 4096, _GpfWscriptBaseStream = _gpfDefine({
            $class: "gpf.wscript.BaseStream",
            /**
             * Base class wrapping NodeJS streams
             *
             * @constructor gpf.wscript.BaseStream
             * @param {Object} file File object
             * @since 0.1.9
             */
            constructor: function (file) {
                this._file = file;
            },
            /**
             * Close the stream
             *
             * @return {Promise} Resolved when closed
             * @since 0.1.9
             */
            close: function () {
                return new Promise(function (resolve) {
                    this._file.Close();
                    resolve();
                }.bind(this));
            }
        }),
        /**
         * Wraps a file object from FileSystemObject into a IReadableStream
         *
         * @class gpf.wscript.ReadableStream
         * @extends gpf.wscript.BaseStream
         * @implements {gpf.interfaces.IReadableStream}
         * @since 0.1.9
         */
        _GpfWscriptReadableStream = _gpfDefine({
            $class: "gpf.wscript.ReadableStream",
            $extend: "gpf.wscript.BaseStream",
            //region gpf.interfaces.IReadableStream
            /**
             * @gpf:sameas gpf.interfaces.IReadableStream#read
             * @since 0.1.9
             */
            read: _gpfStreamSecureRead(function (output) {
                var me = this,
                    //eslint-disable-line no-invalid-this
                    file = me._file;
                return new Promise(function (resolve) {
                    function read() {
                        return output.write(file.Read(_GPF_STREAM_WSCRIPT_BUFFER_SIZE)).then(function () {
                            if (!file.AtEndOfStream) {
                                return read();
                            }
                        });
                    }
                    return read().then(resolve);
                });
            })    //endregion
        }),
        /**
         * Wraps a file object from FileSystemObject into a IWritableStream
         *
         * @class gpf.wscript.WritableStream
         * @extends gpf.wscript.BaseStream
         * @implements {gpf.interfaces.IWritableStream}
         * @since 0.1.9
         */
        _GpfWscriptWritableStream = _gpfDefine({
            $class: "gpf.wscript.WritableStream",
            $extend: "gpf.wscript.BaseStream",
            //region gpf.interfaces.IWritableStream
            /**
             * @gpf:sameas gpf.interfaces.IWritableStream#write
             * @since 0.1.9
             */
            write: _gpfStreamSecureWrite(function (buffer) {
                var me = this,
                    //eslint-disable-line no-invalid-this
                    file = me._file;
                return new Promise(function (resolve) {
                    file.Write(buffer);
                    resolve();
                });
            })    //endregion
        });
    _gpfErrorDeclare("fs/wscript", {
        /**
         * ### Summary
         *
         * Path not explorable
         *
         * ### Description
         *
         * This error is used when explore is used with a path that does not point to a folder.
         * @since 0.2.1
         */
        pathNotExplorable: "Path not explorable"
    });
    /**
     * Translate WScript file object into a {@link gpf.typedef.fileStorageInfo}
     *
     * @param {Object} obj WScript file object
     * @param {gpf.fs.types} type Object type
     * @return {gpf.typedef.fileStorageInfo} Information about the object
     * @since 0.1.9
     */
    function _gpfFsWScriptObjToFileStorageInfo(obj, type) {
        return {
            type: type,
            fileName: obj.Name.toLowerCase(),
            filePath: _gpfPathNormalize(obj.Path),
            size: obj.Size,
            createdDateTime: new Date(obj.DateCreated),
            modifiedDateTime: new Date(obj.DateLastModified)
        };
    }
    function _gpfFsWscriptFSOCallWithArg(name, path) {
        return new Promise(function (resolve) {
            _gpfMsFSO[name](_gpfPathDecompose(path).join("\\"));
            resolve();
        });
    }
    function _gpfFsWscriptFSOCallWithArgAndTrue(name, path) {
        return new Promise(function (resolve) {
            _gpfMsFSO[name](_gpfPathDecompose(path).join("\\"), true);
            resolve();
        });
    }
    function _gpfFsWscriptGetFileInfo(path) {
        if (_gpfMsFSO.FileExists(path)) {
            return _gpfFsWScriptObjToFileStorageInfo(_gpfMsFSO.GetFile(path), _GPF_FS_TYPES.FILE);
        }
        return { type: _GPF_FS_TYPES.NOT_FOUND };
    }
    function _gpfFsWscriptGetInfo(path) {
        if (_gpfMsFSO.FolderExists(path)) {
            return _gpfFsWScriptObjToFileStorageInfo(_gpfMsFSO.GetFolder(path), _GPF_FS_TYPES.DIRECTORY);
        }
        return _gpfFsWscriptGetFileInfo(path);
    }
    function _gpfFsWScriptExploreList(collection) {
        var fsoEnum = new Enumerator(collection), results = [];
        for (; !fsoEnum.atEnd(); fsoEnum.moveNext()) {
            results.push(fsoEnum.item().Path);
        }
        return results;
    }
    function _gpfFsWScriptExplore(path) {
        var folder;
        if (_gpfMsFSO.FolderExists(path)) {
            folder = _gpfMsFSO.GetFolder(path);
            return _gpfFsWScriptExploreList(folder.SubFolders).concat(_gpfFsWScriptExploreList(folder.Files));
        }
        gpf.Error.pathNotExplorable();
    }
    var _GPF_FS_WSCRIPT_APPENDING = 8;
    /**
     * WScript specific IFileStorage implementation
     *
     * @class gpf.wscript.FileStorage
     * @implements {gpf.interfaces.IFileStorage}
     * @private
     * @since 0.1.9
     */
    var _GpfWScriptFileStorage = _gpfDefine({
        $class: "gpf.wscript.FileStorage",
        //region gpf.interfaces.IFileStorage
        /**
         * @gpf:sameas gpf.interfaces.IFileStorage#getInfo
         * @since 0.1.9
         */
        getInfo: function (path) {
            return Promise.resolve(_gpfFsWscriptGetInfo(_gpfPathDecompose(path).join("\\")));
        },
        /**
         * @gpf:sameas gpf.interfaces.IFileStorage#openTextStream
         * @since 0.1.9
         */
        openTextStream: function (unnormalizedPath, mode) {
            var path = _gpfPathDecompose(unnormalizedPath).join("\\");
            return new Promise(function (resolve) {
                var stream;
                if (_GPF_FS_OPENFOR.READING === mode) {
                    stream = new _GpfWscriptReadableStream(_gpfMsFSO.OpenTextFile(path, _GPF_FS_WSCRIPT_READING, false));
                } else {
                    stream = new _GpfWscriptWritableStream(_gpfMsFSO.OpenTextFile(path, _GPF_FS_WSCRIPT_APPENDING, true));
                }
                resolve(stream);
            });
        },
        /**
         * @gpf:sameas gpf.interfaces.IFileStorage#close
         * @since 0.1.9
         */
        close: _gpfFsCloseBuild(_GpfWscriptBaseStream),
        /**
         * @gpf:sameas gpf.interfaces.IFileStorage#explore
         * @since 0.1.9
         */
        explore: function (path) {
            var me = this;
            return new Promise(function (resolve) {
                resolve(_gpfFsExploreEnumerator(me, _gpfFsWScriptExplore(_gpfPathDecompose(path).join("\\"))));
            });
        },
        /**
         * @gpf:sameas gpf.interfaces.IFileStorage#createDirectory
         * @since 0.1.9
         */
        createDirectory: _gpfFsWscriptFSOCallWithArg.bind(null, "CreateFolder"),
        /**
         * @gpf:sameas gpf.interfaces.IFileStorage#deleteFile
         * @since 0.1.9
         */
        deleteFile: _gpfFsWscriptFSOCallWithArgAndTrue.bind(null, "DeleteFile"),
        /**
         * @gpf:sameas gpf.interfaces.IFileStorage#deleteDirectory
         * @since 0.1.9
         */
        deleteDirectory: _gpfFsWscriptFSOCallWithArgAndTrue.bind(null, "DeleteFolder")    //endregion
    });
    _gpfFsSetFileStorageIf(_GPF_HOST.WSCRIPT, _GpfWScriptFileStorage);
    var _gpfObjectToString = Object.prototype.toString;
    /**
     * Check if the parameter is a literal object
     *
     * @param {*} value Value to check
     * @return {Boolean} True if the value is a literal object
     * @since 0.2.1
     */
    function _gpfIsLiteralObject(value) {
        return value instanceof Object && _gpfObjectToString.call(value) === "[object Object]" && Object.getPrototypeOf(value) === Object.getPrototypeOf({});
    }
    /**
     * @gpf:sameas _gpfIsLiteralObject
     * @since 0.2.1
     */
    gpf.isLiteralObject = _gpfIsLiteralObject;
    _gpfErrorDeclare("web/tag", {
        /**
         * ### Summary
         *
         * Missing node name
         *
         * ### Description
         *
         * A tag can't be created if the node name is missing
         * @since 0.2.1
         */
        missingNodeName: "Missing node name",
        /**
         * ### Summary
         *
         * Unknown namespace prefix
         *
         * ### Description
         *
         * A prefix has been used prior to be associated with a namespace
         * @since 0.2.2
         */
        unknownNamespacePrefix: "Unknown namespace prefix",
        /**
         * ### Summary
         *
         * Unable to use namespace in string
         *
         * ### Description
         *
         * A prefix associated to a namespace has been used and can't be converted to string
         * @since 0.2.2
         */
        unableToUseNamespaceInString: "Unable to use namespace in string"
    });
    /**
     * Mapping of attribute name aliases
     * @type {Object}
     * @since 0.2.1
     */
    var _gpfWebTagAttributeAliases = { "className": "class" };
    /**
     * Mapping of prefixes for namespaces
     * @type {Object}
     * @since 0.2.2
     */
    var _gpfWebNamespacePrefix = {
        "svg": "http://www.w3.org/2000/svg",
        "xlink": "http://www.w3.org/1999/xlink"
    };
    /**
     * Retrieves namespace associated to the prefix or fail
     *
     * @param {String} prefix Namespace prefix
     * @return {String} Namespace URI
     * @throws {gpf.Error.UnknownNamespacePrefix}
     * @since 0.2.2
     */
    function _gpfWebGetNamespace(prefix) {
        var namespace = _gpfWebNamespacePrefix[prefix];
        if (undefined === namespace) {
            gpf.Error.unknownNamespacePrefix();
        }
        return namespace;
    }
    /**
     * Resolves prefixed name to namespace and name
     *
     * @param {String} name Attribute or node name
     * @return {{namespace, name}|undefined} Namespace and name in a structure if prefixed, undefined otherwise
     * @since 0.2.2
     */
    function _gpfWebGetNamespaceAndName(name) {
        var EXPECTED_PARTS_COUNT = 2, NAMESPACE_PREFIX = 0, NAME = 1, parts = name.split(":");
        if (parts.length === EXPECTED_PARTS_COUNT) {
            return {
                namespace: _gpfWebGetNamespace(parts[NAMESPACE_PREFIX]),
                name: parts[NAME]
            };
        }
    }
    /**
     * Fails if the name includes namespace prefix
     *
     * @param {String} name Attribute or node name
     * @throws {gpf.Error.UnableToUseNamespaceInString}
     * @since 0.2.2
     */
    function _gpfWebCheckNamespaceSafe(name) {
        if (name.includes(":")) {
            gpf.Error.unableToUseNamespaceInString();
        }
    }
    /**
     * Resolve attribute name
     *
     * @param {String} name Attribute name used in the tag function
     * @return {String} Attribute to set on the node ele,ment
     * @since 0.2.1
     */
    function _gpfWebTagAttributeAlias(name) {
        return _gpfWebTagAttributeAliases[name] || name;
    }
    /**
     * Apply the callback to each array item,
     * process recursively if the array item is an array
     *
     * @param {Array} array array of items
     * @param {Function} callback Function to apply on each array item
     * @since 0.2.1
     */
    function _gpfWebTagFlattenChildren(array, callback) {
        array.forEach(function (item) {
            if (_gpfIsArray(item)) {
                _gpfWebTagFlattenChildren(item, callback);
            } else {
                callback(item);
            }
        });
    }
    var _GpfWebTag = _gpfDefine({
        $class: "gpf.web.Tag",
        /**
         * Tag object
         *
         * @param {String} nodeName Node name
         * @param {Object} [attributes] Dictionary of attributes to set
         * @param {Array} [children] Children
         *
         * @constructor gpf.web.Tag
         * @private
         * @since 0.2.1
         */
        constructor: function (nodeName, attributes, children) {
            this._nodeName = nodeName;
            this._attributes = attributes || {};
            this._children = children;
        },
        /**
         * Node name
         * @since 0.2.1
         */
        _nodeName: "",
        /**
         * Node attributes
         * @since 0.2.1
         */
        _attributes: {},
        /**
         * Node children
         * @since 0.2.1
         */
        _children: [],
        //region toString implementation
        _getAttributesAsString: function () {
            return Object.keys(this._attributes).map(function (name) {
                _gpfWebCheckNamespaceSafe(name);
                return " " + _gpfWebTagAttributeAlias(name) + "=\"" + _gpfStringEscapeForHtml(this._attributes[name]) + "\"";
            }, this).join("");
        },
        _getChildrenAsString: function () {
            var result = [];
            _gpfWebTagFlattenChildren(this._children, function (child) {
                result.push(child.toString());
            });
            return result.join("");
        },
        _getClosingString: function () {
            if (this._children.length) {
                return ">" + this._getChildrenAsString() + "</" + this._nodeName + ">";
            }
            return "/>";
        },
        /**
         * Convert the current tag into HTML
         *
         * @return {String} HTML representation of the tag
         * @since 0.2.1
         */
        toString: function () {
            _gpfWebCheckNamespaceSafe(this._nodeName);
            return "<" + this._nodeName + this._getAttributesAsString() + this._getClosingString();
        },
        //endregion
        //region appendTo implementation
        _createElement: function (node) {
            var ownerDocument = node.ownerDocument, qualified = _gpfWebGetNamespaceAndName(this._nodeName);
            if (qualified) {
                return ownerDocument.createElementNS(qualified.namespace, qualified.name);
            }
            return ownerDocument.createElement(this._nodeName);
        },
        _setAttributesTo: function (node) {
            _gpfObjectForEach(this._attributes, function (value, name) {
                var qualified = _gpfWebGetNamespaceAndName(name);
                if (qualified) {
                    node.setAttributeNS(qualified.namespace, _gpfWebTagAttributeAlias(qualified.name), value);
                } else {
                    node.setAttribute(_gpfWebTagAttributeAlias(name), value);
                }
            });
        },
        _appendChildrenTo: function (node) {
            var ownerDocument = node.ownerDocument;
            _gpfWebTagFlattenChildren(this._children, function (child) {
                if (child instanceof _GpfWebTag) {
                    child.appendTo(node);
                } else {
                    node.appendChild(ownerDocument.createTextNode(child.toString()));
                }
            });
        },
        /**
         * Appends the tag to the provided node
         *
         * @param {Object} node Expected to be a DOM node
         * @return {Object} Created node
         * @since 0.2.1
         */
        appendTo: function (node) {
            var element = this._createElement(node);
            this._setAttributesTo(element);
            this._appendChildrenTo(element);
            return node.appendChild(element);
        }    //endregion
    });
    /**
     * Create a tag generation function
     *
     * @param {String} nodeName tag name.
     * May include the namespace prefix svg for [SVG elements](https://developer.mozilla.org/en-US/docs/Web/SVG)
     * @return {gpf.typedef.tagFunc} The tag generation function
     * @gpf:closure
     * @since 0.2.1
     */
    function _gpfWebTagCreateFunction(nodeName) {
        if (!nodeName) {
            gpf.Error.missingNodeName();
        }
        return function (firstParam) {
            var sliceFrom = 0, attributes;
            if (_gpfIsLiteralObject(firstParam)) {
                attributes = firstParam;
                ++sliceFrom;
            }
            return new _GpfWebTag(nodeName, attributes, _gpfArraySlice(arguments, sliceFrom));
        };
    }
    /**
     * @gpf:sameas _gpfWebTagCreateFunction
     * @since 0.2.1
     *
     * @example <caption>Tree building to string</caption>
     * var div = gpf.web.createTagFunction("div"),
     *     span = gpf.web.createTagFunction("span"),
     * tree = div({className: "test1"}, "Hello ", span({className: "test2"}, "World!"));
     * // tree.toString() gives <div class="test1">Hello <span class="test2">World!</span></div>
     *
     * @example <caption>Tree building to DOM</caption>
     * var mockNode = mockDocument.createElement("any"),
     *     div = gpf.web.createTagFunction("div"),
     *     span = gpf.web.createTagFunction("span"),
     *     tree = div({className: "test"}, "Hello ", span("World!")),
     *     result = tree.appendTo(mockNode);
     *
     * @example <caption>SVG building</caption>
     * var mockNode = mockDocument.createElement("any"),
     *     svgImage = gpf.web.createTagFunction("svg:image"),
     *     tree = svgImage({x: 0, y: 0, "xlink:href": "test.png"}),
     *     result = tree.appendTo(mockNode);
     *
     */
    gpf.web.createTagFunction = _gpfWebTagCreateFunction;
    gpf.http = {};
    /**
     * Http methods
     * @since 0.2.1
     */
    var _GPF_HTTP_METHODS = {
        GET: "GET",
        POST: "POST",
        PUT: "PUT",
        OPTIONS: "OPTIONS",
        DELETE: "DELETE",
        HEAD: "HEAD"
    };
    var _gpfHttpHeadersParserRE = new RegExp("([^:\\s]+)\\s*: ?([^\\r]*)", "gm"), _GPF_HTTP_HELPERS_HEADER_NAME = 1, _GPF_HTTP_HELPERS_HEADER_VALUE = 2;
    /**
     * Parse HTTP response headers
     *
     * @param {String} headers Response headers
     * @return {Object} headers dictionary
     * @since 0.2.1
     */
    function _gpfHttpParseHeaders(headers) {
        var result = {};
        _gpfArrayForEach(_gpfRegExpForEach(_gpfHttpHeadersParserRE, headers), function (match) {
            result[match[_GPF_HTTP_HELPERS_HEADER_NAME]] = match[_GPF_HTTP_HELPERS_HEADER_VALUE];
        });
        return result;
    }
    /**
     * Generates a function that transmit headers to the http object
     *
     * @param {String} methodName Name of the method to call
     * @return {Function} Method to set the headers
     * @gpf:closure
     * @since 0.2.1
     */
    function _gpfHttpGenSetHeaders(methodName) {
        return function (httpObj, headers) {
            if (headers) {
                Object.keys(headers).forEach(function (headerName) {
                    httpObj[methodName](headerName, headers[headerName]);
                });
            }
        };
    }
    /**
     * Generates a function that implements the http send logic
     *
     * @param {String} methodName Name of the method to call
     * @return {Function} Method to trigger the send
     * @gpf:closure
     * @since 0.2.1
     */
    function _gpfHttpGenSend(methodName) {
        return function (httpObj, data) {
            if (data) {
                httpObj[methodName](data);
            } else {
                httpObj[methodName]();
            }
        };
    }
    /**
     * Generates a function that extracts response from the http object
     *
     * @param {String} status Name of the status property
     * @param {String} getAllResponseHeaders Name of the getAllResponseHeaders method
     * @param {String} responseText Name of the responseText property
     * @return {Function} Method to generate response
     * @gpf:closure
     * @since 0.2.7
     */
    function _gpfHttpGenGetResponse(status, getAllResponseHeaders, responseText) {
        return function (httpObj) {
            return {
                status: httpObj[status],
                headers: _gpfHttpParseHeaders(httpObj[getAllResponseHeaders]()),
                responseText: httpObj[responseText]
            };
        };
    }
    var _gpfIThenable = _gpfDefineInterface("Thenable", { "then": 2 });
    /**
     * Converts any value into a promise.
     * If the value implements {@link gpf.interfaces.IThenable}, it is considered as a promise.
     *
     * @param {*} value Value to convert
     * @return {Promise<*>} Promisified version of the value
     * @since 0.2.2
     */
    function _gpfPromisify(value) {
        if (gpf.interfaces.isImplementedBy(gpf.interfaces.IThenable, value)) {
            return value;
        }
        return Promise.resolve(value);
    }
    /**
     * Converts value into a promise if not undefined.
     * If the value implements {@link gpf.interfaces.IThenable}, it is considered as a promise.
     *
     * @param {*} value Value to convert
     * @return {Promise<*>|undefined} Promisified version of the value or undefined
     * @since 0.2.2
     */
    function _gpfPromisifyDefined(value) {
        if (undefined !== value) {
            return _gpfPromisify(value);
        }
    }
    /**
     * @gpf:sameas _gpfPromisify
     * @since 0.2.2
     * @deprecated since version 0.2.6, use
     * [Promise.resolve](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve)
     * instead
     */
    gpf.promisify = _gpfPromisify;
    /**
     * @gpf:sameas _gpfPromisifyDefined
     * @since 0.2.2
     * @deprecated since version 0.2.6, use
     * [Promise.resolve](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve)
     * combined with a condition instead
     */
    gpf.promisifyDefined = _gpfPromisifyDefined;
    var _gpfHttpRequestImpl;
    /**
     * Set the http request implementation if the host matches
     *
     * @param {String} host host to test, if matching with the current one, the http request implementation is set
     * @param {Function} httpRequestImpl http request implementation function
     * @return {Function} Previous host specific implementation
     * @since 0.2.6
     */
    function _gpfHttpSetRequestImplIf(host, httpRequestImpl) {
        var result = _gpfHttpRequestImpl;
        if (host === _gpfHost) {
            _gpfHttpRequestImpl = httpRequestImpl;
        }
        return result;
    }
    /**
     * HTTP request common implementation
     *
     * @param {gpf.typedef.httpRequestSettings} request HTTP Request settings
     * @return {Promise<gpf.typedef.httpRequestResponse>} Resolved on request completion
     * @since 0.2.1
     */
    function _gpfHttpRequest(request) {
        return new Promise(function (resolve, reject) {
            _gpfHttpRequestImpl(request, resolve, reject);
        });
    }
    /**
     * Implementation of aliases
     *
     * @param {String} method HTTP method to apply
     * @param {String|gpf.typedef.httpRequestSettings} url Url to send the request to or a request settings object
     * @param {*} [data] Data to be sent to the server
     * @return {Promise<gpf.typedef.httpRequestResponse>} HTTP request promise
     * @since 0.2.1
     */
    function _gpfProcessAlias(method, url, data) {
        if (typeof url === "string") {
            return _gpfHttpRequest({
                method: method,
                url: url,
                data: data
            });
        }
        return _gpfHttpRequest(Object.assign({ method: method }, url));
    }
    Object.assign(gpf.http, /** @lends gpf.http */
    {
        /**
         * HTTP methods enumeration
         *
         * @enum {String}
         * @readonly
         * @since 0.2.1
         */
        methods: {
            /**
             * GET
             * @since 0.2.1
             */
            get: _GPF_HTTP_METHODS.GET,
            /**
             * POST
             * @since 0.2.1
             */
            post: _GPF_HTTP_METHODS.POST,
            /**
             * PUT
             * @since 0.2.1
             */
            put: _GPF_HTTP_METHODS.PUT,
            /**
             * OPTIONS
             * @since 0.2.1
             */
            options: _GPF_HTTP_METHODS.OPTIONS,
            /**
             * DELETE
             * @since 0.2.1
             */
            "delete": _GPF_HTTP_METHODS.DELETE,
            /**
             * HEAD
             * @since 0.2.2
             */
            head: _GPF_HTTP_METHODS.HEAD
        },
        /**
         * @gpf:sameas _gpfHttpRequest
         * @since 0.2.1
         */
        request: _gpfHttpRequest,
        /**
         * HTTP GET request
         *
         * @method
         * @param {String|gpf.typedef.httpRequestSettings} urlOrRequest URL or HTTP Request settings
         * @return {Promise<gpf.typedef.httpRequestResponse>} Resolved on request completion
         * @since 0.2.1
         */
        get: _gpfProcessAlias.bind(gpf.http, _GPF_HTTP_METHODS.GET),
        /**
         * HTTP POST request
         *
         * @method
         * @param {String|gpf.typedef.httpRequestSettings} urlOrRequest URL or HTTP Request settings
         * @param {String} data Data to POST
         * @return {Promise<gpf.typedef.httpRequestResponse>} Resolved on request completion
         * @since 0.2.1
         */
        post: _gpfProcessAlias.bind(gpf.http, _GPF_HTTP_METHODS.POST),
        /**
         * HTTP PUT request
         *
         * @method
         * @param {String|gpf.typedef.httpRequestSettings} urlOrRequest URL or HTTP Request settings
         * @param {String} data Data to PUT
         * @return {Promise<gpf.typedef.httpRequestResponse>} Resolved on request completion
         * @since 0.2.1
         */
        put: _gpfProcessAlias.bind(gpf.http, _GPF_HTTP_METHODS.PUT),
        /**
         * HTTP OPTIONS request
         *
         * @method
         * @param {String|gpf.typedef.httpRequestSettings} urlOrRequest URL or HTTP Request settings
         * @return {Promise<gpf.typedef.httpRequestResponse>} Resolved on request completion
         * @since 0.2.1
         */
        options: _gpfProcessAlias.bind(gpf.http, _GPF_HTTP_METHODS.OPTIONS),
        /**
         * HTTP DELETE request
         *
         * @method
         * @param {String|gpf.typedef.httpRequestSettings} urlOrRequest URL or HTTP Request settings
         * @return {Promise<gpf.typedef.httpRequestResponse>} Resolved on request completion
         * @since 0.2.1
         */
        "delete": _gpfProcessAlias.bind(gpf.http, _GPF_HTTP_METHODS.DELETE),
        /**
         * HTTP HEAD request
         *
         * @method
         * @param {String|gpf.typedef.httpRequestSettings} urlOrRequest URL or HTTP Request settings
         * @return {Promise<gpf.typedef.httpRequestResponse>} Resolved on request completion
         * @since 0.2.2
         */
        head: _gpfProcessAlias.bind(gpf.http, _GPF_HTTP_METHODS.HEAD)
    });
    var _GPF_HTTP_XHR_READYSTATE_DONE = 4, _gpfHttpXhrSetHeaders = _gpfHttpGenSetHeaders("setRequestHeader"), _gpfHttpXhrSend = _gpfHttpGenSend("send"), _gpfHttpXhrGetResponse = _gpfHttpGenGetResponse("status", "getAllResponseHeaders", "responseText");
    function _gpfHttpXhrOpen(request) {
        var xhr = new XMLHttpRequest();
        xhr.open(request.method, request.url);
        return xhr;
    }
    function _gpfHttpXhrWaitForCompletion(xhr, resolve) {
        xhr.onreadystatechange = function () {
            if (xhr.readyState === _GPF_HTTP_XHR_READYSTATE_DONE) {
                resolve(_gpfHttpXhrGetResponse(xhr));
            }
        };
    }
    function _gpfHttpXhrRequest(request, resolve) {
        var xhr = _gpfHttpXhrOpen(request);
        _gpfHttpXhrSetHeaders(xhr, request.headers);
        _gpfHttpXhrWaitForCompletion(xhr, resolve);
        _gpfHttpXhrSend(xhr, request.data);
    }
    _gpfHttpSetRequestImplIf(_GPF_HOST.BROWSER, _gpfHttpXhrRequest);
    _gpfHttpSetRequestImplIf(_GPF_HOST.PHANTOMJS, _gpfHttpXhrRequest);
    function _gpfStringFromStream(readableStream) {
        var iWritableString = new _GpfStreamWritableString(), iReadableStream = _gpfStreamQueryReadable(readableStream);
        return iReadableStream.read(iWritableString).then(function () {
            return iWritableString.toString();
        });
    }
    function _gpfHttpNodeProcessResponse(nodeResponse, resolve) {
        nodeResponse.setEncoding("utf8");
        var iReadableStream = new _GpfNodeReadableStream(nodeResponse);
        _gpfStringFromStream(iReadableStream).then(function (responseText) {
            iReadableStream.close();
            resolve({
                status: nodeResponse.statusCode,
                headers: nodeResponse.headers,
                responseText: responseText
            });
        });
    }
    function _gpfHttpNodeAdjustSettingsForSend(settings, data) {
        if (data) {
            settings.headers = Object.assign({
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": Buffer.byteLength(data)
            }, settings.headers);
        }
    }
    function _gpfHttpNodeBuildRequestSettings(request) {
        var settings = Object.assign(_gpfNodeUrl.parse(request.url), request);
        _gpfHttpNodeAdjustSettingsForSend(settings, request.data);
        return settings;
    }
    function _gpfHttpNodeGetMessageHandler(settings) {
        if (settings.protocol === "https:") {
            return _gpfNodeHttps;
        }
        return _gpfNodeHttp;
    }
    function _gpfHttpNodeAllocate(request, resolve) {
        var settings = _gpfHttpNodeBuildRequestSettings(request), messageHandler = _gpfHttpNodeGetMessageHandler(settings);
        return messageHandler.request(settings, function (nodeResponse) {
            _gpfHttpNodeProcessResponse(nodeResponse, resolve);
        });
    }
    function _gpfHttpNodeSend(clientRequest, data) {
        if (data) {
            clientRequest.write(data, "utf8", function () {
                clientRequest.end();
            });
        } else {
            clientRequest.end();
        }
    }
    function _gpfHttpNodeRequestImpl(request, resolve, reject) {
        var clientRequest = _gpfHttpNodeAllocate(request, resolve);
        clientRequest.on("error", reject);
        _gpfHttpNodeSend(clientRequest, request.data);
    }
    _gpfHttpSetRequestImplIf(_GPF_HOST.NODEJS, _gpfHttpNodeRequestImpl);
    var _gpfHttpWScriptSetHeaders = _gpfHttpGenSetHeaders("setRequestHeader"), _gpfHttpWScriptSend = _gpfHttpGenSend("Send"), _gpfHttpWScriptGetResponse = _gpfHttpGenGetResponse("Status", "GetAllResponseHeaders", "ResponseText");
    function _gpfHttpWScriptAllocate(request) {
        var winHttp = new ActiveXObject("WinHttp.WinHttpRequest.5.1");
        winHttp.Open(request.method, request.url);
        return winHttp;
    }
    function _gpfHttpWScriptResolve(winHttp, resolve) {
        resolve(_gpfHttpWScriptGetResponse(winHttp));
    }
    function _gpfHttpWscriptRequestImpl(request, resolve) {
        var winHttp = _gpfHttpWScriptAllocate(request);
        _gpfHttpWScriptSetHeaders(winHttp, request.headers);
        _gpfHttpWScriptSend(winHttp, request.data);
        _gpfHttpWScriptResolve(winHttp, resolve);
    }
    _gpfHttpSetRequestImplIf(_GPF_HOST.WSCRIPT, _gpfHttpWscriptRequestImpl);
    var _GpfStreamJavaBase = _gpfDefine({
            $class: "gpf.java.BaseStream",
            /**
             * Base class wrapping Rhino streams
             *
             * @param {java.io.InputStream|java.io.OutputStream} stream Rhino input or output stream object
             *
             * @constructor gpf.java.BaseStream
             * @since 0.2.4
             */
            constructor: function (stream) {
                this._stream = stream;
            },
            /**
             * Close the stream
             *
             * @return {Promise} Resolved when closed
             * @since 0.2.4
             */
            close: function () {
                this._stream.close();
                return Promise.resolve();
            },
            /**
             * Rhino stream object
             *
             * @type {java.io.InputStream|java.io.OutputStream}
             * @since 0.2.4
             */
            _stream: null
        }),
        /**
         * Wraps a readable stream from Rhino into a IReadableStream
         *
         * @param {java.io.InputStream} stream Rhino stream object
         *
         * @class gpf.java.ReadableStream
         * @extends gpf.java.BaseStream
         * @implements {gpf.interfaces.IReadableStream}
         * @since 0.2.4
         */
        _GpfStreamJavaReadable = _gpfDefine({
            $class: "gpf.java.ReadableStream",
            $extend: _GpfStreamJavaBase,
            //region gpf.interfaces.IReadableStream
            /**
             * Process error that occurred during the stream reading
             *
             * @param {Error} e Error coming from read
             * @return {Promise} Read result replacement
             * @since 0.2.4
             */
            _handleError: function (e) {
                if (e instanceof java.util.NoSuchElementException || e.message.startsWith("java.util.NoSuchElementException")) {
                    // Empty stream
                    return Promise.resolve();
                }
                return Promise.reject(e);
            },
            /**
             * @gpf:sameas gpf.interfaces.IReadableStream#read
             * @since 0.2.4
             */
            read: _gpfStreamSecureRead(function (output) {
                try {
                    var scanner = new java.util.Scanner(this._stream);
                    //eslint-disable-line no-invalid-this
                    return output.write(String(scanner.useDelimiter("\\A").next()));
                } catch (e) {
                    return this._handleError(e);    //eslint-disable-line no-invalid-this
                }
            })    //endregion
        }),
        /**
         * Wraps a writable stream from Rhino into a IWritableStream
         *
         * @param {java.io.OutputStream} stream Rhino stream object
         *
         * @class gpf.java.WritableStream
         * @extends gpf.java.BaseStream
         * @implements {gpf.interfaces.IWritableStream}
         * @since 0.2.4
         */
        _GpfStreamJavaWritable = _gpfDefine({
            $class: "gpf.java.WritableStream",
            $extend: _GpfStreamJavaBase,
            constructor: function (stream) {
                this.$super(stream);
                this._writer = new java.io.OutputStreamWriter(stream);
            },
            //region gpf.interfaces.IWritableStream
            /**
             * @gpf:sameas gpf.interfaces.IWritableStream#write
             * @since 0.2.4
             */
            write: _gpfStreamSecureWrite(function (buffer) {
                var writer = this._writer;
                //eslint-disable-line no-invalid-this
                writer.write(buffer);
                writer.flush();
                return Promise.resolve();
            }),
            //endregion
            /**
             * @inheritdoc
             * @since 0.2.4
             */
            close: function () {
                this._writer.close();
                return this.$super();
            },
            /**
             * Stream writer
             *
             * @type {java.io.OutputStreamWriter}
             * @since 0.2.4
             */
            _writer: null
        });
    var _gpfHttpJavaSetHeaders = _gpfHttpGenSetHeaders("setRequestProperty");
    function _gpfHttpJavaSendData(httpConnection, data) {
        if (data) {
            httpConnection.setDoOutput(true);
            var iWritableStream = new _GpfStreamJavaWritable(httpConnection.getOutputStream());
            return iWritableStream.write(data).then(function () {
                iWritableStream.close();
            });
        }
        return Promise.resolve();
    }
    function _gpfHttpJavaGetResponse(httpConnection) {
        try {
            return httpConnection.getInputStream();
        } catch (e) {
            return httpConnection.getErrorStream();
        }
    }
    function _gpfHttpJavaGetResponseText(httpConnection) {
        var iReadableStream = new _GpfStreamJavaReadable(_gpfHttpJavaGetResponse(httpConnection));
        return _gpfStringFromStream(iReadableStream).then(function (responseText) {
            iReadableStream.close();
            return responseText;
        });
    }
    function _gpfHttpJavaGetHeaders(httpConnection) {
        var headers = {}, headerFields = httpConnection.getHeaderFields(), keys = headerFields.keySet().toArray();
        _gpfArrayForEach(keys, function (key) {
            headers[String(key)] = String(headerFields.get(key).get(_GPF_START));
        });
        return headers;
    }
    function _gpfHttpJavaResolve(httpConnection, resolve) {
        _gpfHttpJavaGetResponseText(httpConnection).then(function (responseText) {
            resolve({
                status: httpConnection.getResponseCode(),
                headers: _gpfHttpJavaGetHeaders(httpConnection),
                responseText: responseText
            });
        });
    }
    function _gpfHttpJavaRequestImpl(request, resolve) {
        var httpConnection = new java.net.URL(request.url).openConnection();
        httpConnection.setRequestMethod(request.method);
        _gpfHttpJavaSetHeaders(httpConnection, request.headers);
        _gpfHttpJavaSendData(httpConnection, request.data).then(function () {
            _gpfHttpJavaResolve(httpConnection, resolve);
        });
    }
    _gpfHttpSetRequestImplIf(_GPF_HOST.RHINO, _gpfHttpJavaRequestImpl);
    _gpfHttpSetRequestImplIf(_GPF_HOST.NASHORN, _gpfHttpJavaRequestImpl);
    var _gpfHttpMockedRequests;
    /**
     * Match the provided request with the mocked one
     *
     * @param {gpf.typedef.mockedRequest} mockedRequest Mocked request to match
     * @param {gpf.typedef.httpRequestSettings} request Request to match
     * @return {Promise<gpf.typedef.httpRequestResponse>|undefined} undefined if not matching
     * @since 0.2.2
     */
    function _gpfHttMockMatchRequest(mockedRequest, request) {
        var url = mockedRequest.url, match;
        url.lastIndex = 0;
        match = url.exec(request.url);
        if (match) {
            return mockedRequest.response.apply(mockedRequest, [request].concat(_gpfArrayTail(match)));
        }
    }
    /**
     * Match the provided request to the list of mocked ones
     *
     * @param {gpf.typedef.mockedRequest[]} mockedRequests List of mocked requests for the given method
     * @param {gpf.typedef.httpRequestSettings} request Request to match
     * @return {Promise<gpf.typedef.httpRequestResponse>|undefined} undefined if no mocked request matches
     * @since 0.2.2
     */
    function _gpfHttMockMatch(mockedRequests, request) {
        var result;
        mockedRequests.every(function (mockedRequest) {
            result = _gpfHttMockMatchRequest(mockedRequest, request);
            return result === undefined;
        });
        return result;
    }
    function _gpfHttpMockGetMockedRequests(method) {
        if (!_gpfHttpMockedRequests[method]) {
            _gpfHttpMockedRequests[method] = [];
        }
        return _gpfHttpMockedRequests[method];
    }
    /**
     * Check if the provided request match any of the mocked one
     *
     * @param {gpf.typedef.httpRequestSettings} request Request to check
     * @return {Promise<gpf.typedef.httpRequestResponse>|undefined} undefined if no mocked request matches
     * @since 0.2.2
     */
    function _gpfHttpMockCheck(request) {
        return _gpfHttMockMatch(_gpfHttpMockGetMockedRequests(request.method.toUpperCase()), request);
    }
    var _gpfHttpMockLastId = 0;
    /**
     * Add a mocked request
     *
     * @param {gpf.typedef.mockedRequest} definition Mocked request definition
     * @return {gpf.typedef.mockedRequestID} Mocked request identifier, to be used with {@link gpf.http.mock.remove}
     * @see gpf.http
     * @since 0.2.2
     */
    function _gpfHttpMockAdd(definition) {
        var method = definition.method.toUpperCase(), id = method + "." + _gpfHttpMockLastId++;
        _gpfHttpMockGetMockedRequests(method).unshift(Object.assign({ id: id }, definition));
        return id;
    }
    /**
     * Removes a mocked request
     *
     * @param {gpf.typedef.mockedRequestID} id Mocked request identifier returned by {@link gpf.http.mock}
     * @since 0.2.2
     */
    function _gpfHttpMockRemove(id) {
        var method = id.substring(_GPF_START, id.indexOf("."));
        _gpfHttpMockedRequests[method] = _gpfHttpMockGetMockedRequests(method).filter(function (mockedRequest) {
            return mockedRequest.id !== id;
        });
    }
    /**
     * Clears all mocked requests
     * @since 0.2.2
     */
    function _gpfHttpMockReset() {
        _gpfHttpMockedRequests = {};
    }
    _gpfHttpMockReset();
    /**
     * @gpf:sameas _gpfHttpMockAdd
     * @since 0.2.2
     */
    gpf.http.mock = _gpfHttpMockAdd;
    /**
     * @gpf:sameas _gpfHttpMockRemove
     * @since 0.2.2
     */
    gpf.http.mock.remove = _gpfHttpMockRemove;
    /**
     * @gpf:sameas _gpfHttpMockReset
     * @since 0.2.2
     */
    gpf.http.mock.reset = _gpfHttpMockReset;
    // Hook the mocking algorithm on top of host specific implementation
    var _gpfHttpMockRequestImpl;
    function _gpfHttpMockImpl(request, resolve, reject) {
        var mockedResult = _gpfHttpMockCheck(request);
        if (undefined === mockedResult) {
            _gpfHttpMockRequestImpl(request, resolve, reject);
        } else {
            resolve(mockedResult);
        }
    }
    _gpfHttpMockRequestImpl = _gpfHttpSetRequestImplIf(_gpfHost, _gpfHttpMockImpl);
    function _GpfStreamBufferedReadToken() {
    }
    _GpfStreamBufferedReadToken.prototype = {
        /**
         * Execute the action associated to the token
         *
         * @method _GpfStreamBufferedReadToken#execute
         * @param {gpf.stream.BufferedRead} bufferedRead Instance of gpf.stream.BufferedRead
         * @since 0.2.3
         */
        execute: _gpfEmptyFunc
    };
    var
        /**
         * Unique token to signal an error: it ensures the error is triggered at the right time
         *
         * @type {_GpfStreamBufferedReadToken}
         * @since 0.2.3
         */
        _gpfStreamBufferedReadError = new _GpfStreamBufferedReadToken(),
        /**
         * Unique token to signal end of read: it ensures the error is triggered at the right time
         *
         * @type {_GpfStreamBufferedReadToken}
         * @since 0.2.3
         */
        _gpfStreamBufferedReadEnd = new _GpfStreamBufferedReadToken();
    _gpfStreamBufferedReadError.execute = function (bufferedRead) {
        bufferedRead._readReject(bufferedRead._readBuffer.shift());
    };
    _gpfStreamBufferedReadEnd.execute = function (bufferedRead) {
        bufferedRead._readResolve();
    };
    var _GpfStreamBufferedRead = _gpfDefine({
        $class: "gpf.stream.BufferedRead",
        /**
         * Implements IReadableStream by offering methods manipulating a buffer:
         * - {@link gpf.stream.BufferedRead#_appendToReadBuffer}
         * - {@link gpf.stream.BufferedRead#_completeReadBuffer}
         * - {@link gpf.stream.BufferedRead#_setReadError}
         *
         * Make sure to implement the {@link gpf.interfaces.IFlushableStream} interface
         * to complete the buffer.
         *
         * @constructor gpf.stream.BufferedRead
         * @implements {gpf.interfaces.IReadableStream}
         * @since 0.2.3
         */
        constructor: function () {
            this._readBuffer = [];
        },
        /**
         * Read buffer, also contains tokens to signal the end of the read ({@see _GpfStreamBufferedReadToken} and
         * {@see _gpfStreamBufferedReadEnd})
         * @since 0.2.3
         */
        _readBuffer: [],
        /**
         * Stream to write to
         *
         * @type {gpf.interfaces.IWritableStream}
         * @since 0.2.3
         */
        _readWriteToStream: null,
        /**
         * Read Promise resolve function
         *
         * @type {Function}
         * @since 0.2.3
         */
        _readResolve: null,
        /**
         * Read Promise reject function
         *
         * @type {Function}
         * @since 0.2.3
         */
        _readReject: null,
        //region Secured writing
        _readDataIsToken: function (data) {
            if (data instanceof _GpfStreamBufferedReadToken) {
                data.execute(this);
                return true;
            }
            return false;
        },
        _readWriteToOutput: function () {
            var me = this, data = me._readBuffer.shift();
            if (me._readDataIsToken(data)) {
                return Promise.resolve();
            }
            return me._readWriteToStream.write(data).then(function () {
                if (me._readBuffer.length) {
                    return me._readWriteToOutput();
                }
                me._readNotWriting = true;
            });
        },
        /**
         * Critical section to avoid writing while writing
         * @since 0.2.3
         */
        _readNotWriting: true,
        /**
         * Triggers write only if no write is in progress
         * @since 0.2.3
         */
        _readSafeWrite: function () {
            var me = this;
            if (me._readNotWriting) {
                me._readNotWriting = false;
                me._readWriteToOutput().then(undefined, function (reason) {
                    me._readReject(reason);
                });
            }
        },
        /**
         * Check if data exists and trigger write consequently
         * @since 0.2.3
         */
        _readCheckIfData: function () {
            if (this._readBuffer.length) {
                this._readSafeWrite();
            }
        },
        /**
         * Check if a read is in progress and trigger write consequently
         * @since 0.2.3
         */
        _readCheckIfOutput: function () {
            if (this._readWriteToStream) {
                this._readCheckIfData();
            }
        },
        //endregion
        //region Protected interface for sub classes
        /**
         * Adds data to the read buffer
         *
         * @param {...*} data Data to write
         * @gpf:chainable
         * @protected
         * @since 0.2.3
         */
        _appendToReadBuffer: function (data) {
            _gpfIgnore(data);
            this._readBuffer = this._readBuffer.concat(_gpfArraySlice(arguments));
            this._readCheckIfOutput();
            return this;
        },
        /**
         * Ends the read without any error
         *
         * @protected
         * @since 0.2.3
         */
        _completeReadBuffer: function () {
            this._readBuffer.push(_gpfStreamBufferedReadEnd);
            this._readCheckIfOutput();
        },
        /**
         * Ends the read with an error
         *
         * @param {*} reason Rejection reason
         * @protected
         * @since 0.2.3
         */
        _setReadError: function (reason) {
            this._readBuffer.push(_gpfStreamBufferedReadError, reason);
            this._readCheckIfOutput();
        },
        //endregion
        //region gpf.interfaces.IReadableStream
        /**
         * @gpf:sameas gpf.interfaces.IReadableStream#read
         * @since 0.2.3
         */
        read: _gpfStreamSecureRead(function (output) {
            var me = this;
            //eslint-disable-line no-invalid-this
            me._readWriteToStream = output;
            me._readCheckIfData();
            return new Promise(function (resolve, reject) {
                me._readResolve = resolve;
                me._readReject = reject;
            });
        })    //endregion
    });
    _gpfStreamSecureInstallProgressFlag(_GpfStreamBufferedRead);
    var _reDOSCR = /\r\n/g, _GpfStreamLineAdatper = _gpfDefine({
            $class: "gpf.stream.LineAdapter",
            $extend: _GpfStreamBufferedRead,
            /**
             * Stream line adapter
             *
             * @constructor gpf.stream.LineAdapter
             * @implements {gpf.interfaces.IReadableStream}
             * @implements {gpf.interfaces.IWritableStream}
             * @implements {gpf.interfaces.IFlushableStream}
             * @extends gpf.stream.BufferedRead
             * @since 0.2.1
             */
            constructor: function () {
                this.$super();
                this._buffer = [];
            },
            //region gpf.interfaces.IReadableStream
            /**
             * @gpf:sameas gpf.interfaces.IWritableStream#write
             * @since 0.2.1
             */
            write: _gpfStreamSecureWrite(function (buffer) {
                var me = this;
                //eslint-disable-line no-invalid-this
                me._buffer.push(buffer.toString());
                me._process();
                return Promise.resolve();
            }),
            //endregion
            //region gpf.interfaces.IFlushableStream
            /**
             * @gpf:sameas gpf.interfaces.IFlushableStream#flush
             * @since 0.2.1
             */
            flush: function () {
                if (this._buffer.length) {
                    this._buffer.push("\n");
                    this._process();
                }
                this._completeReadBuffer();
                return Promise.resolve();
            },
            //endregion
            /**
             * Buffer
             * @since 0.2.1
             */
            _buffer: [],
            /**
             * Consolidate lines from buffer
             *
             * @return {String[]} Array of lines
             * @since 0.2.1
             */
            _consolidateLines: function () {
                return this._buffer.join("").replace(_reDOSCR, "\n").split("\n");
            },
            /**
             * The array lines is built using split on \n. Hence, the last line is what comes after the last \n.
             * If not empty, it must be pushed back to the buffer.
             *
             * @param {String[]} lines Array of lines
             * @since 0.2.1
             */
            _pushBackLastLineIfNotEmpty: function (lines) {
                var lastLine = lines.pop();
                if (lastLine.length) {
                    this._buffer.push(lastLine);
                }
            },
            /**
             * Check if the buffer contains any carriage return and write to output
             *
             * @since 0.2.1
             */
            _process: function () {
                var me = this, lines = me._consolidateLines();
                me._buffer.length = 0;
                me._pushBackLastLineIfNotEmpty(lines);
                _gpfArrayForEach(lines, function (line) {
                    me._appendToReadBuffer(line);
                });
            }
        });
    var _gpfIFlushableStream = _gpfDefineInterface("FlushableStream", { "flush": 0 });
    var _gpfReadImpl = {};
    /**
     * Set the read implementation if the host matches
     *
     * @param {String} host host to test, if matching with the current one, the read implementation is set
     * @param {Function} readImpl read implementation function
     * @since 0.2.6
     */
    function _gpfReadSetImplIf(host, readImpl) {
        if (host === _gpfHost) {
            _gpfReadImpl = readImpl;
        }
    }
    /**
     * Generic read method
     *
     * @param {String} path File path
     * @return {Promise<String>} Resolved with the file content
     * @since 0.2.2
     */
    function _gpfRead(path) {
        return _gpfReadImpl(path);
    }
    /**
     * @gpf:sameas _gpfRead
     * @since 0.2.6
     */
    gpf.read = _gpfRead;
    /* istanbul ignore else */
    // flavor.1
    if (gpf.fs) {
        /**
         * @gpf:sameas _gpfRead
         * @since 0.2.2
         * @deprecated since version 0.2.6, use {@link gpf.read} instead
         */
        gpf.fs.read = _gpfRead;
    }
    var _GPF_READ_HTTP_STATUS_CLASS = 100, _GPF_READ_HTTP_STATUS_CLASS_OK = 2;
    function _gpfReadHttp(path) {
        return _gpfHttpRequest({
            method: _GPF_HTTP_METHODS.GET,
            url: path
        }).then(function (response) {
            if (Math.floor(response.status / _GPF_READ_HTTP_STATUS_CLASS) !== _GPF_READ_HTTP_STATUS_CLASS_OK) {
                throw new Error(response.responseText);
            }
            return response.responseText;
        });
    }
    _gpfReadSetImplIf(_GPF_HOST.BROWSER, _gpfReadHttp);
    function _gpfReadNashorn(path) {
        var javaPath = java.nio.file.Paths.get(path);
        if (java.nio.file.Files.exists(javaPath)) {
            return new Promise(function (resolve, reject) {
                var javaInputStream = java.nio.file.Files.newInputStream(javaPath), iStreamReader = new _GpfStreamJavaReadable(javaInputStream), iWritableString = new _GpfStreamWritableString();
                return iStreamReader.read(iWritableString).then(function () {
                    resolve(iWritableString.toString());
                })["catch"](reject);
            });
        }
        return Promise.reject(new Error("File not found"));    // To be improved
    }
    _gpfReadSetImplIf(_GPF_HOST.NASHORN, _gpfReadNashorn);
    function _gpfReadNodeJS(path) {
        return new Promise(function (resolve, reject) {
            _gpfNodeFs.readFile(path, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.toString());
                }
            });
        });
    }
    _gpfReadSetImplIf(_GPF_HOST.NODEJS, _gpfReadNodeJS);
    function _gpfReadPhantomJS(path) {
        return new Promise(function (resolve, reject) {
            try {
                resolve(_gpfNodeFs.read(path));
            } catch (e) {
                // Error is a string
                reject(new Error(e));
            }
        });
    }
    _gpfReadSetImplIf(_GPF_HOST.PHANTOMJS, _gpfReadPhantomJS);
    function _gpfReadRhino(path) {
        return new Promise(function (resolve) {
            resolve(readFile(path));
        });
    }
    _gpfReadSetImplIf(_GPF_HOST.RHINO, _gpfReadRhino);
    function _gpfReadWScript(path) {
        return new Promise(function (resolve) {
            var file = _gpfMsFSO.OpenTextFile(path, _GPF_FS_WSCRIPT_READING, false);
            resolve(file.ReadAll());
            file.Close();
        });
    }
    _gpfReadSetImplIf(_GPF_HOST.WSCRIPT, _gpfReadWScript);
    var _gpfRequireProcessor = {};
    function _gpfLoadOrPreload(context, name) {
        var preload = context.preload[name];
        if (preload) {
            return Promise.resolve(preload);
        }
        return _gpfRead(name);
    }
    function _gpfLoadTextProcessor(name, content) {
        _gpfIgnore(name);
        return Promise.resolve(content);
    }
    function _gpfLoadGetProcessor(resource) {
        return _gpfRequireProcessor[resource.type] || _gpfLoadTextProcessor;
    }
    /**
     * Load the resource
     *
     * @param {String} name Resource name
     * @return {Promise<*>} Resolved with the resource result
     * @since 0.2.2
     */
    function _gpfRequireLoad(name) {
        var me = this;
        return _gpfLoadOrPreload(me, name).then(function (content) {
            return me.preprocess({
                name: name,
                content: content,
                type: _gpfPathExtension(name).toLowerCase()
            });
        }).then(function (resource) {
            return _gpfLoadGetProcessor(resource).call(me, resource.name, resource.content);
        });
    }
    function _gpfRequireAllocateWrapper() {
        return {
            gpf: Object.create(gpf),
            promise: Promise.resolve(),
            _initialDefine: null
        };
    }
    function _gpfRequireWrappedDefine() {
        /*jshint validthis:true*/
        var wrapper = this,
            //eslint-disable-line
            gpfRequire = wrapper.gpf.require, gpfRequireDefine = wrapper._initialDefine;
        wrapper.promise = gpfRequireDefine.apply(gpfRequire, arguments);
        gpfRequire.define = gpfRequireDefine;
        return wrapper.promise;
    }
    function _gpfRequirePlugWrapper(wrapper, require) {
        wrapper._initialDefine = require.define;
        require.define = _gpfRequireWrappedDefine.bind(wrapper);
        wrapper.gpf.require = require;
        return wrapper;
    }
    /**
     * Wrap gpf to fit the new context and give access to gpf.require.define promise
     *
     * @param {Object} context Require context
     * @param {String} name Resource (resolved) name
     * @return {gpf.typedef._requireWrapper} Wrapper
     * @since 0.2.2
     */
    function _gpfRequireWrapGpf(context, name) {
        return _gpfRequirePlugWrapper(_gpfRequireAllocateWrapper(), _gpfRequireAllocate(context, { base: _gpfPathParent(name) }));
    }
    _gpfRequireProcessor[".json"] = function (name, content) {
        return JSON.parse(content);
    };
    _gpfErrorDeclare("require/javascript", {
        /**
         * ### Summary
         *
         * Dynamic require not supported
         *
         * ### Description
         *
         * When loading a [CommonJS](http://www.commonjs.org/) module, a first pass is done to extract all requires being
         * called. If the require is based on a complex parameter (variable or string manipulation), the loader won't be
         * able to understand the require. No fallback mechanism is implemented yet
         * @since 0.2.2
         */
        noCommonJSDynamicRequire: "Dynamic require not supported"
    });
    var _gpfRequireJsModuleRegEx = /[^.]\brequire\b\s*\(\s*(?:['|"]([^"']+)['|"]|[^)]+)\s*\)/g, _GPF_REQUIRE_MATCH_MODULE_NAME = 1;
    function _gpfRequireJSGetStaticDependencies(resourceName, content) {
        /*jshint validthis:true*/
        var requires = _gpfRegExpForEach(_gpfRequireJsModuleRegEx, content);
        if (requires.length) {
            return _gpfRequireWrapGpf(this, resourceName).gpf.require.define(requires    //eslint-disable-line no-invalid-this
.map(function (match) {
                return match[_GPF_REQUIRE_MATCH_MODULE_NAME];    // may be undefined if dynamic
            }).filter(function (require) {
                return require;
            }).reduce(function (dictionary, name) {
                dictionary[name] = name;
                return dictionary;
            }, {}), function (require) {
                return require;
            });
        }
        return Promise.resolve({});    // No static dependencies
    }
    //region AMD define wrapper
    function _gpfRequireAmdDefineParamsFactoryOnly(factory) {
        return {
            dependencies: [],
            factory: factory
        };
    }
    function _gpfRequireAmdDefineParamsDependenciesAndFactory(dependencies, factory) {
        return {
            dependencies: dependencies,
            factory: factory
        };
    }
    function _gpfRequireAmdDefineParamsAll(any, dependencies, factory) {
        return {
            dependencies: dependencies,
            factory: factory
        };
    }
    var
    /**
     * Mapping of define parameter count to dependencies / factory
     *
     * @type {Function[]}
     * @since 0.2.2
     */
    _gpfRequireAmdDefineParamsMapping = [
        null,
        _gpfRequireAmdDefineParamsFactoryOnly,
        _gpfRequireAmdDefineParamsDependenciesAndFactory,
        _gpfRequireAmdDefineParamsAll
    ];
    function _gpfRequireAmdDefine(name, dependencies, factory) {
        /*jshint validthis:true*/
        _gpfIgnore(name, dependencies, factory);
        var myGpf = this,
            //eslint-disable-line
            params = _gpfRequireAmdDefineParamsMapping[arguments.length].apply(null, arguments);
        myGpf.require.define(params.dependencies, function (require) {
            require.length = params.dependencies.length;
            return params.factory.apply(null, _gpfArraySlice(require));
        });
    }
    function _gpfRequireJS(myGpf, content, staticDependencies) {
        var module = {};
        _gpfFunc([
            "gpf",
            "define",
            "module",
            "require"
        ], content)(myGpf, _gpfRequireAmdDefine.bind(myGpf), module, function (name) {
            return staticDependencies[name] || gpf.Error.noCommonJSDynamicRequire();
        });
        return module.exports;
    }
    /*global location*/
    function _gpfRequireSourceMapBrowswer(name, content) {
        var parentPath = location.pathname.toString();
        /* istanbul ignore else */
        // sourceURL.1
        if (!parentPath.endsWith("/")) {
            parentPath = _gpfPathParent(parentPath);
        }
        return "//# sourceURL=" + location.origin + _gpfPathJoin(parentPath, name) + "?gpf.require\n" + content;
    }
    function _gpfRequireSourceMapNone(name, content) {
        return content;
    }
    var _gpfRequireSourceMapImpl;
    if (_GPF_HOST.BROWSER === _gpfHost) {
        _gpfRequireSourceMapImpl = _gpfRequireSourceMapBrowswer;
    } else {
        _gpfRequireSourceMapImpl = _gpfRequireSourceMapNone;
    }
    _gpfRequireProcessor[".js"] = function (resourceName, content) {
        var wrapper = _gpfRequireWrapGpf(this, resourceName);
        return _gpfRequireJSGetStaticDependencies.call(this, resourceName, content).then(function (staticDependencies) {
            var exports = _gpfRequireJS(wrapper.gpf, _gpfRequireSourceMapImpl(resourceName, content), staticDependencies);
            if (undefined === exports) {
                return wrapper.promise;
            }
            return exports;
        });
    };
    _gpfErrorDeclare("require/configure", {
        /**
         * ### Summary
         *
         * Invalid {@link gpf.require.configure} option
         *
         * ### Description
         *
         * This error is triggered whenever an option passed to {@link gpf.require.configure} is not recognized.
         * Please check the {@link gpf.typedef.requireOptions} documentation.
         * @since 0.2.2
         */
        invalidRequireConfigureOption: "Invalid configuration option",
        /**
         * ### Summary
         *
         * Invalid {@link gpf.require.configure} option value
         *
         * ### Description
         *
         * This error is triggered whenever an option passed to {@link gpf.require.configure} has an invalid value.
         * Please check the {@link gpf.typedef.requireOptions} documentation.
         * @since 0.2.9
         */
        invalidRequireConfigureOptionValue: "Invalid configuration option value"
    });
    /**
     * @namespace gpf.require
     * @description Root namespace for the modularization helpers.
     * @since 0.2.2
     */
    /**
     * @typedef gpf.typedef.requireOptions
     * @property {String} [base] Base path used to resolve names
     * @property {Object} [cache] Inject names into the require cache
     * @property {Boolean} [clearCache=false] When set, the require cache is first cleared
     * @property {Object} [preload] Inject names into the loading cache
     * @property {gpf.typedef.requirePreprocessFunc} [preprocess] Resource preprocessor
     * @since 0.2.2
     */
    var
        /**
         * Dictionary of option name to function handling the option
         * @type {Object}
         * @since 0.2.2
         */
        _gpfRequireConfigureHandler = {},
        /**
         * Array of option names which order is significant
         * @type {Array}
         * @since 0.2.9
         */
        _gpfRequireConfigureOptionNames = [];
    /**
     * Declare a configuration option
     *
     * @param {String} name Option name
     * @param {Function} handler Option handler (will receive context and value)
     * @param {Boolean} [highPriority=false] Option must be handled before the others
     * @since 0.2.9
     */
    function _gpfRequireConfigureAddOption(name, handler, highPriority) {
        if (highPriority) {
            _gpfRequireConfigureOptionNames.unshift(name);
        } else {
            _gpfRequireConfigureOptionNames.push(name);
        }
        _gpfRequireConfigureHandler[name] = handler;
    }
    function _gpfRequireConfigureCheckOptions(options) {
        _gpfArrayForEach(Object.keys(options), function (name) {
            if (!_gpfRequireConfigureHandler[name]) {
                gpf.Error.invalidRequireConfigureOption();
            }
        });
    }
    /**
     * Configure the {@link gpf.require} layer
     *
     * @param {gpf.typedef.requireOptions} options Options to configure
     * @throws {gpf.Error.InvalidRequireConfigureOption}
     * @since 0.2.2
     */
    function _gpfRequireConfigure(options) {
        _gpfRequireConfigureCheckOptions(options);
        var me = this;
        _gpfArrayForEach(_gpfRequireConfigureOptionNames.filter(function (name) {
            return options[name] !== undefined;
        }), function (name) {
            _gpfRequireConfigureHandler[name](me, options[name]);
        });
    }    /**
          * @method gpf.require.configure
          * @gpf:sameas _gpfRequireConfigure
          * @since 0.2.2
          *
          * @example <caption>Setting the base path</caption>
          * gpf.require.configure({
          *   base: "/test/require"
          * });
          * assert(gpf.require.resolve("file.js") === "/test/require/file.js");
          *
          * @example <caption>Injecting in the cache</caption>
          * var cache = {};
          * cache[gpf.require.resolve("data.json")] = {};
          * gpf.require.configure({
          *   clearCache: true,
          *   cache: cache
          * });
          */
    function _gpfRequireConfigureCheckBase(value) {
        if (typeof value !== "string") {
            gpf.Error.invalidRequireConfigureOptionValue();
        }
    }
    function _gpfRequireConfigureBase(context, value) {
        _gpfRequireConfigureCheckBase(value);
        context.base = value;
    }
    _gpfRequireConfigureAddOption("base", _gpfRequireConfigureBase);
    function _gpfRequireConfigureCheckCache(value) {
        if (typeof value !== "object") {
            gpf.Error.invalidRequireConfigureOptionValue();
        }
    }
    function _gpfRequireConfigureCache(context, value) {
        _gpfRequireConfigureCheckCache(value);
        _gpfArrayForEach(Object.keys(value), function (name) {
            context.cache[name] = Promise.resolve(value[name]);
        });
    }
    _gpfRequireConfigureAddOption("cache", _gpfRequireConfigureCache);
    function _gpfRequireConfigureCheckClearCache(value) {
        if (typeof value !== "boolean") {
            gpf.Error.invalidRequireConfigureOptionValue();
        }
    }
    function _gpfRequireConfigureClearCache(context, value) {
        _gpfRequireConfigureCheckClearCache(value);
        if (value) {
            context.cache = {};
        }
    }
    _gpfRequireConfigureAddOption("clearCache", _gpfRequireConfigureClearCache, true);
    function _gpfRequireConfigureCheckPreload(value) {
        if (typeof value !== "object") {
            gpf.Error.invalidRequireConfigureOptionValue();
        }
    }
    function _gpfRequireConfigurePreload(context, value) {
        _gpfRequireConfigureCheckPreload(value);
        _gpfArrayForEach(Object.keys(value), function (name) {
            context.preload[name] = value[name];
        });
    }
    _gpfRequireConfigureAddOption("preload", _gpfRequireConfigurePreload);
    function _gpfRequireConfigureCheckPreprocess(value) {
        if (typeof value !== "function") {
            gpf.Error.invalidRequireConfigureOptionValue();
        }
    }
    function _gpfRequireConfigurePreprocess(context, value) {
        _gpfRequireConfigureCheckPreprocess(value);
        context.preprocess = value;
    }
    _gpfRequireConfigureAddOption("preprocess", _gpfRequireConfigurePreprocess);
    function _gpfRequireResolve(name) {
        return _gpfPathJoin(this.base, name);
    }
    function _gpfRequireDocumentStack(reason, name) {
        if (!Array.isArray(reason.requires)) {
            reason.requires = [];
        }
        reason.requires.push(name);
    }
    /**
     * Get the cached resource or load it
     *
     * @param {String} name Resource name
     * @return {Promise<*>} Resource association
     * @since 0.2.2
     */
    function _gpfRequireGet(name) {
        var me = this, promise;
        if (me.cache[name]) {
            return me.cache[name];
        }
        promise = _gpfRequireLoad.call(me, name);
        me.cache[name] = promise;
        return promise["catch"](function (reason) {
            _gpfRequireDocumentStack(reason, name);
            return Promise.reject(reason);
        });
    }
    /**
     * Defines a new module by executing the factory function with the specified dependent resources,
     * see {@tutorial REQUIRE}
     *
     *
     * @param {Object} dependencies Dictionary of dependencies, the keys are preserved while passing the result
     * dictionary to the factory function
     * @param {*} factory Can be either:
     * * A factory function executed when all resources are resolved, the first parameter will be a dictionary
     *   with all dependencies indexed by their name (as initially specified in the dependencies parameter).
     *   The result of the factory function will be cached as the result of this resource
     * * Any value that will be cached as the result of this resource
     * @return {Promise<*>} Resolved with the factory function result or the object
     * @since 0.2.2
     */
    function _gpfRequireDefine(dependencies, factory) {
        var me = this, promises = [], keys = Object.keys(dependencies);
        _gpfArrayForEach(keys, function (key) {
            promises.push(_gpfRequireGet.call(me, _gpfRequireResolve.call(me, dependencies[key])));
        }, me);
        return Promise.all(promises).then(function (resources) {
            var result, require;
            if (typeof factory === "function") {
                require = {};
                _gpfArrayForEach(keys, function (key, index) {
                    require[key] = resources[index];
                });
                result = factory(require);
            } else {
                result = factory;
            }
            return result;
        });
    }
    /**
     * Allocate a new require context with the proper methods
     *
     * @param {Object} parentContext Context to inherit from
     * @param {gpf.typedef.requireOptions} [options] Options to configure
     * @return {Object} Containing {@link gpf.require.define}, {@link gpf.require.resolve} and {@link gpf.require.configure}
     * @since 0.2.2
     */
    function _gpfRequireAllocate(parentContext, options) {
        var context = Object.create(parentContext),
            // cache content is shared but other properties are protected
            require = {};
        require.define = _gpfRequireDefine.bind(context);
        require.resolve = _gpfRequireResolve.bind(context);
        require.configure = _gpfRequireConfigure.bind(context);
        if (options) {
            require.configure(options);
        }
        return require;
    }
    gpf.require = _gpfRequireAllocate({
        base: "",
        cache: {},
        preload: {},
        preprocess: function (resource) {
            return Promise.resolve(resource);
        }
    });    /**
            * @method gpf.require.define
            * @gpf:sameas _gpfRequireDefine
            * @since 0.2.2
            */
           /**
            * @method gpf.require.resolve
            * @gpf:sameas _gpfRequireResolve
            * @since 0.2.2
            *
            * @example <caption>Setting the base path</caption>
            * gpf.require.configure({
            *   base: "/test/require"
            * });
            * assert(gpf.require.resolve("file.js") === "/test/require/file.js");
            */
    var _GpfStreamReadableArray = _gpfDefine({
            $class: "gpf.stream.ReadableArray",
            /**
             * Wraps an array inside a readable stream.
             * Each array item is written separately to the output
             *
             * @constructor gpf.stream.ReadableArray
             * @implements {gpf.interfaces.IReadableStream}
             * @param {Array} buffer Array buffer
             * @since 0.2.2
             */
            constructor: function (buffer) {
                this._buffer = buffer;
            },
            //region gpf.interfaces.IReadableStream
            /**
             * @gpf:sameas gpf.interfaces.IReadableStream#read
             * @since 0.2.2
             */
            read: _gpfStreamSecureRead(function (output) {
                var buffer = this._buffer,
                    //eslint-disable-line no-invalid-this
                    step = 0;
                function write() {
                    if (buffer.length === step) {
                        return Promise.resolve();
                    }
                    return output.write(buffer[step++]).then(write);
                }
                return write();
            }),
            //endregion
            /**
             * Buffer
             * @since 0.2.2
             */
            _buffer: []
        }), _GpfStreamWritableArray = _gpfDefine({
            $class: "gpf.stream.WritableArray",
            /**
             * Creates a writable stream that pushes all writes into an array
             *
             * @constructor gpf.stream.WritableArray
             * @implements {gpf.interfaces.IWritableStream}
             * @since 0.2.2
             */
            constructor: function () {
                this._buffer = [];
            },
            //region gpf.interfaces.IWritableStream
            /**
             * @gpf:sameas gpf.interfaces.IWritableStream#write
             * @since 0.2.2
             */
            write: _gpfStreamSecureWrite(function (buffer) {
                this._buffer.push(buffer);
                //eslint-disable-line no-invalid-this
                return Promise.resolve();
            }),
            //endregion
            /**
             * Gets the array containing writen data
             *
             * @return {Array} array containing writen data
             * @since 0.2.2
             */
            toArray: function () {
                return this._buffer;
            },
            /**
             * Buffer
             * @since 0.2.2
             */
            _buffer: []
        });
    _gpfStreamSecureInstallProgressFlag(_GpfStreamReadableArray);
    _gpfStreamSecureInstallProgressFlag(_GpfStreamWritableArray);
    var _gpfStreamPipeFakeFlushable = { flush: Promise.resolve.bind(Promise) };
    function _gpfStreamPipeToFlushable(stream) {
        return _gpfInterfaceQuery(_gpfIFlushableStream, stream) || _gpfStreamPipeFakeFlushable;
    }
    function _gpfStreamPipeCouplerDebug(coupler, message) {
        _gpfIgnore(coupler, message);    // if (console.expects) {
                                         //     console.expects("log", /.*/, true);
                                         // }
                                         // console.log("gpf.stream.pipe/coupler@" + coupler.index + " [" + coupler.fromName + "::" + coupler.toName + "] "
                                         //     + message);
    }
    function _gpfStreamPipeAllocateCoupler(intermediate, destination) {
        var toName;
        if (destination._isCoupler === _gpfStreamPipeCouplerDebug) {
            toName = "(coupler)";
        } else {
            toName = _gpfGetFunctionName(destination.constructor);
        }
        return {
            from: intermediate,
            fromName: _gpfGetFunctionName(intermediate.constructor),
            to: destination,
            toName: toName,
            iReadableIntermediate: _gpfStreamQueryReadable(intermediate),
            iWritableIntermediate: _gpfStreamQueryWritable(intermediate),
            iFlushableIntermediate: _gpfStreamPipeToFlushable(intermediate),
            iWritableDestination: _gpfStreamQueryWritable(destination),
            iFlushableDestination: _gpfStreamPipeToFlushable(destination),
            readInProgress: false,
            readError: null,
            readPromise: Promise.resolve(),
            rejectWrite: _gpfEmptyFunc,
            flushed: false
        };
    }
    function _gpfStreamPipeCouplerDrain(coupler) {
        // Read errors must be transmitted up to the initial read, this is done by forwarding it to flush & write
        var iReadableIntermediate = coupler.iReadableIntermediate, iWritableDestination = coupler.iWritableDestination;
        if (coupler.readInProgress) {
            _gpfStreamPipeCouplerDebug(coupler, "read in progress");
        }
        if (!coupler.readInProgress) {
            try {
                coupler.readInProgress = true;
                _gpfStreamPipeCouplerDebug(coupler, "read started");
                coupler.readPromise = iReadableIntermediate.read(iWritableDestination).then(function () {
                    _gpfStreamPipeCouplerDebug(coupler, "read ended");
                    coupler.readInProgress = false;
                }, function (reason) {
                    coupler.readError = reason;
                    coupler.rejectWrite(reason);
                });
            } catch (e) {
                coupler.readError = e;
            }
        }
    }
    function _gpfStreamPipeCouplerWrite(coupler, promise) {
        return new Promise(function (resolve, reject) {
            promise.then(function (value) {
                resolve(value);
                coupler.rejectWrite = _gpfEmptyFunc;
            }, reject);
            coupler.rejectWrite = reject;
        });
    }
    function _gpfStreamPipeCheckIfReadError(coupler) {
        if (coupler.readError) {
            return Promise.reject(coupler.readError);
        }
    }
    /**
     * Create a flushable & writable stream by coupling the intermediate stream with the writable destination
     *
     * @param {Object} intermediate Must implements IReadableStream interface.
     * If it implements the IFlushableStream interface, it is assumed that it retains data
     * until it receives the Flush. Meaning, the read won't complete until the flush call.
     * If it does not implement the IFlushableStream, the read may end before the whole sequence
     * has finished. It means that the next write should trigger a new read and flush must be simulated at
     * least to pass it to the destination
     * @param {Object} destination Must implements IWritableStream interface.
     * If it implements the IFlushableStream, it will be called when the intermediate completes.
     * @param {Number} index zero-based index of the coupler, helps for debugging.
     *
     * @return {Object} Implementing IWritableStream and IFlushableStream
     * @since 0.2.3
     */
    function _gpfStreamPipeWeldCoupler(intermediate, destination, index) {
        var coupler = _gpfStreamPipeAllocateCoupler(intermediate, destination), iFlushableIntermediate = coupler.iFlushableIntermediate, iFlushableDestination = coupler.iFlushableDestination, iWritableIntermediate = coupler.iWritableIntermediate;
        coupler.index = index;
        _gpfStreamPipeCouplerDrain(coupler);
        return {
            _isCoupler: _gpfStreamPipeCouplerDebug,
            flush: function () {
                _gpfAssert(!coupler.flushed, "A flushed coupler can't be flushed again");
                _gpfStreamPipeCouplerDebug(coupler, "flush");
                coupler.flushed = true;
                return _gpfStreamPipeCheckIfReadError(coupler) || iFlushableIntermediate.flush().then(function () {
                    return coupler.readPromise;    // Wait for any pending read
                }).then(function () {
                    return iFlushableDestination.flush();
                }).then(function () {
                    _gpfStreamPipeCouplerDebug(coupler, "flush ended");
                });
            },
            write: function (data) {
                _gpfAssert(!coupler.flushed, "A flushed coupler can't be written to");
                _gpfStreamPipeCouplerDebug(coupler, "write(" + JSON.stringify(data) + ")");
                _gpfStreamPipeCouplerDrain(coupler);
                return _gpfStreamPipeCheckIfReadError(coupler) || _gpfStreamPipeCouplerWrite(coupler, iWritableIntermediate.write(data));
            }
        };
    }
    function _gpfStreamPipeWeldCouplers(streams) {
        var idx = streams.length, iWritableStream = streams[--idx];
        while (idx) {
            iWritableStream = _gpfStreamPipeWeldCoupler(streams[--idx], iWritableStream, idx);
        }
        return iWritableStream;
    }
    function _gpfStreamPipeToWritable(streams) {
        if (_gpfArrayTail(streams).length) {
            return _gpfStreamPipeWeldCouplers(streams);
        }
        return _gpfStreamQueryWritable(streams[_GPF_START]);
    }
    /**
     * Pipe streams.
     *
     * @param {gpf.interfaces.IReadableStream} source Source stream
     * @param {...gpf.interfaces.IWritableStream} destination streams to pipe data through.
     * It is assumed that the last destination stream will not block data receiving if readable),
     * every other intermediate stream must also implement {@link gpf.interfaces.IReadableStream} interface
     * @return {Promise} Resolved when reading (and subsequent writings) are done
     * @since 0.2.3
     */
    function _gpfStreamPipe(source, destination) {
        _gpfIgnore(destination);
        var iReadableStream = _gpfStreamQueryReadable(source), iWritableStream = _gpfStreamPipeToWritable(_gpfArrayTail(arguments)), iFlushableStream = _gpfStreamPipeToFlushable(iWritableStream);
        try {
            return iReadableStream.read(iWritableStream).then(function () {
                return iFlushableStream.flush();
            });
        } catch (e) {
            return Promise.reject(e);
        }
    }
    /**
     * @gpf:sameas _gpfStreamPipe
     * @since 0.2.3
     */
    gpf.stream.pipe = _gpfStreamPipe;
    var _GPF_STRING_ESCAPE_REGEXP = "regexp";
    _gpfStringEscapes[_GPF_STRING_ESCAPE_REGEXP] = {
        "\\": "\\\\",
        "-": "\\-",
        "[": "\\[",
        "]": "\\]",
        "/": "\\/",
        "{": "\\{",
        "}": "\\}",
        "(": "\\(",
        ")": "\\)",
        "*": "\\*",
        "+": "\\+",
        "?": "\\?",
        ".": "\\.",
        "^": "\\^",
        "$": "\\$",
        "|": "\\|"
    };
    function _gpfStringEscapeForRegexp(that) {
        return _gpfStringEscapeFor(that, _GPF_STRING_ESCAPE_REGEXP);
    }
    _gpfErrorDeclare("csv", { invalidCSV: "Invalid CSV syntax (bad quote sequence or missing end of file)" });
    /**
     * @typedef gpf.typedef.csvParserOptions
     * @property {String} [header] Header line: if not specified, the first write of the input stream becomes the header
     * @property {String} [separator] Column separator, detected from the header line if not specified (allowed characters
     * are ";" "," and "\t")
     * @property {String} [quote="\""] Quote sign: introduces an escaped value in which quotes, separator and carriage
     * returns are allowed. Consequently, the value may stand on several lines
     * @property {String} [newLine="\n"] New line: each input stream write is considered as a separate line.
     * If a quoted value stands on several lines, this character is used to represents every new line
     * @since 0.2.3
     */
    /**
     * @namespace gpf.stream.csv
     * @description Root namespace for CSV related streams
     * @since 0.2.3
     */
    gpf.stream.csv = {};
    var
    // Usual CSV separators
    _gpfCsvSeparators = ";,\t ".split("");
    var _GpfStreamCsvParser = _gpfDefine({
        $class: "gpf.stream.csv.Parser",
        $extend: _GpfStreamBufferedRead,
        /**
         * CSV Parser
         *
         * Parses the incoming stream by considering each write as a separate line.
         * It is recommended to use the {@link gpf.stream.LineAdapter} class in between the incoming stream and the CSV
         * parser.
         *
         * Generates objects where properties are matching header columns and values are string extracted from record
         * lines.
         *
         * @param {gpf.typedef.csvParserOptions} [parserOptions] Parser options
         * @constructor gpf.stream.csv.Parser
         * @implements {gpf.interfaces.IReadableStream}
         * @implements {gpf.interfaces.IWritableStream}
         * @implements {gpf.interfaces.IFlushableStream}
         * @extends gpf.stream.BufferedRead
         * @since 0.2.3
         */
        constructor: function (parserOptions) {
            this._readParserOptions(parserOptions);
            if (this._header) {
                this._parseHeader();
            } else {
                this._write = this._writeHeader;
            }
        },
        //region Parser options
        /**
         * Read parser options
         *
         * @param {gpf.typedef.csvParserOptions} [parserOptions] Parser options
         * @since 0.2.3
         */
        _readParserOptions: function (parserOptions) {
            var me = this;
            if (parserOptions) {
                _gpfArrayForEach([
                    "header",
                    "separator",
                    "quote",
                    "newLine"
                ], function (optionName) {
                    if (parserOptions[optionName]) {
                        me["_" + optionName] = parserOptions[optionName];
                    }
                });
            }
        },
        /**
         * Header line
         *
         * @type {String}
         * @since 0.2.3
         */
        _header: "",
        /**
         * Column separator
         *
         * @type {String}
         * @since 0.2.3
         */
        _separator: "",
        /**
         * Deduce separator from header line
         * @since 0.2.3
         */
        _deduceSeparator: function () {
            var header = this._header;
            this._separator = _gpfArrayForEachFalsy(_gpfCsvSeparators, function (separator) {
                if (header.includes(separator)) {
                    return separator;
                }
            }) || _gpfCsvSeparators[_GPF_START];
        },
        /**
         * Quote sign
         *
         * @type {String}
         * @since 0.2.3
         */
        _quote: "\"",
        /**
         * New line
         *
         * @type {String}
         * @since 0.2.3
         */
        _newLine: "\n",
        //endregion
        //region Header processing
        /**
         * @property {String[]} Columns' name
         * @since 0.2.3
         */
        _columns: [],
        _buildParsingHelpers: function () {
            this._unescapeDictionary = {};
            this._unescapeDictionary[this._quote + this._quote] = this._quote;
            this._parser = new RegExp(_gpfStringReplaceEx("^(?:([^QS][^S]*)|Q((?:[^Q]|QQ)+)Q)(?=$|S)", {
                Q: _gpfStringEscapeForRegexp(this._quote),
                S: _gpfStringEscapeForRegexp(this._separator)
            }));
        },
        /**
         * Once header line is known, process it to prepare the parser
         * @since 0.2.3
         */
        _parseHeader: function () {
            if (!this._separator) {
                this._deduceSeparator();
            }
            this._columns = this._header.split(this._separator);
            this._buildParsingHelpers();
            this._write = this._writeContent;
        },
        /**
         * Write header line
         *
         * @param {String} line CSV line
         * @since 0.2.3
         */
        _writeHeader: function (line) {
            this._header = line;
            this._parseHeader();
        },
        //endregion
        //region Content processing
        /**
         * Values being built
         * @since 0.2.3
         */
        _values: [],
        /**
         * Content to parse
         * @since 0.2.3
         */
        _content: "",
        /**
         * Unescape quoted value
         *
         * @param {String} value Quoted value
         * @return {String} unescaped value
         * @since 0.2.3
         */
        _unescapeQuoted: function (value) {
            return _gpfStringReplaceEx(value, this._unescapeDictionary);
        },
        /**
         * Add the matching value to the array of values
         *
         * @param {Object} match Regular expression match
         * @since 0.2.3
         */
        _addValue: function (match) {
            var UNQUOTED = 1, QUOTED = 2;
            if (match[UNQUOTED]) {
                this._values.push(match[UNQUOTED]);
            } else
                /* if (match[QUOTED]) */
                {
                    this._values.push(this._unescapeQuoted(match[QUOTED]));
                }
        },
        /**
         * Move the content to the next value
         *
         * @param {Number} index Position where the next value starts
         * @return {Boolean} True if some remaining content must be parsed
         * @since 0.2.3
         */
        _nextValue: function (index) {
            this._content = this._content.substring(index);
            return Boolean(this._content.length);
        },
        /**
         * Check what appears after the extracted value
         *
         * @param {Object} match Regular expression match
         * @return {Boolean} True if some remaining content must be parsed
         * @since 0.2.3
         */
        _checkAfterValue: function (match) {
            var lengthOfMatchedString = match[_GPF_START].length, charAfterValue = this._content.charAt(lengthOfMatchedString);
            if (charAfterValue) {
                _gpfAssert(charAfterValue === this._separator, "Positive lookahead works");
                return this._nextValue(++lengthOfMatchedString);
            }
            delete this._content;
            return false;    // No value means end of content
        },
        /**
         * Extract value
         *
         * @return {Boolean} True if some remaining content must be parsed
         * @since 0.2.3
         */
        _extractValue: function () {
            var match = this._parser.exec(this._content);
            if (!match) {
                return false;    // Stop parsing
            }
            this._addValue(match);
            return this._checkAfterValue(match);
        },
        /**
         * Check if the content starts with a separator or assume it's a value
         *
         * @return {Boolean} True if some remaining content must be parsed
         * @since 0.2.3
         */
        _checkForValue: function () {
            if (this._content.startsWith(this._separator)) {
                this._values.push("");
                // Separator here means empty value
                return this._nextValue(this._separator.length);
            }
            return this._extractValue();
        },
        /**
         * Extract all values in the content
         *
         * @since 0.2.3
         */
        _parseValues: function () {
            while (this._checkForValue()) {
                _gpfIgnore();    // Not my proudest but avoid empty block warning
            }
        },
        /**
         * Parse content contained in the line (and any previously unterminated content)
         *
         * @return {String[]|undefined} Resulting values or undefined if record is not finalized yet
         * @since 0.2.3
         */
        _parseContent: function () {
            this._parseValues();
            if (this._content) {
                return;
            }
            return this._values;
        },
        /**
         * If some content remains from previous parsing, concatenate it and parse
         *
         * @param {String} line CSV line
         * @return {String[]|undefined} Resulting values or undefined if not yet finalized
         * @since 0.2.3
         */
        _processContent: function (line) {
            if (this._content) {
                this._content = this._content + this._newLine + line;
            } else {
                this._values = [];
                this._content = line;
            }
            return this._parseContent();
        },
        /**
         * Generate a record from values
         *
         * @param {String[]} values Array of values
         * @return {Object} Record based on header names
         * @since 0.2.3
         */
        _getRecord: function (values) {
            var record = {};
            _gpfArrayForEach(this._columns, function (name, idx) {
                var value = values[idx];
                if (value !== undefined) {
                    record[name] = values[idx];
                }
            });
            return record;
        },
        /**
         * Write content line
         *
         * @param {String} line CSV line
         * @since 0.2.3
         */
        _writeContent: function (line) {
            var values = this._processContent(line);
            if (values) {
                this._appendToReadBuffer(this._getRecord(values));
            }
        },
        //endregion
        //region gpf.interfaces.IReadableStream
        /**
         * @gpf:sameas gpf.interfaces.IWritableStream#write
         * @since 0.2.3
         */
        write: _gpfStreamSecureWrite(function (line) {
            var me = this;
            //eslint-disable-line no-invalid-this
            me._write(line);
            return Promise.resolve();
        }),
        //endregion
        //region gpf.interfaces.IFlushableStream
        /**
         * @gpf:sameas gpf.interfaces.IFlushableStream#flush
         * @since 0.2.3
         */
        flush: function () {
            if (this._content) {
                var error = new gpf.Error.InvalidCSV();
                this._setReadError(error);
                return Promise.reject(error);
            }
            this._completeReadBuffer();
            return Promise.resolve();
        }    //endregion
    });
    gpf.attributes = {};
    /**
     * Base class for all attributes
     *
     * @class gpf.attributes.Attribute
     * @since 0.2.4
     */
    var _gpfAttribute = _gpfDefine({
        $class: "gpf.attributes.Attribute",
        $abstract: true,
        /**
         * Class member name the attribute was set on (or undefined if at class level)
         * @type {String|undefined}
         * @since 0.2.8
         */
        _memberName: undefined,
        /**
         * @gpf:read _memberName
         * @since 0.2.8
         */
        getMemberName: function () {
            return this._memberName;
        },
        /**
         * Class constructore the attribute was set on
         * @type {Function|undefined}
         * @since 0.2.8
         */
        _ClassConstructor: undefined,
        /**
         * @gpf:read _ClassConstructor
         * @since 0.2.8
         */
        getClassConstructor: function () {
            return this._ClassConstructor;
        },
        /**
         * Check the attribute usage
         * **NOTE**: Experimental feature, do not rely on this method
         *
         * @param {String} member Member name or empty if global to the class
         * @param {_GpfClassDefinition} classDefinition Class definition
         * @private
         * @since 0.2.8
         */
        _check: function (member, classDefinition) {
            _gpfIgnore(member, classDefinition);
        },
        /**
         * Build the class according to the attribute usage
         * **NOTE**: Experimental feature, do not rely on this method
         *
         * @param {String} member Member name or empty if global to the class
         * @param {_GpfClassDefinition} classDefinition Class definition
         * @param {Object} classPrototype Class prototype being built
         * @private
         * @since 0.2.8
         */
        _build: function (member, classDefinition, classPrototype) {
            _gpfIgnore(member, classDefinition, classPrototype);
        }
    });
    _gpfErrorDeclare("define/class/attributes", {
        /**
         * ### Summary
         *
         * The attributes are set on an unknwon member
         *
         * ### Description
         *
         * Attributes are allowed only on existing members or at the class level using $attributes
         * @since 0.2.4
         */
        unknownAttributesSpecification: "Unknown attributes specification",
        /**
         * ### Summary
         *
         * The attributes specification is invalid
         *
         * ### Description
         *
         * Attributes are specified using an array of {@link gpf.attributes.Attribute} instances
         * @since 0.2.4
         */
        invalidAttributesSpecification: "Invalid attributes specification"
    });
    var _GPF_DEFINE_CLASS_ATTRIBUTES_SPECIFICATION = "attributes", _GPF_DEFINE_CLASS_ATTRIBUTES_NAME = "$" + _GPF_DEFINE_CLASS_ATTRIBUTES_SPECIFICATION,
        // If matching the capturing group returns the member name or undefined (hence the |.)
        _gpfDefClassAttrIsAttributeRegExp = new RegExp("^\\[([^\\]]+)\\]$|."), _GPF_DEFINE_CLASS_ATTRIBUTE_MATCH_NAME = 1, _gpfDefClassAttrClassCheckMemberName = _GpfClassDefinition.prototype._checkMemberName, _gpfDefClassAttrClassCheckMemberValue = _GpfClassDefinition.prototype._checkMemberValue, _gpfDefClassAttrClassCheck$Property = _GpfClassDefinition.prototype._check$Property, _gpfDefClassAttrClassCheck = _GpfClassDefinition.prototype.check;
    /**
     * Check attribute
     *
     * @param {String} member Member name
     * @param {gpf.attributes.Attribute} attribute Attribute
     * @this {_GpfClassDefinition}
     * @since 0.2.9
     */
    function _gpfDefClassAttrCheck(member, attribute) {
        /*jshint validthis:true*/
        attribute._check(member, this);    //eslint-disable-line no-invalid-this
    }
    /**
     * Given the member name, tells if the property introduces attributes
     *
     * @param {String} name Member name
     * @return {String|undefined} Real property name if attributes specification, undefined otherwise
     * @since 0.2.4
     */
    function _gpfDefClassAttrIsAttributeSpecification(name) {
        return _gpfDefClassAttrIsAttributeRegExp.exec(name)[_GPF_DEFINE_CLASS_ATTRIBUTE_MATCH_NAME];
    }
    Object.assign(_GpfClassDefinition.prototype, {
        _hasInheritedMember: function (name) {
            return this._extend && this._extend.prototype[name] !== undefined;
        },
        _hasMember: function (name) {
            return Object.prototype.hasOwnProperty.call(this._initialDefinition, name) || this._hasInheritedMember(name);
        },
        /**
         * Given the member name, check if it exists
         *
         * @param {String} name property name
         * @throws {gpf.Error.unknownAttributesSpecification}
         * @since 0.2.4
         */
        _checkAttributeMemberExist: function (name) {
            if (!this._hasMember(name)) {
                gpf.Error.unknownAttributesSpecification();
            }
        },
        /**
         * @inheritdoc
         * @since 0.2.4
         */
        _checkMemberName: function (name) {
            var attributeName = _gpfDefClassAttrIsAttributeSpecification(name);
            if (attributeName) {
                _gpfDefClassAttrClassCheckMemberName.call(this, attributeName);
                this._checkAttributeMemberExist(attributeName);
            } else {
                _gpfDefClassAttrClassCheckMemberName.call(this, name);
            }
        },
        /**
         * Verify that the attributes specification fits the requirements:
         * - Must be an array
         * - The array must contain only instances of {@link gpf.attributes.Attribute}
         *
         * @param {*} attributes The attributes specification to validate
         * @throws {gpf.Error.InvalidAttributesSpecification}
         * @since 0.2.4
         */
        _checkAttributesSpecification: function (attributes) {
            if (!_gpfIsArrayLike(attributes)) {
                gpf.Error.invalidAttributesSpecification();
            }
            _gpfArrayForEach(attributes, function (attribute) {
                if (!(attribute instanceof _gpfAttribute)) {
                    gpf.Error.invalidAttributesSpecification();
                }
            });
        },
        /**
         * @inheritdoc
         * @since 0.2.4
         */
        _checkMemberValue: function (name, value) {
            var attributeName = _gpfDefClassAttrIsAttributeSpecification(name);
            if (attributeName) {
                this._checkAttributesSpecification(value);
                this._addAttributesFor(attributeName, value);
            } else {
                _gpfDefClassAttrClassCheckMemberValue.call(this, name, value);
            }
        },
        /**
         * @inheritdoc
         * @since 0.2.4
         */
        _check$Property: function (name, value) {
            if (_GPF_DEFINE_CLASS_ATTRIBUTES_SPECIFICATION === name) {
                this._checkAttributesSpecification(value);
                this._addAttributesFor(_GPF_DEFINE_CLASS_ATTRIBUTES_NAME, value);
            } else {
                _gpfDefClassAttrClassCheck$Property.call(this, name, value);
            }
        },
        /**
         * @inheritdoc
         * @since 0.2.8
         */
        check: function () {
            this._attributes = {};
            _gpfDefClassAttrClassCheck.call(this);
            this._forOwnAttributes(_gpfDefClassAttrCheck);
        }
    });
    _GpfClassDefinition.prototype._allowed$Properties.push(_GPF_DEFINE_CLASS_ATTRIBUTES_SPECIFICATION);
    var _gpfDefClassAttrClassAddmemberToPrototype = _GpfClassDefinition.prototype._addMemberToPrototype, _gpfDefClassAttrClassBuildPrototype = _GpfClassDefinition.prototype._buildPrototype;
    /**
     * Build attribute
     *
     * @param {String} member Member name
     * @param {gpf.attributes.Attribute} attribute Attribute
     * @param {Object} newPrototype Class prototype
     * @since 0.2.9
     */
    function _gpfDefClassAttrBuild(member, attribute, newPrototype) {
        /*jshint validthis:true*/
        var attributeEntityDefinition = _gpfDefineClassImport(attribute.constructor);
        if (!attributeEntityDefinition._singleton) {
            attribute._memberName = member;
            attribute._ClassConstructor = newPrototype.constructor;
        }
        attribute._build(member, this, newPrototype);    //eslint-disable-line no-invalid-this
    }
    Object.assign(_GpfClassDefinition.prototype, {
        /**
         * Dictionary of Attributes
         * @since 0.2.4
         */
        _attributes: {},
        _addAttributesFor: function (memberName, attributes) {
            this._attributes[memberName] = attributes;
        },
        /**
         * @inheritdoc
         * @since 0.2.4
         */
        _addMemberToPrototype: function (newPrototype, memberName, value) {
            var attributeName = _gpfDefClassAttrIsAttributeSpecification(memberName);
            if (!attributeName) {
                _gpfDefClassAttrClassAddmemberToPrototype.call(this, newPrototype, memberName, value);
            }
        },
        _buildPrototype: function (newPrototype) {
            _gpfDefClassAttrClassBuildPrototype.call(this, newPrototype);
            this._forOwnAttributes(_gpfDefClassAttrBuild, newPrototype);
        }
    });
    function _gpfDefClassAttrFilter(attributes, baseAttributeClass) {
        if (baseAttributeClass) {
            return attributes.filter(function (attribute) {
                return attribute instanceof baseAttributeClass;
            });
        }
        return attributes;
    }
    function _gpfDefClassAttrAssign(allAttributes, member, attributes) {
        allAttributes[member] = (allAttributes[member] || []).concat(attributes);
    }
    Object.assign(_GpfClassDefinition.prototype, {
        _collectOwnAttributes: function (allAttributes, baseAttributeClass) {
            _gpfObjectForEach(this._attributes, function (memberAttributes, member) {
                var attributes = _gpfDefClassAttrFilter(memberAttributes, baseAttributeClass);
                if (attributes.length) {
                    _gpfDefClassAttrAssign(allAttributes, member, attributes);
                }
            });
        },
        _getOwnAttributes: function () {
            var ownAttributes = {};
            this._collectOwnAttributes(ownAttributes);
            return ownAttributes;
        },
        _collectAttributes: function (allAttributes, baseAttributeClass) {
            this._collectOwnAttributes(allAttributes, baseAttributeClass);
            if (this._extendDefinition) {
                this._extendDefinition._collectAttributes(allAttributes, baseAttributeClass);
            }
        },
        _forOwnAttributes: function (callback, lastParam) {
            var me = this, ownAttributes = me._getOwnAttributes();
            _gpfObjectForEach(ownAttributes, function (attributes, name) {
                var member;
                if (_GPF_DEFINE_CLASS_ATTRIBUTES_NAME !== name) {
                    member = name;
                }
                _gpfArrayForEach(attributes, function (attribute) {
                    callback.call(me, member, attribute, lastParam);
                });
            });
        },
        /**
         * Retrieve all attributes for this class definition (including inherited ones)
         *
         * @param {gpf.attributes.Attribute} [baseAttributeClass] Base attribute class used to filter results
         * @return {Object} Dictionary of attributes grouped per members
         * @since 0.2.4
         */
        getAttributes: function (baseAttributeClass) {
            var allAttributes = {};
            this._collectAttributes(allAttributes, baseAttributeClass);
            return allAttributes;
        }
    });
    function _gpfAttributesGetFromClass(classConstructor, baseAttributeClass) {
        return _gpfDefineClassImport(classConstructor).getAttributes(baseAttributeClass);
    }
    function _gpfAttributesGetConstructorFromTruthy(any) {
        if (typeof any !== "object") {
            gpf.Error.invalidParameter();
        }
        return any.constructor;
    }
    function _gpfAttributesGetConstructorFrom(any) {
        if (any) {
            return _gpfAttributesGetConstructorFromTruthy(any);
        }
        gpf.Error.invalidParameter();
    }
    /**
     * Get attributes defined for the object / class
     *
     * @param {Object|Function} objectOrClass Object instance or class constructor
     * @param {gpf.attributes.Attribute} [baseAttributeClass] Base attribute class used to filter results
     * @return {Object} Dictionary of attributes grouped per members,
     * the special member $attributes is used for attributes set at the class level.
     * @throws {gpf.Error.InvalidParameter}
     * @since 0.2.4
     */
    function _gpfAttributesGet(objectOrClass, baseAttributeClass) {
        var classConstructor;
        if (typeof objectOrClass === "function") {
            classConstructor = objectOrClass;
        } else {
            classConstructor = _gpfAttributesGetConstructorFrom(objectOrClass);
        }
        return _gpfAttributesGetFromClass(classConstructor, baseAttributeClass);
    }
    /**
     * @gpf:sameas _gpfAttributesGet
     * @since 0.2.4
     */
    gpf.attributes.get = _gpfAttributesGet;
    var _gpfStreamOperatorNoData = {},
        /**
         * Abstract operator stream
         * Base class to simplify writing of unbuffered data processor streams (filter, map)
         *
         * @class gpf.stream.AbstractOperator
         * @implements {gpf.interfaces.IReadableStream}
         * @implements {gpf.interfaces.IWritableStream}
         * @implements {gpf.interfaces.IFlushableStream}
         * @since 0.2.5
         */
        _GpfStreamAbtsractOperator = _gpfDefine({
            $class: "gpf.stream.AbstractOperator",
            //region internal handling
            /**
             * Promise used to wait for data
             * @type {Promise}
             * @since 0.2.5
             */
            _dataInPromise: undefined,
            /**
             * Resolve function of _dataInPromise
             * @type {Function}
             * @since 0.2.5
             */
            _dataInResolve: _gpfEmptyFunc,
            /**
             * Resolve function of _writeData's Promise
             * @type {Function}
             * @since 0.2.5
             */
            _dataOutResolve: _gpfEmptyFunc,
            /**
             * Reject function of _writeData's Promise
             * @type {Function}
             * @since 0.2.5
             */
            _dataOutReject: _gpfEmptyFunc,
            /**
             * Wait until data was written to this stream
             *
             * @return {Promise} Resolved when a data as been written to this stream
             * @since 0.2.5
             */
            _waitForData: function () {
                var me = this;
                if (!me._dataInPromise) {
                    me._dataInPromise = new Promise(function (resolve) {
                        me._dataInResolve = resolve;
                    }).then(function (data) {
                        delete me._dataInPromise;
                        delete me._dataInResolve;
                        return data;
                    });
                }
                return me._dataInPromise;
            },
            /**
             * Waits for the read API to write it out
             *
             * @param {*} data Data to write
             * @return {Promise} Resolved when write operation has been done on output
             * @protected
             * @since 0.2.5
             */
            _writeData: function (data) {
                var me = this;
                me._waitForData();
                me._dataInResolve(data);
                return new Promise(function (resolve, reject) {
                    me._dataOutResolve = resolve;
                    me._dataOutReject = reject;
                }).then(function (value) {
                    delete me._dataOutResolve;
                    delete me._dataOutReject;
                    return value;
                }, function (reason) {
                    delete me._dataOutResolve;
                    delete me._dataOutReject;
                    return Promise.reject(reason);
                });
            },
            //endregion
            //region gpf.interfaces.IReadableStream
            /**
             * @gpf:sameas gpf.interfaces.IReadableStream#read
             * @since 0.2.5
             */
            read: _gpfStreamSecureRead(function (output) {
                var me = this;
                //eslint-disable-line no-invalid-this
                return me._waitForData().then(function (data) {
                    if (_gpfStreamOperatorNoData !== data) {
                        return output.write(data).then(me._dataOutResolve, me._dataOutReject);
                    }
                    me._dataOutResolve();
                    return Promise.resolve();    // Nothing to write
                });
            }),
            //endregion
            //region gpf.interfaces.IWritableStream
            /**
             * Process data, use {@link gpf.stream.AbstractOperator#_writeData} to transmit data to the reader
             *
             * @param {*} data Data to process
             * @return {Promise} Resolved when ready
             * @abstract
             * @since 0.2.5
             */
            _process: _gpfCreateAbstractFunction(),
            /**
             * @gpf:sameas gpf.interfaces.IWritableStream#write
             * @since 0.2.5
             */
            write: _gpfStreamSecureWrite(function (data) {
                return this._process(data);    //eslint-disable-line no-invalid-this
            }),
            //endregion
            //region gpf.interfaces.IFlushableStream
            /**
             * @gpf:sameas gpf.interfaces.IFlushableStream#flush
             * @since 0.2.5
             */
            flush: function () {
                if (this._dataInPromise) {
                    return this._writeData(_gpfStreamOperatorNoData);
                }
                return Promise.resolve();
            }    //endregion
        });
    _gpfStreamSecureInstallProgressFlag(_GpfStreamAbtsractOperator);
    var _GpfStreamFilter = _gpfDefine({
        $class: "gpf.stream.Filter",
        $extend: _GpfStreamAbtsractOperator,
        /**
         * Filter stream
         *
         * @param {gpf.typedef.filterFunc} filter Filter function
         * @constructor gpf.stream.Filter
         * @implements {gpf.interfaces.IReadableStream}
         * @implements {gpf.interfaces.IWritableStream}
         * @implements {gpf.interfaces.IFlushableStream}
         * @since 0.2.4
         */
        constructor: function (filter) {
            this._filter = filter;
        },
        _process: function (data) {
            if (this._filter(data)) {
                return this._writeData(data);
            }
            return Promise.resolve();
        }
    });
    var _GpfStreamMap = _gpfDefine({
        $class: "gpf.stream.Map",
        $extend: _GpfStreamAbtsractOperator,
        /**
         * Map stream
         *
         * @param {gpf.typedef.mapFunc} map map function
         * @constructor gpf.stream.Map
         * @extends gpf.stream.AbstractOperator
         * @implements {gpf.interfaces.IReadableStream}
         * @implements {gpf.interfaces.IWritableStream}
         * @implements {gpf.interfaces.IFlushableStream}
         * @since 0.2.5
         */
        constructor: function (map) {
            this._map = map;
        },
        _process: function (data) {
            return this._writeData(this._map(data));
        }
    });
    var _gpfIXmlContentHandler = _gpfDefineInterface("XmlContentHandler", {
        "characters": 1,
        "endDocument": 0,
        "endElement": 0,
        "endPrefixMapping": 1,
        "processingInstruction": 2,
        "startDocument": 0,
        "startElement": 2,
        "startPrefixMapping": 2
    });
    _gpfErrorDeclare("xml/check", {
        /**
        * ### Summary
        *
        * Invalid XML element name
        *
        * ### Description
        *
        * Invalid XML element name
        * @since 0.2.7
        */
        invalidXmlElementName: "Invalid XML element name",
        /**
        * ### Summary
        *
        * Invalid XML attribute name
        *
        * ### Description
        *
        * Invalid XML attribute name
        * @since 0.2.7
        */
        invalidXmlAttributeName: "Invalid XML attribute name",
        /**
        * ### Summary
        *
        * Invalid XML namespace prefix
        *
        * ### Description
        *
        * Invalid XML namespace prefix
        * @since 0.2.7
        */
        invalidXmlNamespacePrefix: "Invalid XML namespace prefix",
        /**
        * ### Summary
        *
        * Invalid use of XML namespace prefix xmlns
        *
        * ### Description
        *
        * Invalid use of XML namespace prefix xmlns: startPrefixMapping should be used instead
        * @since 0.2.7
        */
        invalidXmlUseOfPrefixXmlns: "Invalid use of XML namespace prefix xmlns",
        /**
        * ### Summary
        *
        * Invalid use of XML namespace prefix xml
        *
        * ### Description
        *
        * Invalid use of XML namespace prefix xml: only xml:space="preserve" is allowed
        * @since 0.2.7
        */
        invalidXmlUseOfPrefixXml: "Invalid use of XML namespace prefix xml",
        /**
        * ### Summary
        *
        * Unknown XML namespace prefix
        *
        * ### Description
        *
        * This error is triggered when an element or an attribute is prefixed with an unknown namespace prefix
        * @since 0.2.7
        */
        unknownXmlNamespacePrefix: "Unknown XML namespace prefix"
    });
    function _gpfXmlCheckBuildSimple(regexp, exception) {
        return function (name) {
            if (!name.match(regexp)) {
                gpf.Error["invalidXml" + exception]();
            }
        };
    }
    var _gpfXmlCheckNameRegExp = new RegExp("^[a-zA-Z_][a-zA-Z0-9_\\-\\.]*$"), _gpfXmlNamespacePrefixRegExp = new RegExp("^(|[a-z_][a-zA-Z0-9_]*)$"),
        /**
         * Check XML element name
         *
         * @param {String} name Element name to check
         * @throws {gpf.Error.InvalidXmlElementName}
         * @since 0.2.7
         */
        _gpfXmlCheckValidElementName = _gpfXmlCheckBuildSimple(_gpfXmlCheckNameRegExp, "ElementName"),
        /**
         * Check XML attribute name
         *
         * @param {String} name Attribute name to check
         * @throws {gpf.Error.InvalidXmlAttributeName}
         * @since 0.2.7
         */
        _gpfXmlCheckValidAttributeName = _gpfXmlCheckBuildSimple(_gpfXmlCheckNameRegExp, "AttributeName"),
        /**
        * Check XML namespace prefix name
        *
        * @param {String} name Namespace prefix name to check
        * @throws {gpf.Error.InvalidXmlNamespacePrefix}
        * @since 0.2.7
        */
        _gpfXmlCheckValidNamespacePrefixName = _gpfXmlCheckBuildSimple(_gpfXmlNamespacePrefixRegExp, "NamespacePrefix");
    function _gpfXmlCheckNoXmlns(prefix) {
        if (prefix === "xmlns") {
            gpf.Error.invalidXmlUseOfPrefixXmlns();
        }
    }
    function _gpfXmlCheckQualifiedNameAndPrefix(name, prefix) {
        _gpfXmlCheckValidElementName(name);
        _gpfXmlCheckValidNamespacePrefixName(prefix);
        _gpfXmlCheckNoXmlns(prefix);
    }
    function _gpfXmlCheckIfKnownPrefix(prefix, knownPrefixes) {
        if (!knownPrefixes.includes(prefix)) {
            gpf.Error.unknownXmlNamespacePrefix();
        }
    }
    function _gpfXmlCheckQualifiedElementNameAndPrefix(name, prefix, knownPrefixes) {
        _gpfXmlCheckQualifiedNameAndPrefix(name, prefix);
        if (prefix === "xml") {
            gpf.Error.invalidXmlUseOfPrefixXml();
        } else {
            _gpfXmlCheckIfKnownPrefix(prefix, knownPrefixes);
        }
    }
    function _gpfXmlCheckGetQualified(noPrefixCheck, nameAndPrefixCheck) {
        return function (qName, knownPrefixes) {
            var sep = qName.indexOf(":"), name, prefix;
            if (sep === _GPF_NOT_FOUND) {
                noPrefixCheck(qName);
            } else {
                prefix = qName.substring(_GPF_START, sep);
                name = qName.substring(++sep);
                nameAndPrefixCheck(name, prefix, knownPrefixes);
            }
        };
    }
    /**
     * Check XML qualified element name
     *
     * @param {String} qName Element qualified name to check
     * @param {String[]} knownPrefixes Known namespaces prefixes
     *
     * @throws {gpf.Error.InvalidXmlElementName}
     * @throws {gpf.Error.invalidXmlNamespacePrefix}
     * @since 0.2.7
     */
    var _gpfXmlCheckQualifiedElementName = _gpfXmlCheckGetQualified(_gpfXmlCheckValidElementName, _gpfXmlCheckQualifiedElementNameAndPrefix);
    function _gpfXmlCheckOnlyXmlSpace(name) {
        if (name !== "space") {
            gpf.Error.invalidXmlUseOfPrefixXml();
        }
    }
    function _gpfXmlCheckQualifiedAttributeNameAndPrefix(name, prefix, knownPrefixes) {
        _gpfXmlCheckQualifiedNameAndPrefix(name, prefix);
        if (prefix === "xml") {
            _gpfXmlCheckOnlyXmlSpace(name);
        } else {
            _gpfXmlCheckIfKnownPrefix(prefix, knownPrefixes);
        }
    }
    /**
     * Check XML qualified attribute name
     *
     * @param {String} qName Attribute qualified name to check
     * @param {String[]} knownPrefixes Known namespaces prefixes
     *
     * @throws {gpf.Error.InvalidXmlElementName}
     * @since 0.2.7
     */
    var _gpfXmlCheckQualifiedAttributeName = _gpfXmlCheckGetQualified(_gpfXmlCheckValidAttributeName, _gpfXmlCheckQualifiedAttributeNameAndPrefix);
    /**
     * Check if the given XML namespace prefix name can be defined
     *
     * @param {String} name Namespace prefix name to check
     * @throws {gpf.Error.InvalidXmlNamespacePrefix}
     * @throws {gpf.Error.InvalidXmlUseOfPrefixXmlns}
     * @throws {gpf.Error.InvalidXmlUseOfPrefixXml}
     * @since 0.2.7
     */
    function _gpfXmlCheckDefinableNamespacePrefixName(name) {
        _gpfXmlCheckValidNamespacePrefixName(name);
        _gpfXmlCheckNoXmlns(name);
        if (name === "xml") {
            gpf.Error.invalidXmlUseOfPrefixXml();
        }
    }
    function _gpfInterfacesWrap(iInterfaceImpl, interfaceSpecifier, promise) {
        var fThen = promise.then;
        promise.then = function () {
            return _gpfInterfacesWrap(iInterfaceImpl, interfaceSpecifier, fThen.apply(promise, arguments));
        };
        _gpfObjectForEach(interfaceSpecifier.prototype, function (referenceMethod, name) {
            promise[name] = function () {
                var args = arguments;
                return promise.then(function () {
                    return _gpfPromisify(iInterfaceImpl[name].apply(iInterfaceImpl, args));
                });
            };
        });
        return promise;
    }
    /**
     * Build promisified interface wrapper
     *
     * @param {Function} interfaceSpecifier Reference interface
     * @return {Function} Interface Wrapper constructor
     * @since 0.2.8
     */
    function _gpfInterfacesPromisify(interfaceSpecifier) {
        return function (object) {
            var iInterfaceImpl = _gpfInterfaceQuery(interfaceSpecifier, object);
            if (!iInterfaceImpl) {
                gpf.Error.interfaceExpected({ name: _gpfGetFunctionName(interfaceSpecifier) });
            }
            return _gpfInterfacesWrap(iInterfaceImpl, interfaceSpecifier, Promise.resolve());
        };
    }
    /**
     * @gpf:sameas _gpfInterfacesPromisify
     * @since 0.2.8
     *
     * @example <caption>IXmlContentHandler wrapper</caption>
     * var wrapXmlContentHandler = gpf.interfaces.promisify(gpf.interfaces.IXmlContentHandler),
     *     writer = new gpf.xml.Writer(),
     *     output = new gpf.stream.WritableString();
     * gpf.stream.pipe(writer, output).then(function () {
     *     console.log(output.toString());
     * });
     * wrapXmlContentHandler(writer)
     *     .startDocument()
     *     .startElement("document")
     *     .endElement();
     * // <document/>
     */
    gpf.interfaces.promisify = _gpfInterfacesPromisify;
    _gpfErrorDeclare("xml/writer", {
        /**
         * ### Summary
         *
         * Invalid XML Writer state
         *
         * ### Description
         *
         * This error is used when a method can not be called due to the current XML writer state
         * @since 0.2.7
         */
        invalidXmlWriterState: "Invalid XML Writer state"
    });
    var _GpfXmlWriter = _gpfDefine({
        $class: "gpf.xml.Writer",
        $extend: _GpfStreamBufferedRead,
        /**
         * XML writer
         *
         * @constructor gpf.xml.Writer
         * @implements {gpf.interfaces.IReadableStream}
         * @implements {gpf.interfaces.IXmlContentHandler}
         * @extends gpf.stream.BufferedRead
         * @since 0.2.7
         */
        constructor: function () {
            this._elements = [];
            this._nextNamespaces = {};
            this._checkIfStarted = gpf.Error.invalidXmlWriterState;
        },
        _elements: [],
        _nextNamespaces: {},
        _checkIfElementsExist: function (hasElements) {
            if (hasElements !== Boolean(this._elements.length)) {
                gpf.Error.invalidXmlWriterState();
            }
        },
        _checkState: function (hasElements) {
            this._checkIfStarted();
            if (undefined !== hasElements) {
                this._checkIfElementsExist(hasElements);
            }
        },
        _addContentToElement: function (element) {
            if (!element.content) {
                this._appendToReadBuffer(">");
                element.content = true;
            }
        },
        _addContentToLastElement: function () {
            var element = this._elements[_GPF_START];
            if (element) {
                return this._addContentToElement(element);
            }
        },
        _writeAttribute: function (qName, value) {
            this._appendToReadBuffer(" " + qName + "=\"");
            this._appendToReadBuffer(_gpfStringEscapeForXml(value.toString()));
            this._appendToReadBuffer("\"");
        },
        _getNamespacePrefixes: function () {
            return this._elements.reduce(function (namespaces, element) {
                return namespaces.concat(Object.keys(element.namespaces));
            }, []);
        },
        _processAttributes: function (attributes) {
            _gpfObjectForEach(attributes, function (value, qName) {
                /*jshint validthis:true*/
                var me = this;
                //eslint-disable-line no-invalid-this
                _gpfXmlCheckQualifiedAttributeName(qName, me._getNamespacePrefixes());
                me._writeAttribute(qName, value);
            }, this);
        },
        _processNamespaces: function (namespaces) {
            _gpfObjectForEach(namespaces, function (value, name) {
                /*jshint validthis:true*/
                var me = this;
                //eslint-disable-line no-invalid-this
                if (name) {
                    me._writeAttribute("xmlns:" + name, value);
                } else {
                    me._writeAttribute("xmlns", value);
                }
            }, this);
        },
        // region gpf.interfaces.IXmlContentHandler
        /**
         * @gpf:sameas gpf.interfaces.IXmlContentHandler#characters
         * @since 0.2.7
         */
        characters: function (buffer) {
            this._checkState(true);
            this._addContentToLastElement();
            this._appendToReadBuffer(_gpfStringEscapeForXml(buffer.toString()));
            return Promise.resolve();
        },
        /**
         * @gpf:sameas gpf.interfaces.IXmlContentHandler#endDocument
         * @since 0.2.7
         */
        endDocument: function () {
            this._checkState(false);
            this._checkIfStarted = gpf.Error.invalidXmlWriterState;
            this._completeReadBuffer();
            return Promise.resolve();
        },
        /**
         * @gpf:sameas gpf.interfaces.IXmlContentHandler#endElement
         * @since 0.2.7
         */
        endElement: function () {
            this._checkState(true);
            var element = this._elements.shift();
            if (element.content) {
                this._appendToReadBuffer("</" + element.qName + ">");
            } else {
                this._appendToReadBuffer("/>");
            }
            return Promise.resolve();
        },
        /**
         * @gpf:sameas gpf.interfaces.IXmlContentHandler#endPrefixMapping
         * @since 0.2.7
         */
        endPrefixMapping: function (prefix) {
            // Actually this call is ignored since closing the element owning the namespaces will do the same.
            this._checkState();
            _gpfIgnore(prefix);
            return Promise.resolve();
        },
        /**
         * @gpf:sameas gpf.interfaces.IXmlContentHandler#processingInstruction
         * @since 0.2.7
         */
        processingInstruction: function (target, data) {
            this._checkState(false);
            this._appendToReadBuffer("<?" + target + " " + data + "?>\n");
            return Promise.resolve();
        },
        /**
         * @gpf:sameas gpf.interfaces.IXmlContentHandler#startDocument
         * @since 0.2.7
         */
        startDocument: function () {
            this._checkIfStarted = _gpfEmptyFunc;
            this.startDocument = gpf.Error.invalidXmlWriterState;
            this._checkState(false);
            return Promise.resolve();
        },
        /**
         * @gpf:sameas gpf.interfaces.IXmlContentHandler#startElement
         * @since 0.2.7
         */
        startElement: function (qName, attributes) {
            var namespaces = this._nextNamespaces;
            this._checkState();
            this._addContentToLastElement();
            this._elements.unshift({
                qName: qName,
                namespaces: namespaces
            });
            this._nextNamespaces = {};
            _gpfXmlCheckQualifiedElementName(qName, this._getNamespacePrefixes());
            this._appendToReadBuffer("<" + qName);
            if (attributes) {
                this._processAttributes(attributes);
            }
            this._processNamespaces(namespaces);
        },
        /**
         * @gpf:sameas gpf.interfaces.IXmlContentHandler#startPrefixMapping
         * @since 0.2.7
         */
        startPrefixMapping: function (prefix, uri) {
            this._checkState();
            _gpfXmlCheckDefinableNamespacePrefixName(prefix);
            if (this._nextNamespaces[prefix]) {
                gpf.Error.invalidXmlWriterState();
            }
            this._nextNamespaces[prefix] = uri;
        }    //endregion
    });
    function _gpfArrayForEachAsync(array, callback, thisArg) {
        var index = 0, length = array.length;
        function next() {
            if (index === length) {
                return Promise.resolve();
            }
            var current = index++;
            try {
                return _gpfPromisify(callback.call(thisArg, array[current], current, array)).then(next);
            } catch (e) {
                return Promise.reject(e);
            }
        }
        return next();
    }
    /**
     * Executes a provided function once per structure element.
     * NOTE: unlike [].forEach, non own properties are also enumerated
     *
     * @param {Array} container Container to enumerate
     * @param {gpf.typedef.forEachCallback} callback Callback function executed on each item or own property,
     * may return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
     * If so, waits for the promise to be resolved before iterating over the next item.
     * @param {*} [thisArg=undefined] thisArg Value to use as this when executing callback
     * @return {Promise} Resolved when the iteration is done
     * @throws {gpf.Error.InvalidParameter}
     * @since 0.2.8
     */
    gpf.forEachAsync = function (container, callback, thisArg) {
        if (_gpfIsArrayLike(container)) {
            return _gpfArrayForEachAsync(container, callback, thisArg);
        }
        gpf.Error.invalidParameter();
    };
    _gpfErrorDeclare("serial/property", {
        /**
         * ### Summary
         *
         * Serializable property 'name' is invalid
         *
         * ### Description
         *
         * name should respect the pattern `/^[a-z][a-z0-9_]*$/i`
         * @since 0.2.8
         */
        invalidSerialName: "Invalid serial name",
        /**
         * ### Summary
         *
         * Serializable property 'type' is invalid
         *
         * ### Description
         *
         * Value should be one of the enumeration {@see gpf.serial.types}
         * @since 0.2.8
         */
        invalidSerialType: "Invalid serial type",
        /**
         * ### Summary
         *
         * Serializable property 'required' is invalid
         *
         * ### Description
         *
         * Value can either be true or false
         * @since 0.2.8
         */
        invalidSerialRequired: "Invalid serial required",
        /**
         * ### Summary
         *
         * Serializable property 'readOnly' is invalid
         *
         * ### Description
         *
         * Value can either be true or false
         * @since 0.2.9
         */
        invalidSerialReadOnly: "Invalid serial readOnly"
    });
    /**
     * @namespace gpf.serial
     * @description Root namespace for the serialization helpers.
     * @since 0.2.8
     */
    gpf.serial = {};
    /**
     * Serializable property specification
     *
     * @typedef gpf.typedef.serializableProperty
     * @property {String} name Name of the property
     * @property {gpf.serial.types} [type=gpf.serial.types.string] Type of the property
     * @property {Boolean} [required=false] Property must have a value
     * @property {Boolean} [readOnly=undefined] Property is read only. When undefined, and if the host supports
     * [Object.getOwnPropertyDescriptors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/
     * Object/getOwnPropertyDescriptors), the framework will check if the property can be set.
     * This property is resolved when used in the {@link gpf.typedef.serialConverter}.
     * @see gpf.attributes.Serializable
     * @since 0.2.8
     */
    /**
     * Serializable types constants
     * @since 0.2.8
     */
    var _GPF_SERIAL_TYPE = {
        STRING: "string",
        INTEGER: "integer",
        DATETIME: "datetime"
    };
    /**
     * Serializable types enumeration
     *
     * @enum {String}
     * @readonly
     * @since 0.2.8
     */
    gpf.serial.types = {
        /**
         * String
         * @since 0.2.8
         */
        string: _GPF_SERIAL_TYPE.STRING,
        /**
         * Integer
         * @since 0.2.8
         */
        integer: _GPF_SERIAL_TYPE.INTEGER,
        /**
         * Date/Time
         * @since 0.2.8
         */
        datetime: _GPF_SERIAL_TYPE.DATETIME
    };
    function _gpfSerialPropertyCheckNameType(name) {
        if (typeof name !== "string") {
            gpf.Error.invalidSerialName();
        }
    }
    var _gpfSerialPropertyNameRegExp = new RegExp("^[a-z][a-z0-9_]*$", "i");
    function _gpfSerialPropertyCheckNameRegExp(name) {
        if (!name.match(_gpfSerialPropertyNameRegExp)) {
            gpf.Error.invalidSerialName();
        }
    }
    function _gpfSerialPropertyCheckName(property) {
        _gpfSerialPropertyCheckNameType(property.name);
        _gpfSerialPropertyCheckNameRegExp(property.name);
    }
    var _gpfSerialPropertyTypes = Object.keys(_GPF_SERIAL_TYPE).map(function (name) {
        return _GPF_SERIAL_TYPE[name];
    });
    function _gpfSerialPropertyCheckTypeExists(type) {
        if (!_gpfSerialPropertyTypes.includes(type)) {
            gpf.Error.invalidSerialType();
        }
    }
    function _gpfSerialPropertyCheckType(property) {
        if (undefined === property.type) {
            property.type = _GPF_SERIAL_TYPE.STRING;
        } else {
            _gpfSerialPropertyCheckTypeExists(property.type);
        }
    }
    function _gpfSerialPropertyCheckBooleanType(value, exception) {
        if (typeof value !== "boolean") {
            exception();
        }
    }
    function _gpfSerialPropertyCheckRequired(property) {
        if (undefined === property.required) {
            property.required = false;
        } else {
            _gpfSerialPropertyCheckBooleanType(property.required, gpf.Error.invalidSerialRequired);
        }
    }
    function _gpfSerialPropertyCheckReadOnly(property) {
        if (undefined !== property.readOnly) {
            _gpfSerialPropertyCheckBooleanType(property.readOnly, gpf.Error.invalidSerialReadOnly);
        }
    }
    /**
     * Check that the serializable property definition is valid.
     * Returns a copy with defaulted properties.
     *
     * @param {gpf.typedef.serializableProperty} property Property definition to validate
     * @return {gpf.typedef.serializableProperty} Completed property definition
     * @throws {gpf.Error.InvalidSerialName}
     * @throws {gpf.Error.InvalidSerialType}
     * @throws {gpf.Error.InvalidSerialRequired}
     * @since 0.2.8
     */
    function _gpfSerialPropertyCheck(property) {
        var clonedProperty = Object.assign(property);
        [
            _gpfSerialPropertyCheckName,
            _gpfSerialPropertyCheckType,
            _gpfSerialPropertyCheckRequired,
            _gpfSerialPropertyCheckReadOnly
        ].forEach(function (checkFunction) {
            checkFunction(clonedProperty);
        });
        return clonedProperty;
    }
    _gpfErrorDeclare("attributes/check", {
        /**
         * ### Summary
         *
         * Class attribute only
         *
         * ### Description
         *
         * A class attribute can't be assigned to a member
         * @since 0.2.8
         */
        classAttributeOnly: "Class attribute only",
        /**
         * ### Summary
         *
         * Member attribute only
         *
         * ### Description
         *
         * A member attribute can't be assigned to a class
         * @since 0.2.8
         */
        memberAttributeOnly: "Member attribute only",
        /**
        * ### Summary
        *
        * Restricted base class attribute
        *
        * ### Description
        *
        * The attribute is restricted to a given base class, check the attribute documentation.
        * @since 0.2.8
        */
        restrictedBaseClassAttribute: "Restricted base class attribute",
        /**
        * ### Summary
        *
        * Unique attribute used twice
        *
        * ### Description
        *
        * The attribute is restricted to a single use
        * @since 0.2.8
        */
        uniqueAttributeUsedTwice: "Unique attribute used twice"
    });
    /**
     * Ensures attribute is used only at class level
     *
     * @param {String} member Member name or empty if global to the class
     * @throws {gpf.Error.ClassAttributeOnly}
     * @since 0.2.8
     */
    function _gpfAttributesCheckClassOnly(member) {
        if (member) {
            gpf.Error.classAttributeOnly();
        }
    }
    /**
     * Ensures attribute is used only at member level
     *
     * @param {String} member Member name or empty if global to the class
     * @throws {gpf.Error.MemberAttributeOnly}
     * @since 0.2.8
     */
    function _gpfAttributesCheckMemberOnly(member) {
        if (!member) {
            gpf.Error.memberAttributeOnly();
        }
    }
    function _gpfAttributesCheckAppliedOnBaseClassIsInstanceOf(prototype, ExpectedBaseClass) {
        if (!(prototype instanceof ExpectedBaseClass)) {
            gpf.Error.restrictedBaseClassAttribute();
        }
    }
    /**
     * Ensures attribute is applied on a specific base class
     *
     * @param {_GpfClassDefinition} classDefinition Class definition
     * @param {Function} ExpectedBaseClass Expected base class
     * @throws {gpf.Error.RestrictedBaseClassAttribute}
     * @since 0.2.8
     */
    function _gpfAttributesCheckAppliedOnBaseClass(classDefinition, ExpectedBaseClass) {
        var Extend = classDefinition._extend;
        if (Extend !== ExpectedBaseClass) {
            _gpfAttributesCheckAppliedOnBaseClassIsInstanceOf(Extend.prototype, ExpectedBaseClass);
        }
    }
    function _gpfAttributesCheckGetMemberAttributes(member, classDefinition, AttributeClass) {
        var allAttributes = classDefinition.getAttributes(AttributeClass);
        if (member) {
            return allAttributes[member];
        }
        return allAttributes[_GPF_DEFINE_CLASS_ATTRIBUTES_NAME];
    }
    /**
     * Ensures attribute is used only once
     *
     * @param {String} member Member name or empty if global to the class
     * @param {_GpfClassDefinition} classDefinition Class definition
     * @param {Function} AttributeClass Attribute class
     * @throws {gpf.Error.UniqueAttributeUsedTwice}
     * @since 0.2.8
     */
    function _gpfAttributesCheckAppliedOnlyOnce(member, classDefinition, AttributeClass) {
        var attributes = _gpfAttributesCheckGetMemberAttributes(member, classDefinition, AttributeClass);
        if (_gpfArrayTail(attributes).length) {
            gpf.Error.uniqueAttributeUsedTwice();
        }
    }
    var _gpfAttributesAttributeAttribute = _gpfDefine({
        $class: "gpf.attributes.AttributeAttribute",
        $extend: _gpfAttribute,
        $abstract: true,
        /**
         * @inheritdoc
         * @since 0.2.8
         */
        _check: function (member, classDefinition) {
            _gpfAttributesCheckClassOnly(member);
            _gpfAttributesCheckAppliedOnBaseClass(classDefinition, _gpfAttribute);
            _gpfAttributesCheckAppliedOnlyOnce(member, classDefinition, this.constructor);
        },
        /**
         * _check method 'injected' onto the target attribute
         *
         * @param {String} member Member name or empty if global to the class
         * @param {_GpfClassDefinition} classDefinition Class definition
         * @param {gpf.attributes.Attribute} targetAttribute Target attribute instance
         * @protected
         * @since 0.2.8
         */
        _targetCheck: _gpfCreateAbstractFunction(),
        _overrideTargetCheck: function (classPrototype) {
            var me = this, initialCheck = classPrototype._check;
            classPrototype._check = function (member, classDefinition) {
                me._targetCheck(member, classDefinition, this);
                initialCheck.call(this, member, classDefinition);
            };
        },
        /**
         * @inheritdoc
         * @since 0.2.8
         */
        _build: function (member, classDefinition, classPrototype) {
            _gpfIgnore(member, classDefinition);
            this._overrideTargetCheck(classPrototype);
        }
    });
    var _gpfAttributesClassAttribute = _gpfDefine({
        $class: "gpf.attributes.ClassAttribute",
        $extend: _gpfAttributesAttributeAttribute,
        $singleton: true,
        /**
         * @inheritdoc
         * @since 0.2.8
         */
        _targetCheck: function (member, classDefinition) {
            _gpfAttributesCheckClassOnly(member);
            _gpfIgnore(classDefinition);
        }
    });
    gpf.attributes.ClassAttribute = _gpfAttributesClassAttribute;
    var _gpfAttributesMemberAttribute = _gpfDefine({
        $class: "gpf.attributes.MemberAttribute",
        $extend: _gpfAttributesAttributeAttribute,
        $singleton: true,
        /**
         * @inheritdoc
         * @since 0.2.8
         */
        _targetCheck: function (member, classDefinition) {
            _gpfAttributesCheckMemberOnly(member);
            _gpfIgnore(classDefinition);
        }
    });
    gpf.attributes.MemberAttribute = _gpfAttributesMemberAttribute;
    var _gpfAttributesAttributeForInstanceOf = _gpfDefine({
        $class: "gpf.attributes.AttributeForInstanceOf",
        $extend: _gpfAttributesAttributeAttribute,
        _BaseClass: null,
        /**
         * Attribute to restrict the use of an attribute to instance of a given class (or child classes).
         * It throws {@link gpf.Error.RestrictedBaseClassAttribute} if the target attribute is not used in a definition that
         * does not extend the expected base class (or any of its child classes).
         *
         * @param {Function} BaseClass The base class restriction
         * @throws {gpf.Error.InvalidParameter}
         * @constructor gpf.attributes.AttributeForInstanceOf
         * @extends gpf.attributes.Attribute
         * @gpf:attribute-restriction attribute,class,unique
         * @since 0.2.8
         */
        constructor: function (BaseClass) {
            if (typeof BaseClass !== "function") {
                gpf.Error.invalidParameter();
            }
            this._BaseClass = BaseClass;
        },
        /**
         * @inheritdoc
         * @since 0.2.8
         */
        _targetCheck: function (member, classDefinition) {
            _gpfIgnore(member);
            _gpfAttributesCheckAppliedOnBaseClass(classDefinition, this._BaseClass);
        }
    });
    gpf.attributes.AttributeForInstanceOf = _gpfAttributesAttributeForInstanceOf;
    var _gpfAttributesUniqueAttribute = _gpfDefine({
        $class: "gpf.attributes.UniqueAttribute",
        $extend: _gpfAttributesAttributeAttribute,
        $singleton: true,
        _targetCheck: function (member, classDefinition, targetAttribute) {
            _gpfAttributesCheckAppliedOnlyOnce(member, classDefinition, targetAttribute.constructor);
        }
    });
    gpf.attributes.UniqueAttribute = _gpfAttributesUniqueAttribute;
    var _GPF_ATTRIBUTES_SERIALIZABLE_SKIP_ = 1;
    function _gpfAttributesSerializableExtractName(name) {
        if (name.startsWith("_")) {
            return name.substring(_GPF_ATTRIBUTES_SERIALIZABLE_SKIP_);
        }
        return name;
    }
    var _gpfAttributesSerializable = _gpfDefine({
        $class: "gpf.attributes.Serializable",
        $extend: _gpfAttribute,
        $attributes: [
            new _gpfAttributesMemberAttribute(),
            new _gpfAttributesUniqueAttribute()
        ],
        /**
         * Serializable property definition
         *
         * @type {gpf.typedef.serializableProperty}
         * @since 0.2.8
         */
        _property: null,
        /**
         * Associates a serialization property defintion to a member
         *
         * @param {gpf.typedef.serializableProperty} [property] Serializable property definition
         * @throws {gpf.Error.InvalidSerialName}
         * @throws {gpf.Error.InvalidSerialType}
         * @throws {gpf.Error.InvalidSerialRequired}
         * @constructor gpf.attributes.Serializable
         * @extends gpf.attributes.Attribute
         * @gpf:attribute-restriction member,unique
         * @since 0.2.8
         */
        constructor: function (property) {
            this._property = property;
        },
        /**
         * @inheritdoc
         * @since 0.2.9
         */
        _check: function (member, classDefinition) {
            _gpfIgnore(classDefinition);
            this._property = _gpfSerialPropertyCheck(Object.assign({ name: _gpfAttributesSerializableExtractName(member) }, this._property || {}));
        },
        /**
         * @gpf:read _property
         * @since 0.2.8
         */
        getProperty: function () {
            return Object.create(this._property);
        }
    });
    function _gpfSerialGet(objectOrClass) {
        var serializable = _gpfAttributesGet(objectOrClass, _gpfAttributesSerializable), properties = {};
        _gpfObjectForEach(serializable, function (attributes, member) {
            properties[member] = attributes[_GPF_START].getProperty();
        });
        return properties;
    }
    function _gpfSerialGetResolveReadOnlyCheckDescriptor(prototype, member) {
        var descriptor = Object.getOwnPropertyDescriptor(prototype, member);
        if (descriptor) {
            return !descriptor.writable;
        }
    }
    var _gpfSerialGetResolveReadOnly;
    if (Object.getOwnPropertyDescriptor) {
        _gpfSerialGetResolveReadOnly = function (instance, member) {
            var prototype = instance, readOnly;
            while (prototype !== Object && readOnly === undefined) {
                readOnly = _gpfSerialGetResolveReadOnlyCheckDescriptor(prototype, member);
                prototype = Object.getPrototypeOf(prototype);
            }
            return readOnly || false;
        };
    } else {
        _gpfSerialGetResolveReadOnly = function () {
            return false;
        };
    }
    /**
     * Same as {@link gpf.serial.get} but on instances and resolving readOnly
     *
     * @param {Object} instance Object instance or class constructor
     * @return {Object} Dictionary of {@link gpf.typedef.serializableProperty} index by member
     * @since 0.2.9
     */
    function _gpfSerialGetWithReadOnly(instance) {
        var properties = _gpfSerialGet(instance);
        _gpfObjectForEach(properties, function (property, member) {
            if (property.readOnly === undefined) {
                property.readOnly = _gpfSerialGetResolveReadOnly(instance, member);
            }
        });
        return properties;
    }
    /**
     * @gpf:sameas _gpfSerialGet
     * @since 0.2.8
     */
    gpf.serial.get = _gpfSerialGet;
    function _gpfSerialIdentityConverter(value, property) {
        if (!property.readOnly) {
            return value;
        }
    }
    function _gpfSerialRawToPropertyValue(result, member, value) {
        if (value !== undefined) {
            result[member] = value;
        }
    }
    function _gpfSerialRawToProperties(instance, properties, converter) {
        var result = {};
        _gpfObjectForEach(properties, function (property, member) {
            _gpfSerialRawToPropertyValue(result, property.name, converter.call(instance, instance[member], property, member));
        });
        return result;
    }
    function _gpfSerialRawTo(instance, converter) {
        return _gpfSerialRawToProperties(instance, _gpfSerialGetWithReadOnly(instance), converter || _gpfSerialIdentityConverter);
    }
    /**
     * Converts the given instance a simpler dictionary containing only serializable properties' value.
     *
     * @param {Object} instance Instance of a class containing {@ling gpf.attributes.Serializable} attributes
     * @param {gpf.typedef.serialConverter} [converter] Converter function for properties' value
     * @return {Object} A dictionary with all serializable properties (indexed by property names)
     * @throws {gpf.Error.InvalidParameter}
     * @since 0.2.8
     */
    gpf.serial.toRaw = function (instance, converter) {
        if (typeof instance === "function") {
            gpf.Error.invalidParameter();
        }
        return _gpfSerialRawTo(instance, converter);
    };
    function _gpfSerialRawFromPropertyValue(instance, member, value) {
        if (value !== undefined) {
            instance[member] = value;
        }
    }
    function _gpfSerialRawFromProperties(instance, raw, converter) {
        var properties = _gpfSerialGetWithReadOnly(instance);
        _gpfObjectForEach(properties, function (property, member) {
            if (Object.prototype.hasOwnProperty.call(raw, property.name)) {
                _gpfSerialRawFromPropertyValue(instance, member, converter.call(instance, raw[property.name], property, member));
            }
        });
    }
    function _gpfSerialRawFrom(instance, raw, converter) {
        _gpfSerialRawFromProperties(instance, raw, converter || _gpfSerialIdentityConverter);
    }
    /**
     * Initialize the given instance from a dictionary containing serializable properties' value.
     *
     * @param {Object} instance Instance of a class containing {@ling gpf.attributes.Serializable} attributes
     * @param {Object} raw Dictionary with all serializable properties (indexed by property names)
     * @param {gpf.typedef.serialConverter} [converter] Converter function for properties' value
     * @return {Object} instance
     * @throws {gpf.Error.InvalidParameter}
     * @since 0.2.8
     */
    gpf.serial.fromRaw = function (instance, raw, converter) {
        if (typeof instance === "function") {
            gpf.Error.invalidParameter();
        }
        _gpfSerialRawFrom(instance, raw, converter);
        return instance;
    };
    _gpfErrorDeclare("attributes/decorator", {
        /**
         * ### Summary
         *
         * ES6 class only
         *
         * ### Description
         *
         * Decorators can be used on ES6 class only
         * @since 0.2.9
         */
        es6classOnly: "ES6 class only"
    });
    function _gpfAttributesDecoratorGetAttributesKeyFromMember(member) {
        if (!member) {
            return _GPF_DEFINE_CLASS_ATTRIBUTES_NAME;
        }
        return member;
    }
    function _gpfAttributesDecoratorProcessEachAttribute(entityDefinition, member, attributes) {
        attributes.forEach(function (attribute) {
            _gpfDefClassAttrCheck.call(entityDefinition, member, attribute);
            _gpfDefClassAttrBuild(member, attribute, entityDefinition._instanceBuilder.prototype);
        });
    }
    function _gpfAttributesDecoratorAddAttributes(entityDefinition, member, attributes) {
        var key = _gpfAttributesDecoratorGetAttributesKeyFromMember(member);
        entityDefinition._attributes[key] = (entityDefinition._attributes[key] || []).concat(attributes);
        _gpfAttributesDecoratorProcessEachAttribute(entityDefinition, member, attributes);
    }
    /**
     * Bridge ES6 decorators with attributes
     *
     * @param {...gpf.attributes.Attribute} attribute Attributes to add
     * @return {Function} decorator function
     * @throws {gpf.Error.InvalidParameter}
     * @since 0.2.9
     */
    function _gpfAttributesDecorator() {
        var attributes = _gpfArraySlice(arguments);
        return function (ClassConstructor, member) {
            if (!_gpfIsClass(ClassConstructor)) {
                gpf.Error.es6classOnly();
            }
            _gpfAttributesDecoratorAddAttributes(_gpfDefineClassImport(ClassConstructor), member, attributes);
        };
    }
    /**
     * @gpf:sameas _gpfAttributesDecorator
     * @since 0.2.9
     */
    gpf.attributes.decorator = _gpfAttributesDecorator;
}));
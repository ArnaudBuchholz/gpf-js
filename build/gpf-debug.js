/*global define, exports*/
/*jshint -W098*/
// ignore unused gpf
/*eslint no-unused-vars: 0*/
// ignore unused gpf
/*eslint strict: [2, "function"]*/
// To be more modular
/*global __gpf__*/
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
        /**
         * GPF Version
         * @since 0.1.5
         */
        _gpfVersion = "0.2.3",
        /**
         * Host constants
         * @since 0.1.5
         */
        _GPF_HOST = {
            BROWSER: "browser",
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
        /*jshint -W040*/
        // This is the common way to get the global context
        /**
         * Main context object
         *
         * @type {Object}
         * @since 0.1.5
         */
        _gpfMainContext = this,
        //eslint-disable-line no-invalid-this, consistent-this
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
        _gpfNodeFs,
        /**
         * Node [require("path")](https://nodejs.org/api/path.html)
         *
         * @type {Object}
         * @since 0.1.5
         */
        _gpfNodePath,
        /**
         * Boot host specific implementation per host
         *
         * @type {Object}
         * @since 0.2.1
         */
        _gpfBootImplByHost = {};
    _gpfVersion += "-debug";
    /* Host detection */
    // Microsoft cscript / wscript
    if ("undefined" !== typeof WScript) {
        _gpfHost = _GPF_HOST.WSCRIPT;
        _gpfDosPath = true;
    } else if ("undefined" !== typeof print && "undefined" !== typeof java) {
        _gpfHost = _GPF_HOST.RHINO;
        _gpfDosPath = false;    // PhantomJS - When used as a command line (otherwise considered as a browser)
    } else if ("undefined" !== typeof phantom && phantom.version && !document.currentScript) {
        _gpfHost = _GPF_HOST.PHANTOMJS;
        _gpfDosPath = require("fs").separator === "\\";
        _gpfMainContext = window;    // Nodejs
    } else if ("undefined" !== typeof module && module.exports) {
        _gpfHost = _GPF_HOST.NODEJS;
        _gpfNodePath = require("path");
        _gpfDosPath = _gpfNodePath.sep === "\\";
        _gpfMainContext = global;    // Browser
                                     /* istanbul ignore else */
                                     // unknown.1
    } else if ("undefined" !== typeof window) {
        _gpfHost = _GPF_HOST.BROWSER;
        _gpfMainContext = window;
    }
    /**
     * Host type enumeration
     *
     * @enum {String}
     * @readonly
     * @since 0.1.5
     */
    gpf.hosts = {
        /**
         * Any browser (phantomjs is recognized separately)
         * @since 0.1.5
         */
        browser: _GPF_HOST.BROWSER,
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
    /**
     * Returns the current version
     *
     * @return {String} Version
     * @since 0.1.5
     */
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
    _gpfBootImplByHost[_GPF_HOST.BROWSER] = function () {
        /* istanbul ignore next */
        // exit.1
        _gpfExit = function (code) {
            window.location = "https://arnaudbuchholz.github.io/gpf/exit.html?" + (code || 0);
        };
        _gpfWebWindow = window;
        _gpfWebDocument = document;
    };
    var
        /**
         * require("http")
         *
         * @type {Object}
         * @since 0.2.1
         */
        _gpfNodeHttp,
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
    _gpfBootImplByHost[_GPF_HOST.NODEJS] = function () {
        _gpfNodeFs = require("fs");
        _gpfNodeHttp = require("http");
        _gpfNodeUrl = require("url");
        /* istanbul ignore next */
        // exit.1
        _gpfExit = function (code) {
            process.exit(code);
        };
    };
    _gpfBootImplByHost[_GPF_HOST.PHANTOMJS] = function () {
        /* istanbul ignore next */
        // exit.1
        _gpfExit = function (code) {
            phantom.exit(code);
        };
        _gpfWebWindow = window;
        _gpfWebDocument = document;
        _gpfNodeFs = require("fs");
    };
    gpf.rhino = {};
    _gpfBootImplByHost[_GPF_HOST.RHINO] = function () {
        // Define console APIs
        _gpfMainContext.console = _gpfConsoleGenerate(print);
        /* istanbul ignore next */
        // exit.1
        _gpfExit = function (code) {
            java.lang.System.exit(code);
        };
    };
    _gpfBootImplByHost[_GPF_HOST.UNKNOWN] = _gpfEmptyFunc;
    gpf.wscript = {};
    /* istanbul ignore next */
    // wscript.echo.1
    function _gpfWScriptEcho(text) {
        WScript.Echo(text);
    }
    _gpfBootImplByHost[_GPF_HOST.WSCRIPT] = function () {
        _gpfMsFSO = new ActiveXObject("Scripting.FileSystemObject");
        // Define console APIs
        _gpfMainContext.console = _gpfConsoleGenerate(_gpfWScriptEcho);
        /* istanbul ignore next */
        // exit.1
        _gpfExit = function (code) {
            WScript.Quit(code);
        };
    };
    _gpfBootImplByHost[_gpfHost]();
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
        var index, length = array.length;
        for (index = 0; index < length; ++index) {
            callback.call(thisArg, array[index], index, array);
        }
    }
    function _gpfObjectForEachOwnProperty(object, callback, thisArg) {
        for (var property in object) {
            /* istanbul ignore else */
            // hasOwnProperty.1
            if (object.hasOwnProperty(property)) {
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
            if (object.hasOwnProperty(property)) {
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
        var result, index, length = array.length;
        for (index = 0; index < length && !result; ++index) {
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
     * NOTE: unlike [].forEach, non own properties are also enumerated
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
            message = "Assertion with no message";
            condition = false;
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
    var
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
        // List of JavaScript keywords
        _gpfJsKeywords = [
            "abstract",
            "arguments",
            "await",
            "boolean",
            "break",
            "byte",
            "case",
            "catch",
            "char",
            "class",
            "const",
            "continue",
            "debugger",
            "default",
            "delete",
            "do",
            "double",
            "else",
            "enum",
            "eval",
            "export",
            "extends",
            "false",
            "final",
            "finally",
            "float",
            "for",
            "function",
            "goto",
            "if",
            "implements",
            "import",
            "in",
            "instanceof",
            "int",
            "interface",
            "let",
            "long",
            "native",
            "new",
            "null",
            "package",
            "private",
            "protected",
            "public",
            "return",
            "short",
            "static",
            "super",
            "switch",
            "synchronized",
            "this",
            "throw",
            "throws",
            "transient",
            "true",
            "try",
            "typeof",
            "var",
            "void",
            "volatile",
            "while",
            "with",
            "yield"
        ];
    // Unprotected version of _gpfFunc
    function _gpfFuncUnsafe(params, source) {
        var args;
        if (0 === params.length) {
            return _GpfFunc(source);
        }
        args = [].concat(params);
        args.push(source);
        return _GpfFunc.apply(null, args);
    }
    // Protected version of _gpfFunc
    function _gpfFuncImpl(params, source) {
        _gpfAssert("string" === typeof source && source.length, "Source expected (or use _gpfEmptyFunc)");
        try {
            return _gpfFuncUnsafe(params, source);
        } catch (e) {
            // Makes it easier to debug
            throw new Error("_gpfFuncImpl exception: " + e.message + "\r\n" + source);
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
            source = params;
            params = [];
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
        return "number" === typeof value && _gpfIsInRange(value, 0, 255);
    }
    /**
     * @namespace gpf.web
     * @description Root namespace for web-related tools (even if not in a browser)
     * @since 0.1.5
     */
    gpf.web = {};
    function _gpfStringCapitalize(that) {
        return that.charAt(0).toUpperCase() + that.substr(1);
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
        if ("javascript" === language) {
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
    _gpfStringEscapes.javascript = {
        "\\": "\\\\",
        "\"": "\\\"",
        "\n": "\\n",
        "\r": "\\r",
        "\t": "\\t"
    };
    _gpfStringEscapes.xml = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;"
    };
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
     * Define and install compatible methods
     *
     * @param {String} typeName Type name ("Object", "String"...)
     * @param {_GpfCompatibilityDescription} description Description of compatible methods
     * @since 0.1.5
     */
    function _gpfInstallCompatibility(typeName, description) {
        var on = description.on;
        _gpfInstallCompatibleMethods(on, description.methods);
        _gpfInstallCompatibleStatics(on, description.statics);
    }
    function _gpfArrayBind(callback, thisArg) {
        if (undefined !== thisArg) {
            return callback.bind(thisArg);
        }
        return callback;
    }
    function _gpfArrayForEachOwn(array, callback) {
        var len = array.length, idx = 0;
        while (idx < len) {
            if (array.hasOwnProperty(idx)) {
                callback(array[idx], idx, array);
            }
            ++idx;
        }
    }
    function _gpfArrayEveryOwn(array, callback, idx) {
        var len = array.length;
        while (idx < len) {
            if (array.hasOwnProperty(idx) && true !== callback(array[idx], idx, array)) {
                return false;
            }
            ++idx;
        }
        return true;
    }
    function _gpfArrayEveryOwnFrom0(array, callback) {
        return _gpfArrayEveryOwn(array, callback, 0);
    }
    //endregion
    //region Array.from
    function _gpfArrayFromString(array, string) {
        var length = string.length, index;
        for (index = 0; index < length; ++index) {
            array.push(string.charAt(index));
        }
    }
    function _gpfArrayConvertFrom(arrayLike) {
        var array = [];
        if ("string" === typeof arrayLike) {
            // Required for cscript
            _gpfArrayFromString(array, arrayLike);
        } else {
            _gpfArrayForEach(arrayLike, function (value) {
                array.push(value);
            }, 0);
        }
        return array;
    }
    function _gpfArrayFrom(arrayLike) {
        var array = _gpfArrayConvertFrom(arrayLike), callback = arguments[1];
        if ("function" === typeof callback) {
            array = array.map(callback, arguments[2]);
        }
        return array;
    }
    //endregion
    _gpfInstallCompatibility("Array", {
        on: Array,
        methods: {
            // Introduced with JavaScript 1.6
            every: function (callback) {
                return _gpfArrayEveryOwnFrom0(this, _gpfArrayBind(callback, arguments[1]));
            },
            // Introduced with JavaScript 1.6
            filter: function (callback) {
                var result = [];
                callback = _gpfArrayBind(callback, arguments[1]);
                _gpfArrayForEachOwn(this, function (item, idx, array) {
                    if (callback(item, idx, array)) {
                        result.push(item);
                    }
                });
                return result;
            },
            // Introduced with JavaScript 1.6
            forEach: function (callback) {
                _gpfArrayForEachOwn(this, _gpfArrayBind(callback, arguments[1]));
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
                }, arguments[1] || 0);
                return result;
            },
            // Introduced with JavaScript 1.6
            map: function (callback) {
                var result = new Array(this.length);
                callback = _gpfArrayBind(callback, arguments[1]);
                _gpfArrayForEachOwn(this, function (item, index, array) {
                    result[index] = callback(item, index, array);
                });
                return result;
            },
            // Introduced with JavaScript 1.6
            some: function (callback) {
                callback = _gpfArrayBind(callback, arguments[1]);
                return !_gpfArrayEveryOwnFrom0(this, function (item, index, array) {
                    return !callback(item, index, array);
                });
            },
            // Introduced with JavaScript 1.8
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
        statics: {
            // Introduced with ECMAScript 2015
            from: _gpfArrayFrom,
            // Introduced with JavaScript 1.8.5
            isArray: function (arrayLike) {
                return "[object Array]" === {}.toString.call(arrayLike);
            }
        }
    });
    // Update if it was not defined
    if (!_gpfIsArray) {
        _gpfIsArray = Array.isArray;
    }
    function _gpfBuildFunctionParameterList(count) {
        if (0 === count) {
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
            var count = index + 1;
            src.push("if (" + count + " === l) { return new C(" + parameters.slice(0, count).join(", ") + ");}");
        });
        return src.join("\r\n");
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
    var _gpfGenericFactory = _gpfGenerateGenericFactory(10);
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
    function _pad(number) {
        if (10 > number) {
            return "0" + number;
        }
        return number;
    }
    function _gpfDateToISOString(date) {
        return date.getUTCFullYear() + "-" + _pad(date.getUTCMonth() + 1) + "-" + _pad(date.getUTCDate()) + "T" + _pad(date.getUTCHours()) + ":" + _pad(date.getUTCMinutes()) + ":" + _pad(date.getUTCSeconds()) + "." + (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) + "Z";
    }
    _gpfInstallCompatibility("Date", {
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
    var _gpfISO8601RegExp = new RegExp("^([0-9][0-9][0-9][0-9])\\-([0-9][0-9])\\-([0-9][0-9])" + "(?:T([0-9][0-9])\\:([0-9][0-9])\\:([0-9][0-9])(?:\\.([0-9][0-9][0-9])Z)?)?$");
    function _gpfIsValidDateInDateArray(dateArray) {
        return dateArray[1] < 12 && dateArray[2] < 32;
    }
    function _gpfIsValidTimeInDateArray(dateArray) {
        return dateArray[3] < 24 && dateArray[4] < 60 && dateArray[5] < 60;
    }
    function _gpfCheckDateArray(dateArray) {
        if (_gpfIsValidDateInDateArray(dateArray) && _gpfIsValidTimeInDateArray(dateArray)) {
            return dateArray;
        }
    }
    function _gpfAddDatePartToArray(dateArray, datePart) {
        if (datePart) {
            dateArray.push(parseInt(datePart, 10));
        } else {
            dateArray.push(0);
        }
    }
    function _gpfToDateArray(matchResult) {
        var dateArray = [], len = matchResult.length,
            // 0 is the recognized string
            idx;
        for (idx = 1; idx < len; ++idx) {
            _gpfAddDatePartToArray(dateArray, matchResult[idx]);
        }
        return dateArray;
    }
    function _gpfProcessISO8601MatchResult(matchResult) {
        var dateArray;
        if (matchResult) {
            dateArray = _gpfToDateArray(matchResult);
            // Month must be corrected (0-based)
            --dateArray[1];
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
        if ("string" === typeof value) {
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
        var firstArgument = arguments[0], values = _gpfIsISO8601String(firstArgument);
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
    function _gpfInstallCompatibleDate() {
        _gpfCopyDateStatics();
        // Test if ISO 8601 format variations are supported
        var longDateAsString, shortDateAsString;
        try {
            longDateAsString = _gpfDateToISOString(new Date("2003-01-22T22:45:34.075Z"));
            shortDateAsString = _gpfDateToISOString(new Date("2003-01-22"));
        } catch (e) {
        }
        //eslint-disable-line no-empty
        if (longDateAsString !== "2003-01-22T22:45:34.075Z" || shortDateAsString !== "2003-01-22T00:00:00.000Z") {
            // Replace constructor with new one
            _gpfMainContext.Date = _GpfDate;
        }
    }
    _gpfInstallCompatibleDate();    //endregion
    var _gpfArrayPrototypeSlice = Array.prototype.slice;
    function _generateBindBuilderSource(length) {
        return "var me = this;\n" + "return function (" + _gpfBuildFunctionParameterList(length).join(", ") + ") {\n" + "   var args = _gpfArrayPrototypeSlice.call(arguments, 0);\n" + "    return me.apply(thisArg, prependArgs.concat(args));\n" + "};";
    }
    _gpfInstallCompatibility("Function", {
        on: Function,
        methods: {
            // Introduced with JavaScript 1.8.5
            bind: function (thisArg) {
                var me = this, prependArgs = _gpfArrayPrototypeSlice.call(arguments, 1), builderSource = _generateBindBuilderSource(Math.max(this.length - prependArgs.length, 0));
                return _gpfFunc([
                    "thisArg",
                    "prependArgs",
                    "_gpfArrayPrototypeSlice"
                ], builderSource).call(me, thisArg, prependArgs, _gpfArrayPrototypeSlice);
            }
        }
    });
    //region Function name
    // Get the name of a function if bound to the call
    var _gpfJsCommentsRegExp = new RegExp("//.*$|/\\*(?:[^\\*]*|\\*[^/]*)\\*/", "gm");
    function _gpfGetFunctionName() {
        // Use simple parsing
        /*jshint validthis:true*/
        var functionSource = _gpfEmptyFunc.toString.call(this),
            //eslint-disable-line no-invalid-this
            functionKeywordPos = functionSource.indexOf("function"), parameterListStartPos = functionSource.indexOf("(", functionKeywordPos);
        return functionSource.substr(functionKeywordPos + 9, parameterListStartPos - functionKeywordPos - 9).replace(_gpfJsCommentsRegExp, "")    // remove comments
.trim();
    }
    // Handling function name properly
    if (function () {
            // Trick source minification
            var testFunction = _gpfFunc("return function functionName () {};")();
            return testFunction.name !== "functionName";
        }()) {
        Function.prototype.compatibleName = _gpfGetFunctionName;
    } else {
        /**
         * Return function name
         *
         * @return {String} Function name
         * @since 0.1.5
         */
        Function.prototype.compatibleName = function () {
            return this.name;
        };
    }    //endregion
    function _gpfObjectAssign(value, memberName) {
        /*jshint validthis:true*/
        this[memberName] = value;    //eslint-disable-line no-invalid-this
    }
    _gpfInstallCompatibility("Object", {
        on: Object,
        statics: {
            // Introduced with ECMAScript 2015
            assign: function (destination, source) {
                _gpfIgnore(source);
                [].slice.call(arguments, 1).forEach(function (nthSource) {
                    _gpfObjectForEach(nthSource, _gpfObjectAssign, destination);
                });
                return destination;
            },
            // Introduced with JavaScript 1.8.5
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
            // Introduced with JavaScript 1.8.5
            getPrototypeOf: function (object) {
                if (object.__proto__) {
                    return object.__proto__;
                }
                // May break if the constructor has been tampered with
                return object.constructor.prototype;
            },
            // Introduced with JavaScript 1.8.5
            keys: function (object) {
                var result = [], key;
                for (key in object) {
                    if (object.hasOwnProperty(key)) {
                        result.push(key);
                    }
                }
                return result;
            },
            // Introduced with JavaScript 1.8.5
            values: function (object) {
                var result = [], key;
                for (key in object) {
                    if (object.hasOwnProperty(key)) {
                        result.push(object[key]);
                    }
                }
                return result;
            }
        }
    });
    _gpfInstallCompatibility("String", {
        on: String,
        methods: {
            // Introduced with JavaScript 1.8.1
            trim: function () {
                var rtrim = new RegExp("^[\\s\uFEFF\xA0]+|[\\s\uFEFF\xA0]+$", "g");
                return function () {
                    return this.replace(rtrim, "");
                };
            }()
        }
    });
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
                    _gpfPromiseSafeResolve(then.bind(newValue), _gpfPromiseResolve.bind(me), _gpfPromiseReject.bind(me));
                    return;
                }
            }
            me._state = true;
            me._value = newValue;
            _gpfPromiseFinale.call(me);
        } catch (e) {
            /* istanbul ignore next */
            // compability.promise.1
            _gpfPromiseReject.call(me, e);
        }
    }
    var _GpfPromise = gpf.Promise = function (fn) {
        _gpfPromiseSafeResolve(fn, _gpfPromiseResolve.bind(this), _gpfPromiseReject.bind(this));
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
                // hasOwnProperty.1
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
                    /* istanbul ignore next */
                    // compability.promise.1
                    reject(e);
                }
            }
            promises.forEach(handle);
        });
    };
    _GpfPromise.race = function (promises) {
        return new _GpfPromise(function (resolve, reject) {
            promises.forEach(function (promise) {
                promise.then(resolve, reject);
            });
        });
    };
    if (undefined === _gpfMainContext.Promise) {
        _gpfMainContext.Promise = _GpfPromise;
    }
    var
        // List of pending callbacks (sorted by execution time)
        _gpfTimeoutQueue = [],
        // Last allocated timeoutID
        _gpfTimeoutID = 0,
        // Sleep function
        _gpfSleep = _gpfEmptyFunc;
    // Handle timeouts (mandatory for some environments)
    gpf.handleTimeout = _gpfEmptyFunc;
    // Sorting function used to reorder the async queue
    function _gpfSortOnDt(a, b) {
        if (a.dt === b.dt) {
            return a.id - b.id;
        }
        return a.dt - b.dt;
    }
    function _gpSetTimeoutPolyfill(callback, timeout) {
        _gpfAssert("number" === typeof timeout, "Timeout is required");
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
        var pos;
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
    /**
     * For WSCRIPT and RHINO environments, this function must be used to process the timeout queue when using
     * [setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setTimeout)
     * @since 0.1.5
     */
    function _gpfHandleTimeout() {
        var queue = _gpfTimeoutQueue, timeoutItem, now;
        while (queue.length) {
            timeoutItem = queue.shift();
            now = new Date().getTime();
            while (timeoutItem.dt > now) {
                _gpfSleep(timeoutItem.dt - now);
                now = new Date().getTime();
            }
            timeoutItem.cb();
        }
    }
    // Used only for WSCRIPT & RHINO environments
    if ("undefined" === typeof setTimeout) {
        /*jshint wsh: true*/
        /*eslint-env wsh*/
        /*jshint rhino: true*/
        /*eslint-env rhino*/
        if (_GPF_HOST.WSCRIPT === _gpfHost) {
            _gpfSleep = function (t) {
                WScript.Sleep(t);    //eslint-disable-line new-cap
            };    /* istanbul ignore else */
                  // unknown.1
        } else if (_GPF_HOST.RHINO === _gpfHost) {
            _gpfSleep = java.lang.Thread.sleep;
        } else {
            console.warn("No implementation for setTimeout");
        }
        _gpfMainContext.setTimeout = _gpSetTimeoutPolyfill;
        _gpfMainContext.clearTimeout = _gpfClearTimeoutPolyfill;
        /**
         * @gpf:sameas _gpfHandleTimeout
         * @since 0.1.5
         */
        gpf.handleTimeout = _gpfHandleTimeout;
    }
    var
        /**
         * The JSON.stringify() method converts a JavaScript value to a JSON string
         *
         * @param {*} value the value to convert to a JSON string
         * @return {String} JSON representation of the value
         * @since 0.1.5
         */
        _gpfJsonStringify,
        /**
         * The JSON.parse() method parses a string as JSON
         *
         * @param {*} text The string to parse as JSON
         * @return {Object} Parsed value
         * @since 0.1.5
         */
        _gpfJsonParse;
    // Filter functions and escape values
    function _gpfPreprocessValueForJson(callback) {
        return function (value, index) {
            if ("function" === typeof value) {
                return;    // ignore
            }
            callback(_gpfJsonStringifyPolyfill(value), index);
        };
    }
    function _gpfObject2Json(object) {
        var isArray, results;
        isArray = object instanceof Array;
        results = [];
        if (isArray) {
            _gpfArrayForEach(object, _gpfPreprocessValueForJson(function (value) {
                results.push(value);
            }));
            return "[" + results.join(",") + "]";
        }
        _gpfObjectForEach(object, _gpfPreprocessValueForJson(function (value, property) {
            results.push(_gpfStringEscapeFor(property, "javascript") + ":" + value);
        }));
        return "{" + results.join(",") + "}";
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
        },
        object: function (object) {
            if (null === object) {
                return "null";
            }
            return _gpfObject2Json(object);
        }
    };
    /*jshint -W003*/
    // Circular reference _gpfJsonStringifyPolyfill <-> _gpfObject2Json
    function _gpfJsonStringifyPolyfill(object) {
        return _gpfJsonStringifyMapping[typeof object](object);
    }
    /*jshint +W003*/
    function _gpfJsonParsePolyfill(test) {
        return _gpfFunc("return " + test)();
    }
    // Used only for environments where JSON is not defined
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
        var rootContext;
        if (path[0] === "gpf") {
            rootContext = gpf;
            path = path.slice(1);
        } else {
            rootContext = _gpfMainContext;
        }
        return path.reduce(reducer, rootContext);
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
    _gpfStringEscapes.html = Object.assign({}, _gpfStringEscapes.xml, {
        "à": "&agrave;",
        "á": "&aacute;",
        "è": "&egrave;",
        "é": "&eacute;",
        "ê": "&ecirc;"
    });
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
        function NewErrorClass(context) {
            this._buildMessage(context);
        }
        NewErrorClass.prototype = new _GpfError();
        Object.assign(NewErrorClass.prototype, {
            code: code,
            name: name,
            message: message
        });
        // constructor can't be enumerated with wscript
        NewErrorClass.prototype.constructor = NewErrorClass;
        _GpfError[_gpfStringCapitalize(name)] = NewErrorClass;
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
    function _gpfStringTrim(that) {
        return that.trim();
    }
    function _gpfFunctionDescribeName(functionToDescribe, resultDescription) {
        var name = functionToDescribe.compatibleName();
        if (name) {
            resultDescription.name = name;
        }
    }
    function _gpfFunctionDescribeParameters(functionToDescribe, functionSource, resultDescription) {
        if (functionToDescribe.length) {
            resultDescription.parameters = new RegExp("\\(\\s*(\\w+(?:\\s*,\\s*\\w+)*)\\s*\\)").exec(functionSource)[1].split(",").map(_gpfStringTrim);
        }
    }
    function _gpfFunctionDescribeBody(functionSource, resultDescription) {
        var body = _gpfStringTrim(new RegExp("{((?:.*\\n)*.*)}").exec(functionSource)[1]);
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
        _gpfAssert(definition && "object" === typeof definition, "Expected an entity definition");
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
        if (-1 === allowedList.indexOf(name)) {
            gpf.Error.invalidEntity$Property();
        }
    }
    function _gpfDefineEntityCheckProperty(value, name) {
        _gpfIgnore(value);
        /*jshint -W040*/
        /*eslint-disable no-invalid-this*/
        // bound through thisArg
        if (name.charAt(0) === "$") {
            this._check$Property(name.substr(1), value);
        } else {
            this._checkProperty(name, value);
        }    /*jshint -W040*/
             /*eslint-enable no-invalid-this*/
    }
    Object.assign(_GpfEntityDefinition.prototype, /** @lends _GpfEntityDefinition.prototype */
    {
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
        _throwInvalidProperty: _gpfCreateAbstractFunction(0),
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
            if (-1 !== this._reservedNames.indexOf(name)) {
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
        _throwInvalidName: _gpfCreateAbstractFunction(0),
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
            var parts = new RegExp("(.*)\\.([^\\.]+)$").exec(this._name);
            if (parts) {
                this._name = parts[2];
                return parts[1];
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
            if (namespaces.length > 0) {
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
    Object.assign(_GpfEntityDefinition.prototype, /** @lends _GpfEntityDefinition.prototype */
    {
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
    Object.assign(_GpfClassDefinition.prototype, /** @lends _GpfClassDefinition.prototype */
    {
        constructor: _GpfClassDefinition,
        /**
         * @inheritdoc
         * @since 0.1.6
         */
        _type: "class"
    });
    _gpfDefineTypedBuilders["class"] = _GpfClassDefinition;
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
        if ("string" === typeof extend) {
            return _gpfContext(extend.split("."));
        }
        return extend;
    }
    Object.assign(_GpfClassDefinition.prototype, /** @lends _gpfClassDefinition.prototype */
    {
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
            if ("function" !== typeof constructorValue) {
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
            if ("constructor" === name) {
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
            if (-1 !== _gpfEmptyFunc.toString.call(this._extend).indexOf("interfaceConstructorFunction")) {
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
            if ("function" !== typeof this._extend) {
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
            _GpfEntityDefinition.prototype.check.call(this);
        }
    });
    _gpfErrorDeclare("define/class/constructor", { "classConstructorFunction": "This is a class constructor function, use with new" });
    Object.assign(_GpfClassDefinition.prototype, /** @lends _GpfClassDefinition.prototype */
    {
        /**
         * Resolved constructor
         *
         * @type {Function}
         * @since 0.1.6
         */
        _resolvedConstructor: _gpfEmptyFunc
    });
    function _gpfDefineGetClassSecuredConstructorDefinition(classDefinition) {
        var name = classDefinition._name;
        return {
            name: name,
            parameters: _gpfFunctionDescribe(classDefinition._resolvedConstructor).parameters,
            body: "if (!(this instanceof _classDef_._instanceBuilder)) gpf.Error.classConstructorFunction();\n" + "_classDef_._resolvedConstructor.apply(this, arguments);"
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
        if ("function" !== typeof superMember) {
            superMember = _gpfClassNoSuper;
        }
        return _gpfClassSuperCreateWithSameSignature(superMember);
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
        if ("function" !== typeof superMethod) {
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
    var _gpfClassSuperRegExp = new RegExp("\\.\\$super\\.(\\w+)\\b", "g");
    /**
     * Extract all 'members' that are used on $super
     *
     * @param {Function} method Method to analyze
     * @return {String[]} Member names that are used
     * @since 0.1.7
     */
    function _gpfClassMethodExtractSuperMembers(method) {
        return _gpfRegExpForEach(_gpfClassSuperRegExp, method).map(function (match) {
            return match[1];
        });
    }
    Object.assign(_GpfClassDefinition.prototype, /** @lends _GpfClassDefinition.prototype */
    {
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
        _superifiedBody: "var _super_;\n" + "if (this.hasOwnProperty(\"$super\")) {\n" + "    _super_ = this.$super;\n" + "}\n" + "this.$super = _classDef_._get$Super(this, _methodName_, _superMembers_);\n" + "try{\n" + "    var _result_ = _method_.apply(this, arguments);\n" + "} finally {\n" + "    if (undefined === _super_) {\n" + "        delete this.$super;\n" + "    } else {\n" + "        this.$super = _super_;\n" + "    }\n" + "}\n" + "return _result_;",
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
    Object.assign(_GpfClassDefinition.prototype, /** @lends _GpfClassDefinition.prototype */
    {
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
            if ("function" === typeof value) {
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
                if (memberName.charAt(0) !== "$" && memberName !== "constructor") {
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
            if (this._initialDefinition.hasOwnProperty("constructor")) {
                /* jshint -W069*/
                /*eslint-disable dot-notation*/
                this._resolvedConstructor = this._superify(this._initialDefinition["constructor"], "constructor");    /* jshint +W069*/
                                                                                                                      /*eslint-enable dot-notation*/
            } else {
                this._setResolvedConstructorToInherited();
            }
        }
    });
    function _GpfInterfaceDefinition(definition) {
        /*jshint validthis:true*/
        // constructor
        /*eslint-disable no-invalid-this*/
        _GpfEntityDefinition.call(this, definition);    /*eslint-enable no-invalid-this*/
    }
    _GpfInterfaceDefinition.prototype = Object.create(_GpfEntityDefinition.prototype);
    Object.assign(_GpfInterfaceDefinition.prototype, /** @lends _GpfInterfaceDefinition.prototype */
    {
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
    Object.assign(_GpfInterfaceDefinition.prototype, /** @lends _GpfInterfaceDefinition.prototype */
    {
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
            if ("function" !== typeof value) {
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
    Object.assign(_GpfInterfaceDefinition.prototype, /** @lends _GpfInterfaceDefinition.prototype */
    {
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
                if (memberName.charAt(0) !== "$") {
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
        return "function" !== typeof method || referenceMethod.length !== method.length;
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
        _gpfAssert(null === result || _gpfInterfaceIsImplementedBy(interfaceSpecifier, result), "Invalid result of queryInterface (must be null or an object implementing the interface)");
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
        if ("string" === typeof interfaceSpecifier) {
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
        if ("string" === type) {
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
        if (!_gpfIsArray(specifications)) {
            specifications = [specifications];
        }
        return _gpfCreateSortFunction(specifications);
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
        if ("object" === typeof specification) {
            return Object.keys(specification).filter(function (property) {
                return -1 < _gpfCreateFilterTypes.indexOf(property);
            })[0];
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
     * @return {Function} Function that takes an object and return a truthy / falsy value indicating if the object
     * matches the filter
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
    /**
     * Starts a secured read operation (if possible)
     *
     * @param {Object} stream configured with {@see _gpfStreamSecureInstallProgressFlag}
     * @throws {gpf.Error.ReadInProgress}
     * @since 0.2.3
     */
    function _gpfStreamProgressStartRead(stream) {
        if (stream[_gpfStreamProgressRead]) {
            gpf.Error.readInProgress();
        }
        stream[_gpfStreamProgressRead] = true;
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
        if (stream[_gpfStreamProgressWrite]) {
            gpf.Error.writeInProgress();
        }
        stream[_gpfStreamProgressWrite] = true;
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
            return read.call(me, iWritableStream).then(function (result) {
                _gpfStreamProgressEndRead(me);
                return Promise.resolve(result);
            }, function (reason) {
                _gpfStreamProgressEndRead(me);
                return Promise.reject(reason);
            });
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
            return write.call(me, buffer)    //eslint-disable-line no-invalid-this
.then(function (result) {
                _gpfStreamProgressEndWrite(me);
                return Promise.resolve(result);
            }, function (reason) {
                _gpfStreamProgressEndWrite(me);
                return Promise.reject(reason);
            });
        };
    }
    var _GpfStreamReadableString = _gpfDefine(/** @lends gpf.stream.ReadableString.prototype */
        {
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
        _GpfStreamWritableString = _gpfDefine(/** @lends gpf.stream.WritableString.prototype */
        {
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
         * {@see gpf.interfaces.IFileStorage} per host
         *
         * @type {Object}
         * @since 0.2.1
         */
        _gpfFileStorageByHost = {},
        /**
         * {@see gpf.fs.read} per host
         *
         * @type {Object}
         * @since 0.2.2
         */
        _gpfFsReadImplByHost = {};
    /**
     * Generic read method using FileStorage
     *
     * @param {String} path File path
     * @return {Promise<String>} Resolved with the file content
     * @since 0.2.2
     */
    function _gpfFileStorageRead(path) {
        var fs = _gpfFileStorageByHost[_gpfHost], iWritableStream = new _GpfStreamWritableString();
        return fs.openTextStream(path, _GPF_FS_OPENFOR.READING).then(function (iReadStream) {
            return iReadStream.read(iWritableStream);
        }).then(function () {
            return iWritableStream.toString();
        });
    }
    /**
     * Generic read method
     *
     * @param {String} path File path
     * @return {Promise<String>} Resolved with the file content
     * @since 0.2.2
     */
    function _gpfFsRead(path) {
        return _gpfFsReadImplByHost[_gpfHost](path);
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
            return _gpfFileStorageByHost[_gpfHost] || null;
        },
        /**
         * @gpf:sameas _gpfFsRead
         * @since 0.2.2
         */
        read: _gpfFsRead
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
        if (-1 < path.indexOf("\\")) {
            // DOS path is case insensitive, hence lowercase it
            return path.toLowerCase().split("\\");
        }
        // Assuming a Unix-like path
        return path.split("/");
    }
    function _gpfPathRemoveTrailingBlank(splitPath) {
        if (!splitPath[splitPath.length - 1]) {
            splitPath.pop();
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
        if (-1 === pos) {
            return "";
        }
        return name.substr(pos);
    }
    function _gpfPathAppend(splitPath, relativePath) {
        _gpfPathDecompose(relativePath).forEach(function (relativeItem) {
            if (".." === relativeItem) {
                _gpfPathUp(splitPath);
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
        [].slice.call(arguments, 1).forEach(_gpfPathAppend.bind(null, splitPath));
        return splitPath.join("/");
    }
    function _gpfPathSafeShiftIdenticalBeginning(splitFromPath, splitToPath) {
        while (splitFromPath[0] === splitToPath[0]) {
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
        path = _gpfPathDecompose(path);
        _gpfPathUp(path);
        return path.join("/");
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
        length = splitFrom.length + 1;
        while (--length) {
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
            if (-1 === pos) {
                return name;
            }
            return name.substr(0, pos);
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
    function _gpfFsExploreEnumerator(iFileStorage, listOfPaths) {
        var pos = -1, info;
        return {
            reset: function () {
                pos = -1;
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
    var _GpfNodeBaseStream = _gpfDefine(/** @lends gpf.node.BaseStream.prototype */
        {
            $class: "gpf.node.BaseStream",
            /**
             * Base class wrapping NodeJS streams
             *
             * @param {Object} stream NodeJS stream object
             * @param {Function} [close] Close handler
             *
             * @constructor gpf.node.BaseStream
             * @private
             * @since 0.1.9
             */
            constructor: function (stream, close) {
                this._stream = stream;
                if ("function" === typeof close) {
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
        _GpfNodeReadableStream = _gpfDefine(/** @lends gpf.node.ReadableStream.prototype */
        {
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
        _GpfNodeWritableStream = _gpfDefine(/** @lends gpf.node.WritableStream.prototype */
        {
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
                    me._reject = reject;
                    me._checkIfValid();
                    if (stream.write(buffer)) {
                        return resolve();
                    }
                    stream.once("drain", resolve);
                });
            })    //endregion
        });
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
    var _GpfNodeFileStorage = _gpfDefine(/** @lends gpf.node.FileStorage.prototype */
    {
        $class: "gpf.node.FileStorage",
        //region gpf.interfaces.IFileStorage
        /**
         * @gpf:sameas gpf.interfaces.IFileStorage#getInfo
         * @since 0.1.9
         */
        getInfo: function (path) {
            path = _gpfPathNormalize(path);
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
        close: function (stream) {
            if (stream instanceof _GpfNodeBaseStream) {
                return stream.close();
            }
            return Promise.reject(new gpf.Error.IncompatibleStream());
        },
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
    _gpfFileStorageByHost[_GPF_HOST.NODEJS] = new _GpfNodeFileStorage();
    _gpfFsReadImplByHost[_GPF_HOST.NODEJS] = _gpfFileStorageRead;
    var _GpfWscriptBaseStream = _gpfDefine(/** @lends gpf.wscript.BaseStream.prototype */
        {
            $class: "gpf.wscript.BaseStream",
            /**
             * Base class wrapping NodeJS streams
             *
             * @constructor gpf.wscript.BaseStream
             * @param {Object} file File object
             * @private
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
         * @private
         * @since 0.1.9
         */
        _GpfWscriptReadableStream = _gpfDefine(/** @lends gpf.wscript.ReadableStream.prototype */
        {
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
                        return output.write(file.Read(4096))    // buffer size
.then(function () {
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
         * @private
         * @since 0.1.9
         */
        _GpfWscriptWritableStream = _gpfDefine(/** @lends gpf.wscript.WritableStream.prototype */
        {
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
    /**
     * WScript specific IFileStorage implementation
     *
     * @class gpf.wscript.FileStorage
     * @implements {gpf.interfaces.IFileStorage}
     * @private
     * @since 0.1.9
     */
    var _GpfWScriptFileStorage = _gpfDefine(/** @lends gpf.wscript.FileStorage.prototype */
    {
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
        openTextStream: function (path, mode) {
            path = _gpfPathDecompose(path).join("\\");
            return new Promise(function (resolve) {
                var stream;
                if (_GPF_FS_OPENFOR.READING === mode) {
                    stream = new _GpfWscriptReadableStream(_gpfMsFSO.OpenTextFile(path, 1, false));
                } else {
                    stream = new _GpfWscriptWritableStream(_gpfMsFSO.OpenTextFile(path, 8, true));
                }
                resolve(stream);
            });
        },
        /**
         * @gpf:sameas gpf.interfaces.IFileStorage#close
         * @since 0.1.9
         */
        close: function (stream) {
            if (stream instanceof _GpfWscriptBaseStream) {
                return stream.close();
            }
            return Promise.reject(new gpf.Error.IncompatibleStream());
        },
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
    _gpfFileStorageByHost[_GPF_HOST.WSCRIPT] = new _GpfWScriptFileStorage();
    _gpfFsReadImplByHost[_GPF_HOST.WSCRIPT] = _gpfFileStorageRead;
    _gpfFsReadImplByHost[_GPF_HOST.BROWSER] = gpf.Error.notImplemented;
    _gpfFsReadImplByHost[_GPF_HOST.RHINO] = function (path) {
        return new Promise(function (resolve) {
            resolve(readFile(path));
        });
    };
    _gpfFsReadImplByHost[_GPF_HOST.PHANTOMJS] = function (path) {
        return new Promise(function (resolve, reject) {
            try {
                resolve(_gpfNodeFs.read(path));
            } catch (e) {
                // Error is a string
                reject(new Error(e));
            }
        });
    };
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
        var parts = name.split(":");
        if (parts.length === 2) {
            return {
                namespace: _gpfWebGetNamespace(parts[0]),
                name: parts[1]
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
        if (-1 !== name.indexOf(":")) {
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
    var _GpfWebTag = _gpfDefine(/** @lends gpf.web.Tag.prototype */
    {
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
                return " " + _gpfWebTagAttributeAlias(name) + "=\"" + _gpfStringEscapeFor(this._attributes[name], "html") + "\"";
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
            var sliceFrom, attributes;
            if (_gpfIsLiteralObject(firstParam)) {
                attributes = firstParam;
                sliceFrom = 1;
            } else {
                sliceFrom = 0;
            }
            return new _GpfWebTag(nodeName, attributes, [].slice.call(arguments, sliceFrom));
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
    var _gpfHttpHeadersParserRE = new RegExp("([^:\\s]+)\\s*: ?([^\\r]*)", "gm");
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
            result[match[1]] = match[2];
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
     */
    gpf.promisify = _gpfPromisify;
    /**
     * @gpf:sameas _gpfPromisifyDefined
     * @since 0.2.2
     */
    gpf.promisifyDefined = _gpfPromisifyDefined;
    var _gpfHttpMockedRequests = {};
    /**
     * Match the provided request with the mocked one
     *
     * @param {gpf.typedef.mockedRequest} mockedRequest Mocked request to match
     * @return {Promise<gpf.typedef.httpRequestResponse>|undefined} undefined if not matching
     * @this {gpf.typedef.httpRequestSettings}
     * @since 0.2.2
     */
    function _gpfHttMockMatchRequest(mockedRequest) {
        /*jshint validthis:true*/
        var url = mockedRequest.url, match;
        url.lastIndex = 0;
        match = url.exec(this.url);
        if (match) {
            return _gpfPromisifyDefined(mockedRequest.response.apply(null, [this].concat([].slice.call(match, 1))));
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
        return _gpfArrayForEachFalsy(mockedRequests, _gpfHttMockMatchRequest.bind(request));
    }
    /**
     * Check if the provided request match any of the mocked one
     *
     * @param {gpf.typedef.httpRequestSettings} request Request to check
     * @return {Promise<gpf.typedef.httpRequestResponse>|undefined} undefined if no mocked request matches
     * @since 0.2.2
     */
    function _gpfHttpMockCheck(request) {
        return _gpfHttMockMatch(_gpfHttpMockedRequests[request.method], request);
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
        var method = definition.method, id;
        ++_gpfHttpMockLastId;
        id = method + "." + _gpfHttpMockLastId;
        _gpfHttpMockedRequests[method].unshift(Object.assign({
            method: method,
            id: id
        }, definition));
        return id;
    }
    /**
     * Removes a mocked request
     *
     * @param {gpf.typedef.mockedRequestID} id Mocked request identifier returned by {@link gpf.http.mock}
     * @since 0.2.2
     */
    function _gpfHttpMockRemove(id) {
        var method = id.split(".")[0];
        _gpfHttpMockedRequests[method] = _gpfHttpMockedRequests[method].filter(function (mockedRequest) {
            return mockedRequest.id !== id;
        });
    }
    /**
     * Clears all mocked requests
     * @since 0.2.2
     */
    function _gpfHttpMockReset() {
        Object.keys(_GPF_HTTP_METHODS).forEach(function (method) {
            _gpfHttpMockedRequests[method] = [];
        });
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
    var _gpfHttpRequestImplByHost = {};
    /**
     * HTTP request common implementation
     *
     * @param {gpf.typedef.httpRequestSettings} request HTTP Request settings
     * @return {Promise<gpf.typedef.httpRequestResponse>} Resolved on request completion
     * @since 0.2.1
     */
    function _gpfHttpRequest(request) {
        return _gpfHttpMockCheck(request) || new Promise(function (resolve, reject) {
            _gpfHttpRequestImplByHost[_gpfHost](request, resolve, reject);
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
        if ("string" === typeof url) {
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
    var _gpfHttpXhrSetHeaders = _gpfHttpGenSetHeaders("setRequestHeader"), _gpfHttpXhrSend = _gpfHttpGenSend("send");
    function _gpfHttpXhrOpen(request) {
        var xhr = new XMLHttpRequest();
        xhr.open(request.method, request.url);
        return xhr;
    }
    function _gpfHttpXhrWaitForCompletion(xhr, callback) {
        xhr.onreadystatechange = function () {
            if (4 === xhr.readyState) {
                callback();
            }
        };
    }
    _gpfHttpRequestImplByHost[_GPF_HOST.BROWSER] = _gpfHttpRequestImplByHost[_GPF_HOST.PHANTOMJS] = function (request, resolve) {
        var xhr = _gpfHttpXhrOpen(request);
        _gpfHttpXhrSetHeaders(xhr, request.headers);
        _gpfHttpXhrWaitForCompletion(xhr, function () {
            resolve({
                status: xhr.status,
                headers: _gpfHttpParseHeaders(xhr.getAllResponseHeaders()),
                responseText: xhr.responseText
            });
        });
        _gpfHttpXhrSend(xhr, request.data);
    };
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
    function _gpfHttpNodeAllocate(request, resolve) {
        var settings = _gpfHttpNodeBuildRequestSettings(request);
        return _gpfNodeHttp.request(settings, function (nodeResponse) {
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
    _gpfHttpRequestImplByHost[_GPF_HOST.NODEJS] = function (request, resolve, reject) {
        var clientRequest = _gpfHttpNodeAllocate(request, resolve);
        clientRequest.on("error", reject);
        _gpfHttpNodeSend(clientRequest, request.data);
    };
    var _gpfHttpWScriptSetHeaders = _gpfHttpGenSetHeaders("setRequestHeader"), _gpfHttpWScriptSend = _gpfHttpGenSend("Send");
    function _gpfHttpWScriptAllocate(request) {
        var winHttp = new ActiveXObject("WinHttp.WinHttpRequest.5.1");
        winHttp.Open(request.method, request.url);
        return winHttp;
    }
    function _gpfHttpWScriptResolve(winHttp, resolve) {
        resolve({
            status: winHttp.Status,
            headers: _gpfHttpParseHeaders(winHttp.GetAllResponseHeaders()),
            responseText: winHttp.ResponseText
        });
    }
    _gpfHttpRequestImplByHost[_GPF_HOST.WSCRIPT] = function (request, resolve) {
        var winHttp = _gpfHttpWScriptAllocate(request);
        _gpfHttpWScriptSetHeaders(winHttp, request.headers);
        _gpfHttpWScriptSend(winHttp, request.data);
        _gpfHttpWScriptResolve(winHttp, resolve);
    };
    var _GpfRhinoBaseStream = _gpfDefine(/** @lends gpf.rhino.BaseStream.prototype */
        {
            $class: "gpf.rhino.BaseStream",
            /**
             * Base class wrapping Rhino streams
             *
             * @param {java.io.InputStream|java.io.OutputStream} stream Rhino input or output stream object
             *
             * @constructor gpf.rhino.BaseStream
             * @private
             * @since 0.2.1
             */
            constructor: function (stream) {
                this._stream = stream;
            },
            /**
             * Close the stream
             *
             * @return {Promise} Resolved when closed
             * @since 0.2.1
             */
            close: function () {
                this._stream.close();
                return Promise.resolve();
            },
            /**
             * Rhino stream object
             *
             * @type {java.io.InputStream|java.io.OutputStream}
             * @since 0.2.1
             */
            _stream: null
        }),
        /**
         * Wraps a readable stream from Rhino into a IReadableStream
         *
         * @param {java.io.InputStream} stream Rhino stream object
         *
         * @class gpf.rhino.ReadableStream
         * @extends gpf.rhino.BaseStream
         * @implements {gpf.interfaces.IReadableStream}
         * @since 0.2.1
         */
        _GpfRhinoReadableStream = _gpfDefine(/** @lends gpf.rhino.ReadableStream.prototype */
        {
            $class: "gpf.rhino.ReadableStream",
            $extend: "gpf.rhino.BaseStream",
            //region gpf.interfaces.IReadableStream
            /**
             * Process error that occurred during the stream reading
             *
             * @param {Error} e Error coming from read
             * @return {Promise} Read result replacement
             * @since 0.2.1
             */
            _handleError: function (e) {
                if (e.message.indexOf("java.util.NoSuchElementException") === 0) {
                    // Empty stream
                    return Promise.resolve();
                }
                return Promise.reject(e);
            },
            /**
             * @gpf:sameas gpf.interfaces.IReadableStream#read
             * @since 0.2.1
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
         * @class gpf.rhino.WritableStream
         * @extends gpf.rhino.BaseStream
         * @implements {gpf.interfaces.IWritableStream}
         * @since 0.2.1
         */
        _GpfRhinoWritableStream = _gpfDefine(/** @lends gpf.rhino.WritableStream.prototype */
        {
            $class: "gpf.rhino.WritableStream",
            $extend: "gpf.rhino.BaseStream",
            constructor: function (stream) {
                this.$super(stream);
                this._writer = new java.io.OutputStreamWriter(stream);
            },
            //region gpf.interfaces.IWritableStream
            /**
             * @gpf:sameas gpf.interfaces.IWritableStream#write
             * @since 0.2.1
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
             * @since 0.2.1
             */
            close: function () {
                this._writer.close();
                return this.$super();
            },
            /**
             * Stream writer
             *
             * @type {java.io.OutputStreamWriter}
             * @since 0.2.1
             */
            _writer: null
        });
    var _gpfHttpRhinoSetHeaders = _gpfHttpGenSetHeaders("setRequestProperty");
    function _gpfHttpRhinoSendData(httpConnection, data) {
        if (data) {
            httpConnection.setDoOutput(true);
            var iWritableStream = new _GpfRhinoWritableStream(httpConnection.getOutputStream());
            return iWritableStream.write(data).then(function () {
                iWritableStream.close();
            });
        }
        return Promise.resolve();
    }
    function _gpfHttpRhinoGetResponse(httpConnection) {
        try {
            return httpConnection.getInputStream();
        } catch (e) {
            return httpConnection.getErrorStream();
        }
    }
    function _gpfHttpRhinoGetResponseText(httpConnection) {
        var iReadableStream = new _GpfRhinoReadableStream(_gpfHttpRhinoGetResponse(httpConnection));
        return _gpfStringFromStream(iReadableStream).then(function (responseText) {
            iReadableStream.close();
            return responseText;
        });
    }
    function _gpfHttpRhinoGetHeaders(httpConnection) {
        var headers = {}, headerFields = httpConnection.getHeaderFields(), keys = headerFields.keySet().toArray();
        keys.forEach(function (key) {
            headers[String(key)] = String(headerFields.get(key).get(0));
        });
        return headers;
    }
    function _gpfHttpRhinoResolve(httpConnection, resolve) {
        _gpfHttpRhinoGetResponseText(httpConnection).then(function (responseText) {
            resolve({
                status: httpConnection.getResponseCode(),
                headers: _gpfHttpRhinoGetHeaders(httpConnection),
                responseText: responseText
            });
        });
    }
    _gpfHttpRequestImplByHost[_GPF_HOST.RHINO] = function (request, resolve) {
        var httpConnection = new java.net.URL(request.url).openConnection();
        httpConnection.setRequestMethod(request.method);
        _gpfHttpRhinoSetHeaders(httpConnection, request.headers);
        _gpfHttpRhinoSendData(httpConnection, request.data).then(function () {
            _gpfHttpRhinoResolve(httpConnection, resolve);
        });
    };
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
    var _GpfStreamBufferedRead = _gpfDefine(/** @lends gpf.stream.BufferedRead.prototype */
    {
        $class: "gpf.stream.BufferedRead",
        /**
         * Implements IReadableStream by offering methods manipulating a buffer:
         * - {@link gpf.stream.BufferedRead#_appendToReadBuffer}
         * - {@link gpf.stream.BufferedRead#_completeReadBuffer}
         * - {@link gpf.stream.BufferedRead#_setReadError}
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
            this._readBuffer = this._readBuffer.concat([].slice.call(arguments));
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
    var _reDOSCR = /\r\n/g, _GpfStreamLineAdatper = _gpfDefine(/** @lends gpf.stream.LineAdapter.prototype */
        {
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
    var _gpfRequireLoadImpl;
    function _gpfRequireLoadHTTP(name) {
        return _gpfHttpRequest({
            method: _GPF_HTTP_METHODS.GET,
            url: name
        }).then(function (response) {
            return response.responseText;
        });
    }
    function _gpfRequireLoadFS(name) {
        // Must be relative to the current execution path
        return _gpfFsRead(_gpfPathJoin(".", name));
    }
    if (_gpfHost === _GPF_HOST.BROWSER) {
        _gpfRequireLoadImpl = _gpfRequireLoadHTTP;
    } else {
        _gpfRequireLoadImpl = _gpfRequireLoadFS;
    }
    /**
     * Mapping of resource extension to processor function
     *
     * @type {Object}
     * @since 0.2.2
     */
    var _gpfRequireProcessor = {};
    /**
     * Load the resource
     *
     * @param {String} name Resource name
     * @return {Promise<*>} Resolved with the resource result
     * @since 0.2.2
     */
    function _gpfRequireLoad(name) {
        var me = this;
        return _gpfRequireLoadImpl(name).then(function (content) {
            var processor = _gpfRequireProcessor[_gpfPathExtension(name).toLowerCase()];
            if (processor) {
                return processor.call(me, name, content);
            }
            // Treated as simple text file by default
            return content;
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
    //region CommonJS
    var _gpfRequireJsModuleRegEx = /[^\.]\brequire\b\s*\(\s*(?:['|"]([^"']+)['|"]|[^\)]+)\s*\)/g;
    function _gpfRequireCommonJSBuildNamedDependencies(requires) {
        return requires.reduce(function (dictionary, name) {
            dictionary[name] = name;
            return dictionary;
        }, {});
    }
    function _gpfRequireCommonJs(myGpf, content, requires) {
        return myGpf.require.define(_gpfRequireCommonJSBuildNamedDependencies(requires), function (require) {
            var module = {};
            _gpfFunc([
                "gpf",
                "module",
                "require"
            ], content)(myGpf, module, function (name) {
                return require[name] || gpf.Error.noCommonJSDynamicRequire();
            });
            return module.exports;
        });
    }
    //endregion
    //region GPF, AMD (define) and others
    function _gpfRequireAmdDefineParamsFactoryOnly(params) {
        return {
            dependencies: [],
            factory: params[0]
        };
    }
    function _gpfRequireAmdDefineParamsDependenciesAndFactory(params) {
        return {
            dependencies: params[0],
            factory: params[1]
        };
    }
    function _gpfRequireAmdDefineParamsAll(params) {
        return {
            dependencies: params[1],
            factory: params[2]
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
            params = _gpfRequireAmdDefineParamsMapping[arguments.length](arguments);
        myGpf.require.define(params.dependencies, function (require) {
            require.length = params.dependencies.length;
            return params.factory.apply(null, [].slice.call(require));
        });
    }
    function _gpfRequireOtherJs(myGpf, content) {
        _gpfFunc([
            "gpf",
            "define"
        ], content)(myGpf, _gpfRequireAmdDefine.bind(myGpf));
    }
    //endregion
    _gpfRequireProcessor[".js"] = function (name, content) {
        var wrapper = _gpfRequireWrapGpf(this, name);
        // CommonJS ?
        var requires = _gpfRegExpForEach(_gpfRequireJsModuleRegEx, content);
        if (requires.length) {
            return _gpfRequireCommonJs(wrapper.gpf, content, requires.map(function (match) {
                return match[1];    // may be undefined if dynamic
            }).filter(function (require) {
                return require;
            }));
        }
        _gpfRequireOtherJs(wrapper.gpf, content);
        return wrapper.promise;
    };
    _gpfErrorDeclare("require", {
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
        invalidRequireConfigureOption: "Invalid configuration option"
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
     * @since 0.2.2
     */
    /**
     * @typedef gpf.typedef._requireContext
     * @property {String} base Base path used to resolve names
     * @property {Object} cache Dictionary of loaded requires
     * @since 0.2.2
     */
    /**
     * Valuate the option priority to have them executed in the proper order
     *
     * @param {String} name option name
     * @return {Number} Option priority
     * @since 0.2.2
     */
    function _gpfRequireOptionPriority(name) {
        if ("clearCache" === name) {
            return -1;
        }
        return 1;
    }
    /**
     *  Dictionary of option name to function handling the option
     * @type {Object}
     * @since 0.2.2
     */
    var _gpfRequireOptionHandler = {
        base: function (base) {
            this.base = base;
        },
        cache: function (cache) {
            _gpfArrayForEach(Object.keys(cache), function (name) {
                this.cache[name] = _gpfPromisify(cache[name]);
            }, this);
        },
        clearCache: function () {
            this.cache = {};
        }
    };
    /**
     * Configure the {@link gpf.require} layer
     *
     * @param {gpf.typedef.requireOptions} options Options to configure
     * @since 0.2.2
     */
    function _gpfRequireConfigure(options) {
        var me = this;
        _gpfArrayForEach(Object.keys(options).sort(function (key1, key2) {
            // Some keys must be processed first
            return _gpfRequireOptionPriority(key1) - _gpfRequireOptionPriority(key2);
        }), function (key) {
            (_gpfRequireOptionHandler[key] || gpf.Error.invalidRequireConfigureOption).call(me, options[key]);
        }, me);
    }
    /**
     * Resolves the resource name according to current require context.
     *
     * @param {String} name Relative resource name
     * @return {String} Resolved name
     * @since 0.2.2
     *
     */
    function _gpfRequireResolve(name) {
        return _gpfPathJoin(this.base, name);
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
        return promise;
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
            if ("function" === typeof factory) {
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
        cache: {}
    });    /**
            * @method gpf.require.define
            * @gpf:sameas _gpfRequireDefine
            * @since 0.2.2
            */
           /**
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
    var _GpfStreamReadableArray = _gpfDefine(/** @lends gpf.stream.ReadableArray.prototype */
        {
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
        }), _GpfStreamWritableArray = _gpfDefine(/** @lends gpf.stream.WritableArray.prototype */
        {
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
            //region gpf.interfaces.IReadableStream
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
    /**
     * Create a flushable & writable stream by combining the intermediate stream with the writable destination
     *
     * @param {Object} intermediate Must implements IReadableStream interface.
     * If it implements the IFlushableStream interface, it is assumed that it retains data
     * until it receives the Flush. Meaning, the read won't complete until the flush call.
     * If it does not implement the IFlushableStream, the read may end before the whole sequence
     * has finished. It means that the next write should trigger a new read and flush must be simulated at
     * least to pass it to the destination
     * @param {Object} destination Must implements IWritableStream interface.
     * If it implements the IFlushableStream, it will be called when the intermediate completes.
     *
     * @return {Object} Implementing IWritableStream and IFlushableStream
     * @since 0.2.3
     */
    function _gpfStreamPipeToFlushableWrite(intermediate, destination) {
        var iReadableIntermediate = _gpfStreamQueryReadable(intermediate), iWritableIntermediate = _gpfStreamQueryWritable(intermediate), iFlushableIntermediate = _gpfStreamPipeToFlushable(intermediate), iWritableDestination = _gpfStreamQueryWritable(destination), iFlushableDestination = _gpfStreamPipeToFlushable(destination), readingDone = false, readError;
        // Read errors must be transmitted up to the initial read, this is done by forwarding it to flush & write
        function _read() {
            try {
                iReadableIntermediate.read(iWritableDestination).then(function () {
                    readingDone = true;
                }, function (reason) {
                    readError = reason;
                });
            } catch (e) {
                readError = e;
            }
        }
        _read();
        function _checkIfReadError() {
            if (readError) {
                return Promise.reject(readError);
            }
        }
        return {
            flush: function () {
                return _checkIfReadError() || iFlushableIntermediate.flush().then(function () {
                    return iFlushableDestination.flush();
                });
            },
            write: function (data) {
                return _checkIfReadError() || iWritableIntermediate.write(data).then(function () {
                    if (readingDone) {
                        _read();
                    }
                });
            }
        };
    }
    function _gpfStreamPipeReduce(streams) {
        var idx = streams.length - 1, iWritableStream = streams[idx];
        while (idx > 0) {
            iWritableStream = _gpfStreamPipeToFlushableWrite(streams[--idx], iWritableStream);
        }
        return iWritableStream;
    }
    function _gpfStreamPipeToWritable(streams) {
        if (streams.length > 1) {
            return _gpfStreamPipeReduce(streams);
        }
        return _gpfStreamQueryWritable(streams[0]);
    }
    /**
     * Pipe streams.
     *
     * @param {gpf.interfaces.IReadableStream} source Source stream
     * @param {...gpf.interfaces.IWritableStream} destination Writable streams
     * @return {Promise} Resolved when reading (and subsequent writings) are done
     * @since 0.2.3
     */
    function _gpfStreamPipe(source, destination) {
        _gpfIgnore(destination);
        var iReadableStream = _gpfStreamQueryReadable(source), iWritableStream = _gpfStreamPipeToWritable([].slice.call(arguments, 1)), iFlushableStream = _gpfStreamPipeToFlushable(iWritableStream);
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
    _gpfStringEscapes.regexp = {
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
        "\\": "\\\\",
        "^": "\\^",
        "$": "\\$",
        "|": "\\|"
    };
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
    var _GpfStreamCsvParser = _gpfDefine(/** @lends gpf.stream.csv.Parser.prototype */
    {
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
                if (-1 !== header.indexOf(separator)) {
                    return separator;
                }
            }) || _gpfCsvSeparators[0];
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
                Q: _gpfStringEscapeFor(this._quote, "regexp"),
                S: _gpfStringEscapeFor(this._separator, "regexp")
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
            if (match[1]) {
                this._values.push(match[1]);
            } else
                /* if (match[2]) */
                {
                    this._values.push(this._unescapeQuoted(match[2]));
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
            this._content = this._content.substr(index);
            return this._content.length > 0;
        },
        /**
         * Check what appears after the extracted value
         *
         * @param {Object} match Regular expression match
         * @return {Boolean} True if some remaining content must be parsed
         * @since 0.2.3
         */
        _checkAfterValue: function (match) {
            var charAfterValue = this._content.charAt(match[0].length);
            if (charAfterValue) {
                _gpfAssert(charAfterValue === this._separator, "Positive lookahead works");
                return this._nextValue(match[0].length + 1);
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
            if (this._content.charAt(0) === this._separator) {
                this._values.push("");
                // Separator here means empty value
                return this._nextValue(1);
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
}));
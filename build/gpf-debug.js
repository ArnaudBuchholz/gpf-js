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
        _gpfVersion = "0.1.9",
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
         * Browser [head](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head) tag
         *
         * @type {Object}
         * @since 0.1.5
         */
        _gpfWebHead,
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
        _gpfNodePath;
    _gpfVersion += "-debug";
    /* Host detection */
    /* istanbul ignore next */
    // Microsoft cscript / wscript
    if ("undefined" !== typeof WScript) {
        _gpfHost = _GPF_HOST.WSCRIPT;
        _gpfDosPath = true;
    } else if ("undefined" !== typeof print && "undefined" !== typeof java) {
        _gpfHost = _GPF_HOST.RHINO;
        _gpfDosPath = false;    // PhantomJS
    } else if ("undefined" !== typeof phantom && phantom.version) {
        _gpfHost = _GPF_HOST.PHANTOMJS;
        _gpfDosPath = require("fs").separator === "\\";
        _gpfMainContext = window;    // Nodejs
    } else if ("undefined" !== typeof module && module.exports) {
        _gpfHost = _GPF_HOST.NODEJS;
        _gpfNodePath = require("path");
        _gpfDosPath = _gpfNodePath.sep === "\\";
        _gpfMainContext = global;    // Browser
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
    if (_GPF_HOST.BROWSER === _gpfHost) {
        _gpfExit = function (code) {
            window.location = "https://arnaudbuchholz.github.io/gpf/exit.html?" + (code || 0);
        };
        _gpfWebWindow = window;
        _gpfWebDocument = document;
        _gpfWebHead = _gpfWebDocument.getElementsByTagName("head")[0] || _gpfWebDocument.documentElement;
    }
    if (_GPF_HOST.NODEJS === _gpfHost) {
        /* istanbul ignore next */
        // Not testable
        _gpfExit = function (code) {
            process.exit(code);
        };
        /**
         * @namespace gpf.node
         * @description Root namespace for NodeJS specifics
         * @since 0.1.5
         */
        gpf.node = {};
    }
    if (_GPF_HOST.PHANTOMJS === _gpfHost) {
        _gpfExit = function (code) {
            phantom.exit(code);
        };
        _gpfWebWindow = window;
        _gpfWebDocument = document;
        _gpfWebHead = _gpfWebDocument.getElementsByTagName("head")[0] || _gpfWebDocument.documentElement;
    }
    if (_GPF_HOST.RHINO === _gpfHost) {
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
        };
        _gpfExit = function (code) {
            java.lang.System.exit(code);
        };
    }
    if (_GPF_HOST.WSCRIPT === _gpfHost) {
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
        };
        _gpfExit = function (code) {
            WScript.Quit(code);
        };
        /**
         * @namespace gpf.wscript
         * @description Root namespace for WScript specifics
         * @since 0.1.9
         */
        gpf.wscript = {};
    }
    var _gpfIsArrayLike = function (obj) {
        //eslint-disable-line func-style
        return Array.isArray(obj);
    };
    /* istanbul ignore next */
    // Not tested with NodeJS
    if (_GPF_HOST.BROWSER === _gpfHost && (_gpfWebWindow.HTMLCollection || _gpfWebWindow.NodeList)) {
        _gpfIsArrayLike = function (obj) {
            return Array.isArray(obj) || obj instanceof _gpfWebWindow.HTMLCollection || obj instanceof _gpfWebWindow.NodeList;
        };
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
            if (object.hasOwnProperty(property)) {
                callback.call(thisArg, object[property], property, object);
            }
        }
    }
    /* istanbul ignore next */
    // Microsoft cscript / wscript specific version
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
     * Similar to [].forEach but for objects
     *
     * @param {Object} object Object
     * @param {gpf.typedef.forEachCallback} callback Callback function executed on each own property
     * @param {*} [thisArg] thisArg Value to use as this when executing callback
     * @since 0.1.5
     */
    var _gpfObjectForEach;
    /* istanbul ignore if */
    // Microsoft cscript / wscript specific version
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
    // Because tested in DEBUG
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
        // TODO update with http://stackoverflow.com/questions/26255/reserved-keywords-in-javascript
        // List of JavaScript keywords
        _gpfJsKeywords = ("break,case,class,catch,const,continue,debugger,default,delete,do,else,export,extends,finally," + "for,function,if,import,in,instanceof,let,new,return,super,switch,this,throw,try,typeof,var,void,while,with," + "yield").split(",");
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
            /* istanbul ignore next */
            // Not supposed to happen (not tested)
            console.error("An exception occurred compiling:\r\n" + source);
            /* istanbul ignore next */
            return null;
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
    _gpfInstallCompatibility("Date", {
        on: Date,
        methods: {
            // Introduced with JavaScript 1.8
            toISOString: function () {
                return this.getUTCFullYear() + "-" + _pad(this.getUTCMonth() + 1) + "-" + _pad(this.getUTCDate()) + "T" + _pad(this.getUTCHours()) + ":" + _pad(this.getUTCMinutes()) + ":" + _pad(this.getUTCSeconds()) + "." + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) + "Z";
            }
        }
    });
    //region Date override
    var _gpfISO8601RegExp = new RegExp("^([0-9][0-9][0-9][0-9])\\-([0-9][0-9])\\-([0-9][0-9])" + "(?:T([0-9][0-9])\\:([0-9][0-9])\\:([0-9][0-9])(?:\\.([0-9][0-9][0-9])Z)?)?$");
    function _gpfCheckDateArray(dateArray) {
        if (dateArray[1] < 12 && dateArray[2] < 32 && dateArray[3] < 24 && dateArray[4] < 60 && dateArray[5] < 60) {
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
        var members = [
                "prototype",
                // Ensure instanceof
                "UTC",
                "parse",
                "now"
            ], len = members.length, idx, member;
        for (idx = 0; idx < len; ++idx) {
            member = members[idx];
            _GpfDate[member] = _GpfGenuineDate[member];
        }
    }
    function _gpfInstallCompatibleDate() {
        _gpfCopyDateStatics();
        // Test if ISO 8601 format variations are supported
        var supported = false;
        try {
            var longDate = new Date("2003-01-22T22:45:34.075Z"), shortDate = new Date("2003-01-22");
            supported = 2003 === longDate.getUTCFullYear() && 0 === longDate.getUTCMonth() && 22 === longDate.getUTCDate() && 22 === longDate.getUTCHours() && 45 === longDate.getUTCMinutes() && 34 === longDate.getUTCSeconds() && 75 === longDate.getUTCMilliseconds() && 2003 === shortDate.getUTCFullYear() && 0 === shortDate.getUTCMonth() && 22 === shortDate.getUTCDate();
        } catch (e) {
        }
        //eslint-disable-line no-empty
        /* istanbul ignore if */
        // NodeJS environment supports ISO 8601 format
        if (!supported) {
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
                    /* istanbul ignore if */
                    // NodeJS implements __proto__
                    if (!obj.__proto__) {
                        obj.__proto__ = O;
                    }
                    return obj;
                };
            }(),
            // Introduced with JavaScript 1.8.5
            getPrototypeOf: function (object) {
                /* istanbul ignore else */
                // NodeJS implements __proto__
                if (object.__proto__) {
                    return object.__proto__;
                }
                /* istanbul ignore next */
                // NodeJS implements __proto__
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
    /* istanbul ignore next */
    // Promise exists now in NodeJS
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
            now = new Date();
            /* istanbul ignore else */
            // Harder to test (would require a very long loop)
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
        if (_GPF_HOST.WSCRIPT === _gpfHost) {
            _gpfSleep = function (t) {
                WScript.Sleep(t);    //eslint-disable-line new-cap
            };
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
    gpf.extend = Object.assign;
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
            // No use case to call getInstanceBuilder twice
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
         * @see {@tutorial DEFINE}
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
         * @see {@tutorial DEFINE}
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
     * Extract all 'members' that are used on $super
     *
     * @param {Function} method Method to analyze
     * @return {String[]} Member names that are used
     * @since 0.1.7
     */
    function _gpfClassMethodExtractSuperMembers(method) {
        var re = new RegExp("\\.\\$super\\.(\\w+)\\b", "g"), match = re.exec(method), result = [];
        while (match) {
            result.push(match[1]);
            match = re.exec(method);
        }
        return result;
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
        if (!Array.isArray(specifications)) {
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
    /**
     * Get an IReadableStream or fail if not implemented
     *
     * @param {Object} queriedObject Object to query
     * @return {gpf.interfaces.IReadableStream} IReadableStream interface
     * @throws {gpf.Error.InterfaceExpected}
     * @since 0.1.9
     */
    function _gpfStreamQueryReadable(queriedObject) {
        var iReadableStream = _gpfInterfaceQuery(_gpfIReadableStream, queriedObject);
        if (!iReadableStream) {
            gpf.Error.interfaceExpected({ name: "gpf.interfaces.IReadableStream" });
        }
        return iReadableStream;
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
        var iWritableStream = _gpfInterfaceQuery(_gpfIWritableStream, queriedObject);
        if (!iWritableStream) {
            gpf.Error.interfaceExpected({ name: "gpf.interfaces.IWritableStream" });
        }
        return iWritableStream;
    }
    var _gpfStreamInProgressPropertyName = "gpf.stream#inProgress";
    /**
     * Install the progress flag used by _gpfStreamSecureRead and Write
     *
     * @param {Function} constructor Class constructor
     * @since 0.1.9
     */
    function _gpfStreamSecureInstallProgressFlag(constructor) {
        constructor.prototype[_gpfStreamInProgressPropertyName] = false;
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
            var me = this;
            //eslint-disable-line no-invalid-this
            if (me[_gpfStreamInProgressPropertyName]) {
                gpf.Error.readInProgress();
            }
            var iWritableStream = _gpfStreamQueryWritable(output);
            me[_gpfStreamInProgressPropertyName] = true;
            return read.call(me, iWritableStream).then(function (result) {
                me[_gpfStreamInProgressPropertyName] = false;
                return Promise.resolve(result);
            }, function (reason) {
                me[_gpfStreamInProgressPropertyName] = false;
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
            if (me[_gpfStreamInProgressPropertyName]) {
                gpf.Error.writeInProgress();
            }
            me[_gpfStreamInProgressPropertyName] = true;
            return write.call(me, buffer)    //eslint-disable-line no-invalid-this
.then(function (result) {
                me[_gpfStreamInProgressPropertyName] = false;
                return Promise.resolve(result);
            }, function (reason) {
                me[_gpfStreamInProgressPropertyName] = false;
                return Promise.reject(reason);
            });
        };
    }
    var _GpfStreamReadableString = _gpfDefine(/** @lends gpf.node.ReadableString */
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
        _GpfStreamWritableString = _gpfDefine(/** @lends gpf.node.WritableString */
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
         * Host file storage
         *
         * @type {gpf.interfaces.IFileStorage}
         * @since 0.1.9
         */
        _gpfHostFileStorage = null;
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
         * @return {gpf.interfaces.IFileStorage} IFileStorage interface
         * @since 0.1.9
         */
        getFileStorage: function () {
            return _gpfHostFileStorage;
        }
    };
    /**
     * Set the result of {@see gpf.fs.getFileStorage}
     *
     * @param {gpf.interfaces.IFileStorage} iFileStorage object implementing IFileStorage
     * @since 0.1.9
     */
    function _gpfSetHostFileStorage(iFileStorage) {
        _gpfHostFileStorage = iFileStorage;
    }
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
     * @description Root namespace for path manipulation
     * @since 0.1.9
     */
    gpf.path = {
        /**
         * @gpf:sameas _gpfPathJoin
         * @since 0.1.9
         */
        join: _gpfPathJoin,
        /**
         * Get the parent of a path
         *
         * @param {String} path Path to analyze
         * @return {String} Parent path
         * @throws {gpf.Error.UnreachablePath}
         * @since 0.1.9
         */
        parent: function (path) {
            path = _gpfPathDecompose(path);
            _gpfPathUp(path);
            return path.join("/");
        },
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
         * Get the extension of the last name of a path (including dot)
         *
         * @param {String} path Path to analyze
         * @return {String} Extension (including dot)
         * @since 0.1.9
         */
        extension: function (path) {
            var name = _gpfPathName(path), pos = name.lastIndexOf(".");
            if (-1 === pos) {
                return "";
            }
            return name.substr(pos);
        },
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
    if (_GPF_HOST.NODEJS === _gpfHost) {
        var _GpfNodeBaseStream = _gpfDefine(/** @lends gpf.node.BaseStream */
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
            _GpfNodeReadableStream = _gpfDefine(/** @lends gpf.node.ReadableStream */
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
            _GpfNodeWritableStream = _gpfDefine(/** @lends gpf.node.WritableStream */
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
    var _gpfNodeFileStorage = _gpfDefine(/** @lends gpf.node.FileStorage */
    {
        $class: "gpf.node.FileStorage",
        /**
         * NodeJS specific IFileStorage implementation
         *
         * @constructor gpf.node.FileStorage
         * @implements {gpf.interfaces.IFileStorage}
         * @private
         * @since 0.1.9
         */
        constructor: function () {
            /* istanbul ignore next */
            // Because boot always implies require("fs")
            if (!_gpfNodeFs) {
                _gpfNodeFs = require("fs");
            }
        },
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
    /* istanbul ignore else */
    // Because tested with NodeJS
    if (_GPF_HOST.NODEJS === _gpfHost) {
        _gpfSetHostFileStorage(new _gpfNodeFileStorage());
    }
    if (_GPF_HOST.WSCRIPT === _gpfHost) {
        var _GpfWscriptBaseStream = _gpfDefine(/** @lends gpf.wscript.BaseStream */
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
            _GpfWscriptReadableStream = _gpfDefine(/** @lends gpf.wscript.ReadableStream */
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
            _GpfWscriptWritableStream = _gpfDefine(/** @lends gpf.wscript.WritableStream */
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
    }
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
    /* istanbul ignore next */
    // Because tested with NodeJS
    function _gpfFsWscriptFSOCallWithArg(name, path) {
        return new Promise(function (resolve) {
            _gpfMsFSO[name](_gpfPathDecompose(path).join("\\"));
            resolve();
        });
    }
    /* istanbul ignore next */
    // Because tested with NodeJS
    function _gpfFsWscriptFSOCallWithArgAndTrue(name, path) {
        return new Promise(function (resolve) {
            _gpfMsFSO[name](_gpfPathDecompose(path).join("\\"), true);
            resolve();
        });
    }
    /* istanbul ignore next */
    // Because tested with NodeJS
    function _gpfFsWscriptGetFileInfo(path) {
        if (_gpfMsFSO.FileExists(path)) {
            return _gpfFsWScriptObjToFileStorageInfo(_gpfMsFSO.GetFile(path), _GPF_FS_TYPES.FILE);
        }
        return { type: _GPF_FS_TYPES.NOT_FOUND };
    }
    /* istanbul ignore next */
    // Because tested with NodeJS
    function _gpfFsWscriptGetInfo(path) {
        if (_gpfMsFSO.FolderExists(path)) {
            return _gpfFsWScriptObjToFileStorageInfo(_gpfMsFSO.GetFolder(path), _GPF_FS_TYPES.DIRECTORY);
        }
        return _gpfFsWscriptGetFileInfo(path);
    }
    /* istanbul ignore next */
    // Because tested with NodeJS
    function _gpfFsWScriptExploreList(collection) {
        var fsoEnum = new Enumerator(collection), results = [];
        for (; !fsoEnum.atEnd(); fsoEnum.moveNext()) {
            results.push(fsoEnum.item().Path);
        }
        return results;
    }
    /* istanbul ignore next */
    // Because tested with NodeJS
    function _gpfFsWScriptExplore(path) {
        var folder;
        if (_gpfMsFSO.FolderExists(path)) {
            folder = _gpfMsFSO.GetFolder(path);
            return _gpfFsWScriptExploreList(folder.SubFolders).concat(_gpfFsWScriptExploreList(folder.Files));
        }
        return [];
    }
    /* istanbul ignore next */
    // Because tested with NodeJS
    var _GpfWScriptFileStorage = _gpfDefine(/** @lends gpf.wscript.FileStorage */
    {
        $class: "gpf.wscript.FileStorage",
        /**
         * WScript specific IFileStorage implementation
         *
         * @constructor gpf.wscript.FileStorage
         * @implements {gpf.interfaces.IFileStorage}
         * @private
         * @since 0.1.9
         */
        constructor: function () {
            if (!_gpfMsFSO) {
                _gpfMsFSO = new ActiveXObject("Scripting.FileSystemObject");
            }
        },
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
            return Promise.resolve(_gpfFsExploreEnumerator(this, _gpfFsWScriptExplore(_gpfPathDecompose(path).join("\\"))));
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
    /* istanbul ignore next */
    // Because tested with NodeJS
    if (_GPF_HOST.WSCRIPT === _gpfHost) {
        _gpfSetHostFileStorage(new _GpfWScriptFileStorage());
    }
}));
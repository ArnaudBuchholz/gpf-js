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
        // GPF version
        _gpfVersion = "0.1.5",
        /**
         * Host type
         *
         * @enum {String}
         */
        _GPF_HOST = {
            /** Browser */
            BROWSER: "browser",
            /** [NodeJs](http://nodejs.org/) */
            NODEJS: "nodejs",
            /** [PhantomJS](http://phantomjs.org/) */
            PHANTOMJS: "phantomjs",
            /** [Rhino](http://developer.mozilla.org/en/docs/Rhino) */
            RHINO: "rhino",
            /** Unknown: detection failed */
            UNKNOWN: "unknown",
            /** [cscript/wscript](http://technet.microsoft.com/en-us/library/bb490887.aspx) */
            WSCRIPT: "wscript"
        },
        /**
         * Current host type
         *
         * @type {_GPF_HOST}
         */
        _gpfHost = _GPF_HOST.UNKNOWN,
        /** Indicates that paths are DOS-like (i.e. case insensitive with /) */
        _gpfDosPath = false,
        /*jshint -W040*/
        // This is the common way to get the global context
        /**
         * Main context object
         *
         * @type {Object}
         */
        _gpfMainContext = this,
        //eslint-disable-line no-invalid-this, consistent-this
        /*jshint +W040*/
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
        /**
         * Browser window object
         *
         * @type {Object}
         */
        _gpfWebWindow,
        /**
         * Browser [document](https://developer.mozilla.org/en-US/docs/Web/API/Document) object
         *
         * @type {Object}
         */
        _gpfWebDocument,
        /**
         * Browser [head](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head) tag
         *
         * @type {Object}
         */
        _gpfWebHead,
        /**
         * [Scripting.FileSystemObject](https://msdn.microsoft.com/en-us/library/aa711216(v=vs.71).aspx) Object
         *
         * @type {Object}
         */
        _gpfMsFSO,
        /**
         * Node [require("fs")](https://nodejs.org/api/fs.html)
         *
         * @type {Object}
         */
        _gpfNodeFs,
        /**
         * Node [require("path")](https://nodejs.org/api/path.html)
         *
         * @type {Object}
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
    // Returns the current version
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
    }
    var _gpfAssert, _gpfAsserts;
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
        if (!condition) {
            console.warn("ASSERTION FAILED: " + message);
            gpf.Error.assertionFailed({ message: message });
        }
    }
    /**
     * Batch assertion helper
     *
     * @param {Object} assertions Dictionary of messages associated to condition values
     * @throws {gpf.Error.AssertionFailed}
     * @since 0.1.5
     */
    function _gpfAssertsImpl(assertions) {
        for (var message in assertions) {
            /* istanbul ignore else */
            if (assertions.hasOwnProperty(message)) {
                _gpfAssertImpl(assertions[message], message);
            }
        }
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
    // DEBUG specifics
    _gpfAssert = _gpfAssertImpl;
    _gpfAsserts = _gpfAssertsImpl;
    /* istanbul ignore if */
    // Because tested in DEBUG
    if (!_gpfAssert) {
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
    /**
     * Similar to [].forEach but for objects
     *
     * @param {Object} object Object
     * @param {gpfForEachCallback} callback Callback function executed on each own property
     * @param {*} [thisArg] thisArg Value to use as this when executing callback
     * @since 0.1.5
     */
    function _gpfObjectForEach(object, callback, thisArg) {
        for (var property in object) {
            /* istanbul ignore else */
            if (object.hasOwnProperty(property)) {
                callback.call(thisArg, object[property], property, object);
            }
        }
    }
    /**
     * Executes a provided function once per structure element.
     * NOTE: unlike [].forEach, non own properties are also enumerated
     *
     * @param {Array|Object} container Container to enumerate
     * @param {gpfForEachCallback} callback Callback function executed on each item or own property
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
    var
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
    // Unsafe version of _gpfFunc
    function _gpfFuncUnsafe(params, source) {
        var args;
        if (0 === params.length) {
            return _GpfFunc(source);
        }
        args = [].concat(params);
        args.push(source);
        return _GpfFunc.apply(null, args);
    }
    /**
     * Create a new function from the source and parameter list.
     * In DEBUG mode, it catches any error to log the problem.
     *
     * @param {String[]} [params] params Parameter names list
     * @param {String} source Body of the function
     * @return {Function} New function
     * @private
     * @since 0.1.5
     */
    function _gpfFunc(params, source) {
        if (undefined === source) {
            source = params;
            params = [];
        }
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
    // Returns true if the value is an unsigned byte
    function _gpfIsUnsignedByte(value) {
        return "number" === typeof value && 0 <= value && value < 256;
    }
    /**
     * Add constants to the provided object
     *
     * @param {Object} obj Object receiving the constants
     * @param {Object} dictionary Dictionary names to value
     * @private
     * @since 0.1.5
     */
    function _gpfCreateConstants(obj, dictionary) {
        _gpfObjectForEach(dictionary, function (value, key) {
            obj[key] = value;
        });
    }
    _gpfCreateConstants(gpf, {
        HOST_BROWSER: _GPF_HOST.BROWSER,
        HOST_NODEJS: _GPF_HOST.NODEJS,
        HOST_PHANTOMJS: _GPF_HOST.PHANTOMJS,
        HOST_RHINO: _GPF_HOST.RHINO,
        HOST_UNKNOWN: _GPF_HOST.UNKNOWN,
        HOST_WSCRIPT: _GPF_HOST.WSCRIPT
    });
    /* istanbul ignore else */
    // Because tested with NodeJS
    if (_GPF_HOST.NODEJS === _gpfHost) {
        /**
         * @namespace gpf.node
         * @description Root namespace for NodeJS specifics
         * @since 0.1.5
         */
        gpf.node = {};
    }
    /**
     * @namespace gpf.web
     * @description Root namespace for web-related tools (even if not in a browser)
     * @since 0.1.5
     */
    gpf.web = {};
    function _gpfAssign(value, memberName) {
        /*jshint validthis:true*/
        this[memberName] = value;
    }
    /**
     * Extends the destination object by copying own enumerable properties from the source object.
     * If the member already exists, it is overwritten.
     *
     * @param {Object} destination Destination object
     * @param {...Object} source Source objects
     * @return {Object} Destination object
     * @since 0.1.5
     */
    function _gpfExtend(destination, source) {
        _gpfIgnore(source);
        [].slice.call(arguments, 1).forEach(function (nthSource) {
            _gpfObjectForEach(nthSource, _gpfAssign, destination);
        });
        return destination;
    }
    /**
     * @gpf:sameas _gpfExtend
     * @since 0.1.5
     */
    gpf.extend = _gpfExtend;
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
        that = _gpfStringReplaceEx(that, _gpfStringEscapes[language]);
        if ("javascript" === language) {
            that = "\"" + that + "\"";
        }
        return that;
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
    _gpfStringEscapes.html = _gpfExtend(_gpfStringEscapes.xml, {
        "à": "&agrave;",
        "á": "&aacute;",
        "è": "&egrave;",
        "é": "&eacute;",
        "ê": "&ecirc;"
    });
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
    function _gpfArrayForEachOwn(array, callback, idx) {
        var len = array.length;
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
                return _gpfArrayEveryOwn(this, _gpfArrayBind(callback, arguments[1]), 0);
            },
            // Introduced with JavaScript 1.6
            filter: function (callback) {
                var result = [];
                callback = _gpfArrayBind(callback, arguments[1]);
                _gpfArrayForEachOwn(this, function (item, idx, array) {
                    if (callback(item, idx, array)) {
                        result.push(item);
                    }
                }, 0);
                return result;
            },
            // Introduced with JavaScript 1.6
            forEach: function (callback) {
                _gpfArrayForEachOwn(this, _gpfArrayBind(callback, arguments[1]), 0);
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
                }, 0);
                return result;
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
                return "[object Array]" === Object.prototype.toString.call(arrayLike);
            }
        }
    });
    function _gpfBuildFactoryParameterList(maxParameters) {
        return new Array(maxParameters).join(" ").split(" ").map(function (value, index) {
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
        var parameters = _gpfBuildFactoryParameterList(maxParameters);
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
                return [
                    this.getUTCFullYear(),
                    "-",
                    _pad(this.getUTCMonth() + 1),
                    "-",
                    _pad(this.getUTCDate()),
                    "T",
                    _pad(this.getUTCHours()),
                    ":",
                    _pad(this.getUTCMinutes()),
                    ":",
                    _pad(this.getUTCSeconds()),
                    ".",
                    (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5),
                    "Z"
                ].join("");
            }
        }
    });
    //region Date override
    var _gpfISO8601RegExp = new RegExp([
        "^([0-9][0-9][0-9][0-9])",
        "\\-",
        "([0-9][0-9])",
        "\\-",
        "([0-9][0-9])",
        "(?:T",
        "([0-9][0-9])",
        "\\:",
        "([0-9][0-9])",
        "\\:",
        "([0-9][0-9])",
        "(?:\\.",
        "([0-9][0-9][0-9])",
        "Z)?)?$"
    ].join(""));
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
    _gpfInstallCompatibility("Function", {
        on: Function,
        methods: {
            // Introduced with JavaScript 1.8.5
            bind: function (thisArg) {
                var me = this, prependArgs = _gpfArrayPrototypeSlice.call(arguments, 1);
                return function () {
                    var args = _gpfArrayPrototypeSlice.call(arguments, 0);
                    me.apply(thisArg, prependArgs.concat(args));
                };
            }
        }
    });
    //region Function name
    // Get the name of a function if bound to the call
    var _gpfJsCommentsRegExp = new RegExp("//.*$|/\\*(?:[^\\*]*|\\*[^/]*)\\*/", "gm");
    function _gpfGetFunctionName() {
        // Use simple parsing
        /*jshint validthis:true*/
        var functionSource = Function.prototype.toString.call(this),
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
    _gpfInstallCompatibility("Object", {
        on: Object,
        statics: {
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
    
     * @typedef {*} gpfTypeContextResult
     * @since 0.1.5
     */
    /**
     * Resolve the provided contextual path and returns the result
     *
     * @param {String[]} path Array of identifiers
     * @param {Boolean} [createMissingParts=false] If the path includes undefined parts and createMissingParts is true,
     * it allocates a default empty object. This allows building namespaces on the fly.
     *
     * @return {gpfTypeContextResult} Resolved path
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
     * @return {gpfTypeContextResult} Resolved path
     * @since 0.1.5
     */
    gpf.context = function (path) {
        if (undefined === path) {
            return _gpfMainContext;
        }
        return _gpfContext(path.split("."));
    };
    var _GpfError = gpf.Error = function () {
    };
    _GpfError.prototype = new Error();
    _gpfExtend(_GpfError.prototype, /** @lends gpf.Error.prototype */
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
        _gpfExtend(NewErrorClass.prototype, {
            constructor: NewErrorClass,
            code: code,
            name: name,
            message: message
        });
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
         * Method is abstract
         *
         * ### Description
         *
         * This error is used to implement abstract methods. Mostly used for interfaces.
         * @since 0.1.5
         */
        abstractMethod: "Abstract method",
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
}));
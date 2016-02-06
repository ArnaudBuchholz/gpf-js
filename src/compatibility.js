/*#ifndef(UMD)*/
"use strict";
/*exported _gpfArraySlice*/ // Slice an array-like object
/*exported _gpfJsCommentsRegExp*/ // Find all JavaScript comments
/*#endif*/

/*eslint-disable no-proto*/ // Used for compatibility reasons
/*jshint -W103*/

var _gpfArrayPrototypeSlice = Array.prototype.slice;

/**
 * Slice an array-like object
 *
 * @param {Object} array array-like parameter (arguments, Array)
 * @param {Number} from
 * @param {Number} [to=undefined] to
 * @return {Array}
 */
function _gpfArraySlice (array, from, to) {
    return _gpfArrayPrototypeSlice.apply(array, [from || 0, to || array.length + 1]);
}

function _pad (number) {
    if (10 > number) {
        return "0" + number;
    }
    return number;
}

var _gpfCompatibility = {

    Array: {
        on: Array.prototype,

        // Introduced with JavaScript 1.6
        every: function (callback) {
            var thisArg = arguments[1],
                len = this.length,
                idx;
            for (idx = 0; idx < len; ++idx) {
                if (!callback.apply(thisArg, [this[idx], idx, this])) {
                    return false;
                }
            }
            return true;
        },

        // Introduced with JavaScript 1.6
        filter: function (callback) {
            var thisArg = arguments[1],
                result = [],
                len = this.length,
                idx,
                item;
            for (idx = 0; idx < len; ++idx) {
                item = this[idx];
                if (callback.apply(thisArg, [this[idx], idx, this])) {
                    result.push(item);
                }
            }
            return result;
        },

        // Introduced with JavaScript 1.6
        forEach: function (callback) {
            var thisArg = arguments[1],
                len = this.length,
                idx;
            for (idx = 0; idx < len; ++idx) {
                callback.apply(thisArg, [this[idx], idx, this]);
            }
        },

        // Introduced with JavaScript 1.5
        indexOf: function (searchElement) {
            var fromIndex = arguments[1],
                index = fromIndex || 0,
                thisLength = this.length;
            while (index < thisLength) {
                if (this[index] === searchElement) {
                    return index;
                }
                ++index;
            }
            return -1;
        },

        // Introduced with JavaScript 1.6
        map: function (callback) {
            var thisArg = arguments[1],
                thisLength = this.length,
                result = new Array(thisLength),
                index;
            for (index = 0; index < thisLength; ++index) {
                result[index] = callback.apply(thisArg, [this[index], index, this]);
            }
            return result;
        },

        // Introduced with JavaScript 1.8
        reduce: function (callback) {
            var initialValue = arguments[1],
                thisLength = this.length,
                index = 0,
                value;
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

        // Introduced with JavaScript 1.8.5
        bind: function (thisArg) {
            var me = this,
                prependArgs = _gpfArraySlice(arguments, 1);
            return function () {
                var args = _gpfArraySlice(arguments, 0);
                me.apply(thisArg, prependArgs.concat(args));
            };
        }

    },

    Object: {
        on: Object,

        create: (function () {
            function Temp () {}
            return function (O) {
                Temp.prototype = O;
                var obj = new Temp();
                Temp.prototype = null;
                if (!obj.__proto__) {
                    obj.__proto__ = O;
                }
                return obj;
            };
        }()),

        getPrototypeOf: function (object) {
            // May break if the constructor has been tampered with
            return object.__proto__ || object.constructor.prototype;
        }

    },

    String: {
        on: String.prototype,

        // Introduced with JavaScript 1.8.1
        trim: (function () {
            var rtrim = new RegExp("^[\\s\uFEFF\xA0]+|[\\s\uFEFF\xA0]+$", "g");
            return function () {
                return this.replace(rtrim, "");
            };
        }())

    },

    Date: {
        on: Date.prototype,

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

};

(function () {
    var type,
        compatibleMethods;

    function install (dictionary, methods) {
        for (var name in methods) {
            /* istanbul ignore else */
            if (methods.hasOwnProperty(name)) {
                if (name === "on") {
                    continue;
                }
                /* istanbul ignore if */ // NodeJS environment already contains all methods
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
var _gpfJsCommentsRegExp =  new RegExp("//.*$|/\\*(?:[^\\*]*|\\*[^/]*)\\*/", "gm");
function _gpfGetFunctionName () {
    // Use simple parsing
    /*jshint validthis:true*/
    var functionSource = Function.prototype.toString.apply(this), //eslint-disable-line no-invalid-this
        functionKeywordPos = functionSource.indexOf("function"),
        parameterListStartPos = functionSource.indexOf("(", functionKeywordPos);
    return functionSource
            .substr(functionKeywordPos + 9, parameterListStartPos - functionKeywordPos - 9)
            .replace(_gpfJsCommentsRegExp, "") // remove comments
            .trim();
}

// Handling function name properly
/* istanbul ignore if */ // NodeJS exposes Function.prototype.name
if ((function () {
    /* istanbul ignore next */ // Will never be evaluated
    function functionName () {}
    return functionName.name !== "functionName";
})()) {

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

/*#ifndef(UMD)*/

gpf.internals._gpfArraySlice = _gpfArraySlice;
gpf.internals._gpfCompatibility = _gpfCompatibility;
gpf.internals._gpfGetFunctionName = _gpfGetFunctionName;

/*#endif*/

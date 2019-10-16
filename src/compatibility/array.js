/**
 * @file Array methods polyfill
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_START*/ // 0
/*global _gpfArrayForEach*/ // Almost like [].forEach (undefined are also enumerated)
/*global _gpfCompatibilityInstallMethods*/ // Define and install compatible methods on standard objects
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfIsArray:true*/ // Return true if the parameter is an array
/*#endif*/

//region Array helpers

var _GPF_COMPATIBILITY_ARRAY_THIS_ARG_INDEX = 1;

function _gpfArrayGetThisArg (args) {
    return args[_GPF_COMPATIBILITY_ARRAY_THIS_ARG_INDEX];
}

function _gpfArrayBind (callback, args) {
    var thisArg = _gpfArrayGetThisArg(args);
    if (undefined !== thisArg) {
        return callback.bind(thisArg);
    }
    return callback;
}

function _gpfArrayForEachOwn (array, callback) {
    var len = array.length,
        idx = 0;
    while (idx < len) {
        if (Object.prototype.hasOwnProperty.call(array, idx)) {
            callback(array[idx], idx, array);
        }
        ++idx;
    }
}

function _gpfArrayEveryOwn (array, callback, startIdx) {
    var len = array.length,
        idx = startIdx;
    while (idx < len) {
        if (Object.prototype.hasOwnProperty.call(array, idx) && callback(array[idx], idx, array) !== true) {
            return false;
        }
        ++idx;
    }
    return true;
}

function _gpfArrayEveryOwnFrom0 (array, callback) {
    return _gpfArrayEveryOwn(array, callback, _GPF_START);
}

//endregion

//region Array.from

function _gpfArrayFromString (array, string) {
    var length = string.length,
        index = 0;
    for (; index < length; ++index) {
        array.push(string.charAt(index));
    }
}

function _gpfArrayConvertFrom (arrayLike) {
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

function _gpfArrayFrom (arrayLike, callback, thisArg) {
    var array = _gpfArrayConvertFrom(arrayLike);
    if (typeof callback === "function") {
        array = array.map(callback, thisArg);
    }
    return array;
}

var _GPF_COMPATIBILITY_ARRAY_FROM_INDEX_INDEX = 1;

function _gpfArrayGetFromIndex (args) {
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
            var result = [],
                boundCallback = _gpfArrayBind(callback, arguments);
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
            var result = new Array(this.length),
                boundCallback = _gpfArrayBind(callback, arguments);
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
            var REDUCE_INITIAL_VALUE_INDEX = 1,
                initialValue = arguments[REDUCE_INITIAL_VALUE_INDEX],
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

/*#ifndef(UMD)*/

_gpfIsArray([]); // To clear out linter error

/*#endif*/

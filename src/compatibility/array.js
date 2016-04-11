/*#ifndef(UMD)*/
"use strict";
/*global _gpfInstallCompatibility*/ // Define and install compatible methods
/*#endif*/

//region Array helpers

function _gpfArrayBind (callback, thisArg) {
    if (undefined !== thisArg) {
        return callback.bind(thisArg);
    }
    return callback;
}

function _gpfArrayForEachFrom (array, callback, idx) {
    var len = array.length;
    while (idx < len) {
        callback(array[idx], idx, array);
        ++idx;
    }
}

function _gpfArrayEveryFrom (array, callback, idx) {
    var len = array.length;
    while (idx < len) {
        if (true !== callback(array[idx], idx, array)) {
            return false;
        }
        ++idx;
    }
    return true;
}

//endregion

//region Array.from

function _gpfArrayFromString (array, string) {
    var length = string.length,
        index;
    for (index = 0; index < length; ++index) {
        array.push(string.charAt(index));
    }
}

function _gpfArrayConvertFrom (arrayLike) {
    var array = [];
    if ("string" === typeof arrayLike) {
        // Required for cscript
        _gpfArrayFromString(array, arrayLike);
    } else {
        _gpfArrayForEachFrom(arrayLike, function (value) {
            array.push(value);
        }, 0);
    }
    return array;
}

function _gpfArrayFrom (arrayLike) {
    var array = _gpfArrayConvertFrom(arrayLike),
        callback = arguments[1];
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
            return _gpfArrayEveryFrom(this, _gpfArrayBind(callback, arguments[1]), 0);
        },

        // Introduced with JavaScript 1.6
        filter: function (callback) {
            var result = [];
            callback = _gpfArrayBind(callback, arguments[1]);
            _gpfArrayForEachFrom(this, function (item, idx, array) {
                if (callback(item, idx, array)) {
                    result.push(item);
                }
            }, 0);
            return result;
        },

        // Introduced with JavaScript 1.6
        forEach: function (callback) {
            _gpfArrayForEachFrom(this, _gpfArrayBind(callback, arguments[1]), 0);
        },

        // Introduced with JavaScript 1.5
        indexOf: function (searchElement) {
            var result = -1;
            _gpfArrayEveryFrom(this, function (value, index) {
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
            _gpfArrayForEachFrom(this, function (item, index, array) {
                result[index] = callback(item, index, array);
            }, 0);
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

    statics: {

        // Introduced with ECMAScript 2015
        from: _gpfArrayFrom,

        // Introduced with JavaScript 1.8.5
        isArray: function (arrayLike) {
            return "[object Array]" === Object.prototype.toString.call(arrayLike);
        }

    }

});

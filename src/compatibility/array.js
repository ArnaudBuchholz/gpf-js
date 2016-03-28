/*#ifndef(UMD)*/
"use strict";
/*global _gpfInstallCompatibility*/ // Define and install compatible methods
/*#endif*/

_gpfInstallCompatibility("Array", {
    on: Array,

    methods: {

        // Introduced with JavaScript 1.6
        every: function (callback) {
            var thisArg = arguments[1],
                len = this.length,
                idx;
            for (idx = 0; idx < len; ++idx) {
                if (!callback.call(thisArg, this[idx], idx, this)) {
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
                if (callback.call(thisArg, this[idx], idx, this)) {
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
                callback.call(thisArg, this[idx], idx, this);
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
                result[index] = callback.call(thisArg, this[index], index, this);
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

    statics: {

        // Introduced with ECMAScript 2015
        from: function (arrayLike) {
            var length = arrayLike.length,
                array = [],
                index,
                callback = arguments[1],
                thisArg = arguments[2];
            if ("string" === typeof arrayLike) {
                // Required for cscript
                for (index = 0; index < length; ++index) {
                    array.push(arrayLike.charAt(index));
                }

            } else {
                for (index = 0; index < length; ++index) {
                    array.push(arrayLike[index]);
                }
            }
            if ("function" === typeof callback) {
                array = array.map(callback, thisArg);
            }
            return array;
        },

        // Introduced with JavaScript 1.8.5
        isArray: function (arrayLike) {
            return "[object Array]" === Object.prototype.toString.call(arrayLike);
        }

    }

});

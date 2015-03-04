/*#ifndef(UMD)*/
"use strict";
/*#endif*/

var
    /**
     * Shortcut on Array.prototype.slice
     *
     * @type {Function}
     * @private
     */
    _gpfArraySlice = Array.prototype.slice;

if (undefined === Array.prototype.forEach) {

    // Introduced with JavaScript 1.6
    Array.prototype.forEach = function (callback, thisArg) {
        var len = this.length,
            idx;
        for (idx = 0; idx < len; ++idx) {
            callback.apply(thisArg, [this[idx], idx, this]);
        }
    };
}

if (undefined === Array.prototype.indexOf) {

    // Introduced with JavaScript 1.5
    Array.prototype.indexOf = function (searchElement, fromIndex) {
        var idx,
            len = this.length;
        if (undefined !== fromIndex) {
            idx = fromIndex;
        } else {
            fromIndex = 0;
        }
        while (idx < len) {
            if (this[idx] === searchElement) {
                return idx;
            }
        }
        return -1;
    };

}

if (undefined === Function.prototype.bind) {

    // Introduced with JavaScript 1.8.5
    Function.prototype.bind = function (thisArg) {
        var thisFn = this,
            prependArgs = _gpfArraySlice.apply(arguments, [1]);
        return function() {
            thisFn.apply(thisArg, prependArgs.concat(arguments));
        };
    };

}

if (undefined === Object.defineProperty) {

    /**
     * If possible, defines a read-only property
     *
     * @param {Object} obj
     * @param {String} name
     * @param {*} value
     * @return {Object}
     * @chainable
     */
    gpf.setReadOnlyProperty = function (obj, name, value) {
        obj[name] = value;
        return obj;
    };

} else {

    gpf.setReadOnlyProperty = function (obj, name, value) {
        Object.defineProperty(obj, name, {
            enumerable: true,
            configurable: false,
            writable: false,
            value: value
        });
        return obj;
    };

}

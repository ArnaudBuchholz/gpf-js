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

if (undefined === Array.prototype.indexOf) {

    // Introduced with JavaScript 1.5
    Array.prototype.indexOf = function (value) {
        var idx = this.length;
        while (idx--) {
            if (this[idx] === value) {
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

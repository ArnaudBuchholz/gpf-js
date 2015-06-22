/*#ifndef(UMD)*/
"use strict";
/*exported _gpfArraySlice*/
/*exported _gpfSetReadOnlyProperty*/
/*#endif*/

var
    /**
     * Shortcut on Array.prototype.slice
     *
     * @type {Function}
     * @private
     */
    _gpfArraySlice = Array.prototype.slice,

    /**
     * Shortcut on gpf.setReadOnlyProperty
     * @inheritdoc gpf:setReadOnlyProperty
     */
     _gpfSetReadOnlyProperty;

if (undefined === Array.prototype.every) {

    // Introduced with JavaScript 1.6
    Array.prototype.every = function (callback, thisArg) {
        var len = this.length,
            idx;
        for (idx = 0; idx < len; ++idx) {
            if (!callback.apply(thisArg, [this[idx], idx, this])) {
                return false;
            }
        }
        return true;
    };
}

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
            idx = 0;
        }
        while (idx < len) {
            if (this[idx] === searchElement) {
                return idx;
            }
            ++idx;
        }
        return -1;
    };

}

if (undefined === Array.prototype.map) {

    // Introduced with JavaScript 1.6
    Array.prototype.map = function (callback, thisArg) {
        var len = this.length,
            result = new Array(len),
            idx;
        for (idx = 0; idx < len; ++idx) {
            result[idx] = callback.apply(thisArg, [this[idx], idx, this]);
        }
        return result;
    };

}

if (undefined === Function.prototype.bind) {

    // Introduced with JavaScript 1.8.5
    Function.prototype.bind = function (thisArg) {
        var thisFn = this,
            prependArgs = _gpfArraySlice.apply(arguments, [1]);
        return function() {
            var args = _gpfArraySlice.apply(arguments, [0]);
            thisFn.apply(thisArg, prependArgs.concat(args));
        };
    };

}

// Handling function name properly
if ((function () {
    function functionName() {}
    if (functionName.name !== "functionName") {
        return true;
    } else {
        return false;
    }
})()) {

    (function () {
        var comments = new RegExp("//.*$|/\\*.*\\*/", "g");
        Function.prototype.compatibleName = function () {
            // Use simple parsing as a first step
            // TODO leverage JS parser to implement this properly
            var src = "" + this,
                pos = src.indexOf("function"),
                paramList = src.indexOf("(", pos);
            return src.substr(pos + 9, paramList - pos - 9)
                    .replace(comments, "") // remove comments
                    .trim();
        };

    }());

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

if (undefined === Object.defineProperty) {

    _gpfSetReadOnlyProperty = function (obj, name, value/*, hidden*/) {
        obj[name] = value;
        return obj;
    };

} else {

    _gpfSetReadOnlyProperty = function (obj, name, value, hidden) {
        Object.defineProperty(obj, name, {
            enumerable: hidden !== true,
            configurable: false,
            writable: false,
            value: value
        });
        return obj;
    };

}

/**
 * If possible, defines a read-only property
 *
 * @param {Object} obj
 * @param {String} name
 * @param {*} value
 * @param {Boolean} [hidden=false] hidden
 * @return {Object}
 * @chainable
 */
gpf.setReadOnlyProperty = _gpfSetReadOnlyProperty;

if (undefined === String.prototype.trim) {

    // Introduced with JavaScript 1.8.1
    (function () {
        var rtrim = new RegExp("^[\\s\uFEFF\xA0]+|[\\s\uFEFF\xA0]+$", "g");
        String.prototype.trim = function() {
            return this.replace(rtrim, "");
        };
    }());

}
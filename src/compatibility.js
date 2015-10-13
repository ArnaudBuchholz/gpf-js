/*#ifndef(UMD)*/
"use strict";
/*exported _gpfArraySlice*/
/*#endif*/

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

if (undefined === Array.prototype.filter) {

    // Introduced with JavaScript 1.6
    Array.prototype.filter = function (callback, thisArg) {
        var result = [],
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
        var index = fromIndex || 0,
            thisLength = this.length;
        while (index < thisLength) {
            if (this[index] === searchElement) {
                return index;
            }
            ++index;
        }
        return -1;
    };

}

if (undefined === Array.prototype.map) {

    // Introduced with JavaScript 1.6
    Array.prototype.map = function (callback, thisArg) {
        var thisLength = this.length,
            result = new Array(thisLength),
            index;
        for (index = 0; index < thisLength; ++index) {
            result[index] = callback.apply(thisArg, [this[index], index, this]);
        }
        return result;
    };

}

if (undefined === Array.prototype.reduce) {

    // Introduced with JavaScript 1.8
    Array.prototype.reduce = function (callback, initialValue) {
        var thisLength = this.length,
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
    };

}

if (undefined === Function.prototype.bind) {

    // Introduced with JavaScript 1.8.5
    Function.prototype.bind = function (thisArg) {
        var thisFunction = this,
            prependArgs = _gpfArraySlice(arguments, 1);
        return function() {
            var args = _gpfArraySlice(arguments, 0);
            thisFunction.apply(thisArg, prependArgs.concat(args));
        };
    };

}

// Handling function name properly
if ((function () {
    function functionName() {}
    return functionName.name !== "functionName";
})()) {

    (function () {

        var comments = new RegExp("//.*$|/\\*.*\\*/", "g");

        Function.prototype.compatibleName = function () {
            // Use simple parsing as a first step
            // TODO leverage JS parser to implement this properly
            var functionSource = Function.prototype.toString.apply(this),
                functionKeywordPos = functionSource.indexOf("function"),
                parameterListStartPos = functionSource.indexOf("(", functionKeywordPos);
            return functionSource
                    .substr(functionKeywordPos + 9, parameterListStartPos - functionKeywordPos - 9)
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

if (undefined === Object.create) {

    /*jshint -W103*/
    Object.create = (function() {
        function Temp() {}
        return function (O) {
            Temp.prototype = O;
            var obj = new Temp();
            Temp.prototype = null;
            if (!obj.__proto__) {
                obj.__proto__ = O;
            }
            return obj;
        };
    })();

}

if (undefined === Object.getPrototypeOf) {

    Object.getPrototypeOf = function (object){
        // May break if the constructor has been tampered with
        return object.__proto__ || object.constructor.prototype;
    };
    /*jshint +W103*/

}

if (undefined === String.prototype.trim) {

    // Introduced with JavaScript 1.8.1
    (function () {
        var rtrim = new RegExp("^[\\s\uFEFF\xA0]+|[\\s\uFEFF\xA0]+$", "g");
        String.prototype.trim = function() {
            return this.replace(rtrim, "");
        };
    }());

}

/*#ifndef(UMD)*/
"use strict";
/*global _gpfHost*/ // Host type
/*global _gpfInNode*/ // The current host is a nodeJS like
/*#endif*/

/*
    This package contains general helpers that will be used everywhere else
*/

var
    /**
     * gpf.each implementation on array
     *
     * @param {Array} array
     * @param {Function} memberCallback
     * @param {*} defaultResult
     * @private
     */
    _gpfArrayEachWithResult = function (array, memberCallback, defaultResult) {
        var
            result,
            len = array.length,
            idx;
        for (idx = 0; idx < len; ++idx) {
            result = memberCallback.apply(this, [idx, array[idx]]);
            if (undefined !== result) {
                return result;
            }
        }
        return defaultResult;
    },

    /**
     * gpf.each implementation on array without default result
     *
     * @param {Array} array
     * @param {Function} memberCallback
     * @private
     */
    _gpfArrayEach = function (array, memberCallback) {
        var
            len = array.length,
            idx;
        for (idx = 0; idx < len; ++idx) {
            memberCallback.apply(this, [idx, array[idx]]);
        }
    },

    /**
     * gpf.each implementation on object
     *
     * @param {Object} dictionary
     * @param {Function} memberCallback
     * @param {*} defaultResult
     * @private
     */
    _gpfDictionaryEachWithResult = function (dictionary, memberCallback,
        defaultResult) {
        var
            result,
            member;
        for (member in dictionary) {
            if (dictionary.hasOwnProperty(member)) {
                result = memberCallback.apply(this, [member,
                    dictionary[member]]);
                if (undefined !== result) {
                    return result;
                }
            }
        }
        return defaultResult;
    },

    /**
     * gpf.each implementation on object without default result
     *
     * @param {Object} dictionary
     * @param {Function} memberCallback
     * @private
     */
    _gpfDictionaryEach = function (dictionary, memberCallback) {
        var
            member;
        for (member in dictionary) {
            if (dictionary.hasOwnProperty(member)) {
                memberCallback.apply(this, [member, dictionary[member]]);
            }
        }
    },

    /**
     * gpf.extend implementation of assign without any callback
     *
     * @param {String} member
     * @param {*} value
     * @private
     */
    _gpfAssign = function (member, value) {
        // this = gpf.extend's arguments
        // this[0] is dictionary
        this[0][member] = value;
    },

    /**
     * gpf.extend implementation of assign with a  callback
     *
     * @param {String} member
     * @param {*} value
     * @private
     */
    _gpfAssignOrCall = function (member, value) {
        // this = gpf.extend's arguments
        var
            dictionary = this[0],
            overwriteCallback = this[2];
        // TODO: see if in is faster
        if (undefined !== dictionary[member]) {
            overwriteCallback(dictionary, member, value);
        } else {
            dictionary[member] = value;
        }
    },

    /**
     * gpf.value handlers per type
     *
     * @type {Object}
     * @private
     */
    _gpfValues = {
        boolean: function (value, valueType, defaultValue) {
            if ("string" === valueType) {
                if ("yes" === value || "true" === value) {
                    return true;
                }
                return 0 !== parseInt(value, 10);
            }
            if ("number" === valueType) {
                return 0 !== value;
            }
            return defaultValue;
        },

        number:  function (value, valueType, defaultValue) {
            if ("string" === valueType) {
                return parseFloat(value);
            }
            return defaultValue;
        },

        string: function (value, valueType, defaultValue) {
            gpf.interfaces.ignoreParameter(valueType);
            gpf.interfaces.ignoreParameter(defaultValue);
            if (value instanceof Date) {
                return gpf.dateToComparableFormat(value);
            }
            return value.toString();
        },

        object: function (value, valueType, defaultValue) {
            if (defaultValue instanceof Date && "string" === valueType) {
                return gpf.dateFromComparableFormat(value);
            }
            return defaultValue;
        }
    };

if ("browser" === _gpfHost && (window.HTMLCollection || window.NodeList)) {
    /**
     * Return true if the provided parameter looks like an array (i.e. it has
     * a property length and each item can be accessed with [])
     *
     * @param {Object} obj
     * @return {Boolean} True if array-like
     */
    gpf.isArrayLike = function (obj) {
        return obj instanceof Array
            || obj instanceof window.HTMLCollection
            || obj instanceof window.NodeList;
    };
} else {
    gpf.isArrayLike = function (obj) {
        return obj instanceof Array;
    };
}

/*jshint unused: false */ // Because of arguments
/*
 * Enumerate dictionary members and call memberCallback for each of them.
 * If defaultResult is defined, memberCallback may return a result.
 * If memberCallback returns anything, the function stops and returns it.
 * Otherwise, the defaultResult is returned.
 * When defaultResult is not defined, memberCallback result is ignored.
 *
 * @param {Object|Array} dictionary
 * @param {Function} memberCallback
 * @param {*} defaultResult
 * @return {*}
 * @chainable
 * @forwardThis
 */
gpf.each = function (dictionary, memberCallback, defaultResult) {
    if (undefined === defaultResult) {
        if (gpf.isArrayLike(dictionary)) {
            _gpfArrayEach.apply(this, arguments);
        } else {
            _gpfDictionaryEach.apply(this, arguments);
        }
        return;
    }
    if (gpf.isArrayLike(dictionary)) {
        return _gpfArrayEachWithResult.apply(this, arguments);
    }
    return _gpfDictionaryEachWithResult.apply(this, arguments);
};
/*jshint unused: true */

/*
 * Appends members of additionalProperties to the dictionary object.
 * If a conflict has to be handled (i.e. member exists on both objects),
 * the overwriteCallback has to handle it.
 *
 * @param {Object} dictionary
 * @param {Object} additionalProperties
 * @param {Function} overwriteCallback
 * @return {Object} the modified dictionary
 * @chainable
 */
gpf.extend = function (dictionary, additionalProperties, overwriteCallback) {
    var callbackToUse;
    if (undefined === overwriteCallback) {
        callbackToUse = _gpfAssign;
    } else {
        gpf.ASSERT("function" === typeof overwriteCallback,
            "Expected function");
        callbackToUse = _gpfAssignOrCall;
    }
    _gpfDictionaryEach.apply(arguments, [additionalProperties, callbackToUse]);
    return dictionary;
};

gpf.extend(gpf, {

    /*
     * Converts the provided value to match the expectedType.
     * If not specified or impossible to do so, defaultValue is returned.
     * When expectedType is not provided, it is deduced from defaultValue.
     *
     * @param {*} value
     * @param {*} default value
     * @param {String} [expectedType=typeof defaultValue] expected type
     * @return {*}
     */
    value: function (value, defaultValue, expectedType) {
        var valueType = typeof value;
        if (!expectedType) {
            expectedType = typeof defaultValue;
        }
        if (expectedType === valueType) {
            return value;
        }
        if ("undefined" === valueType || !value) {
            return defaultValue;
        }
        return _gpfValues[expectedType](value, valueType, defaultValue);
    },

    /**
     * Shallow copy an object
     *
     * @param {Object} obj
     * @return {Object}
     */
    clone: function (obj) {
        /*
         * http://stackoverflow.com/questions/122102/what-is-the-most-
         * efficient-way-to-clone-an-object/5344074#5344074
         */
        return gpf.json.parse(gpf.json.stringify(obj));
    },

    /*
     * Find the first member of dictionary which value equals to value.
     *
     * @param {Object/array} dictionary
     * @param {*} value
     * @return {String/number/undefined} undefined if not found
     */
    test: function (dictionary, value) {
        var idx;
        if (dictionary instanceof Array) {
            idx = dictionary.length;
            while (idx > 0) {
                if (dictionary[--idx] === value) {
                    return idx;
                }
            }
        } else {
            for (idx in dictionary) {
                if (dictionary.hasOwnProperty(idx)
                    && dictionary[idx] === value) {
                    return idx;
                }
            }
        }
        return undefined;
    },

    /*
     * Inserts the value in the array if not already present.
     *
     * @param {Array} array
     * @param {*} value
     * @return {Array}
     * @chainable
     */
    set: function (array, value) {
        gpf.ASSERT(array instanceof Array,
            "gpf.set must be used with an Array");
        var idx = array.length;
        while (idx > 0) {
            if (array[--idx] === value) {
                return array; // Already set
            }
        }
        array.push(value);
        return array;
    },

    /*
     * Removes the member of 'dictionary' which value equals 'value'.
     * NOTE: that the object is modified.
     *
     * @param {Object/array} dictionary
     * @param {*} value
     * @return {Object/array} dictionary
     * @chainable
     */
    clear: function (dictionary, value) {
        var idx;
        if (dictionary instanceof Array) {
            idx = dictionary.length;
            while (idx > 0) {
                if (dictionary[--idx] === value) {
                    dictionary.splice(idx, 1);
                    break;
                }
            }
        } else {
            for (idx in dictionary) {
                if (dictionary.hasOwnProperty(idx)
                    && dictionary[idx] === value) {
                    break;
                }
            }
        }
        return dictionary;
    },

    /**
     * XOR
     *
     * @param {Boolean} a
     * @param {Boolean} b
     */
    xor: function (a, b) {
        return a && !b || !a && b;
    },

    /**
     * Capitalize the string
     *
     * @param {String} that
     * @return {String}
     */
    capitalize: function (that) {
        return that.charAt(0).toUpperCase() + that.substr(1);
    }

});

//region NodeJS helpers

if (_gpfInNode) {

    /**
     * Converts a NodeJS buffer into a native array containing unsigned
     * bytes
     *
     * @param {Buffer} buffer
     * @return {Number[]}
     */
    gpf.node.buffer2JsArray = function (buffer) {
        var result = [],
            len = buffer.length,
            idx;
        for (idx = 0; idx < len; ++idx) {
            result.push(buffer.readUInt8(idx));
        }
        return result;
    };

}

//endregion
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST_BROWSER*/ // gpf.HOST_BROWSER
/*global _gpfAssert*/ // Assertion method
/*global _gpfExit*/ // Exit function
/*global _gpfHost*/ // Host type
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfInNode*/ // The current host is a nodeJS like
/*global _gpfWebWindow*/ // Browser window object
/*exported _gpfExtend*/
/*exported _gpfIsArrayLike*/
/*exported _gpfObjectForEach*/
/*exported _gpfStringCapitalize*/
/*exported _gpfStringEscapeFor*/
/*exported _gpfStringReplaceEx*/
/*#endif*/

//region _gpfIsArrayLike

var
    /**
     * Return true if the parameter looks like an array
     *
     * @param {Object} obj
     * @return {Boolean} True if array-like
     */
    _gpfIsArrayLike;

if (_GPF_HOST_BROWSER === _gpfHost && (_gpfWebWindow.HTMLCollection || _gpfWebWindow.NodeList)) {
    _gpfIsArrayLike = function (obj) {
        return obj instanceof Array
            || obj instanceof _gpfWebWindow.HTMLCollection
            || obj instanceof _gpfWebWindow.NodeList;
    };
} else {
    _gpfIsArrayLike = function (obj) {
        return obj instanceof Array;
    };
}

/**
 * Return true if the provided parameter looks like an array (i.e. it has a property length and each item can be
 * accessed with [])
 *
 * @param {Object} obj
 * @return {Boolean} True if array-like
 */
gpf.isArrayLike = _gpfIsArrayLike;

//endregion

//region gpf.forEach

/**
 * Similar to [].forEach but works on array-like
 *
 * @param {Array} array
 * @param {Function} callback Function to execute for each own property, taking three arguments:
 * - {*} currentValue The current element being processed
 * - {String} property The current index being processed
 * - {Object} array The array currently being processed
 * @param {*} [thisArg=undefined] thisArg Value to use as this when executing callback.
 */
function _gpfArrayForEach(array, callback, thisArg) {
    var index,
        length = array.length;
    for (index = 0; index < length; ++index) {
        callback.apply(thisArg, [array[index], index, array]);
    }
}

/**
 * Similar to [].forEach but for objects
 *
 * @param {Object} object
 * @param {Function} callback Function to execute for each own property, taking three arguments:
 * - {*} currentValue The current element being processed
 * - {String} property The name of the current property being processed
 * - {Object} object The object currently being processed
 * @param {*} [thisArg=undefined] thisArg Value to use as this when executing callback.
 */
function _gpfObjectForEach(object, callback, thisArg) {
    for (var property in object) {
        if (object.hasOwnProperty(property)) {
            callback.apply(thisArg, [object[property], property, object]);
        }
    }
}

/**
 * Executes a provided function once per structure element.
 *
 * @param {Array|Object} structure
 * @param {Function} callback Function to execute for each element, taking three arguments:
 * - {*} currentValue The current element being processed
 * - {String} property The name of the current property or the index being processed
 * - {Array|Object} structure The structure currently being processed
 * @param {*} [thisArg=undefined] thisArg Value to use as this when executing callback.
 */
gpf.forEach = function (structure, callback, thisArg) {
    if (_gpfIsArrayLike(structure)) {
        _gpfArrayForEach(structure, callback, thisArg);
        return;
    }
    /*gpf:inline(object)*/ _gpfObjectForEach(structure, callback, thisArg);
};

//endregion

//region String helpers (will be reused in string module)

/**
 * Capitalize the string
 *
 * @param {String} that
 * @return {String}
 */
function _gpfStringCapitalize (that) {
    return that.charAt(0).toUpperCase() + that.substr(1);
}

/**
 * String replacement using dictionary map
 *
 * @param {String} that
 * @param {Object} replacements map of strings to search and replace
 * @return {String}
 */
function _gpfStringReplaceEx (that, replacements) {
    var result = that;
    /*gpf:inline(object)*/ _gpfObjectForEach(replacements, function (replacement, key) {
        result = result.split(key).join(replacement);
    });
    return result;
}

var
// Dictionary of language to escapes
    _gpfStringEscapes = {

        javascript: {
            "\\": "\\\\",
            "\"": "\\\"",
            "\n": "\\n",
            "\r": "\\r",
            "\t": "\\t"
        },

        xml: {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;"
        },

        html: {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\u00E9": "&eacute;",
            "\u00E8": "&egrave;",
            "\u00EA": "&ecirc;",
            "\u00E1": "&aacute;",
            "\u00E0": "&agrave;"
        }

    };

/**
 * Make the string content compatible with lang
 *
 * @param {String} that
 * @param {String} language
 * @return {String}
 */
function _gpfStringEscapeFor (that, language) {
    var replacements = _gpfStringEscapes[language];
    if (undefined !== replacements) {
        that = _gpfStringReplaceEx(that, replacements);
        if ("javascript" === language) {
            that = "\"" + that + "\"";
        }
    }
    return that;
}

//endregion

//region gpf.extend

/**
 * gpf.extend implementation of assign with no callback
 *
 * @param {*} value
 * @param {String} member
 */
function _gpfAssign (value, member) {
    /*jshint validthis:true*/ // gpf.extend's arguments: this[0] is dst
    this[0][member] = value;
}

/**
 * gpf.extend implementation of assign with a callback
 *
 * @param {*} value
 * @param {String} member
 */
function _gpfAssignOrCall (value, member) {
    /*jshint validthis:true*/ // gpf.extend's arguments
    var dst = this[0],
        overwriteCallback = this[2];
    // TODO: see if in is faster
    if (undefined !== dst[member]) {
        overwriteCallback(dst, member, value);
    } else {
        dst[member] = value;
    }
}

/**
 * Extends the destination object dst by copying own enumerable properties from the src object(s) to dst.
 * If a conflict has to be handled (i.e. member exists on both objects), the overwriteCallback has to handle it.
 *
 * @param {Object} dst
 * @param {Object} src
 * @param {Function} [overwriteCallback=undefined] overwriteCallback
 * @return {Object} the modified dst
 * @chainable
 */
function _gpfExtend (dst, src, overwriteCallback) {
    var callbackToUse;
    if (undefined === overwriteCallback) {
        callbackToUse = _gpfAssign;
    } else {
        _gpfAssert("function" === typeof overwriteCallback, "Expected function");
        callbackToUse = _gpfAssignOrCall;
    }
    /*gpf:inline(object)*/ _gpfObjectForEach(src, callbackToUse, arguments);
    return dst;
}

// @inheritdoc _gpfExtend
gpf.extend = _gpfExtend;

//endregion

//region gpf.value

var
    /**
     * gpf.value handlers per type.
     * Each handler signature is:
     * - {*} value the value to convert
     * - {String} valueType typeof value
     * - {*} defaultValue the expected default value if not convertible
     *
     * @type {Object}
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
            _gpfIgnore(valueType);
            _gpfIgnore(defaultValue);
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
function _gpfValue (value, defaultValue, expectedType) {
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
}

// @inheritdoc _gpfValue
gpf.value = _gpfValue;

//endregion

_gpfExtend(gpf, {

    /**
     * Shallow copy an object
     *
     * @param {Object} obj
     * @return {Object}
     */
    clone: function (obj) {
        // http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object/5344074#5344074
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
                if (dictionary.hasOwnProperty(idx) && dictionary[idx] === value) {
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
        _gpfAssert(array instanceof Array, "gpf.set must be used with an Array");
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
                if (dictionary.hasOwnProperty(idx) && dictionary[idx] === value) {
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
     * Exit function
     *
     * @paran {Number} [exitCode=0] exitCode
     */
    exit: function (exitCode) {
        if (undefined === exitCode) {
            exitCode = 0;
        }
        _gpfExit(exitCode);
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

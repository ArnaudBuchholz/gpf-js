/*#ifndef(UMD)*/
"use strict";
/*global _gpfAssert*/ // Assertion method
/*global _gpfExit*/ // Exit function
/*global _gpfExtend*/ // gpf.extend
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfIsISO8601String*/ // Check if the string is an ISO 8601 representation of a date
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _gpfNodeBuffer2JsArray*/ // Converts a NodeJS buffer into an int array
/*exported _gpfStringCapitalize*/ // Capitalize the string
/*exported _gpfStringEscapeFor*/ // Make the string content compatible with lang
/*exported _gpfStringReplaceEx*/ // String replacement using dictionary map
/*exported _gpfValues*/ // Dictionary of value converters
/*#endif*/

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
    _gpfObjectForEach(replacements, function (replacement, key) {/*gpf:inline(object)*/
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
        }

    };

(function () {
    var escapes = _gpfStringEscapes,
        html = {};
    // Copy XML
    _gpfObjectForEach(escapes.xml, function (escape, key) {
        html[key] = escape;
    });
    // Adds accents escape
    _gpfObjectForEach({
        224: "&agrave;",
        225: "&aacute;",
        232: "&egrave;",
        233: "&eacute;",
        234: "&ecirc;"
    }, function (escape, key) {
        html[String.fromCharCode(key)] = escape;
    });
    escapes.html = html;
}());

/**
 * Make the string content compatible with lang
 *
 * @param {String} that
 * @param {String} language
 * @return {String}
 */
function _gpfStringEscapeFor (that, language) {
    that = _gpfStringReplaceEx(that, _gpfStringEscapes[language]);
    if ("javascript" === language) {
        that = "\"" + that + "\"";
    }
    return that;
}

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
        "boolean": function (value, valueType, defaultValue) {
            _gpfIgnore(defaultValue);
            if ("string" === valueType) {
                if ("yes" === value || "true" === value) {
                    return true;
                }
                return 0 !== parseInt(value, 10);
            }
            if ("number" === valueType) {
                return 0 !== value;
            }
        },

        number:  function (value, valueType, defaultValue) {
            _gpfIgnore(defaultValue);
            if ("string" === valueType) {
                return parseFloat(value);
            }
        },

        string: function (value, valueType, defaultValue) {
            if (value instanceof Date) {
                return value.toISOString();
            }
            _gpfIgnore(valueType, defaultValue);
            return value.toString();
        },

        object: function (value, valueType, defaultValue) {
            if (defaultValue instanceof Date && "string" === valueType && _gpfIsISO8601String(value)) {
                return new Date(value);
            }
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
    var valueType = typeof value,
        result;
    if (!expectedType) {
        expectedType = typeof defaultValue;
    }
    if (expectedType === valueType) {
        return value;
    }
    if ("undefined" === valueType) {
        return defaultValue;
    }
    result = _gpfValues[expectedType](value, valueType, defaultValue);
    if (undefined === result) {
        return defaultValue;
    }
    return result;
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
        return JSON.parse(JSON.stringify(obj));
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
                    delete dictionary[idx];
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
    }

});


/* istanbul ignore next */ // Not testable
/**
 * Exit function
 *
 * @paran {Number} [exitCode=0] exitCode
 */
gpf.exit = function (exitCode) {
    if (undefined === exitCode) {
        exitCode = 0;
    }
    _gpfExit(exitCode);
};

//region NodeJS helpers

/**
 * Converts a NodeJS buffer into a native array containing unsigned
 * bytes
 *
 * @param {Buffer} buffer
 * @return {Number[]}
 */
function _gpfNodeBuffer2JsArray (buffer) {
    var result = [],
        len = buffer.length,
        idx;
    for (idx = 0; idx < len; ++idx) {
        result.push(buffer.readUInt8(idx));
    }
    return result;
}

//endregion

/*#ifndef(UMD)*/

gpf.internals._gpfStringEscapeFor = _gpfStringEscapeFor;
gpf.internals._gpfNodeBuffer2JsArray = _gpfNodeBuffer2JsArray;

/*#endif*/

/**
 * @file JSON.stringify polyfill
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfArrayForEach*/ // Almost like [].forEach (undefined are also enumerated)
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfIsArray*/ // Return true if the parameter is an array
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*global _gpfStringEscapeFor*/ // Make the string content compatible with lang
/*exported _gpfJsonStringifyPolyfill*/ // JSON.stringify polyfill
/*#endif*/

var _gpfJsonStringifyMapping;

function _gpfJsonStringifyGeneric (object) {
    return object.toString();
}

function _gpfJsonStringifyFormat (values, space) {
    if (space) {
        return "\n" + space + values.join(",\n" + space) + "\n";
    }
    return values.join(",");
}

function _gpfJsonStringifyArray (array, replacer, space) {
    var values = [];
    _gpfArrayForEach(array, function (value, index) {
        var replacedValue = replacer(index.toString(), value);
        if (undefined === replacedValue) {
            replacedValue = "null";
        } else {
            replacedValue = _gpfJsonStringifyMapping[typeof replacedValue](replacedValue, replacer, space);
        }
        values.push(replacedValue);
    });
    return "[" + _gpfJsonStringifyFormat(values, space) + "]";
}

function _gpfJsonStringifyObjectMembers (object, replacer, space) {
    var values = [],
        separator;
    if (space) {
        separator = ": ";
    } else {
        separator = ":";
    }
    _gpfObjectForEach(object, function (value, name) {
        var replacedValue = replacer(name, value);
        replacedValue = _gpfJsonStringifyMapping[typeof replacedValue](value, replacer, space);
        if (undefined === replacedValue) {
            return;
        }
        values.push(_gpfStringEscapeFor(name, "javascript") + separator + replacedValue);
    });
    return "{" + _gpfJsonStringifyFormat(values, space) + "}";
}

function _gpfJsonStringifyObject (object, replacer, space) {
    if (object === null) {
        return "null";
    }
    return _gpfJsonStringifyObjectMembers(object, replacer, space);
}

_gpfJsonStringifyMapping = {
    undefined: _gpfEmptyFunc,
    "function": _gpfEmptyFunc,
    number: _gpfJsonStringifyGeneric,
    "boolean": _gpfJsonStringifyGeneric,
    string: function (object) {
        return _gpfStringEscapeFor(object, "javascript");
    },
    object: function (object, replacer, space) {
        if (_gpfIsArray(object)) {
            return _gpfJsonStringifyArray(object, replacer, space);
        }
        return _gpfJsonStringifyObject(object, replacer, space);
    }
};

function _gpfJsonStringifyGetReplacerFunction (replacer) {
    if (typeof replacer === "function") {
        return replacer;
    }
    return function (key, value) {
        return value;
    };
}

function _gpfJsonStringifyCheckReplacer (replacer) {
    if (_gpfIsArray(replacer)) {
        // whitelist
        return function (key, value) {
            if (replacer.indexOf(key) !== -1) {
                return value;
            }
        };
    }
    return _gpfJsonStringifyGetReplacerFunction(replacer);
}

var _GPF_COMPATIBILITY_JSON_STRINGIFY_MAX_SPACE = 10;

function _gpfJsonStringifyCheckSpaceValue (space) {
    if (typeof space === "number") {
        return new Array(Math.min(space, GPF_COMPATIBILITY_JSON_STRINGIFY_MAX_SPACE) + 1).join(" ");
    }
    return space || "";
}

/**
 * JSON.stringify polyfill
 *
 * @param {*} value The value to convert to a JSON string
 * @param {Function|Array} [replacer] A function that alters the behavior of the stringification process, or an array of
 * String and Number objects that serve as a whitelist for selecting/filtering the properties of the value object to be
 * included in the JSON string
 * @param {String|Number} [space] A String or Number object that's used to insert white space into the output JSON
 * string for readability purposes. If this is a Number, it indicates the number of space characters to use as white
 * space; this number is capped at 10 (if it is greater, the value is just 10).
 * @return {String} JSON representation of the value
 * @since 0.1.5
 */
function _gpfJsonStringifyPolyfill (value, replacer, space) {
    return _gpfJsonStringifyMapping[typeof value](value, _gpfJsonStringifyCheckReplacer(replacer),
        _gpfJsonStringifyCheckSpaceValue(space));
}

/*#ifndef(UMD)*/

gpf.internals._gpfJsonStringifyPolyfill = _gpfJsonStringifyPolyfill;

/*#endif*/

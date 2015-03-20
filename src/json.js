/*#ifndef(UMD)*/
"use strict";
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfStringEscapeFor*/ // Make the string content compatible with lang
// /*#endif*/

var
    _gpfJsonStringify,
    _gpfJsonParse;

function _gpfObject2Json (object) {
    var
        isArray,
        results,
        property,
        value;
    isArray = object instanceof Array;
    results = [];
    /*jshint -W089*/
    for (property in object) {
        if ("function" === typeof object[property]) {
            continue; // ignore
        }
        value = _gpfJsonStringify(object[property]);
        if (isArray) {
            results.push(value);
        } else {
            results.push(_gpfStringEscapeFor(property, "javascript")
                + ":" + value);
        }
    }
    if (isArray) {
        return "[" + results.join(",") + "]";
    } else {
        return "{" + results.join(",") + "}";
    }
    /*jshint +W089*/
}

// Need to use typeof as this is a global object
if("undefined" === typeof JSON) {

    _gpfJsonStringify = function (object) {
        var type = typeof object;
        if ("undefined" === type || "function" === type) {
            return;
        } else if ("number" === type || "boolean" === type) {
            return object.toString();
        } else if ("string" === type) {
            return _gpfStringEscapeFor(object, "javascript");
        }
        if (null === object) {
            return "null";
        } else {
            return _gpfObject2Json(object);
        }
    };

    _gpfJsonParse = function (test) {
        return _gpfFunc("return " + test)();
    };

} else {
    _gpfJsonStringify = JSON.stringify;
    _gpfJsonParse = JSON.parse;
}

gpf.json = {

    /**
     * The JSON.stringify() method converts a JavaScript value to a JSON string
     *
     * @param {*} value the value to convert to a JSON string
     * @return {String}
     */
    stringify: _gpfJsonStringify,

    /**
     * The JSON.parse() method parses a string as JSON
     *
     * @param {*} text Tthe string to parse as JSON
     * @return {Object}
     */
    parse: _gpfJsonParse
};



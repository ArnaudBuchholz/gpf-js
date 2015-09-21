/*#ifndef(UMD)*/
"use strict";
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfMainContext*/ // Main context object
/*global _gpfStringEscapeFor*/ // Make the string content compatible with lang
/*exported _gpfJsonParse*/
/*exported _gpfJsonStringify*/
/*#endif*/

var
    /**
     * The JSON.stringify() method converts a JavaScript value to a JSON string
     *
     * @param {*} value the value to convert to a JSON string
     * @return {String}
     */
    _gpfJsonStringify,

    /**
     * The JSON.parse() method parses a string as JSON
     *
     * @param {*} text The string to parse as JSON
     * @return {Object}
     */
    _gpfJsonParse;

function _gpfObject2Json (object) {
    var
        isArray,
        results,
        property,
        value;
    isArray = object instanceof Array;
    results = [];
    /*jshint -W089*/ // Actually, I want all properties
    for (property in object) {
        if ("function" === typeof object[property]) {
            continue; // ignore
        }
        value = _gpfJsonStringify(object[property]);
        if (isArray) {
            results.push(value);
        } else {
            results.push(_gpfStringEscapeFor(property, "javascript") + ":" + value);
        }
    }
    if (isArray) {
        return "[" + results.join(",") + "]";
    } else {
        return "{" + results.join(",") + "}";
    }
    /*jshint +W089*/
}

function _gpfJsonStringifyObject (object) {
    return object.toString();
}

if ("undefined" === typeof JSON) {

    var _gpfJsonStringifyMapping = {
        undefined: _gpfEmptyFunc,
        "function": _gpfEmptyFunc,
        number: _gpfJsonStringifyObject,
        boolean: _gpfJsonStringifyObject,
        string: function (object) {
            return _gpfStringEscapeFor(object, "javascript");
        }
    };

    _gpfJsonStringify = function (object) {
        var mapper = _gpfJsonStringifyMapping[typeof object];
        if (undefined !== mapper) {
            return mapper(object);
        }
        if (null === object) {
            return "null";
        }
        return _gpfObject2Json(object);
    };

    _gpfJsonParse = function (test) {
        return _gpfFunc("return " + test)();
    };

    // Creates the JSON global object
    _gpfMainContext.JSON = {
        stringify: _gpfJsonStringify,
        parse: _gpfJsonParse
    };

} else {

    _gpfJsonStringify = JSON.stringify;
    _gpfJsonParse = JSON.parse;

}

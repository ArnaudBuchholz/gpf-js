/**
 * @file JSON.stringify polyfill
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfArrayForEach*/ // Almost like [].forEach (undefined are also enumerated)
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfMainContext*/ // Main context object
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*global _gpfStringEscapeFor*/ // Make the string content compatible with lang
/*exported _gpfJsonStringifyPolyfill*/
/*#endif*/

function _gpfPreprocessValueForJson (callback) {
    return function (value, index) {
        if ("function" === typeof value) {
            return; // ignore
        }
        callback(_gpfJsonStringifyPolyfill(value), index);
    };
}

function _gpfObject2Json (object) {
    var isArray,
        results;
    isArray = object instanceof Array;
    results = [];
    if (isArray) {
        _gpfArrayForEach(object, _gpfPreprocessValueForJson(function (value) {
            results.push(value);
        }));
        return "[" + results.join(",") + "]";
    }
    _gpfObjectForEach(object, _gpfPreprocessValueForJson(function (value, property) {
        results.push(_gpfStringEscapeFor(property, "javascript") + ":" + value);
    }));
    return "{" + results.join(",") + "}";
}

function _gpfJsonStringifyObject (object) {
    return object.toString();
}

var _gpfJsonStringifyMapping = {
    undefined: _gpfEmptyFunc,
    "function": _gpfEmptyFunc,
    number: _gpfJsonStringifyObject,
    "boolean": _gpfJsonStringifyObject,
    string: function (object) {
        return _gpfStringEscapeFor(object, "javascript");
    },
    object: function (object) {
        if (null === object) {
            return "null";
        }
        return _gpfObject2Json(object);
    }
};

/*jshint -W003*/ // Circular reference _gpfJsonStringifyPolyfill <-> _gpfObject2Json
function _gpfJsonStringifyPolyfill (object) {
    return _gpfJsonStringifyMapping[typeof object](object);
}
/*jshint +W003*/

/*#ifndef(UMD)*/

gpf.internals._gpfJsonStringifyPolyfill = _gpfJsonStringifyPolyfill;

/*#endif*/

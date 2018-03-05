/**
 * @file JSON.parse polyfill
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _gpfJsonParsePolyfill*/
/*#endif*/

function _gpfJsonParseApplyReviver (object, name, reviver) {
    _gpfObjectForEach(object, function (value, property) {
        if ("object" === typeof value) {
            value = _gpfJsonParseApplyReviver(value, property, reviver);
        } else {
            value = reviver(property, value);
        }
        object[property] = value;
    });
    return reviver(name, object);
}

function _gpfJsonParsePolyfill (test, reviver) {
    var result = _gpfFunc("return " + test)();
    if (reviver) {
        return _gpfJsonParseApplyReviver(result, "", reviver);
    }
    return result;
}

/*#ifndef(UMD)*/

gpf.internals._gpfJsonParsePolyfill = _gpfJsonParsePolyfill;

/*#endif*/

/**
 * @file JSON.parse polyfill
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _gpfJsonParsePolyfill*/ // JSON.parse polyfill
/*#endif*/

function _gpfJsonParseApplyReviver (value, name, reviver) {
    if (typeof value === "object") {
        _gpfObjectForEach(value, function (propertyValue, propertyName) {
            value[propertyName] = _gpfJsonParseApplyReviver(propertyValue, propertyName, reviver);
        });
    }
    return reviver(name, value);
}

/**
 * JSON.parse polyfill
 *
 * @param {*} text The string to parse as JSON
 * @param {Function} [reviver] Describes how the value originally produced by parsing is transformed,
 * before being returned
 * @return {Object} Parsed value
 * @since 0.1.5
 */
function _gpfJsonParsePolyfill (text, reviver) {
    var result = _gpfFunc("return " + text)();
    if (reviver) {
        return _gpfJsonParseApplyReviver(result, "", reviver);
    }
    return result;
}

/*#ifndef(UMD)*/

gpf.internals._gpfJsonParsePolyfill = _gpfJsonParsePolyfill;

/*#endif*/

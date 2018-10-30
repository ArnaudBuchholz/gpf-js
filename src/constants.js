/**
 * @file Constants
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfFunc*/ // Function
/*global _gpfAssert*/ // Assertion method
/*global _gpfSyncReadSourceJSON*/ // Reads a source json file (only in source mode)
/*exported _gpfALPHA*/ // Letters (uppercase)
/*exported _gpfAlpha*/ // Letters (lowercase)
/*exported _gpfCreateConstants*/ // Automate constants creation
/*exported _gpfDigit*/ // Digits
/*exported _gpfFunc*/ // Create a new function using the source
/*exported _gpfIdentifierFirstChar*/ // allowed first char in an identifier
/*exported _gpfIdentifierOtherChars*/ // allowed other chars in an identifier
/*exported _gpfIsUnsignedByte*/ // Check if the parameter is an unsigned byte
/*exported _gpfJsCommentsRegExp*/ // Find all JavaScript comments
/*exported _gpfJsKeywords*/ //  List of JavaScript keywords
/*exported _gpfMax31*/ // Max value on 31 bits
/*exported _gpfMax32*/ // Max value on 32 bits
/*jshint -W098*/ // This is a constant list, they won't be used in here
/*eslint-disable no-unused-vars*/
/*eslint-disable no-undef*/
/*jshint -W079*/ // Globals are also copied here
/*#endif*/

/**
 * @namespace gpf
 * @description Root namespace for GPF exports
 * @since 0.1.5
 */

/**
 * @namespace gpf.typedef
 * @description Root namespace for GPF type documentation.
 *
 * Note that this symbol does not exist and is used only for documentation purposes.
 * @since 0.1.5
 */

var
    // Max value on 31 bits
    _gpfMax31 = 0x7FFFFFFF,

    // Max value on 32 bits
    _gpfMax32 = 0xFFFFFFFF,

    // Letters (lowercase)
    _gpfAlpha = "abcdefghijklmnopqrstuvwxyz",

    // Letters (uppercase)
    _gpfALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",

    // Digits
    _gpfDigit = "0123456789",

    // List of allowed first char in an identifier
    _gpfIdentifierFirstChar = _gpfAlpha + _gpfALPHA + "_$",

    // List of allowed other chars in an identifier
    _gpfIdentifierOtherChars = _gpfAlpha + _gpfALPHA + _gpfDigit + "_$",

    // List of JavaScript keywords
    _gpfJsKeywords = _gpfSyncReadSourceJSON("javascript/keywords.json"),

    // Get the name of a function if bound to the call
    _gpfJsCommentsRegExp = new RegExp("//.*$|/\\*(?:[^\\*]*|\\*[^/]*)\\*/", "gm")
;

// Unprotected version of _gpfFunc
function _gpfFuncUnsafe (params, source) {
    var args;
    if (0 === params.length) {
        return _GpfFunc(source);
    }
    args = [].concat(params);
    args.push(source);
    return _GpfFunc.apply(null, args);
}

/*#ifdef(DEBUG)*/

function _gpfFuncImplDocumentError (e, params, source) {
    e.params = params;
    e.source = source;
    return e;
}

/*#endif*/

// Protected version of _gpfFunc
function _gpfFuncImpl (params, source) {
    _gpfAssert("string" === typeof source && source.length, "Source expected (or use _gpfEmptyFunc)");
    /*#ifdef(DEBUG)*/
    try {
        /*#endif*/
        return _gpfFuncUnsafe(params, source);
        /*#ifdef(DEBUG)*/
    } catch (e) {
        throw _gpfFuncImplDocumentError(e, params, source);
    }
    /*#endif*/
}

/**
 * Create a new function from the source and parameter list.
 * In DEBUG mode, it catches any error to log the problem.
 *
 * @param {String[]} [params] params Parameter names list
 * @param {String} source Body of the function
 * @return {Function} New function
 * @since 0.1.5
 */
function _gpfFunc (params, source) {
    if (undefined === source) {
        return _gpfFuncImpl([], params);
    }
    return _gpfFuncImpl(params, source);
}

/**
 * Check if the value is in the range defined by min and max
 *
 * @param {Number} value Value to check
 * @param {Number} min Minimum value (inclusive)
 * @param {Number} max Maximum value (inclusive)
 * @return {Boolean} True if the value is in the range
 * @since 0.1.6
 */
function _gpfIsInRange (value, min, max) {
    return min <= value && value <= max;
}

/**
 * Check if the value is an unsigned byte
 *
 * @param {*} value
 * @returns {Boolean} True if the value is an unsigned byte
 * @since 0.1.6
 */
// Returns true if the value is an unsigned byte
function _gpfIsUnsignedByte (value) {
    return "number" === typeof value && _gpfIsInRange(value, 0, 255);
}

/**
 * @namespace gpf.web
 * @description Root namespace for web-related tools (even if not in a browser)
 * @since 0.1.5
 */
gpf.web = {};

/*#ifndef(UMD)*/

gpf.internals._gpfIsUnsignedByte = _gpfIsUnsignedByte;
gpf.internals._gpfFuncImpl = _gpfFuncImpl;

/*#endif*/

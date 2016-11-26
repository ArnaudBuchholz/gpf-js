/**
 * @file Constants
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfAssert*/ // Assertion method
/*global _gpfHost*/ // Host type
/*exported _gpfALPHA*/ // Letters (uppercase)
/*exported _gpfAlpha*/ // Letters (lowercase)
/*exported _gpfCreateConstants*/ // Automate constants creation
/*exported _gpfDigit*/ // Digits
/*exported _gpfFunc*/ // Create a new function using the source
/*exported _gpfIdentifierFirstChar*/ // allowed first char in an identifier
/*exported _gpfIdentifierOtherChars*/ // allowed other chars in an identifier
/*exported _gpfIsUnsignedByte*/ // Check if the parameter is an unsigned byte
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

    // https://github.com/jshint/jshint/issues/525
    _GpfFunc = Function, // avoid JSHint error

    // Max value on 31 bits
    _gpfMax31 = 0x7FFFFFFF,

    // Max value on 32 bits
    _gpfMax32 =  0xFFFFFFFF,

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

    // TODO update with http://stackoverflow.com/questions/26255/reserved-keywords-in-javascript
    // List of JavaScript keywords
    _gpfJsKeywords = ("break,case,class,catch,const,continue,debugger,default,delete,do,else,export,extends,finally,"
        + "for,function,if,import,in,instanceof,let,new,return,super,switch,this,throw,try,typeof,var,void,while,with,"
        + "yield").split(",")
    ;

// Unsafe version of _gpfFunc
function _gpfFuncUnsafe (params, source) {
    var args;
    if (0 === params.length) {
        return _GpfFunc(source);
    }
    args = [].concat(params);
    args.push(source);
    return _GpfFunc.apply(null, args);
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
        source = params;
        params = [];
    }
    _gpfAssert("string" === typeof source && source.length, "Source expected (or use _gpfEmptyFunc)");
/*#ifdef(DEBUG)*/
    try {
/*#endif*/
        return _gpfFuncUnsafe(params, source);
/*#ifdef(DEBUG)*/
    } catch (e) {
        /* istanbul ignore next */ // Not supposed to happen (not tested)
        console.error("An exception occurred compiling:\r\n" + source);
        /* istanbul ignore next */
        return null;
    }
/*#endif*/
}

// Returns true if the value is an unsigned byte
function _gpfIsUnsignedByte (value) {
    return "number" === typeof value && 0 <= value && value < 256;
}

/* istanbul ignore else */ // Because tested with NodeJS
if (_GPF_HOST.NODEJS === _gpfHost) {

    /**
     * @namespace gpf.node
     * @description Root namespace for NodeJS specifics
     * @since 0.1.5
     */
    gpf.node = {};
}

/**
 * @namespace gpf.web
 * @description Root namespace for web-related tools (even if not in a browser)
 * @since 0.1.5
 */
gpf.web = {};

/*#ifndef(UMD)*/

gpf.internals._gpfIsUnsignedByte = _gpfIsUnsignedByte;

/*#endif*/

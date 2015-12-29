/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST_BROWSER*/ // gpf.HOST_BROWSER
/*global _GPF_HOST_NODEJS*/ // gpf.HOST_NODEJS
/*global _GPF_HOST_PHANTOMJS*/ // gpf.HOST_PHANTOMJS
/*global _GPF_HOST_RHINO*/ // gpf.HOST_RHINO
/*global _GPF_HOST_UNKNOWN*/ // gpf.HOST_UNKNOWN
/*global _GPF_HOST_WSCRIPT*/ // gpf.HOST_WSCRIPT
/*global _gpfAssert*/ // Assertion method
/*exported _GPF_EVENT_ANY*/ // gpf.events.EVENT_ANY
/*exported _GPF_EVENT_CONTINUE*/ // gpf.events.EVENT_CONTINUE
/*exported _GPF_EVENT_DATA*/ // gpf.events.EVENT_DATA
/*exported _GPF_EVENT_END_OF_DATA*/ // gpf.events.EVENT_END_OF_DATA
/*exported _GPF_EVENT_ERROR*/ // gpf.events.EVENT_ERROR
/*exported _GPF_EVENT_READY*/ // gpf.events.EVENT_READY
/*exported _GPF_EVENT_STOP*/ // gpf.events.EVENT_STOP
/*exported _GPF_EVENT_STOPPED*/ // gpf.events.EVENT_STOPPED
/*exported _GPF_FS_TYPE_DIRECTORY*/ // gpf.fs.TYPE_DIRECTORY
/*exported _GPF_FS_TYPE_FILE*/ // gpf.fs.TYPE_FILE
/*exported _GPF_FS_TYPE_NOT_FOUND*/ // gpf.fs.TYPE_NOT_FOUND
/*exported _GPF_FS_TYPE_UNKNOWN*/ // gpf.fs.TYPE_UNKNOWN
/*exported _gpfALPHA*/ // Letters (uppercase)
/*exported _gpfAlpha*/ // Letters (lowercase)
/*exported _gpfCreateConstants*/ // Automate constants creation
/*exported _gpfDigit*/ // Digits
/*exported _gpfFalseFunc*/ // An empty function returning false
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

var
/*#ifdef(RELEASE)*/
    _gpfTypeofBoolean = "boolean",
    _gpfTypeofFunction = "function",
    _gpfTypeofNumber = "number",
    _gpfTypeofObject = "object",
    _gpfTypeofString = "string",
    _gpfTypeofUndefined = "undefined",
    _gpfUndefined = void 0, //eslint-disable-line no-void
    _gpfTrue = !!1, //eslint-disable-line no-implicit-coercion
    _gpfFalse = !_gpfTrue,
    _gpfNull = null,

    /*#define "boolean" _gpfTypeofBoolean*/
    /*#define "function" _gpfTypeofFunction*/
    /*#define "number" _gpfTypeofNumber*/
    /*#define "object" _gpfTypeofObject*/
    /*#define "string" _gpfTypeofString*/
    /*#define "undefined" _gpfTypeofUndefined*/
    /*#define undefined _gpfUndefined*/
    /*#define true _gpfTrue*/
    /*#define false _gpfFalse*/
    /*#define null _gpfNull*/
/*#endif*/

    //region Events

    _GPF_EVENT_ANY                  = "*",
    _GPF_EVENT_ERROR                = "error",
    _GPF_EVENT_READY                = "ready",
    _GPF_EVENT_DATA                 = "data",
    _GPF_EVENT_END_OF_DATA          = "endOfData",
    _GPF_EVENT_CONTINUE             = "continue",
    _GPF_EVENT_STOP                 = "stop",
    _GPF_EVENT_STOPPED              = "stopped",

    //endregion

    //region File system constants

    _GPF_FS_TYPE_NOT_FOUND          = 0,
    _GPF_FS_TYPE_FILE               = 1,
    _GPF_FS_TYPE_DIRECTORY          = 2,
    _GPF_FS_TYPE_UNKNOWN            = 99,

    //endregion

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

// An empty function returning false
function _gpfFalseFunc () {
    return false;
}

/**
 * Create a new function from the source and parameter list.
 * In DEBUG mode, it catches any error to log the problem.
 *
 * @param {String[]} [params=undefined] params Parameter names list
 * @param {String} source
 * @return {Function}
 */
function _gpfFunc (params, source) {
    var args;
    if (undefined === source) {
        source = params;
        params = [];
    }
    _gpfAssert("string" === typeof source && source.length, "Source expected (or use _gpfEmptyFunc)");
    /*#ifdef(DEBUG)*/
    try {
        /*#endif*/
        if (0 === params.length) {
            return _GpfFunc(source);
        }
        args = [].concat(params);
        args.push(source);
        // TODO depending on the environment the result function name is anonymous !
        return _GpfFunc.apply(null, args);
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

/**
 * Add constants to the provided object
 *
 * @param {Object} obj
 * @param {Object} dictionary
 */
function _gpfCreateConstants (obj, dictionary) {
    var key;
    for (key in dictionary) {
        /* istanbul ignore else */
        if (dictionary.hasOwnProperty(key)) {
            /*gpf:constant*/ obj[key] = dictionary[key];
        }
    }
}

_gpfCreateConstants(gpf, {
    HOST_BROWSER: _GPF_HOST_BROWSER,
    HOST_NODEJS: _GPF_HOST_NODEJS,
    HOST_PHANTOMJS: _GPF_HOST_PHANTOMJS,
    HOST_RHINO: _GPF_HOST_RHINO,
    HOST_UNKNOWN: _GPF_HOST_UNKNOWN,
    HOST_WSCRIPT: _GPF_HOST_WSCRIPT
});

/*#ifndef(UMD)*/

gpf.internals._gpfIsUnsignedByte = _gpfIsUnsignedByte;

/*#endif*/

/*#ifndef(UMD)*/
"use strict";
/*jshint -W098*/ // This is a constant list, they won't be used in here
/*jshint -W079*/ // Globals are also copied here
/*#endif*/

/*global gpfSourcesPath*/ // Global source path
/*global _gpfVersion*/ // GPF version
/*global _gpfHost*/ // Host type
/*global _gpfContext*/ // Main context object
/*global _gpfResolveScope*/ // Translate the parameter into a valid scope
/*global _gpfStringCapitalize*/ // Capitalize the string
/*global _gpfStringReplaceEx*/ // String replacement using dictionary map
/*global _gpfStringEscapeFor*/ // Make the string content compatible with lang
/*global _gpfIsArrayLike*/ // Return true if the parameter looks like an array
/*global _gpfInNode*/ // The current host is a nodeJS like
/*global _gpfInBrowser*/ // The current host is a browser like
/*global _gpfWebWindow*/ // Browser window object
/*global _gpfWebDocument*/ // Browser document object
/*global _gpfWebHead*/ // Browser head tag
/*global _gpfMsFSO*/ // Scripting.FileSystemObject activeX
/*global _gpfNodeFS*/ // Node FS module
/*global _gpfFSRead*/ // Phantom/Node File System read text file method (boot)
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfFalseFunc*/ // An empty function returning false
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfAlpha*/ // Letters (lowercase)
/*global _gpfALPHA*/ // Letters (uppercase)
/*global _gpfDigit*/ // Digits
/*global _gpfIdentifierFirstChar*/ // allowed first char in an identifier
/*global _gpfIdentifierOtherChars*/ // allowed other chars in an identifier
/*global _gpfArraySlice*/ // Shortcut on Array.prototype.slice
/*global _gpfDefer*/ // Defer the execution of the callback
/*global _gpfJsonStringify*/ // JSON.stringify
/*global _gpfJsonParse*/ // JSON.parse

var
/*#ifdef(RELEASE)*/
    _gpfTypeofBoolean = "boolean",
    _gpfTypeofFunction = "function",
    _gpfTypeofNumber = "number",
    _gpfTypeofObject = "object",
    _gpfTypeofString = "string",
    _gpfTypeofUndefined = "undefined",
    _gpfUndefined = void 0,
    _gpfTrue = !!1,
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

    // https://github.com/jshint/jshint/issues/525
    _GpfFunc = Function, // avoid JSHint error

    /**
     * An empty function
     *
     * @private
     */
    _gpfEmptyFunc = function () {},

    /**
     * Helper to ignore unused parameter
     *
     * @param {*} param
     * @private
     */
    _gpfIgnore = _gpfEmptyFunc,

    /**
     * An empty function returning false
     *
     * @result {Boolean} False
     * @private
     */
    _gpfFalseFunc = function () {
        return false;
    },

    /**
     * Create a new function using the source
     * In DEBUG mode, it catches any error to signal the problem
     *
     * @param {String} source
     * @returns {Function}
     * @private
     */
    _gpfFunc = function (source) {
/*#ifdef(DEBUG)*/
        try {
/*#endif*/
            gpf.ASSERT("string" === typeof source && source.length,
                "Source expected (or use _gpfEmptyFunc)");
            return new _GpfFunc(source);
/*#ifdef(DEBUG)*/
        } catch (e) {
            console.error("An exception occurred compiling:\r\n" + source);
            return null;
        }
/*#endif*/
    },

    /**
     * Letters (lowercase)
     *
     * @type {String}
     * @private
     */
    _gpfAlpha = "abcdefghijklmnopqrstuvwxyz",

    /**
     * Letters (uppercase)
     *
     * @type {String}
     * @private
     */
    _gpfALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",

    /**
     * Digits
     *
     * @type {String}
     * @private
     */
    _gpfDigit = "0123456789",

    /**
     * List of allowed first char in an identifier
     *
     * @type {String}
     * @private
     */
    _gpfIdentifierFirstChar = _gpfAlpha + _gpfALPHA + "_$",

    /**
     * List of allowed other chars in an identifier
     *
     * @type {String}
     * @private
     */
    _gpfIdentifierOtherChars = _gpfAlpha + _gpfALPHA + _gpfDigit + "_$";

/*#ifndef(UMD)*/
// Mandatory to support boot loading in a browser (removed when UMD is used)
gpf._constants = true;
/*#endif*/
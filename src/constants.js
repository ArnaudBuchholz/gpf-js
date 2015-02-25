/*#ifndef(UMD)*/
"use strict";
/*jshint -W098*/ // This is a constant list, they won't be used in here
/*jshint -W079*/ // Globals are also copied here
/*#endif*/

/*global gpfSourcesPath*/ // Global source path
/*global _gpfVersion*/ // GPF version
/*global _gpfHost*/ // Host type
/*global _gpfContext*/ // Main context object
/*global _gpfInNode*/ // The current host is a nodeJS like
/*global _gpfInBrowser*/ // The current host is a browser like
/*global _gpfWebWindow*/ // Browser window object
/*global _gpfWebDocument*/ // Browser document object
/*global _gpfWebHead*/ // Browser head tag
/*global _gpfMsFSO*/ // Scripting.FileSystemObject activeX
/*global _gpfNodeFS*/ // Node FS module
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfAlpha*/ // Letters (lowercase)
/*global _gpfALPHA*/ // Letters (uppercase)
/*global _gpfDigit*/ // Digits
/*global _gpfArraySlice*/ // Shortcut on Array.prototype.slice

var
    // https://github.com/jshint/jshint/issues/525
    _GpfFunc = Function, // avoid JSHint error

    /**
     * An empty function
     *
     * @private
     */
    _gpfEmptyFunc = function () {},

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
     * @type {string}
     * @private
     */
    _gpfAlpha = "abcdefghijklmnopqrstuvwxyz",

    /**
     * Letters (uppercase)
     *
     * @type {string}
     * @private
     */
    _gpfALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",

    /**
     * Digits
     *
     * @type {string}
     * @private
     */
    _gpfDigit = "0123456789";

/*#ifndef(UMD)*/
// Mandatory to support boot loading in a browser (removed when UMD is used)
gpf._constants = true;
/*#endif*/
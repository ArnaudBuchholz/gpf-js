/*#ifndef(UMD)*/
"use strict";
/*jshint -W098*/
/*jshint -W079*/ // global are also copied here
/*#endif*/

/*global _gpfVersion*/ // GPF version
/*global _gpfHost*/ // Host type
/*global _gpfContext*/ // Main context object
/*global _gpfInNode*/ // The current host is a nodeJS like
/*global _gpfInBrowser*/ // The current host is a browser like
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfAlpha*/ // Letters (lowercase)
/*global _gpfALPHA*/ // Letters (uppercase)
/*global _gpfDigit*/ // Digits

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
            if (!source) {
                return _gpfEmptyFunc;
            } else {
                return new _GpfFunc(source);
            }
/*#ifdef(DEBUG)*/
        } catch (e) {
            console.error("An exception occurred compiling:\r\n"
                + source);
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
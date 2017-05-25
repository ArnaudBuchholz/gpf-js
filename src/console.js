/**
 * @file Console simulation for hosts
 */
/*#ifndef(UMD)*/
"use strict";
/*exported _gpfConsoleGenerate*/ // Generate an object that can be used to simulate console methods
/*#endif*/

/**
 * Generate an object that can be used to simulate console methods
 *
 * @param {Function} outputLine Function that outputs one line
 * @return {Object} object offering console methods
 */
function _gpfConsoleGenerate (outputLine) {
    return {
        log: function (text) {
            outputLine("    " + text);
        },
        info: function (text) {
            outputLine("[?] " + text);
        },
        warn: function (text) {
            outputLine("/!\\ " + text);
        },
        error: function (text) {
            outputLine("(X) " + text);
        }
    };
}

/*#ifndef(UMD)*/

gpf.internals._gpfConsoleGenerate = _gpfConsoleGenerate;

/*#endif*/

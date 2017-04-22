/**
 * @file MS Script host adapter
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfExit:true*/ // Exit function
/*global _gpfHost*/ // Host type
/*global _gpfMainContext*/ // Main context object
/*#endif*/

/*jshint wsh: true*/
/*eslint-env wsh*/
/*eslint-disable new-cap*/

/* istanbul ignore next */ // Tested with NodeJS
if (_GPF_HOST.WSCRIPT === _gpfHost) {

    // Define console APIs
    _gpfMainContext.console = {
        log: function (t) {
            WScript.Echo("    " + t);
        },
        info: function (t) {
            WScript.Echo("[?] " + t);
        },
        warn: function (t) {
            WScript.Echo("/!\\ " + t);
        },
        error: function (t) {
            WScript.Echo("(X) " + t);
        }
    };

    _gpfExit = function (code) {
        WScript.Quit(code);
    };

    /**
     * @namespace gpf.wscript
     * @description Root namespace for WScript specifics
     * @since 0.1.9
     */
    gpf.wscript = {};

}

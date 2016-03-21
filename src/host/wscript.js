/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST_WSCRIPT*/ // gpf.HOST_WSCRIPT
/*global _gpfHost*/ // Host type
/*global _gpfExit:true*/ // Exit function
/*global _gpfMainContext:true*/ // Main context object
/*#endif*/

/*jshint wsh: true*/
/*eslint-env wsh*/
/*eslint-disable new-cap*/

if (_GPF_HOST_WSCRIPT === _gpfHost) {

    _gpfMainContext = (function () {
        return this; //eslint-disable-line no-invalid-this
    }());

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

}

/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST_WSCRIPT*/ // gpf.HOST_WSCRIPT
/*global _gpfHost*/ // Host type
/*global _gpfMainContext*/ // Main context object
/*#endif*/

if (_GPF_HOST_WSCRIPT === _gpfHost) {
    /*eslint-disable new-cap*/

    _gpfMainContext = function () {
        return this;
    }.call(null);

    _gpfExit = function (code) {
        WScript.Quit(code);
    };

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

    /*eslint-enable new-cap*/
}

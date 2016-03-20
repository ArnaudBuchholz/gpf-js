/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST_RHINO*/ // gpf.HOST_RHINO
/*global _gpfHost*/ // Host type
/*global _gpfExit*/ // Exit function
/*global _gpfMainContext*/ // Main context object
/*#endif*/

if (_GPF_HOST_RHINO === _gpfHost) {

    _gpfExit = function (code) {
        java.lang.System.exit(code);
    };

    // Define console APIs
    _gpfMainContext.console = {
        log: function (t) {
            print("    " + t);
        },
        info: function (t) {
            print("[?] " + t);
        },
        warn: function (t) {
            print("/!\\ " + t);
        },
        error: function (t) {
            print("(X) " + t);
        }
    };

}

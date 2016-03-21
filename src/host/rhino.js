/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST_RHINO*/ // gpf.HOST_RHINO
/*global _gpfHost*/ // Host type
/*global _gpfExit:true*/ // Exit function
/*global _gpfMainContext:true*/ // Main context object
/*#endif*/

/*jshint rhino: true*/
/*eslint-env rhino*/

if (_GPF_HOST_RHINO === _gpfHost) {

    _gpfMainContext = (function () {
        return this; //eslint-disable-line no-invalid-this
    }());

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

    _gpfExit = function (code) {
        java.lang.System.exit(code);
    };

}

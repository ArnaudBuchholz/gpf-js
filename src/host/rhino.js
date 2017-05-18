/**
 * @file Rhino host adapter
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfExit:true*/ // Exit function
/*global _gpfHost*/ // Host type
/*global _gpfMainContext*/ // Main context object
/*#endif*/

/*jshint rhino: true*/
/*eslint-env rhino*/

/* istanbul ignore next */ // Tested with NodeJS
if (_GPF_HOST.RHINO === _gpfHost) {

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

    /**
     * @namespace gpf.rhino
     * @description Root namespace for Rhino specifics
     */
    gpf.rhino = {};

}

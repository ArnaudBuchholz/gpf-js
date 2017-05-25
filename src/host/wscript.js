/**
 * @file MS Script host adapter
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfBootImplByHost*/ // Boot host specific implementation per host
/*global _gpfConsoleGenerate*/ // Generate an object that can be used to simulate console methods
/*global _gpfExit:true*/ // Exit function
/*global _gpfMainContext*/ // Main context object
/*#endif*/

/*jshint wsh: true*/
/*eslint-env wsh*/
/*eslint-disable new-cap*/

/**
 * @namespace gpf.wscript
 * @description Root namespace for WScript specifics
 * @since 0.1.9
 */
gpf.wscript = {};

/* istanbul ignore next */ // WScript.Echo can't be bound to WScript and not testable
function _gpfWScriptEcho (text) {
    WScript.Echo(text);
}

_gpfBootImplByHost[_GPF_HOST.WSCRIPT] = function () {

    // Define console APIs
    _gpfMainContext.console = _gpfConsoleGenerate(_gpfWScriptEcho);

    /* istanbul ignore next */ // Not testable
    _gpfExit = function (code) {
        WScript.Quit(code);
    };

};

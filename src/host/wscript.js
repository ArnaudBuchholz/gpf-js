/**
 * @file MS Script host adapter
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfConsoleGenerate*/ // Generate an object that can be used to simulate console methods
/*global _gpfDosPath:true*/ // DOS-like path
/*global _gpfExit:true*/ // Exit function
/*global _gpfHost*/ // Host type
/*global _gpfMainContext*/ // Main context object
/*global _gpfMsFSO:true*/ // Scripting.FileSystemObject activeX
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

/* istanbul ignore next */ // wscript.echo.1
function _gpfWScriptEcho (text) {
    WScript.Echo(text);
}

if (_GPF_HOST.WSCRIPT === _gpfHost) {

    _gpfDosPath = true;

    _gpfMsFSO = new ActiveXObject("Scripting.FileSystemObject");

    // Define console APIs
    _gpfMainContext.console = _gpfConsoleGenerate(_gpfWScriptEcho);

    /* istanbul ignore next */ // exit.1
    _gpfExit = function (code) {
        WScript.Quit(code);
    };

}

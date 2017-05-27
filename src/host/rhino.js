/**
 * @file Rhino host adapter
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

/*jshint rhino: true*/
/*eslint-env rhino*/

/**
 * @namespace gpf.rhino
 * @description Root namespace for Rhino specifics
 */
gpf.rhino = {};

_gpfBootImplByHost[_GPF_HOST.RHINO] = function () {

    // Define console APIs
    _gpfMainContext.console = _gpfConsoleGenerate(print);

    /* istanbul ignore next */ // exit.1
    _gpfExit = function (code) {
        java.lang.System.exit(code);
    };

};

/**
 * @file Java generic host adapter
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfConsoleGenerate*/ // Generate an object that can be used to simulate console methods
/*global _gpfExit:true*/ // Exit function
/*global _gpfMainContext*/ // Main context object
/*exported _gpfJavaHostImpl*/ // Common implementation for Java hosts
/*#endif*/

/*jshint rhino: true*/
/*eslint-env rhino*/

/**
 * @namespace gpf.java
 * @description Root namespace for java specifics
 */
gpf.java = {};

/** Common implementation for Java hosts */
function _gpfJavaHostImpl () {

    // Define console APIs
    _gpfMainContext.console = _gpfConsoleGenerate(print);

    /* istanbul ignore next */ // exit.1
    _gpfExit = function (code) {
        java.lang.System.exit(code);
    };

}

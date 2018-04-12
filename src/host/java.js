/**
 * @file Java generic host adapter
 * @since 0.2.4
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfConsoleGenerate*/ // Generate an object that can be used to simulate console methods
/*global _gpfDosPath:true*/ // DOS-like path
/*global _gpfExit:true*/ // Exit function
/*global _gpfMainContext*/ // Main context object
/*exported _gpfJavaHostImpl*/ // Common implementation for Java hosts
/*#endif*/

/*jshint rhino: true*/
/*eslint-env rhino*/

/**
 * @namespace gpf.java
 * @description Root namespace for java specifics
 * @since 0.2.4
 */
gpf.java = {};

/**
 * Common implementation for Java hosts
 * @since 0.2.4
 */
function _gpfJavaHostImpl () {

    _gpfDosPath = String(java.lang.System.getProperty("file.separator")) === "\\";

    // Define console APIs
    _gpfMainContext.console = _gpfConsoleGenerate(print);

    /* istanbul ignore next */ // exit.1
    _gpfExit = function (code) {
        java.lang.System.exit(code);
    };

}

/**
 * @file Rhino host adapter
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfHost*/ // Host type
/*global _gpfHostJava*/ // Common implementation for Java hosts
/*#endif*/

/**
 * @namespace gpf.rhino
 * @description Root namespace for Rhino specifics
 * @since 0.2.1
 * @deprecated since version 0.2.4, use {@link gpf.java} instead
 */
gpf.rhino = gpf.java;

if (_GPF_HOST.RHINO === _gpfHost) {

    _gpfHostJava();

}

/*#ifndef(UMD)*/

// Generates an empty function to reflect the null complexity of this module
function _gpfHostRhino () {}
/*exported _gpfHostRhino*/

/*#endif*/


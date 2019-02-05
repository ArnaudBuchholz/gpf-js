/**
 * @file Nashorn host adapter
 * @since 0.2.4
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfHost*/ // Host type
/*global _gpfHostJava*/ // Common implementation for Java hosts
/*#endif*/

if (_GPF_HOST.NASHORN === _gpfHost) {

    _gpfHostJava();

}

/*#ifndef(UMD)*/

// Generates an empty function to reflect the null complexity of this module
(function _gpfHostNashorn () {}());

/*#endif*/

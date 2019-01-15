/**
 * @file ES6 compatibility layer
 */
/*#ifndef(UMD)*/
"use strict";
/*exported _gpfDefineES6IsClass*/ // Check if the parameter is an ES6 class
/*#endif*/

function _gpfDefineES6IsClassFunction (value) {
    return value.toString().startsWith("class");
}

/**
 * Check if the parameter is an ES6 class
 *
 * @param {*} value Value to test
 * @return {Boolean} true if the parameter is an ES6 class
 */
function _gpfDefineES6IsClass (value) {
    if (typeof value === "function") {
        return _gpfDefineES6IsClassFunction(value);
    }
    return false;
}

/** @gpf:sameas _gpfDefineES6IsClass */
gpf.define.isES6Class = _gpfDefineES6IsClass;

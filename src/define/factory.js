/**
 * @file Class factory
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfOldClassDefinition*/ // (OLD) GPF class definition
/*exported _gpfDefineFactory*/ // gpf.define factory
/*#endif*/

/**
 * Builds a new class
 *
 * @param {String} name New class contextual name
 * @param {Function} Super Super class
 * @param {Object} definition Class definition
 * @return {Function} New class constructor
 */
function _gpfDefineFactory (name, Super, definition) {
    var classDef = new _GpfOldClassDefinition(name, Super, definition);
    return classDef._Constructor;
}

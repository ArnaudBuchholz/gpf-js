/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // GPF class definition
/*exported _gpfDefineFactory*/ // gpf.define factory
/*#endif*/

/**
 * Builds a new class
 *
 * @param {String} name New class contextual name
 * @param {Function} Base Base class
 * @param {Object} definition Class definition
 * @return {Function} New class constructor
 */
function _gpfDefineFactory (name, Base, definition) {
    var classDef = new _GpfClassDefinition(name, Base, definition);
    return classDef._Constructor;
}

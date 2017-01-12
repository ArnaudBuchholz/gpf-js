/**
 * @file Define Entities
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefineCheckDefinition*/ // Check the dictionary passed to gpf.define
/*exported _gpfDefine*/ // Shortcut for gpf.define
/*#endif*/

/**
 * Define an entity
 *
 * @param {Object} definition Entity definition
 * @return {Function} Entity constructor
 */
function _gpfDefine (definition) {
    _gpfDefineCheckDefinition(definition);
    return function () {};
}

/**
 * @sameas _gpfDefine
 */
gpf.define = _gpfDefine;

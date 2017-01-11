/**
 * @file Define Entities
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*exported _gpfDefine*/ // Shortcut for gpf.define
/*#endif*/

/**
 * Define an entity
 *
 * @param {Object} definition Entity definition
 * @return {Function} Entity constructor
 */
function _gpfDefine (definition) {
    _gpfIgnore(definition);
    // _gpfDefineCheckDefinition(definition);
    return function () {};
}

/**
 * @sameas _gpfDefine
 */
gpf.define = _gpfDefine;

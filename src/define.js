/**
 * @file Entity (class, interface, attribute) definition
 * @since 0.1.6
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
 * @since 0.1.6
 */
function _gpfDefine (definition) {
    _gpfDefineCheckDefinition(definition);
    return function () {};
}

/**
 * @sameas _gpfDefine
 * @since 0.1.6
 */
gpf.define = _gpfDefine;

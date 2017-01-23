/**
 * @file Entity (class, interface, attribute) definition
 * @since 0.1.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefineBuildTypedEntity*/ // Factory to create the correct entity type
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
    var entityDefinition = _gpfDefineBuildTypedEntity(definition);
    return entityDefinition.getInstanceBuilder();
}

/**
 * @sameas _gpfDefine
 * @since 0.1.6
 */
gpf.define = _gpfDefine;

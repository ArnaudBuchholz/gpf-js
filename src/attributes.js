/**
 * @file gpf.attributes.get
 * @since 0.2.4
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefineGetEntityFromBuilder*/ // Retrieves entity definition from instance instance builder
/*exported _gpfAttributesGet*/ // Get attributes defined for the object / class
/*#endif*/

function _gpfAttributesGetFromClass (classConstructor, baseAttributeClass) {
    var entityDefinition = _gpfDefineGetEntityFromBuilder(classConstructor);
    if (entityDefinition) {
        return entityDefinition.getAttributes(baseAttributeClass);
    }
    return {};
}

/**
 * Get attributes defined for the object / class
 *
 * @param {Object|Function} objectOrClass Object instance or class constructor
 * @param {gpf.attributes.Attribute} [baseAttributeClass] Base attribute class used to filter results
 * @return {Object} Dictionary of attributes grouped per members,
 * the special member $attributes is used for attributes set at the class level.
 * @since 0.2.4
 */
function _gpfAttributesGet (objectOrClass, baseAttributeClass) {
    if ("function" !== typeof objectOrClass) {
        objectOrClass = objectOrClass.constructor;
    }
    return _gpfAttributesGetFromClass(objectOrClass, baseAttributeClass);
}

/**
 * @gpf:sameas _gpfAttributesGet
 * @since 0.2.4
 */
gpf.attributes.get = _gpfAttributesGet;

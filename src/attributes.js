/**
 * @file gpf.attributes.get
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAttribute*/ // Shortcut for gpf.attributes.Attribute
/*global _gpfDefineGetEntityFromBuilder*/ // Retrieves entity definition from instance instance builder
/*#endif*/

function _gpfAttributesGetFromClass (classConstructor, baseAttributeClass) {
    var entityDefinition = _gpfDefineGetEntityFromBuilder(classConstructor);
    if (!entityDefinition) {
        return {};
    }
    return entityDefinition._attributes;
}

/**
 * Get attributes defined for the object / $class
 *
 * @param {Object|Function} objectOrClass Object instance or class constructor
 * @param {gpf.attributes.Attribute} [baseAttributeClass] Base attribute class used to filter results
 * @return {Object} Dictionary of attributes grouped per members
 */
function _gpfAttributesGet (objectOrClass, baseAttributeClass) {
    if ("function" !== typeof objectOrClass) {
        objectOrClass = objectOrClass.constructor;
    }
    if (undefined === baseAttributeClass) {
        baseAttributeClass = _gpfAttribute;
    }
    return _gpfAttributesGetFromClass(objectOrClass, baseAttributeClass);
}

/** @gpf:sameas _gpfAttributesGet */
gpf.attributes.get = _gpfAttributesGet;

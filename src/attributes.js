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

function _gpfAttributesGetConstructorFromTruthy (any) {
    if (typeof any !== "object") {
        gpf.Error.invalidParameter();
    }
    return any.constructor;
}

function _gpfAttributesGetConstructorFrom (any) {
    if (any) {
        return _gpfAttributesGetConstructorFromTruthy(any);
    }
    gpf.Error.invalidParameter();
}

/**
 * Get attributes defined for the object / class
 *
 * @param {Object|Function} objectOrClass Object instance or class constructor
 * @param {gpf.attributes.Attribute} [baseAttributeClass] Base attribute class used to filter results
 * @return {Object} Dictionary of attributes grouped per members,
 * the special member $attributes is used for attributes set at the class level.
 * @throws {gpf.Error.InvalidParameter}
 * @since 0.2.4
 */
function _gpfAttributesGet (objectOrClass, baseAttributeClass) {
    var classConstructor;
    if (typeof objectOrClass === "function") {
        classConstructor = objectOrClass;
    } else {
        classConstructor = _gpfAttributesGetConstructorFrom(objectOrClass);
    }
    return _gpfAttributesGetFromClass(classConstructor, baseAttributeClass);
}

/**
 * @gpf:sameas _gpfAttributesGet
 * @since 0.2.4
 */
gpf.attributes.get = _gpfAttributesGet;

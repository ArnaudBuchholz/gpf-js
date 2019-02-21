/**
 * @file ES6 decorator implementation
 * @since 0.2.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfArraySlice*/ // [].slice.call
/*global _gpfAssert*/ // Assertion method
/*global _gpfDefineClassImport*/ // Retrieves or import entity definition from instance builder
/*global _gpfDefClassAttrCheck*/ // Check attribute
/*global _gpfDefClassAttrBuild*/ // _gpfDefClassAttrBuild
/*#endif*/

/**
 * Get attributes defined for the object / class
 *
 * @param {...gpf.attributes.Attribute} attribute Attributes to add
 * @return {Function} decorator function
 * @throws {gpf.Error.InvalidParameter}
 * @since 0.2.9
 */
function _gpfAttributesDecorator () {
    var attributes = _gpfArraySlice(arguments);
    return function (ClassConstructor, member/*, descriptor*/) {
        var entityDefinition = _gpfDefineClassImport(ClassConstructor);
        _gpfAssert(entityDefinition !== null, "Can't access the entity definition");
        if (!entityDefinition._attributes[member]) {
            entityDefinition._attributes[member] = [];
        }
        attributes.forEach(function (attribute) {
            entityDefinition._attributes[member].push(attribute);
            _gpfDefClassAttrCheck.call(entityDefinition, member, attribute);
            _gpfDefClassAttrBuild(member, attribute, ClassConstructor.prototype);
        });
    };
}

/**
 * @gpf:sameas _gpfAttributesDecorator
 * @since 0.2.9
 */
gpf.attributes.decorator = _gpfAttributesDecorator;

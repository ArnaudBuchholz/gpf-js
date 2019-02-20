/**
 * @file ES6 decorator implementation
 * @since 0.2.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfArraySlice*/ // [].slice.call
/*global _gpfAssert*/ // Assertion method
/*global _gpfDefineClassImport*/ // Retrieves or import entity definition from instance builder
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
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
        attributes.forEach(function (attribute) {
            // Add attribute
            _gpfIgnore(ClassConstructor, member, attribute);
        });
    };
}

/**
 * @gpf:sameas _gpfAttributesDecorator
 * @since 0.2.9
 */
gpf.attributes.decorator = _gpfAttributesDecorator;

/**
 * @file ES6 decorator implementation
 * @since 0.2.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfArraySlice*/ // [].slice.call
/*global _gpfDefineClassImport*/ // Retrieves or import entity definition from instance builder
/*global _gpfDefClassAttrCheck*/ // Check attribute
/*global _gpfDefClassAttrBuild*/ // _gpfDefClassAttrBuild
/*global _GPF_DEFINE_CLASS_ATTRIBUTES_NAME*/ // $attributes
/*#endif*/

function _gpfAttributesDecoratorGetAttributesKeyFromMember (member) {
    if (!member) {
        return _GPF_DEFINE_CLASS_ATTRIBUTES_NAME;
    }
    return member;
}

function _gpfAttributesDecoratorProcessEachAttribute (entityDefinition, member, attributes) {
    attributes.forEach(function (attribute) {
        _gpfDefClassAttrCheck.call(entityDefinition, member, attribute);
        _gpfDefClassAttrBuild(member, attribute, entityDefinition._instanceBuilder.prototype);
    });
}

function _gpfAttributesDecoratorAddAttributes (entityDefinition, member, attributes) {
    var key = _gpfAttributesDecoratorGetAttributesKeyFromMember(member);
    entityDefinition._attributes[key] = (entityDefinition._attributes[key] || []).concat(attributes);
    _gpfAttributesDecoratorProcessEachAttribute(entityDefinition, member, attributes);
}

/**
 * Bridge ES6 decorators with attributes
 *
 * @param {...gpf.attributes.Attribute} attribute Attributes to add
 * @return {Function} decorator function
 * @throws {gpf.Error.InvalidParameter}
 * @since 0.2.9
 */
function _gpfAttributesDecorator () {
    var attributes = _gpfArraySlice(arguments);
    return function (ClassConstructor, member/*, descriptor*/) {
        _gpfAttributesDecoratorAddAttributes(_gpfDefineClassImport(ClassConstructor), member, attributes);
    };
}

/**
 * @gpf:sameas _gpfAttributesDecorator
 * @since 0.2.9
 */
gpf.attributes.decorator = _gpfAttributesDecorator;

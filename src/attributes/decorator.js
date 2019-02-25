/**
 * @file ES6 decorator implementation
 * @since 0.2.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_DEFINE_CLASS_ATTRIBUTES_NAME*/ // $attributes
/*global _gpfArraySlice*/ // [].slice.call
/*global _gpfDefClassAttrBuild*/ // _gpfDefClassAttrBuild
/*global _gpfDefClassAttrCheck*/ // Check attribute
/*global _gpfDefineClassImport*/ // Import a class as an entity definition
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfIsClass*/ // Check if the parameter is an ES6 class
/*#endif*/

_gpfErrorDeclare("attributes/decorator", {

    /**
     * ### Summary
     *
     * ES6 class only
     *
     * ### Description
     *
     * Decorators can be used on ES6 class only
     * @since 0.2.9
     */
    es6classOnly: "ES6 class only"

});

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
        if (!_gpfIsClass(ClassConstructor)) {
            gpf.Error.es6classOnly();
        }
        _gpfAttributesDecoratorAddAttributes(_gpfDefineClassImport(ClassConstructor), member, attributes);
    };
}

/**
 * @gpf:sameas _gpfAttributesDecorator
 * @since 0.2.9
 */
gpf.attributes.decorator = _gpfAttributesDecorator;

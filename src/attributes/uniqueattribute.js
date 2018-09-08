/**
 * @file gpf.attributes.UniqueAttribute attribute
 * @since 0.2.8
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAttributesAttributeAttribute*/ // Shortcut for gpf.attributes.AttributeAttribute
/*global _gpfAttributesCheckAppliedOnlyOnce*/ // Ensures attribute is used only once
/*global _gpfDefine*/ // Shortcut for gpf.define
/*exported _gpfAttributesMemberAttribute*/ // Shortcut for gpf.attributes.MemberAttribute
/*#endif*/

/**
 * Attribute to restrict the use of an attribute to only once
 * It throws {@link gpf.Error.UniqueAttributeUsedTwice} if the target attribute is used more than once at any level.
 *
 * @class gpf.attributes.UniqueAttribute
 * @extends gpf.attributes.Attribute
 * @since 0.2.8
 */
var _gpfAttributesUniqueAttribute = _gpfDefine({
    $class: "gpf.attributes.UniqueAttribute",
    $extend: _gpfAttributesAttributeAttribute,
    $singleton: true,

    _targetCheck: function (member, classDefinition, targetAttribute) {
        _gpfAttributesCheckAppliedOnlyOnce(member, classDefinition, targetAttribute.constructor);
    }

});

gpf.attributes.UniqueAttribute = _gpfAttributesUniqueAttribute;

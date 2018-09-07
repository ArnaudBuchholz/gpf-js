/**
 * @file gpf.attributes.UniqueAttribute attribute
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAttributesAttributeAttribute*/ // Shortcut for gpf.attributes.AttributeAttribute
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfAttributesCheckAppliedOnlyOnce*/
/*exported _gpfAttributesMemberAttribute*/ // Shortcut for gpf.attributes.MemberAttribute
/*#endif*/

/**
 * Attribute to restrict the use of an attribute to only once
 * It throws {@link gpf.Error.UniqueAttributeUsedTwice} if the target attribute is used more than once at any level.
 *
 * @class gpf.attributes.UniqueAttribute
 * @extends gpf.attributes.Attribute
 */
var _gpfAttributesUniqueAttribute = _gpfDefine({
    $class: "gpf.attributes.UniqueAttribute",
    $extend: _gpfAttributesAttributeAttribute,

    _targetCheck: function (member, classDefinition, targetAttribute) {
        _gpfAttributesCheckAppliedOnlyOnce(member, classDefinition, targetAttribute.constructor);
    }

});

gpf.attributes.UniqueAttribute = _gpfAttributesUniqueAttribute;

/**
 * @file gpf.attributes.MemberAttribute attribute
 * @since 0.2.8
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAttributesAttributeAttribute*/ // Shortcut for gpf.attributes.AttributeAttribute
/*global _gpfAttributesCheckMemberOnly*/ // Ensures attribute is used only at member level
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*exported _gpfAttributesMemberAttribute*/ // Shortcut for gpf.attributes.MemberAttribute
/*#endif*/

/**
 * Attribute to restrict the use of an attribute to the member level
 * It throws {@link gpf.Error.MemberAttributeOnly} if the target attribute is not used at a member level.
 *
 * @class gpf.attributes.MemberAttribute
 * @extends gpf.attributes.Attribute
 * @gpf:attribute-restriction attribute,class,unique
 * @since 0.2.8
 */
var _gpfAttributesMemberAttribute = _gpfDefine({
    $class: "gpf.attributes.MemberAttribute",
    $extend: _gpfAttributesAttributeAttribute,
    $singleton: true,

    /**
     * @inheritdoc
     * @since 0.2.8
     */
    _targetCheck: function (member, classDefinition) {
        _gpfAttributesCheckMemberOnly(member);
        _gpfIgnore(classDefinition);
    }

});

gpf.attributes.MemberAttribute = _gpfAttributesMemberAttribute;

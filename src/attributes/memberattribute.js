/**
 * @file gpf.attributes.MemberAttribute attribute
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAttributesAttributeAttribute*/
/*global _gpfAttributesCheckMemberOnly*/ // Ensures attribute is used only at member level
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfIgnore*/
/*exported _gpfAttributesMemberAttribute*/ // Shortcut for gpf.attributes.MemberAttribute
/*#endif*/

/**
* Attribute to restrict the use of an attribute to the member level
 *
 * @class gpf.attributes.AttributeForInstanceOf
 */
var _gpfAttributesMemberAttribute = _gpfDefine({
    $class: "gpf.attributes.MemberAttribute",
    $extend: _gpfAttributesAttributeAttribute,

    _targetCheck: function (member, classDefinition) {
        _gpfAttributesCheckMemberOnly(member);
        _gpfIgnore(classDefinition);
    }

});

gpf.attributes.MemberAttribute = _gpfAttributesMemberAttribute;

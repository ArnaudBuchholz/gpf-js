/**
 * @file gpf.attributes.ClassAttribute attribute
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAttributesAttributeAttribute*/
/*global _gpfAttributesCheckClassOnly*/ // Ensures attribute is used only at class level
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfIgnore*/
/*exported _gpfAttributesClassAttribute*/ // Shortcut for gpf.attributes.ClassAttribute
/*#endif*/

/**
 * Attribute to restrict the use of an attribute to the class level
 *
 * @class gpf.attributes.AttributeForInstanceOf
 */
var _gpfAttributesClassAttribute = _gpfDefine({
    $class: "gpf.attributes.ClassAttribute",
    $extend: _gpfAttributesAttributeAttribute,

    _targetCheck: function (member, classDefinition) {
        _gpfAttributesCheckClassOnly(member);
        _gpfIgnore(classDefinition);
    }

});

gpf.attributes.ClassAttribute = _gpfAttributesClassAttribute;

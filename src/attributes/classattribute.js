/**
 * @file gpf.attributes.ClassAttribute attribute
 * @since 0.2.8
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAttributesAttributeAttribute*/ // Shortcut for gpf.attributes.AttributeAttribute
/*global _gpfAttributesCheckClassOnly*/ // Ensures attribute is used only at class level
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*exported _gpfAttributesClassAttribute*/ // Shortcut for gpf.attributes.ClassAttribute
/*#endif*/

/**
 * Attribute to restrict the use of an attribute to the class level.
 * It throws {@link gpf.Error.ClassAttributeOnly} if the target attribute is not used at the class level.
 *
 * @class gpf.attributes.ClassAttribute
 * @extends gpf.attributes.Attribute
 * @since 0.2.8
 */
var _gpfAttributesClassAttribute = _gpfDefine({
    $class: "gpf.attributes.ClassAttribute",
    $extend: _gpfAttributesAttributeAttribute,

    /**
     * @inheritdoc
     * @since 0.2.8
     */
    _targetCheck: function (member, classDefinition) {
        _gpfAttributesCheckClassOnly(member);
        _gpfIgnore(classDefinition);
    }

});

gpf.attributes.ClassAttribute = _gpfAttributesClassAttribute;

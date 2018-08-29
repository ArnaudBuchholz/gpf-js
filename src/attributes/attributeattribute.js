/**
 * @file gpf.attributes.AttributeAttribute attribute base class
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAttribute*/ // Shortcut for gpf.attributes.Attribute
/*global _gpfAttributesCheckAppliedOnBaseClass*/ // Ensures attribute is applied on a specific base class
/*global _gpfAttributesCheckClassOnly*/ // Ensures attribute is used only at class level
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfEmptyFunc*/
/*global _gpfIgnore*/
/*exported _gpfAttributesAttributeAttribute*/ // Shortcut for gpf.attributes.AttributeAttribute
/*#endif*/

/**
 * Attribute to restrict the use of an attribute to the class level
 *
 * @class gpf.attributes.AttributeAttribute
 */
var _gpfAttributesAttributeAttribute = _gpfDefine({
    $class: "gpf.attributes.AttributeAttribute",
    $extend: _gpfAttribute,

    /** @inheritdoc */
    _check: function (member, classDefinition) {
        _gpfAttributesCheckClassOnly(member);
        _gpfAttributesCheckAppliedOnBaseClass(classDefinition, _gpfAttribute);
    },

    _targetCheck: function (member, classDefinition) {
        _gpfIgnore(member, classDefinition);
    },

    _overrideTargetCheck: function (classPrototype) {
        var me = this,
            ownCheck = classPrototype._check || _gpfEmptyFunc;
        classPrototype._check = function (member, classDefinition) {
            me._targetCheck(member, classDefinition);
            ownCheck.call(this, member, classDefinition);
        };
    },

    /** @inheritdoc */
    _build: function (member, classDefinition, classPrototype) {
        _gpfIgnore(member, classDefinition);
        this._overrideTargetCheck(classPrototype);
    }

});

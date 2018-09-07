/**
 * @file gpf.attributes.AttributeAttribute attribute base class
 * @since 0.2.8
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAttribute*/ // Shortcut for gpf.attributes.Attribute
/*global _gpfAttributesCheckAppliedOnBaseClass*/ // Ensures attribute is applied on a specific base class
/*global _gpfAttributesCheckClassOnly*/ // Ensures attribute is used only at class level
/*global _gpfCreateAbstractFunction*/ // Build a function that throws the abstractMethod exception
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*exported _gpfAttributesAttributeAttribute*/ // Shortcut for gpf.attributes.AttributeAttribute
/*#endif*/

/**
 * Attribute to restrict the use of an attribute to the class level
 *
 * @class gpf.attributes.AttributeAttribute
 * @private
 * @since 0.2.8
 */
var _gpfAttributesAttributeAttribute = _gpfDefine({
    $class: "gpf.attributes.AttributeAttribute",
    $extend: _gpfAttribute,
    $abstract: true,

    /**
     * @inheritdoc
     * @since 0.2.8
     */
    _check: function (member, classDefinition) {
        _gpfAttributesCheckClassOnly(member);
        _gpfAttributesCheckAppliedOnBaseClass(classDefinition, _gpfAttribute);
    },

    /**
     * _check method 'injected' onto the target attribute
     *
     * @param {String} member Member name or empty if global to the class
     * @param {_GpfClassDefinition} classDefinition Class definition
     * @param {gpf.attributes.Attribute} targetAttribute Target attribute instance
     * @protected
     * @since 0.2.8
     */
    _targetCheck: _gpfCreateAbstractFunction(3),

    _overrideTargetCheck: function (classPrototype) {
        var me = this,
            initialCheck = classPrototype._check;
        classPrototype._check = function (member, classDefinition) {
            me._targetCheck(member, classDefinition, this);
            initialCheck.call(this, member, classDefinition);
        };
    },

    /**
     * @inheritdoc
     * @since 0.2.8
     */
    _build: function (member, classDefinition, classPrototype) {
        _gpfIgnore(member, classDefinition);
        this._overrideTargetCheck(classPrototype);
    }

});

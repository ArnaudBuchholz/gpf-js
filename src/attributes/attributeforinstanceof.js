/**
 * @file gpf.attributes.AttributeForInstanceOf class
 * @since 0.2.8
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAttributesAttributeAttribute*/ // Shortcut for gpf.attributes.AttributeAttribute
/*global _gpfAttributesCheckAppliedOnBaseClass*/ // Ensures attribute is applied on a specific base class
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*exported _gpfAttributesAttributeForInstanceOf*/ // Shortcut for gpf.attributes.AttributeForInstanceOf
/*#endif*/

var _gpfAttributesAttributeForInstanceOf = _gpfDefine({
    $class: "gpf.attributes.AttributeForInstanceOf",
    $extend: _gpfAttributesAttributeAttribute,

    _BaseClass: null,

    /**
     * Attribute to restrict the use of an attribute to instance of a given class (or child classes).
     * It throws {@link gpf.Error.RestrictedBaseClassAttribute} if the target attribute is not used in a definition that
     * does not extend the expected base class (or any of its child classes).
     *
     * @param {Function} BaseClass The base class restriction
     * @throws {gpf.Error.InvalidParameter}
     * @constructor gpf.attributes.AttributeForInstanceOf
     * @since 0.2.8
     */
    constructor: function (BaseClass) {
        if (typeof BaseClass !== "function") {
            gpf.Error.invalidParameter();
        }
        this._BaseClass = BaseClass;
    },

    _targetCheck: function (member, classDefinition) {
        _gpfIgnore(member);
        _gpfAttributesCheckAppliedOnBaseClass(classDefinition, this._BaseClass);
    }

});

gpf.attributes.AttributeForInstanceOf = _gpfAttributesAttributeForInstanceOf;

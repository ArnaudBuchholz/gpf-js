/**
 * @file gpf.attributes.AttributeForInstanceOf class
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAttributesAttributeAttribute*/
/*global _gpfAttributesCheckAppliedOnBaseClass*/ // Ensures attribute is applied on a specific base class
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfIgnore*/
/*exported _gpfAttributesAttributeForInstanceOf*/ // Shortcut for gpf.attributes.AttributeForInstanceOf
/*#endif*/

/**
 * Attribute to restrict the use of an attribute to instance of a given class
 *
 * @class gpf.attributes.AttributeForInstanceOf
 */
var _gpfAttributesAttributeForInstanceOf = _gpfDefine({
    $class: "gpf.attributes.AttributeForInstanceOf",
    $extend: _gpfAttributesAttributeAttribute,

    _BaseClass: null,

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

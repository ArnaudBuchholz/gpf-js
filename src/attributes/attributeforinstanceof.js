/**
 * @file gpf.attributes.AttributeForInstanceOf class
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAttribute*/ // Shortcut for gpf.attributes.Attribute
/*global _gpfAttributesCheckClassOnly*/ // Ensures attribute is used only at class level
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
    $extend: _gpfAttribute,

    _BaseClass: null,

    constructor: function (BaseClass) {
        if (typeof BaseClass !== "function") {
            gpf.Error.invalidParameter();
        }
        this._BaseClass = BaseClass;
    },

    /** @inheritdoc */
    _check: function (member, classDefinition) {
        _gpfIgnore(classDefinition);
        _gpfAttributesCheckClassOnly(member);
    }

});

gpf.attributes.AttributeForInstanceOf = _gpfAttributesAttributeForInstanceOf;

/**
 * @file gpf.attributes.AttributeForInstanceOf class
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAttribute*/ // Shortcut for gpf.attributes.Attribute
/*global _gpfDefine*/ // Shortcut for gpf.define

/*exported _gpfAttributesAttributeForInstanceOf*/ // Shortcut for gpf.attributes.AttributeForInstanceOf
/*#endif*/

/**
 * Base class for all attributes
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
    }

});

gpf.attributes.AttributeForInstanceOf = _gpfAttributesAttributeForInstanceOf;

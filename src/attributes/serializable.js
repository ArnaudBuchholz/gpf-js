/**
 * @file gpf.attributes.Serializable attribute class
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfAttribute*/ // Shortcut for gpf.attributes.Attribute
/*global _gpfSerialPropertyCheck*/ // Check that the serializable property definition is valid
/*exported _gpfAttributesSerializable*/ // Shortcut for gpf.attributes.Serializable
/*#endif*/

var _gpfAttributesSerializable = _gpfDefine({
    $class: "gpf.attributes.Serializable",
    $extend: _gpfAttribute,
    // $attributes: [new gpf.attributes.MemberAttribute(), new gpf.attributes.Unique()]

    /**
     * Serializable property definition
     *
     * @type {gpf.typedef.serializableProperty}
     */
    _property: null,

    /**
     *
     * @param {gpf.typedef.serializableProperty} property
     * @constructor gpf.attributes.Serializable
     */
    constructor: function (property) {
        _gpfSerialPropertyCheck(property);
        this._property = property;
    },

    /** gpf:read _property */
    getProperty: function () {
        return Object.create(this._property);
    }

});

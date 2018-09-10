/**
 * @file gpf.attributes.Serializable attribute class
 * @since 0.2.8
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAttribute*/ // Shortcut for gpf.attributes.Attribute
/*global _gpfAttributesMemberAttribute*/ // Shortcut for gpf.attributes.MemberAttribute
/*global _gpfAttributesUniqueAttribute*/ // Shortcut for gpf.attributes.UniqueAttribute
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfSerialPropertyCheck*/ // Check that the serializable property definition is valid
/*exported _gpfAttributesSerializable*/ // Shortcut for gpf.attributes.Serializable
/*#endif*/

var _gpfAttributesSerializable = _gpfDefine({
    $class: "gpf.attributes.Serializable",
    $extend: _gpfAttribute,
    $attributes: [new _gpfAttributesMemberAttribute(), new _gpfAttributesUniqueAttribute()],

    /**
     * Serializable property definition
     *
     * @type {gpf.typedef.serializableProperty}
     * @since 0.2.8
     */
    _property: null,

    /**
     *
     * @param {gpf.typedef.serializableProperty} property Serializable property definition
     * @throws {gpf.Error.InvalidSerialName}
     * @throws {gpf.Error.InvalidSerialType}
     * @throws {gpf.Error.InvalidSerialRequired}
     * @constructor gpf.attributes.Serializable
     * @extends gpf.attributes.Attribute
     * @since 0.2.8
     */
    constructor: function (property) {
        this._property = _gpfSerialPropertyCheck(property);
    },

    /**
     * @gpf:read _property
     * @since 0.2.8
     */
    getProperty: function () {
        return Object.create(this._property);
    }

});

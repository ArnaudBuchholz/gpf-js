/**
 * @file Serialization types
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*exported _gpfSerialPropertyCheck*/ // Check that the serializable property definition is valid
/*#endif*/

_gpfErrorDeclare("serial/property", {

    /**
     * ### Summary
     *
     * Name of serializable property is invalid
     *
     * ### Description
     *
     * Name should respect the pattern `/^[a-z][a-z0-9_]*$/i`
     */
    "invalidSerialName": "Invalid serial name",

    /**
     * ### Summary
     *
     * Type of serializable property is invalid
     *
     * ### Description
     *
     * Type should be one of the enumeration {@see gpf.serial.types}
     */
    "invalidSerialType": "Invalid serial type"
});

/**
 * @namespace gpf.serial
 * @description Root namespace for the serialization helpers.
 */
gpf.serial = {};

/**
 * Filter property read specification
 *
 * @typedef gpf.typedef.serializableProperty
 * @property {String} name Name of the property
 * @property {gpf.serial.types} type Type of the property
 * @see gpf.attributes.Serializable
 */

/**
 * Serializable types constants
 * @since 0.1.5
 */
var _GPF_SERIAL_TYPE = {
    STRING: "string"
};

/**
 * Serializable types enumeration
 *
 * @enum {String}
 * @readonly
 */
gpf.serial.types = {
    /**
     * String, might be limited by {@see gpf.typedef.serializableProperty.length}
     */
    string: _GPF_SERIAL_TYPE.STRING
};

function _gpfSerialPropertyCheckNameType (name) {
    if (typeof name !== "string") {
        gpf.Error.invalidSerialName();
    }
}

var _gpfSerialPropertyNameRegExp = new RegExp("^[a-z][a-z0-9_]*$", "i");

function _gpfSerialPropertyCheckNameRegExp (name) {
    if (!name.match(_gpfSerialPropertyNameRegExp)) {
        gpf.Error.invalidSerialName();
    }
}

function _gpfSerialPropertyCheckName (name) {
    _gpfSerialPropertyCheckNameType(name);
    _gpfSerialPropertyCheckNameRegExp(name);
}

var _gpfSerialPropertyTypes = Object.keys(_GPF_SERIAL_TYPE).map(function (name) {
    return _GPF_SERIAL_TYPE[name];
});

function _gpfSerialPropertyCheckType (type) {
    if (_gpfSerialPropertyTypes.indexOf(type) === -1) {
        gpf.Error.invalidSerialType();
    }
}

/**
 * Check that the serializable property definition is valid
 *
 * @param {gpf.typedef.serializableProperty} property Property definition to validate
 * @throws {gpf.Error.InvalidSerialName}
 * @throws {gpf.Error.InvalidSerialType}
 */
function _gpfSerialPropertyCheck (property) {
    _gpfSerialPropertyCheckName(property.name);
    _gpfSerialPropertyCheckType(property.type);
}

/*#ifndef(UMD)*/

gpf.internals._gpfSerialPropertyCheck = _gpfSerialPropertyCheck;

/*#endif*/

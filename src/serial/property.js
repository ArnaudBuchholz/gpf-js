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
    "invalidSerialType": "Invalid serial type",

    /**
     * ### Summary
     *
     * Required of serializable property is invalid
     *
     * ### Description
     *
     * Required can either be true or false
     */
    "invalidSerialRequired": "Invalid serial required"

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
 * @property {gpf.serial.types} [type=gpf.serial.types.string] Type of the property
 * @property {Boolean} [required=false] Property must have a value
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

function _gpfSerialPropertyCheckName (property) {
    _gpfSerialPropertyCheckNameType(property.name);
    _gpfSerialPropertyCheckNameRegExp(property.name);
}

var _gpfSerialPropertyTypes = Object.keys(_GPF_SERIAL_TYPE).map(function (name) {
    return _GPF_SERIAL_TYPE[name];
});

function _gpfSerialPropertyCheckTypeExists (type) {
    if (_gpfSerialPropertyTypes.indexOf(type) === -1) {
        gpf.Error.invalidSerialType();
    }
}

function _gpfSerialPropertyCheckType (property) {
    if (undefined === property.type) {
        property.type = _GPF_SERIAL_TYPE.STRING;
    } else {
        _gpfSerialPropertyCheckTypeExists(property.type);
    }
}

function _gpfSerialPropertyCheckRequiredType (required) {
    if (typeof required !== "boolean") {
        gpf.Error.invalidSerialRequired();
    }
}

function _gpfSerialPropertyCheckRequired (property) {
    if (undefined === property.required) {
        property.required = false;
    } else {
        _gpfSerialPropertyCheckRequiredType(property.required);
    }
}

/**
 * Check that the serializable property definition is valid
 *
 * @param {gpf.typedef.serializableProperty} property Property definition to validate
 * @return {gpf.typedef.serializableProperty} Completed property definition
 * @throws {gpf.Error.InvalidSerialName}
 * @throws {gpf.Error.InvalidSerialType}
 */
function _gpfSerialPropertyCheck (property) {
    property = Object.assign(property); // Clone
    _gpfSerialPropertyCheckName(property);
    _gpfSerialPropertyCheckType(property);
    _gpfSerialPropertyCheckRequired(property);
    return property;
}

/*#ifndef(UMD)*/

gpf.internals._gpfSerialPropertyCheck = _gpfSerialPropertyCheck;

/*#endif*/

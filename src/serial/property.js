/**
 * @file Serialization types
 * @since 0.2.8
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
     * @since 0.2.8
     */
    invalidSerialName: "Invalid serial name",

    /**
     * ### Summary
     *
     * Type of serializable property is invalid
     *
     * ### Description
     *
     * Type should be one of the enumeration {@see gpf.serial.types}
     * @since 0.2.8
     */
    invalidSerialType: "Invalid serial type",

    /**
     * ### Summary
     *
     * Required of serializable property is invalid
     *
     * ### Description
     *
     * Required can either be true or false
     * @since 0.2.8
     */
    invalidSerialRequired: "Invalid serial required"

});

/**
 * @namespace gpf.serial
 * @description Root namespace for the serialization helpers.
 * @since 0.2.8
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
 * @since 0.2.8
 */

/**
 * Serializable types constants
 */
var _GPF_SERIAL_TYPE = {
    STRING: "string",
    INTEGER: "integer",
    DATETIME: "datetime"
};

/**
 * Serializable types enumeration
 *
 * @enum {String}
 * @readonly
 * @since 0.2.8
 */
gpf.serial.types = {
    /**
     * String
     * @since 0.2.8
     */
    string: _GPF_SERIAL_TYPE.STRING,

    /**
     * Integer
     * @since 0.2.8
     */
    integer: _GPF_SERIAL_TYPE.INTEGER,

    /**
     * Date/Time
     * @since 0.2.8
     */
    datetime: _GPF_SERIAL_TYPE.DATETIME
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
 * Check that the serializable property definition is valid.
 * Returns a copy with defaulted properties.
 *
 * @param {gpf.typedef.serializableProperty} property Property definition to validate
 * @return {gpf.typedef.serializableProperty} Completed property definition
 * @throws {gpf.Error.InvalidSerialName}
 * @throws {gpf.Error.InvalidSerialType}
 * @throws {gpf.Error.InvalidSerialRequired}
 * @since 0.2.8
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

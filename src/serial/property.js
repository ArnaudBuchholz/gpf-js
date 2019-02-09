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
     * Serializable property 'name' is invalid
     *
     * ### Description
     *
     * name should respect the pattern `/^[a-z][a-z0-9_]*$/i`
     * @since 0.2.8
     */
    invalidSerialName: "Invalid serial name",

    /**
     * ### Summary
     *
     * Serializable property 'type' is invalid
     *
     * ### Description
     *
     * Value should be one of the enumeration {@see gpf.serial.types}
     * @since 0.2.8
     */
    invalidSerialType: "Invalid serial type",

    /**
     * ### Summary
     *
     * Serializable property 'required' is invalid
     *
     * ### Description
     *
     * Value can either be true or false
     * @since 0.2.8
     */
    invalidSerialRequired: "Invalid serial required",

    /**
     * ### Summary
     *
     * Serializable property 'readOnly' is invalid
     *
     * ### Description
     *
     * Value can either be true or false
     * @since 0.2.9
     */
    invalidSerialReadOnly: "Invalid serial readOnly"

});

/**
 * @namespace gpf.serial
 * @description Root namespace for the serialization helpers.
 * @since 0.2.8
 */
gpf.serial = {};

/**
 * Serializable property specification
 *
 * @typedef gpf.typedef.serializableProperty
 * @property {String} name Name of the property
 * @property {gpf.serial.types} [type=gpf.serial.types.string] Type of the property
 * @property {Boolean} [required=false] Property must have a value
 * @property {Boolean} [readOnly=undefined] Property is read only. When undefined, and if the host supports
 * [Object.getOwnPropertyDescriptors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/
 * Object/getOwnPropertyDescriptors), the framework will check if the property can be set.
 * @see gpf.attributes.Serializable
 * @since 0.2.8
 */

/**
 * Serializable types constants
 * @since 0.2.8
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
    if (!_gpfSerialPropertyTypes.includes(type)) {
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

function _gpfSerialPropertyCheckBooleanType (value, exception) {
    if (typeof value !== "boolean") {
        exception();
    }
}

function _gpfSerialPropertyCheckRequired (property) {
    if (undefined === property.required) {
        property.required = false;
    } else {
        _gpfSerialPropertyCheckBooleanType(property.required, gpf.Error.invalidSerialRequired);
    }
}

function _gpfSerialPropertyCheckReadOnly (property) {
    if (undefined !== property.readOnly) {
        _gpfSerialPropertyCheckBooleanType(property.readOnly, gpf.Error.invalidSerialReadOnly);
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
    var clonedProperty = Object.assign(property);
    [
        _gpfSerialPropertyCheckName,
        _gpfSerialPropertyCheckType,
        _gpfSerialPropertyCheckRequired,
        _gpfSerialPropertyCheckReadOnly
    ].forEach(function (checkFunction) {
        checkFunction(clonedProperty);
    });
    return clonedProperty;
}

/*#ifndef(UMD)*/

gpf.internals._gpfSerialPropertyCheck = _gpfSerialPropertyCheck;

/*#endif*/

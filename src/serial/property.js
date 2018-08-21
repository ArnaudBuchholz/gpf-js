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
     * Name should respect the pattern //i
     */
    "invalidSerialName": "Invalid serial name"

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
 * @see gpf.attributes.Serializable
 */

/**
 * Serializable types constants
 * @since 0.1.5
 */
_GPF_SERIAL_TYPE = {
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
        gpf.error.invalidSerialName();
    }
}

function _gpfSerialPropertyCheckName (name) {
    _gpfSerialPropertyCheckNameType(name);
    _gpfSerialPropertyCheckNameRegExp(name);
}

/**
 * Check that the serializable property definition is valid
 *
 * @param {gpf.typedef.serializableProperty} property
 * @throws {}
 */
function _gpfSerialPropertyCheck (property) {
    _gpfSerialPropertyCheckName(property.name);
}

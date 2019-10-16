/**
 * @file From raw serialization
 * @since 0.2.8
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*global _gpfSerialGetWithReadOnly*/ // Same as _gpfSerialGet but on instances and resolving readOnly
/*global _gpfSerialIdentityConverter*/ // Identity converter, returns passed value
/*#endif*/

function _gpfSerialRawFromPropertyValue (instance, member, value) {
    if (value !== undefined) {
        instance[member] = value;
    }
}

function _gpfSerialRawFromProperties (instance, raw, converter) {
    var properties = _gpfSerialGetWithReadOnly(instance);
    _gpfObjectForEach(properties, function (property, member) {
        if (Object.prototype.hasOwnProperty.call(raw, property.name)) {
            _gpfSerialRawFromPropertyValue(instance, member,
                converter.call(instance, raw[property.name], property, member));
        }
    });
}

function _gpfSerialRawFrom (instance, raw, converter) {
    _gpfSerialRawFromProperties(instance, raw, converter || _gpfSerialIdentityConverter);
}

/**
 * Initialize the given instance from a dictionary containing serializable properties' value.
 *
 * @param {Object} instance Instance of a class containing {@ling gpf.attributes.Serializable} attributes
 * @param {Object} raw Dictionary with all serializable properties (indexed by property names)
 * @param {gpf.typedef.serialConverter} [converter] Converter function for properties' value
 * @return {Object} instance
 * @throws {gpf.Error.InvalidParameter}
 * @since 0.2.8
 */
gpf.serial.fromRaw = function (instance, raw, converter) {
    if (typeof instance === "function") {
        gpf.Error.invalidParameter();
    }
    _gpfSerialRawFrom(instance, raw, converter);
    return instance;
};

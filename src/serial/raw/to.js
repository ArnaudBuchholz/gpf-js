/**
 * @file To raw serialization
 * @since 0.2.8
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*global _gpfSerialGetWithReadOnly*/ // Same as _gpfSerialGet but on instances and resolving readOnly
/*global _gpfSerialIdentityConverter*/ // Identity converter, returns passed value
/*#endif*/

function _gpfSerialRawToPropertyValue (result, member, value) {
    if (value !== undefined) {
        result[member] = value;
    }
}

function _gpfSerialRawToProperties (instance, properties, converter) {
    var result = {};
    _gpfObjectForEach(properties, function (property, member) {
        _gpfSerialRawToPropertyValue(result, property.name,
            converter.call(instance, instance[member], property, member));
    });
    return result;
}

function _gpfSerialRawTo (instance, converter) {
    return _gpfSerialRawToProperties(instance, _gpfSerialGetWithReadOnly(instance),
        converter || _gpfSerialIdentityConverter);
}

/**
 * Converts the given instance a simpler dictionary containing only serializable properties' value.
 *
 * @param {Object} instance Instance of a class containing {@ling gpf.attributes.Serializable} attributes
 * @param {gpf.typedef.serialConverter} [converter] Converter function for properties' value
 * @return {Object} A dictionary with all serializable properties (indexed by property names)
 * @throws {gpf.Error.InvalidParameter}
 * @since 0.2.8
 */
gpf.serial.toRaw = function (instance, converter) {
    if (typeof instance === "function") {
        gpf.Error.invalidParameter();
    }
    return _gpfSerialRawTo(instance, converter);
};

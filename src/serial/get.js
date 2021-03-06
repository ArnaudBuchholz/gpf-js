/**
 * @file Serializable properties helper
 * @since 0.2.8
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_START*/ // 0
/*global _gpfAttributesGet*/ // Get attributes defined for the object / class
/*global _gpfAttributesSerializable*/ // Shortcut for gpf.attributes.Serializable
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _gpfSerialGet*/ // Collect gpf.typedef.serializableProperty defined for the object / class
/*exported _gpfSerialGetWithReadOnly*/ // Same as _gpfSerialGet but on instances and resolving readOnly
/*#endif*/

/**
 * Collect {@link gpf.typedef.serializableProperty} defined for the object / class
 *
 * @param {Object|Function} objectOrClass Object instance or class constructor
 * @return {Object} Dictionary of {@link gpf.typedef.serializableProperty} index by member
 * @since 0.2.8
 */
function _gpfSerialGet (objectOrClass) {
    var serializable = _gpfAttributesGet(objectOrClass, _gpfAttributesSerializable),
        properties = {};
    _gpfObjectForEach(serializable, function (attributes, member) {
        properties[member] = attributes[_GPF_START].getProperty();
    });
    return properties;
}

function _gpfSerialGetResolveReadOnlyCheckDescriptor (prototype, member) {
    var descriptor = Object.getOwnPropertyDescriptor(prototype, member);
    if (descriptor) {
        return !descriptor.writable;
    }
}

var _gpfSerialGetResolveReadOnly;

if (Object.getOwnPropertyDescriptor) {

    _gpfSerialGetResolveReadOnly = function (instance, member) {
        var prototype = instance,
            readOnly;
        while (prototype !== Object && readOnly === undefined) {
            readOnly = _gpfSerialGetResolveReadOnlyCheckDescriptor(prototype, member);
            prototype = Object.getPrototypeOf(prototype);
        }
        return readOnly || false;
    };

} else {

    _gpfSerialGetResolveReadOnly = function () {
        return false;
    };

}

/**
 * Same as {@link gpf.serial.get} but on instances and resolving readOnly
 *
 * @param {Object} instance Object instance or class constructor
 * @return {Object} Dictionary of {@link gpf.typedef.serializableProperty} index by member
 * @since 0.2.9
 */
function _gpfSerialGetWithReadOnly (instance) {
    var properties = _gpfSerialGet(instance);
    _gpfObjectForEach(properties, function (property, member) {
        if (property.readOnly === undefined) {
            property.readOnly = _gpfSerialGetResolveReadOnly(instance, member);
        }
    });
    return properties;
}

/**
 * @gpf:sameas _gpfSerialGet
 * @since 0.2.8
 */
gpf.serial.get = _gpfSerialGet;

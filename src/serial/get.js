/**
 * @file Serializable properties helper
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAttributesGet*/ // Get attributes defined for the object / class
/*global _gpfAttributesSerializable*/ // Shortcut for gpf.attributes.Serializable
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _gpfSerialGet*/ // Collect gpf.typedef.serializableProperty defined for the object / class
/*#endif*/

/**
 * Collect {@link gpf.typedef.serializableProperty} defined for the object / class
 *
 * @param {Object|Function} objectOrClass Object instance or class constructor
 * @return {Object} Dictionary of {@link gpf.typedef.serializableProperty} index by member
 */
function _gpfSerialGet (objectOrClass) {
    var serializable = _gpfAttributesGet(objectOrClass, _gpfAttributesSerializable),
        properties = {};
    _gpfObjectForEach(serializable, function (attributes, member) {
        properties[member] = attributes[0].getProperty();
    });
    return properties;
}

/** @gpf:sameas _gpfSerialGet*/
gpf.serial.get = _gpfSerialGet;

/**
 * @file From raw serialization
 * @since 0.2.8
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfFunctionBuild*/ // Build function from description and context
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*global _gpfSerialGet*/ // Collect gpf.typedef.serializableProperty defined for the object / class
/*#endif*/

function _gpfSerialFromRawBuildMembers (SerializableClass) {
    var properties = _gpfSerialGet(SerializableClass),
        members = [];
    _gpfObjectForEach(properties, function (property, member) {
        members.push("\tif(raw.hasOwnProperty(\"" + property.name + "\")) instance." + member
            + " = raw." + property.name + ";");
    });
    return members;
}

function _gpfSerialFromRawBuild (SerializableClass) {
    return _gpfFunctionBuild({
        body: "return function (instance, raw) {\n"
            + "\tif (!(instance instanceof SerializableClass)) gpf.Error.invalidParameter();\n"
            + _gpfSerialFromRawBuildMembers(SerializableClass).join("\n")
            + "};",
        parameters: ["SerializableClass"]
    })(SerializableClass);
}

/**
 * Generates a function aimed to initialize instances of the given class from a dictionary containing only
 * serializable properties' value.
 *
 * @param {Function} SerializableClass Class containing {@ling gpf.attributes.Serializable} attributes
 * @return {Function} A function that accepts only instances of the given class and a dictionary with all
 * serializable properties (indexed by member names)
 * @throws {gpf.Error.InvalidParameter}
 * @since 0.2.8
 */
gpf.serial.buildFromRaw = function (SerializableClass) {
    if ("function" !== typeof SerializableClass) {
        gpf.Error.invalidParameter();
    }
    return _gpfSerialFromRawBuild(SerializableClass);
};

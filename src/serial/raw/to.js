/**
 * @file To raw serialization
 * @since 0.2.8
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfFunctionBuild*/ // Build function from description and context
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*global _gpfSerialGet*/ // Collect gpf.typedef.serializableProperty defined for the object / class
/*#endif*/

function _gpfSerialToRawBuildMembers (SerializableClass) {
    var properties = _gpfSerialGet(SerializableClass),
        members = [];
    _gpfObjectForEach(properties, function (property, member) {
        members.push("\t\t" + property.name + ": instance." + member);
    });
    return members;
}

function _gpfSerialToRawBuild (SerializableClass) {
    return _gpfFunctionBuild({
        body: "return function (instance) {\n"
            + "\tif (!(instance instanceof SerializableClass)) gpf.Error.invalidParameter();\n\treturn {\n"
            + _gpfSerialToRawBuildMembers(SerializableClass).join(",")
            + "\t};\n};",
        parameters: ["SerializableClass"]
    })(SerializableClass);
}

/**
 * Generates a function aimed to converts instances of the given class to a simpler dictionary containing only
 * serializable properties' value.
 *
 * @param {Function} SerializableClass Class containing {@ling gpf.attributes.Serializable} attributes
 * @return {Function} A function that accepts only instances of the given class and returns a dictionary with all
 * serializable properties (indexed by member names)
 * @throws {gpf.Error.InvalidParameter}
 * @since 0.2.8
 */
gpf.serial.buildToRaw = function (SerializableClass) {
    if ("function" !== typeof SerializableClass) {
        gpf.Error.invalidParameter();
    }
    return _gpfSerialToRawBuild(SerializableClass);
};

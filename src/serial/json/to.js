/**
 * @file to JSON serialization
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAttributesGet*/ // Get attributes defined for the object / class
/*global _gpfAttributesSerializable*/ // Shortcut for gpf.attributes.Serializable
/*global _gpfFunctionBuild*/ // Build function from description and context
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*#endif*/

function _gpfSerialJSONBuildMembers (SerializableClass) {
    var serial = _gpfAttributesGet(SerializableClass, _gpfAttributesSerializable),
        members = [];
    _gpfObjectForEach(serial, function (attributes, member) {
        var property = attributes[0].getProperty();
        members.push("\t\t" + property.name + ": instance." + member);
    });
    return members;
}

function _gpfSerialJSONBuild (SerializableClass) {
    return _gpfFunctionBuild({
        body: "return function (instance) {\n"
            + "\tif (!(instance instanceof SerializableClass)) gpf.Error.invalidParameter();\n"
            + "\treturn {\n"
            + _gpfSerialJSONBuildMembers(SerializableClass).join(",")
            + "\t};"
            + "};",
        parameters: ["SerializableClass"]
    })(SerializableClass);
}

/**
 * Generates
 *
 * @param {Function} SerializableClass Class containing {@ling gpf.attributes.Serializable} attributes
 * @return {Function} A function that accepts only instances of the given class and returns a dictionary with all
 * serializable properties
 */
gpf.serial.buildToJSON = function (SerializableClass) {
    if ("function" !== typeof SerializableClass) {
        gpf.Error.invalidParameter();
    }
    return _gpfSerialJSONBuild(SerializableClass);
};

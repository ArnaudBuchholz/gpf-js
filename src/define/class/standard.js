/**
 * @file Object Class definition
 * @since 0.2.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefineClassImportFrom*/ // Import a class as an entity definition (internal)
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*#endif*/

function _gpfDefineClassStandardGetDictionary (name) {
    return {
        $name: name
    };
}

function _gpfDefineClassStandardPatchDefinition (entityDefinition) {
    Object.assign(entityDefinition, {
        _extend: null,
        _extendDefinition: null
    });
}

function _gpfDefineClassStandardInstallEntityDefinition (InstanceBuilder, name) {
    var entityDefinition = _gpfDefineClassImportFrom(InstanceBuilder, _gpfDefineClassStandardGetDictionary(name));
    _gpfDefineClassStandardPatchDefinition(entityDefinition);
}

_gpfDefineClassStandardInstallEntityDefinition(Object, "Object");
_gpfObjectForEach({
    "Array": Array,
    "Date": Date,
    "Error": Error,
    "Function": Function,
    "Number": Number,
    "RegExp": RegExp,
    "String": String
}, _gpfDefineClassStandardInstallEntityDefinition);

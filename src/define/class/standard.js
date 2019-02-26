/**
 * @file Object Class definition
 * @since 0.2.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfDefineClassImported*/ // Base dictionary for all imported classes
/*global _gpfDefineEntitiesAdd*/ // Store the entity definition to be retreived later
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*#endif*/

function _gpfDefineClassStandardGetDictionary (name) {
    return Object.assign(Object.create(_gpfDefineClassImported), {
        $name: name
    });
}

function _gpfDefineClassStandardBuildEntityDefinition (InstanceBuilder, name) {
    return Object.assign(new _GpfClassDefinition(_gpfDefineClassStandardGetDictionary(name)), {
        _instanceBuilder: InstanceBuilder
    });
}

function _gpfDefineClassStandardPatchDefinition (entityDefinition) {
    Object.assign(entityDefinition, {
        _extend: null,
        _extendDefinition: null
    });
}

function _gpfDefineClassStandardInstallEntityDefinition (InstanceBuilder, name) {
    var entityDefinition = _gpfDefineClassStandardBuildEntityDefinition(InstanceBuilder, name);
    _gpfDefineEntitiesAdd(entityDefinition);
    entityDefinition.check();
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

/**
 * @file Object Class definition
 * @since 0.2.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfDefineClassImported*/ // Base dictionary for all imported classes
/*global _gpfDefineEntitiesAdd*/ // Store the entity definition to be retreived later
/*#endif*/

function _gpfDefineClassObjectGetDictionary () {
    return Object.assign(Object.create(_gpfDefineClassImported), {
        $name: "Object"
    });
}

function _gpfDefineClassObjectBuildEntityDefinition () {
    return Object.assign(new _GpfClassDefinition(_gpfDefineClassObjectGetDictionary()), {
        _instanceBuilder: Object
    });
}

function _gpfDefineClassObjectPatchDefinition (entityDefinition) {
    Object.assign(entityDefinition, {
        _extend: null,
        _extendDefinition: null
    });
}

function _gpfDefineClassObjectInstallEntityDefinition () {
    var entityDefinition = _gpfDefineClassObjectBuildEntityDefinition();
    _gpfDefineEntitiesAdd(entityDefinition);
    entityDefinition.check();
    _gpfDefineClassObjectPatchDefinition(entityDefinition);
}

_gpfDefineClassObjectInstallEntityDefinition();

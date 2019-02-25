/**
 * @file Object Class definition
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfDefineEntitiesAdd*/
/*global _gpfDefineClassImported*/
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

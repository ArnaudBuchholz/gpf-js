/**
 * @file ES6 Class definition import
 * @since 0.2.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfDefineEntitiesAdd*/ // Store the entity definition to be retreived later
/*global _gpfDefineEntitiesFindByConstructor*/ // Retrieve entity definition from Constructor
/*global _gpfEmptyFunc*/
/*exported _gpfDefineClassImport*/ // Import a class as an entity definition
/*exported _gpfDefineClassImported*/ // Base dictionary for all imported classes
/*#endif*/

var _gpfDefineClassImported = {};

function _gpfDefineClassImportGetDictionary (instanceBuilder) {
    var extendPrototype = Object.getPrototypeOf(instanceBuilder.prototype);
    return Object.assign(Object.create(_gpfDefineClassImported), {
        $name: instanceBuilder.compatibleName(),
        $extend: extendPrototype.constructor
    });
}

function _gpfDefineClassImportFrom (instanceBuilder) {
    var entityDefinition = new _GpfClassDefinition(_gpfDefineClassImportGetDictionary(instanceBuilder));
    entityDefinition._instanceBuilder = instanceBuilder;
    _gpfDefineEntitiesAdd(entityDefinition);
    // Since it might not even have a name
    entityDefinition._checkNameIsNotEmpty = _gpfEmptyFunc;
    entityDefinition._checkName = _gpfEmptyFunc;
    entityDefinition.check();
    return entityDefinition;
}

/**
 * Import a class as an entity definition
 *
 * @param {Function} instanceBuilder Instance builder (must be an ES6 class)
 * @return {_GpfEntityDefinition} Entity definition
 * @since 0.2.9
 */

function _gpfDefineClassImport (instanceBuilder) {
    var entityDefinition = _gpfDefineEntitiesFindByConstructor(instanceBuilder);
    if (entityDefinition) {
        return entityDefinition;
    }
    return _gpfDefineClassImportFrom(instanceBuilder);
}

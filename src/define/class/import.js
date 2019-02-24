/**
 * @file ES6 Class definition import
 * @since 0.2.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfDefineEntitiesFindByMatchingBuilder*/
/*global _gpfDefineEntitiesAdd*/
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfDefineEntitiesFindByConstructor*/ // Retrieve entity definition from Constructor
/*#endif*/

var _gpfDefineClassImported = {};

function _gpfDefineClassImportFrom (instanceBuilder) {
    var entityDefinition = new _GpfClassDefinition(_gpfDefineClassImported);
    entityDefinition._instanceBuilder = instanceBuilder;
    var extendPrototype = Object.getPrototypeOf(instanceBuilder.prototype);
    entityDefinition._extend = extendPrototype.constructor;
    entityDefinition._extendDefinition = _gpfDefineClassImport(extendPrototype.constructor);
    entityDefinition._attributes = {}; // TODO find a better way
    _gpfDefinedEntities.push(entityDefinition);
    return entityDefinition;
}

/**
 * Import an ES6 class as an entity definition
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

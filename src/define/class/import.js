/**
 * @file Class definition import
 * @since 0.2.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfDefineGetEntityFromBuilder*/ // Retrieves entity definition from instance instance builder
/*global _gpfDefinedEntities*/ // Array of defined entities
/*exported _gpfDefineClassImport*/ // Retrieves or import entity definition from instance builder
/*#endif*/

var _gpfDefineClassImported = {};

function _gpfDefineClassImportFrom (instanceBuilder) {
    var entityDefinition = new _GpfClassDefinition(_gpfDefineClassImported);
    entityDefinition._instanceBuilder = instanceBuilder;
    entityDefinition._attributes = {}; // TODO find a better way
    _gpfDefinedEntities.push(entityDefinition);
    return entityDefinition;
}

/**
 * Retrieves or import entity definition from instance builder.
 * NOTE: If not existing, an incomplete  _GpfEntityDefinition is created
 *
 * @param {Function} instanceBuilder Instance builder
 * @return {_GpfEntityDefinition} Entity definition (if found)
 * @since 0.2.9
 */

function _gpfDefineClassImport (instanceBuilder) {
    var entityDefinition = _gpfDefineGetEntityFromBuilder(instanceBuilder);
    if (entityDefinition) {
        return entityDefinition;
    }
    return _gpfDefineClassImportFrom(instanceBuilder);
}

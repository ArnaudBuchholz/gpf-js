/**
 * @file Entities list management
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_START*/
/*global _gpfAssert*/
/*global _gpfArrayForEachFalsy*/ // _gpfArrayForEach that returns first truthy value computed by the callback
/*exported _gpfDefineEntitiesAdd*/ // Store the entity definition to be retreived later
/*exported _gpfDefineEntitiesFind*/ // Retrieves entity definition from instance instance builder
/*#endif*/

/**
 * Array of defined entities
 * @type {_GpfEntityDefinition[]}
 * @since 0.2.4
 */
var _gpfDefinedEntities = [];

function _gpfDefineEntitiesFindByMatchingBuilder (instanceBuilder) {
    return _gpfDefinedEntities.filter(function (entityDefinition) {
        return entityDefinition.getInstanceBuilder() === instanceBuilder;
    })[_GPF_START];
}

/**
 * Retrieve entity definition from instance builder.
 * NOTE: This is an internal solution that has the advantage of not exposing the entity definitions.
 *       For performance reasons, this may change in the future.
 *
 * @param {Function} instanceBuilder Instance builder
 * @return {_GpfEntityDefinition|undefined} Entity definition (if found)
 * @since 0.2.4
 */
function _gpfDefineEntitiesFind (instanceBuilder) {
    var result = _gpfDefineEntitiesFindByMatchingBuilder(instanceBuilder);
    if (!result) {
        // Reversed lookup because testing inheritance
        result = _gpfArrayForEachFalsy([].concat(_gpfDefinedEntities).reverse(), function (entityDefinition) {
            if (instanceBuilder.prototype instanceof entityDefinition.getInstanceBuilder()) {
                return entityDefinition;
            }
        });
    }
    return result;
}

/**
 * Store the entity definition to be retreived later
 *
 * @param  {_GpfEntityDefinition} entityDefinition Entity definition
 */
function _gpfDefineEntitiesAdd (entityDefinition) {
    _gpfAssert(entityDefinition._instanceBuilder !== null, "Instance builder must be set");
    _gpfAssert(!_gpfDefineEntitiesFindByMatchingBuilder(entityDefinition.getInstanceBuilder()), "Already added");
    _gpfDefinedEntities.push(entityDefinition);
}

/**
 * @file Entities list management
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_START*/
/*global _gpfAssert*/
/*exported _gpfDefineEntitiesAdd*/ // Store the entity definition to be retreived later
/*exported _gpfDefineEntitiesFindByConstructor*/ // Retrieve entity definition from Constructor
/*exported _gpfDefineEntitiesFindByProtoype*/ // Retrieve entity definition from prototype
/*#endif*/

/**
 * Array of defined entities
 * @type {_GpfEntityDefinition[]}
 * @since 0.2.4
 */
var _gpfDefinedEntities = [];

/**
 * Retrieve entity definition from Constructor.
 * NOTE: This is an internal solution that has the advantage of not exposing the entity definitions.
 *       For performance reasons, this may change in the future.
 *
 * @param {Function} Constructor Constructor function
 * @return {_GpfEntityDefinition|undefined} Entity definition (if found)
 */
function _gpfDefineEntitiesFindByConstructor (Constructor) {
    return _gpfDefinedEntities.filter(function (entityDefinition) {
        return entityDefinition.getInstanceBuilder() === Constructor;
    })[_GPF_START];
}

/**
 * Retrieve entity definition from prototype.
 * NOTE: This is an internal solution that has the advantage of not exposing the entity definitions.
 *       For performance reasons, this may change in the future.
 *
 * @param {Object} prototype Prototype
 * @return {_GpfEntityDefinition|undefined} Entity definition (if found)
 */
//     var prototype = Object.getPrototypeOf(instanceBuilder.prototype);
function _gpfDefineEntitiesFindByProtoype (prototype) {
    return _gpfDefinedEntities.filter(function (entityDefinition) {
        return entityDefinition.getInstanceBuilder().prototype === prototype;
    })[_GPF_START];
}

/**
 * Store the entity definition to be retreived later
 *
 * @param  {_GpfEntityDefinition} entityDefinition Entity definition
 */
function _gpfDefineEntitiesAdd (entityDefinition) {
    _gpfAssert(entityDefinition._instanceBuilder !== null, "Instance builder must be set");
    _gpfAssert(!_gpfDefineEntitiesFindByConstructor(entityDefinition.getInstanceBuilder()), "Already added");
    _gpfDefinedEntities.push(entityDefinition);
}

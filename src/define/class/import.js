/**
 * @file ES6 Class definition import
 * @since 0.2.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfDefineEntitiesAdd*/ // Store the entity definition to be retreived later
/*global _gpfDefineEntitiesFindByConstructor*/ // Retrieve entity definition from Constructor
/*global _gpfEmptyFunc*/ // An empty function
/*exported _GpfImportedClassDefinition*/ // Imported class definition
/*exported _gpfDefineClassImport*/ // Import a class as an entity definition
/*exported _gpfDefineClassImportFrom*/ // Import a class as an entity definition (internal)
/*#endif*/

/**
 * Imported class definition
 *
 * @param {Function} InstanceBuilder Instance builder
 * @param {Object} definition Entity definition
 * @extends _GpfClassDefinition
 * @constructor
 * @since 0.2.9
 */
function _GpfImportedClassDefinition (InstanceBuilder, definition) {
    /*jshint validthis:true*/ // constructor
    /*eslint-disable no-invalid-this*/
    _GpfClassDefinition.call(this, definition);
    this._instanceBuilder = InstanceBuilder;
    /*eslint-enable no-invalid-this*/
}

_GpfImportedClassDefinition.prototype = Object.create(_GpfClassDefinition.prototype);

Object.assign(_GpfImportedClassDefinition.prototype, {
    // Since it might not even have a name
    _checkNameIsNotEmpty: _gpfEmptyFunc,
    _checkName: _gpfEmptyFunc
});

function _gpfDefineClassImportGetDefinition (InstanceBuilder) {
    var extendPrototype = Object.getPrototypeOf(InstanceBuilder.prototype);
    return {
        $name: InstanceBuilder.compatibleName(),
        $extend: extendPrototype.constructor
    };
}

function _gpfDefineClassImportFrom (InstanceBuilder, definition) {
    var entityDefinition = new _GpfImportedClassDefinition(InstanceBuilder, definition);
    _gpfDefineEntitiesAdd(entityDefinition);
    entityDefinition.check();
    return entityDefinition;
}

/**
 * Import a class as an entity definition
 *
 * @param {Function} InstanceBuilder Instance builder (must be an ES6 class)
 * @return {_GpfEntityDefinition} Entity definition
 * @since 0.2.9
 */

function _gpfDefineClassImport (InstanceBuilder) {
    var entityDefinition = _gpfDefineEntitiesFindByConstructor(InstanceBuilder);
    if (entityDefinition) {
        return entityDefinition;
    }
    return _gpfDefineClassImportFrom(InstanceBuilder, _gpfDefineClassImportGetDefinition(InstanceBuilder));
}

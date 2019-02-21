/**
 * @file Class definition import
 * @since 0.2.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfDefinedEntities*/ // Array of defined entities
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfIsClass*/ // Check if the parameter is an ES6 class
/*exported _gpfDefineClassImport*/ // Retrieves or import entity definition from instance builder
/*#endif*/


_gpfErrorDeclare("define/class/import", {

    /**
     * ### Summary
     *
     * ES6 class only
     *
     * ### Description
     *
     * This method can be used on ES6 class only
     */
    es6classOnly: "ES6 class only"

});


var _gpfDefineClassImported = {};

function _gpfDefineClassImportFrom (instanceBuilder) {
    var entityDefinition = new _GpfClassDefinition(_gpfDefineClassImported);
    entityDefinition._instanceBuilder = instanceBuilder;
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
    if (!_gpfIsClass(instanceBuilder)) {
        gpf.Error.es6classOnly();
    }
    return _gpfDefineClassImportFrom(instanceBuilder);
}

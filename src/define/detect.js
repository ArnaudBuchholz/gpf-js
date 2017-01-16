/**
 * @file Detect entity type
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _gpfDefineBuildTypedEntity*/ // Factory to create the correct entity type
/*#endif*/

_gpfErrorDeclare("define/detect", {
    /**
     * ### Summary
     *
     * Entity type is invalid in the definition passed to {@link gpf.define}
     *
     * ### Description
     *
     * This error is thrown when the entity type is either missing or invalid
     */
    invalidEntityType: "Invalid entity type"

});

/**
 * Dictionary mapping type (class...) to the corresponding typed Entity constructor.
 *
 * This dictionary is filled by subsequent entity types.
 */
var _gpfDefineTypedBuilders = {};

/**
 * Search for type specific properties ($class...) and return associated builder function
 *
 * @param {Object} definition Entity definition literal object
 * @return {Function|undefined} Entity builder or undefined
 */
function _gpfDefineRead$TypedProperties (definition) {
    var ResultEntityBuilder;
    _gpfObjectForEach(definition, function (TypedEntityBuilder, type) {
        if (definition["$" + type]) {
            ResultEntityBuilder = TypedEntityBuilder;
        }
    });
    return ResultEntityBuilder;
}

/**
 * Check the $type property to return the associated builder function
 *
 * @param {Object} definition Entity definition literal object
 * @return {Function} Entity builder
 * @throws {gpf.Error.InvalidEntityType}
 */
function _gpfDefineCheck$TypeProperty (definition) {
    var typedEntityBuilder = _gpfDefineTypedBuilders[definition.$type];
    if (undefined === typedEntityBuilder) {
        gpf.Error.invalidEntityType();
    }
    return typedEntityBuilder;
}

/**
 * Factory to create the correct entity type
 *
 * @param {Object} definition Entity definition literal object
 * @return {_GpfEntityDefinition} Entity definition instance
 * @throws {gpf.Error.InvalidEntityType}
 */
function _gpfDefineBuildTypedEntity (definition) {
    var EntityBuilder = _gpfDefineRead$TypedProperties(definition);
    if (!EntityBuilder) {
        EntityBuilder = _gpfDefineCheck$TypeProperty(definition);
    }
    return new EntityBuilder(definition);
}

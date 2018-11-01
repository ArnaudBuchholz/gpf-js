/**
 * @file Entity definition
 * @since 0.1.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAssert*/ // Assertion method
/*exported _GpfEntityDefinition*/ // Entity definition
/*#endif*/

/**
 * Entity definition
 * - Check the definition object for $ properties (and validate them)
 * - Read the entity type, name and namespace
 * - Maintain a flat dictionary of members (using prototype inheritance)
 *
 * @param {Object} definition Entity definition
 * @constructor
 * @since 0.1.6
 */
function _GpfEntityDefinition (definition) {
    _gpfAssert(definition && typeof definition === "object", "Expected an entity definition");
    /*jshint validthis:true*/ // constructor
    /*eslint-disable no-invalid-this*/
    this._initialDefinition = definition;
    /*eslint-enable no-invalid-this*/
}

_GpfEntityDefinition.prototype = {

    constructor: _GpfEntityDefinition,

    /**
     * Entity initial definition passed to {@link gpf.define}
     *
     * @readonly
     * @constant
     * @since 0.1.6
     */
    _initialDefinition: {}

};

/*#ifndef(UMD)*/

gpf.internals._GpfEntityDefinition = _GpfEntityDefinition;

/*#endif*/

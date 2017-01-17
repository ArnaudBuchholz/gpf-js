/**
 * @file Entity definition
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAssert*/ // Assertion method
/*exported _GpfEntityDefinition*/ // Entity definition
/*#endif*/

/**
 * Entity definition
 * - Check the definition object for $ properties
 * - Maintain a flat dictionary of members (using prototype inheritance)
 *
 * @param {Object} definition Entity definition
 * @constructor
 */
function _GpfEntityDefinition (definition) {
    _gpfAssert(definition && "object" === typeof definition, "Expected an entity definition");
    /*jshint validthis:true*/ // constructor
    /*eslint-disable no-invalid-this*/
    this._initialDefinition = definition;
    /*eslint-enable no-invalid-this*/
}

_GpfEntityDefinition.prototype = {

    /** Definition provided upon construction */
    _initialDefinition: {}

};

/*#ifndef(UMD)*/

gpf.internals._GpfEntityDefinition = _GpfEntityDefinition;

/*#endif*/

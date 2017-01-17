/**
 * @file Class definition
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfEntityDefinition*/ // Entity definition
/*global _gpfDefineBuildTypedEntity*/ // Factory to create the correct entity type
/*exported _gpfClassDefinition*/ // Class definition
/*#endif*/

/**
 * Class definition
 *
 * @param {Object} definition Entity definition
 * @extends _GpfEntityDefinition
 * @constructor
 */
function _GpfClassDefinition (definition) {
    /*jshint validthis:true*/ // constructor
    /*eslint-disable no-invalid-this*/
    _GpfEntityDefinition.call(this, definition);
    /*eslint-enable no-invalid-this*/
}

_GpfClassDefinition.prototype = Object.create(_GpfEntityDefinition.prototype);

_gpfDefineBuildTypedEntity["class"] = _GpfClassDefinition;

/*#ifndef(UMD)*/

gpf.internals._GpfClassDefinition = _GpfClassDefinition;

/*#endif*/

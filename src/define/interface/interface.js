/**
 * @file Interface definition
 * @since 0.1.8
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfEntityDefinition*/ // Entity definition
/*global _gpfDefineTypedBuilders*/ // Dictionary mapping type (class...) to the corresponding typed Entity constructor
/*exported _GpfInterfaceDefinition*/ // Interface definition
/*#endif*/

/**
 * Interface definition
 *
 * @param {Object} definition Entity definition
 * @extends _GpfEntityDefinition
 * @constructor
 * @since 0.1.8
 */
function _GpfInterfaceDefinition (definition) {
    /*jshint validthis:true*/ // constructor
    /*eslint-disable no-invalid-this*/
    _GpfEntityDefinition.call(this, definition);
    /*eslint-enable no-invalid-this*/
}

_GpfInterfaceDefinition.prototype = Object.create(_GpfEntityDefinition.prototype);

Object.assign(_GpfInterfaceDefinition.prototype, {

    constructor: _GpfInterfaceDefinition,

    /**
     * @inheritdoc
     * @since 0.1.8
     */
    _type: "interface"

});

_gpfDefineTypedBuilders["interface"] = _GpfInterfaceDefinition;

/*#ifndef(UMD)*/

gpf.internals._GpfInterfaceDefinition = _GpfInterfaceDefinition;

/*#endif*/

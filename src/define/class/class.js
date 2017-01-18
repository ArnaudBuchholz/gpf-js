/**
 * @file Class definition
 * @since 0.1.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfEntityDefinition*/ // Entity definition
/*global _gpfDefineTypedBuilders*/ // Dictionary mapping type (class...) to the corresponding typed Entity constructor
/*global _gpfExtend*/ // gpf.extend
/*exported _gpfClassDefinition*/ // Class definition
/*#endif*/

/**
 * Class definition
 *
 * @param {Object} definition Entity definition
 * @extends _GpfEntityDefinition
 * @constructor
 * @since 0.1.6
 */
function _GpfClassDefinition (definition) {
    /*jshint validthis:true*/ // constructor
    /*eslint-disable no-invalid-this*/
    _GpfEntityDefinition.call(this, definition);
    /*eslint-enable no-invalid-this*/
}

_GpfClassDefinition.prototype = Object.create(_GpfEntityDefinition.prototype);

_gpfExtend(_GpfClassDefinition.prototype, /** @lends _GpfClassDefinition.prototype */ {

    /**
     * @inheritdoc
     * @since 0.1.6
     */
    _type: "class"

});

_gpfDefineTypedBuilders["class"] = _GpfClassDefinition;

/*#ifndef(UMD)*/

gpf.internals._GpfClassDefinition = _GpfClassDefinition;

/*#endif*/

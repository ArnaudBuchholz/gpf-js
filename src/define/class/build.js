/**
 * @file Build class
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfExtend*/ // gpf.extend
/*global _gpfDefineGetSecuredNamedConstructor*/ // Allocate a secured named constructor
/*#endif*/

_gpfExtend(_GpfClassDefinition.prototype, /** @lends _GpfClassDefinition.prototype */ {

    /** @inheritdoc */
    build: function () {
        var newClass = _gpfDefineGetSecuredNamedConstructor(this),
            // Basic JavaScript inheritance mechanism: Defines the newClass prototype as an instance of the super class
            newPrototype = Object.create(this._extend.prototype);

        // Populate our constructed prototype object
        newClass.prototype = newPrototype;

        // Enforce the constructor to be what we expect
        newPrototype.constructor = newClass;


    }

});

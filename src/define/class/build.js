/**
 * @file Build class
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfExtend*/ // gpf.extend
/*global _gpfDefineGetClassSecuredConstructor*/ // Allocate a secured named constructor
/*#endif*/

_gpfExtend(_GpfClassDefinition.prototype, /** @lends _GpfClassDefinition.prototype */ {

    /** @inheritdoc */
    _build: function () {
        var newClass = _gpfDefineGetClassSecuredConstructor(this),
            // Basic JavaScript inheritance mechanism: Defines the newClass prototype as an instance of the super class
            newPrototype = Object.create(this._extend.prototype);

        // Populate our constructed prototype object
        newClass.prototype = newPrototype;

        // Enforce the constructor to be what we expect
        newPrototype.constructor = newClass;

        this._resolveConstructor();

        return newClass;
    },

    _resolveConstructor: function () {
        /* jshint -W069*/
        var ownConstructor = this._initialDefinition["constructor"]; //eslint-disable-line dot-notation
        /* jshint +W069*/
        if (ownConstructor) {
            this._resolvedConstructor = ownConstructor;
        } else {
            this._resolvedConstructor = this._extend;
        }
    }

});

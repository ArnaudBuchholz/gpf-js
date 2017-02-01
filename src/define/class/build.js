/**
 * @file Build class
 * @since 0.1.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfDefineGetClassSecuredConstructor*/ // Allocate a secured named constructor
/*global _gpfExtend*/ // gpf.extend
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*#endif*/

_gpfExtend(_GpfClassDefinition.prototype, /** @lends _GpfClassDefinition.prototype */ {

    /**
     * @inheritdoc
     * @since 0.1.6
     */
    _build: function () {
        var newClass = _gpfDefineGetClassSecuredConstructor(this),
            // Basic JavaScript inheritance mechanism: Defines the newClass prototype as an instance of the super class
            newPrototype = Object.create(this._extend.prototype);

        // Populate our constructed prototype object
        newClass.prototype = newPrototype;

        // Enforce the constructor to be what we expect
        newPrototype.constructor = newClass;

        this._buildPrototype(newPrototype);
        this._resolveConstructor();

        return newClass;
    },

    _addMethodToPrototype: function (newPrototype, memberName, value) {
        newPrototype[memberName] = value;
    },

    _addMemberToPrototype: function (newPrototype, memberName, value) {
        if ("function" === typeof value) {
            this._addMethodToPrototype(newPrototype, memberName, value);
        } else {
            newPrototype[memberName] = value;
        }
    },

    _buildPrototype: function (newPrototype) {
        _gpfObjectForEach(this._initialDefinition, function (value, memberName) {
            if (memberName.charAt(0) !== "$" && memberName !== "constructor") {
                this._addMemberToPrototype(newPrototype, memberName, value); //eslint-disable-line no-invalid-this
            }
        }, this);
    },

    _resolveConstructor: function () {
        if (this._initialDefinition.hasOwnProperty("constructor")) {
            /* jshint -W069*/
            this._resolvedConstructor = this._initialDefinition["constructor"]; //eslint-disable-line dot-notation
            /* jshint +W069*/
        } else {
            this._resolvedConstructor = this._extend;
        }
    }

});

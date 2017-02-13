/**
 * @file Build class
 * @since 0.1.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfDefineGetClassSecuredConstructor*/ // Allocate a secured named constructor
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*#endif*/

Object.assign(_GpfClassDefinition.prototype, /** @lends _GpfClassDefinition.prototype */ {

    /**
     * @inheritdoc
     * @since 0.1.6
     */
    _build: function () {
        var newClass,
            newPrototype;
        this._resolveConstructor();
        newClass = _gpfDefineGetClassSecuredConstructor(this);
        // Basic JavaScript inheritance mechanism: Defines the newClass prototype as an instance of the super class
        newPrototype = Object.create(this._extend.prototype);
        // Populate our constructed prototype object
        newClass.prototype = newPrototype;
        // Enforce the constructor to be what we expect
        newPrototype.constructor = newClass;
        this._buildPrototype(newPrototype);
        return newClass;
    },

    /**
     * Add method to the new class prototype
     *
     * @param {Object} newPrototype New class prototype
     * @param {String} methodName Method name
     * @param {Function} method Method
     */
    _addMethodToPrototype: function (newPrototype, methodName, method) {
        newPrototype[methodName] = this._superify(method, methodName);
    },

    /**
     * Add member to the new class prototype
     *
     * @param {Object} newPrototype New class prototype
     * @param {String} memberName Member name
     * @param {*} value Member value
     */
    _addMemberToPrototype: function (newPrototype, memberName, value) {
        if ("function" === typeof value) {
            this._addMethodToPrototype(newPrototype, memberName, value);
        } else {
            newPrototype[memberName] = value;
        }
    },

    /**
     * Build the new class prototype
     *
     * @param {Object} newPrototype New class prototype
     */
    _buildPrototype: function (newPrototype) {
        _gpfObjectForEach(this._initialDefinition, function (value, memberName) {
            if (memberName.charAt(0) !== "$" && memberName !== "constructor") {
                this._addMemberToPrototype(newPrototype, memberName, value); //eslint-disable-line no-invalid-this
            }
        }, this);
    },

    /** Set the inherited constructor if not Object */
    _setResolvedConstructorToInherited: function () {
        if (this._extend !== Object) {
            this._resolvedConstructor =  this._extend;
        }
    },

    /** Assign the proper constructor to _resolvedConstructor */
    _resolveConstructor: function () {
        if (this._initialDefinition.hasOwnProperty("constructor")) {
            /* jshint -W069*/ /*eslint-disable dot-notation*/
            this._resolvedConstructor = this._superify(this._initialDefinition["constructor"], "constructor");
            /* jshint +W069*/ /*eslint-enable dot-notation*/
        } else {
            this._setResolvedConstructorToInherited();
        }
    }

});

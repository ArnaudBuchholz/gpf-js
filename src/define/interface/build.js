/**
 * @file Build class
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfInterfaceDefinition*/ // Class definition
/*global _gpfDefineGetInterfaceConstructor*/ // Allocate an interface constructor
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*#endif*/

Object.assign(_GpfInterfaceDefinition.prototype, /** @lends _GpfInterfaceDefinition.prototype */ {

    /**
     * @inheritdoc
     */
    _build: function () {
        var newClass,
            newPrototype;
        newClass = _gpfDefineGetInterfaceConstructor(this);
        // Populate our constructed prototype object
        newPrototype = newClass.prototype;
        // Enforce the constructor to be what we expect
        newPrototype.constructor = newClass;
        this._buildPrototype(newPrototype);
        return newClass;
    },

    /**
     * Build the new class prototype
     *
     * @param {Object} newPrototype New class prototype
     * @since 0.1.7
     */
    _buildPrototype: function (newPrototype) {
        _gpfObjectForEach(this._initialDefinition, function (value, memberName) {
            if (memberName.charAt(0) !== "$") {
                newPrototype[memberName] = value;
            }
        }, this);
    }

});

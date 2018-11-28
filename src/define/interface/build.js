/**
 * @file Build class
 * @since 0.1.8
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfInterfaceDefinition*/ // Interface definition
/*global _gpfDefineGetInterfaceConstructor*/ // Allocate an interface constructor
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*#endif*/

Object.assign(_GpfInterfaceDefinition.prototype, {

    /**
     * @inheritdoc
     * @since 0.1.8
     */
    _build: function () {
        var newClass,
            newPrototype;
        newClass = _gpfDefineGetInterfaceConstructor(this);
        // Populate our constructed prototype object
        newPrototype = newClass.prototype;
        // Ensure no constructor on prototype (because of interface)
        delete newPrototype.constructor;
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
            if (!memberName.startsWith("$")) {
                newPrototype[memberName] = value;
            }
        }, this);
    }

});

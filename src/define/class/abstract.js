/**
 * @file $abstract implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*exported _gpfDefineClassAbstractGetInConstructorCheck*/ // Abstract class instantiation check
/*#endif*/

_gpfErrorDeclare("define/class/abstract", {

    /**
     * ### Summary
     *
     * Invalid Class $abstract specification
     *
     * ### Description
     *
     * The property $abstract only accepts the value true
     * @since 0.2.7
     */
    invalidClass$AbstractSpecification: "Invalid class $abstract specification"

});

_GpfClassDefinition.prototype._allowed$Properties.push("abstract");

var _gpfDefClassAbstractClassCheck$Property = _GpfClassDefinition.prototype._check$Property;

Object.assign(_GpfClassDefinition.prototype, {

    /**
     * Class is abstract
     * @since 0.2.7
     */
    _abstract: false,

    _check$abstract: function (value) {
        if (true !== value) {
            gpf.Error.invalidClass$AbstractSpecification();
        }
    },

    /**
     * @inheritdoc
     * @since 0.2.7
     */
    _check$Property: function (name, value) {
        if (name === "abstract") {
            this._check$abstract(value);
            this._abstract = true;
        } else {
            _gpfDefClassAbstractClassCheck$Property.call(this, name, value);
        }
    }

});

/**
 * Abstract class instantiation check
 *
 * @param {_GpfClassDefinition} classDefinition Class definition
 * @return {String} Code to secure instantiation when class is abstract
 */
function _gpfDefineClassAbstractGetInConstructorCheck (classDefinition) {
    if (classDefinition._abstract) {
        return "if (this.constructor === _classDef_._instanceBuilder) gpf.Error.abstractClass();";
    }
}

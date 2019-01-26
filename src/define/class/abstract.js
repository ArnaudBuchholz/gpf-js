/**
 * @file $abstract implementation
 * @since 0.2.8
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfDefineClassConstructorAddCodeWrapper*/ // Adds a constructor code wrapper
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfIgnore*/
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
    invalidClass$AbstractSpecification: "Invalid class $abstract specification",

    /**
     * ### Summary
     *
     * Abstract Class
     *
     * ### Description
     *
     * An abstract class can not be instantiated
     * @since 0.2.7
     */
    abstractClass: "Abstract Class"

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
        if (value !== true) {
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

_gpfDefineClassConstructorAddCodeWrapper(function (classDefinition, body, instance) {
    _gpfIgnore(instance);
    if (classDefinition._abstract) {
        return "if (this.constructor === _classDef_._instanceBuilder) gpf.Error.abstractClass();\n" + body;
    }
    return body;
});

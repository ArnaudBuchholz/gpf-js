/**
 * @file $singleton implementation
 * @since 0.2.8
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfDefineClassConstructorAddCodeWrapper*/ // Adds a constructor code wrapper
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*#endif*/

_gpfErrorDeclare("define/class/singleton", {

    /**
     * ### Summary
     *
     * Invalid Class $singleton specification
     *
     * ### Description
     *
     * The property $singleton only accepts the value true
     * @since 0.2.8
     */
    invalidClass$SingletonSpecification: "Invalid class $singleton specification"

});

_GpfClassDefinition.prototype._allowed$Properties.push("singleton");

var _gpfDefClassSingletonClassCheck$Property = _GpfClassDefinition.prototype._check$Property;

Object.assign(_GpfClassDefinition.prototype, {

    /**
     * Class is used as a singleton
     * @since 0.2.8
     */
    _singleton: false,

    /**
     * Unique instance of the singleton
     * @type {Object}
     * @since 0.2.8
     */
    _singletonInstance: null,

    _check$singleton: function (value) {
        if (true !== value) {
            gpf.Error.invalidClass$SingletonSpecification();
        }
    },

    /**
     * @inheritdoc
     * @since 0.2.8
     */
    _check$Property: function (name, value) {
        if (name === "singleton") {
            this._check$singleton(value);
            this._singleton = true;
        } else {
            _gpfDefClassSingletonClassCheck$Property.call(this, name, value);
        }
    }

});

_gpfDefineClassConstructorAddCodeWrapper(function (classDefinition, body) {
    if (classDefinition._singleton) {
        return "if (!_classDef_._singletonInstance) {\n"
            + body + "\n"
            + "_classDef_._singletonInstance = this;\n"
            + "}\n"
            + "return _classDef_._singletonInstance;";
    }
    return body;
});

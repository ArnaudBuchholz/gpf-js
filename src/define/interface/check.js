/**
 * @file Check entity definition
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfInterfaceDefinition*/ // Interface definition
/*global _GpfEntityDefinition*/ // Entity definition
/*global _gpfDefineGenerate$Keys*/ // Generate an array of names prefixed with $ from a comma separated list
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*#endif*/

_gpfErrorDeclare("define/interface/check", {
    /**
     * ### Summary
     *
     * The interface name is invalid
     *
     * ### Description
     *
     * Only a valid JavaScript identifier (starting with an uppercase I) is allowed
     */
    invalidInterfaceName: "Invalid interface name",

    /**
     * ### Summary
     *
     * The interface definition contains an invalid property
     *
     * ### Description
     *
     * An interface can contain only methods and no constructor
     */
    InvalidInterfaceProperty: "Invalid interface property"

});

Object.assign(_GpfInterfaceDefinition.prototype, /** @lends _gpfClassDefinition.prototype */ {

    /**
     * @inheritdoc
     */
    _allowed$Properties: _GpfEntityDefinition.prototype._allowed$Properties
        .concat(_gpfDefineGenerate$Keys("interface")),

    /**
     * Check that the member name is a valid one
     *
     * @param {String} name Member name
     * @throws {gpf.Error.InvalidInterfaceProperty}
     */
    _checkMemberName: function (name) {
        if (!new RegExp("^[a-z][a-zA-Z0-9]*$").exec(name)) {
            gpf.Error.invalidInterfaceProperty();
        }
    },

    /**
     * List of reserved member names
     *
     * @type {String[]}
     * @readonly
     * @constant
     */
    _reservedNames: "super,class,public,private,protected,static,mixin,constructor".split(","),

    /**
     * Check that the member name is not a reserved one
     *
     * @param {String} name Member name
     * @throws {gpf.Error.InvalidInterfaceProperty}
     */
    _checkReservedMemberName: function (name) {
        if (-1 !== this._reservedNames.indexOf(name)) {
            gpf.Error.invalidInterfaceProperty();
        }
    },

    /**
     * Check the value of the member: it must be a function
     *
     * @param {String} name Property name
     * @param {*} value Property value
     * @throws {gpf.Error.InvalidInterfaceProperty}
     * @private
     */
    _checkMemberValue: function (name, value) {
        if ("function" !== typeof value) {
            gpf.Error.invalidInterfaceProperty();
        }
    },

    /**
     * @inheritdoc
     * @throws {gpf.Error.InvalidInterfaceProperty}
     */
    _checkProperty: function (name, value) {
        _GpfEntityDefinition.prototype._checkProperty.call(this, name);
        this._checkMemberName(name);
        this._checkReservedMemberName(name);
        this._checkMemberValue(name, value);
    },

    /**
     * @inheritdoc
     * @throws {gpf.Error.InvalidInterfaceName}
     */
    _checkName: function () {
        _GpfEntityDefinition.prototype._checkName.call(this);
        if (!new RegExp("^I[a-zA-Z0-9]*$").exec(this._name)) {
            gpf.Error.invalidInterfaceName();
        }
    }

});

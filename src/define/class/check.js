/**
 * @file Check entity definition
 * @since 0.1.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _GpfEntityDefinition*/ // Entity definition
/*global _gpfDefineGenerate$Keys*/ // Generate an array of names prefixed with $ from a comma separated list
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfExtend*/ // gpf.extend
/*#endif*/

_gpfErrorDeclare("define/class/check", {
    /**
     * ### Summary
     *
     * The class name is invalid
     *
     * ### Description
     *
     * Only a valid JavaScript identifier (starting with an uppercase letter, $ or _) is allowed
     * @since 0.1.6
     */
    invalidClassName: "Invalid class name",

    /**
     * ### Summary
     *
     * The class definition contains an property
     *
     * ### Description
     *
     * Some keywords are reserved
     * @since 0.1.6
     */
    invalidClassProperty: "Invalid class property"

});

_gpfExtend(_GpfClassDefinition.prototype, /** @lends _gpfClassDefinition.prototype */ {

    /**
     * @inheritdoc
     * @since 0.1.6
     */
    _allowed$Properties: _GpfEntityDefinition.prototype._allowed$Properties
        .concat(_gpfDefineGenerate$Keys("class,extend")),

    /**
     * Check that the member name is a valid one
     *
     * @param {String} name Member name
     * @throws {gpf.Error.InvalidClassProperty}
     * @since 0.1.6
     */
    _checkMemberName: function (name) {
        if (!new RegExp("^[a-z_$][a-zA-Z0-9]*$").exec(name)) {
            gpf.Error.invalidClassProperty();
        }
    },

    /**
     * List of reserved member names
     *
     * @type {String[]}
     * @readonly
     * @constant
     * @since 0.1.6
     */
    _reservedNames: "super,class,public,private,protected,static,mixin".split(","),

    /**
     * Check that the member name is not a reserved one
     *
     * @param {String} name Member name
     * @throws {gpf.Error.InvalidClassProperty}
     * @since 0.1.6
     */
    _checkReservedMemberName: function (name) {
        if (-1 !== this._reservedNames.indexOf(name)) {
            gpf.Error.invalidClassProperty();
        }
    },

    /**
     * @inheritdoc
     * @throws {gpf.Error.InvalidClassProperty}
     * @since 0.1.6
     */
    _checkProperty: function (name) {
        _GpfEntityDefinition.prototype._checkProperty.call(this, name);
        this._checkMemberName(name);
        this._checkReservedMemberName(name);
    },

    /**
     * @inheritdoc
     * @throws {gpf.Error.InvalidClassName}
     * @since 0.1.6
     */
    _checkName: function () {
        _GpfEntityDefinition.prototype._checkName.call(this);
        if (!new RegExp("^[A-Z_$][a-zA-Z0-9]*$").exec(this._name)) {
            gpf.Error.invalidClassName();
        }
    }

});

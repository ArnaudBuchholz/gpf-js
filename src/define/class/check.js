/**
 * @file Check entity definition
 * @since 0.1.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _GpfEntityDefinition*/ // Entity definition
/*global _gpfContext*/ // Resolve contextual string
/*global _gpfDefineGenerate$Keys*/ // Generate an array of names prefixed with $ from a comma separated list
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
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
     * The class definition contains an invalid property
     *
     * ### Description
     *
     * Some keywords are reserved
     * @since 0.1.6
     */
    invalidClassProperty: "Invalid class property",

    /**
     * ### Summary
     *
     * The class definition contains an invalid $extend
     *
     * ### Description
     *
     * $extend can be either a class or a string that must resolve to a class using {@see gpf.context}
     * @since 0.1.6
     */
    invalidClassExtend: "Invalid class extend",

    /**
     * ### Summary
     *
     * The class constructor must be a method
     *
     * ### Description
     *
     * The constructor member is a special one, see {@tutorial DEFINE}
     *
     * @see {@tutorial DEFINE}
     * @since 0.1.7
     */
    invalidClassConstructor: "Invalid class constructor",

    /**
     * ### Summary
     *
     * A member override is changing the type
     *
     * ### Description
     *
     * The constructor member is a special one, see {@tutorial DEFINE}
     *
     * @see {@tutorial DEFINE}
     * @since 0.1.7
     */
    invalidClassOverride: "Invalid class override"

});

/**
 * If extend is a string, apply _gpfContext on it
 *
 * @param {*} extend Extend value
 * @return {*} The initial value or the context one
 * @since 0.1.6
 */
function _gpfDefineClassDecontextifyExtend (extend) {
    if ("string" === typeof extend) {
        return _gpfContext(extend.split("."));
    }
    return extend;
}

Object.assign(_GpfClassDefinition.prototype, /** @lends _gpfClassDefinition.prototype */ {

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
        if (!new RegExp("^[a-z_][a-zA-Z0-9]*$").exec(name)) {
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
     * Check that the constructor is a method
     *
     * @param {*} constructorValue Value read from definition dictionary
     * @throws {gpf.Error.InvalidClassConstructor}
     * @since 0.1.7
     */
    _checkConstructorMember: function (constructorValue) {
        if ("function" !== typeof constructorValue) {
            gpf.Error.invalidClassConstructor();
        }
    },

    /**
     * Check if the value correspond to the overridden value
     *
     * @param {*} value Member value
     * @param {*} overriddenValue Overridden member value
     * @throws {gpf.Error.InvalidClassOverride}
     * @since 0.1.7
     */
    _checkOverridenMember: function (value, overriddenValue) {
        if (typeof value !== typeof overriddenValue) {
            gpf.Error.invalidClassOverride();
        }
    },

    /**
     * Check if the member overrides an inherited one
     *
     * @param {String} name Member name
     * @param {*} value Member value
     * @throws {gpf.Error.InvalidClassOverride}
     * @since 0.1.7
     */
    _checkIfOverriddenMember: function (name, value) {
        var overriddenMember = this._extend.prototype[name];
        if (undefined !== overriddenMember) {
            this._checkOverridenMember(value, overriddenMember);
        }
    },

    /**
     * Check the value of the member:
     * - If the member name is "constructor", it must be a function
     *
     * @param {String} name Property name
     * @param {*} value Property value
     * @private
     * @since 0.1.7
     */
    _checkMemberValue: function (name, value) {
        if ("constructor" === name) {
            this._checkConstructorMember(value);
        } else {
            this._checkIfOverriddenMember(name, value);
        }
    },

    /**
     * @inheritdoc
     * @throws {gpf.Error.InvalidClassProperty}
     * @since 0.1.6
     */
    _checkProperty: function (name, value) {
        _GpfEntityDefinition.prototype._checkProperty.call(this, name);
        this._checkMemberName(name);
        this._checkReservedMemberName(name);
        this._checkMemberValue(name, value);
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
    },

    /**
     * Base class
     *
     * @type {Function}
     * @since 0.1.6
     */
    _extend: Object,

    /**
     * Read extend property
     * @since 0.1.6
     */
    _readExtend: function () {
        var extend = _gpfDefineClassDecontextifyExtend(this._initialDefinition.$extend);
        if (extend) {
            this._extend = extend;
        }
    },

    /**
     * Check extend property
     *
     * @throws {gpf.Error.InvalidClassExtend}
     * @since 0.1.6
     */
    _checkExtend: function () {
        if ("function" !== typeof this._extend) {
            gpf.Error.invalidClassExtend();
        }
    },

    /**
     * @inheritdoc
     * @since 0.1.6
     */
    check: function () {
        this._readExtend();
        this._checkExtend();
        _GpfEntityDefinition.prototype.check.call(this);
    }

});

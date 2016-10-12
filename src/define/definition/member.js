/**
 * @file Class member definition
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*exported _GpfClassDefMember*/ // GPF class member definition
/*#endif*/

_gpfErrorDeclare("define/definition/member", {
    "classMemberOverloadWithTypeChange":
        "Overloading with a different type is forbidden"
});

/**
 * Class member definition
 * - Contains a reference to the class definition where the member is defined
 * - Owns the name, the default value and a reference type
 *
 * @param {String} name Member name
 * @param {*} defaultValue Member default / initial value
 * @param {String} [type=typeof defaultValue] type Member type
 * @class
 */
function _GpfClassDefMember (name, defaultValue, type) {
    /*jshint validthis:true*/ // constructor
    this._name = name;
    this._setDefaultValue(defaultValue);
    this._setType(type || "undefined");
}

_GpfClassDefMember.prototype = {

    /**
     * Owning class definition
     *
     * @type {_GpfClassDefinition}
     */
    _classDef: null,

    /** @return {_GpfClassDefinition} Owning class definition */
    getClassDefinition: function () {
        return this._classDef;
    },

    /** Member name */
    _name: "",

    /** @return {String} Member name */
    getName: function () {
        return this._name;
    },

    /** Default value */
    _defaultValue: undefined,

    _setDefaultValue: function (defaultValue) {
        if (undefined !== defaultValue) {
            this._defaultValue = defaultValue;
        }
    },

    /** Member type */
    _type: "undefined",

    _setType: function (type) {
        if ("undefined" === type) {
            this._setTypeFromDefaultValue();
        } else {
            this._type = type;
        }
    },

    _setTypeFromDefaultValue: function () {
        var type = typeof this._defaultValue;
        if ("undefined" !== type) {
            this._type = type;
        }
    },

    /** @return {String} Member type */
    getType: function () {
        return this._type;
    },

    /**
     * Check if the current member supports overloading with the given one
     *
     * @param {_GpfClassDefMember} member
     * @exception {gpf.Error.classMemberOverloadWithTypeChange}
     */
    checkOverloadedWith: function (member) {
        this._checkMemberType(member);
    },

    _checkMemberType: function (member) {
        if ("undefined" !== this._type && member._type !== this._type) {
            throw gpf.Error.classMemberOverloadWithTypeChange();
        }
    }

};

/*#ifndef(UMD)*/

gpf.internals._GpfClassDefMember = _GpfClassDefMember;

/*#endif*/

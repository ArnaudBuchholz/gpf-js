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
 * Extensible information about a class member
 *
 * @param {String} name Member name
 * @param {*} defaultValue Member default / initial value
 * @param {String} [type=typeof defaultValue] type Member type
 * @class {_GpfClassDefMember}
 */
function _GpfClassDefMember (name, defaultValue, type) {
    /*jshint validthis:true*/ // constructor
    this._name = name;
    this._setDefaultValue(defaultValue);
    this._setType(type || "undefined");
}

_GpfClassDefMember.prototype = {

    // @property {_GpfClassDefinition} Owning class definition
    _classDef: null,

    /**
     * @return {_GpfClassDefinition} Class definition where the member was initially added
     */
    getClassDefinition: function () {
        return this._classDef;
    },

    // @property {String} Member name
    _name: "",

    /**
     * @return {String} Member name
     */
    getName: function () {
        return this._name;
    },

    // @property {*} Default value
    _defaultValue: undefined,

    _setDefaultValue: function (defaultValue) {
        if (undefined !== defaultValue) {
            this._defaultValue = defaultValue;
        }
    },

    // @property {String} Member type
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

    /**
     * @return {String} Member type
     */
    getType: function () {
        return this._type;
    },

    /** @property {_GPF_VISIBILITY} */
    _visibility: _GPF_VISIBILITY_PUBLIC,

    /**
     * Check if the current member supports overloading with the given one
     *
     * @param {_GpfClassDefMember} member
     * @exception
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

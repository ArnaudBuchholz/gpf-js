/*#ifndef(UMD)*/
"use strict";
/*global _GpfExtensibleObject*/ // Extensible
/*exported _GpfClassDefMember*/ // GPF class member definition
/*#endif*/

/**
 * Extensible information about a class member
 *
 * @class {_GpfClassDefMember}
 * @param {_GpfClassDefinition} classDef Owning class definition
 * @param {String} name Member name
 * @param {String} type Member type
 */
function _GpfClassDefMember (classDef, name, type) {
    /*jshint validthis:true*/ // constructor
    this._classDef = classDef;
    this._name = name;
    if (type) {
        this._type = type;
    }
}

_GpfClassDefMember.prototype = {

    // @property {_GpfClassDefinition} Owning class definition
    _classDef: null,

    // @property {String} Member name
    _name: "",

    // @property {String} Member type
    _type: "undefined",


    /**
     * Check if the current member supports overloading with the given one
     *
     * @param {_GpfClassDefMember} member
     * @exception
     */
    checkOverloadedWith: function (member) {
    }

};

_GpfClassDefMember.extension = new _GpfExtensibleObject(_GpfClassDefMember.prototype);

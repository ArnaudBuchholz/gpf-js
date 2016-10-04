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
 * @param {_GpfClassDefinition} classDef Owning class definition
 * @param {String} name Member name
 * @param {String} type Member type
 * @class {_GpfClassDefMember}
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
        if (member._type !== this._type) {
            throw gpf.Error.classMemberOverloadWithTypeChange();
        }
    }

};

/*#ifndef(UMD)*/

gpf.internals._GpfClassDefMember = _GpfClassDefMember;

/*#endif*/

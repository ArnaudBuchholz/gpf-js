/*#ifndef(UMD)*/
"use strict";
/*global _gpfAssert*/ // Assertion method
/*global _GpfExtensibleObject*/ // Extensible
/*global _GpfClassDefMember*/ // GPF class member definition
/*exported _GpfClassDefinition*/ // GPF class definition
/*#endif*/

_gpfErrorDeclare("define/definition/class", {
    "classMemberAlreadyExist":
        "You can't add a member twice"
});

/**
 * Extensible information about a class
 *
 * @class {_GpfClassDefinition}
 * @param {String} qName Fully qualified class name
 * @param {_GpfClassDefinition} [superClassDef=null] superClassDef Super class definition
 */
function _GpfClassDefinition (qName, superClassDef) {
    _gpfAssert(!superClassDef || superClassDef instanceof _GpfClassDefinition, "Expected a _GpfClassDefinition");
    /*jshint validthis:true*/ // constructor
    var superMembers;
    this._qName = qName;
    if (superClassDef) {
        this._super = superClassDef;
        superMembers = superClassDef._member;
    } else {
        superMembers = {};
    }
    this._members = Object.create(superMembers);
}

_GpfClassDefinition.prototype = {

    // @property {String} Fully qualified class name
    _qName: null,

    // @property {_GpfClassDefinition} Super class definition
    _super: null,

    // @property {Object} Dictionary of members
    _members: {},

    /**
     * Get a member by its name
     *
     * @param {String} name Member name
     * @return {_GpfClassDefMember|undefined} Member
     */
    getMember: function (name) {
        return this._members[name];
    },

    /**
     * Add a member
     *
     * @param {_GpfClassDefMember} member Member to add
     * @return {_GpfClassDefinition} Chainable
     */
    addMember: function (member) {
        _gpfAssert(member instanceof _GpfClassDefMember, "Expected a _GpfClassDefMember");
        var name = member.getName(),
            existing = this._members[name];
        if (this._members.hasOwnProperty(name)) {
            throw gpf.Error.classMemberAlreadyExist();
        }
        if (existing) {
            existing.checkOverloadedWith(member);
        }
        this._members[name] = member;
        return this;
    }

};

_GpfClassDefinition.extension = new _GpfExtensibleObject(_GpfClassDefinition.prototype);

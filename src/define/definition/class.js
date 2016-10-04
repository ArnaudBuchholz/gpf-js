/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefMember*/ // GPF class member definition
/*global _gpfAssert*/ // Assertion method
/*global _gpfAsserts*/ // Multiple assertion method
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
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
        superMembers = superClassDef._members;
    } else {
        superMembers = {};
    }
    this._members = Object.create(superMembers);
}

_GpfClassDefinition.prototype = {

    // @property {String} Fully qualified class name
    _qName: null,

    /**
     * @return {String} Class name
     */
    getName: function () {
        if (-1 !== this._qName.indexOf(".")) {
            return this._qName.split(".").pop();
        }
        return this._qName;
    },

    /**
     * @return {String} Class namespace
     */
    getNamespace: function () {
        if (-1 !== this._qName.indexOf(".")) {
            var nameArray = this._qName.split(".");
            nameArray.pop();
            return nameArray.join(".");
        }
        return "";
    },

    /**
     * @return {String} Class qualified name (namespace.name)
     */
    getQualifiedName: function () {
        return this._qName;
    },


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
        _gpfAsserts({
            "Expected a _GpfClassDefMember": member instanceof _GpfClassDefMember,
            "Member is already assigned to a class": null === member._classDef
        });
        var name = member.getName(),
            existing = this._members[name];
        if (existing) {
            if (this._members.hasOwnProperty(name)) {
                throw gpf.Error.classMemberAlreadyExist();
            }
            existing.checkOverloadedWith(member);
        }
        this._members[name] = member;
        member._classDef = this;
        return this;
    }

};

/*#ifndef(UMD)*/

gpf.internals._GpfClassDefinition = _GpfClassDefinition;

/*#endif*/

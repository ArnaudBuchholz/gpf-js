/**
 * @file Class definition
 */
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
 * Link the class definition to its super one, return member dictionary
 *
 * @param {_GpfClassDefinition} classDef Class definition receiving the link
 * @param {_GpfClassDefinition} superClassDef Class definition to link to
 * @returns {Object} Relevant member dictionary
 */
function _gpfLinkToSuperClassDef (classDef, superClassDef) {
    if (superClassDef) {
        classDef._super = superClassDef;
        return superClassDef._members;
    }
    return {};
}

/**
 * Extensible information about a class
 *
 * @class {internals._GpfClassDefinition}
 * @param {String} qName Fully qualified class name
 * @param {_GpfClassDefinition} [superClassDef=null] superClassDef Super class definition
 */
function _GpfClassDefinition (qName, superClassDef) {
    _gpfAssert(!superClassDef || superClassDef instanceof _GpfClassDefinition, "Expected a _GpfClassDefinition");
    /*jshint validthis:true*/ // constructor
    this._qName = qName;
    this._members = Object.create(_gpfLinkToSuperClassDef(this, superClassDef));
}

_GpfClassDefinition.prototype = {

    /** @property {String} Fully qualified class name */
    _qName: null,

    /** @return {String} Class name */
    getName: function () {
        if (-1 !== this._qName.indexOf(".")) {
            return this._qName.split(".").pop();
        }
        return this._qName;
    },

    /** @return {String} Class namespace */
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


    /** @property {_GpfClassDefinition} Super class definition */
    _super: null,

    /** @property {Object} Dictionary of members */
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

    _checkOwnMemberDoesntExist: function (name) {
        if (this._members.hasOwnProperty(name)) {
            throw gpf.Error.classMemberAlreadyExist();
        }
    },

    _checkMemberBeforeAdd: function (member) {
        var name = member.getName(),
            existing;
        this._checkOwnMemberDoesntExist(name);
        existing = this._members[name];
        if (existing) {
            existing.checkOverloadedWith(member);
        }
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
        this._checkMemberBeforeAdd(member);
        this._members[member.getName()] = member;
        member._classDef = this;
        return this;
    }

};

/*#ifndef(UMD)*/

gpf.internals._GpfClassDefinition = _GpfClassDefinition;

/*#endif*/

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
 * Link the class definition to the super one
 *
 * @param {_GpfClassDefinition} classDef Class definition receiving the link
 * @param {_GpfClassDefinition} [superClassDef=undefined] Class definition to link to
 * @return {Object} Superclass member dictionary if provided or an empty object
 */
function _gpfLinkToSuperClassDef (classDef, superClassDef) {
    if (superClassDef) {
        classDef._super = superClassDef;
        return superClassDef._members;
    }
    return {};
}

/**
 * Class definition
 * - Maintain a flat dictionary of members (using prototype inheritance)
 *
 * @param {String} qName Fully qualified class name (namespace.name)
 * @param {_GpfClassDefinition} [superClassDef=undefined] Super class definition
 * @constructor
 */
function _GpfClassDefinition (qName, superClassDef) {
    _gpfAssert(!superClassDef || superClassDef instanceof _GpfClassDefinition, "Expected a _GpfClassDefinition");
    /*jshint validthis:true*/ // constructor
    /*eslint-disable no-invalid-this*/
    this._qName = qName;
    this._members = Object.create(_gpfLinkToSuperClassDef(this, superClassDef));
    /*eslint-enable no-invalid-this*/
}

_GpfClassDefinition.prototype = {

    /** Fully qualified class name */
    _qName: "",

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

    /** @return {String} Class qualified name (namespace.name) */
    getQualifiedName: function () {
        return this._qName;
    },

    /**
     * Super class definition
     *
     * @type {_GpfClassDefinition}
     */
    _super: null,

    /** Dictionary of members */
    _members: {},

    /**
     * Get a member by its name
     *
     * @param {String} name Member name
     * @return {_GpfClassDefMember|undefined} Member or undefined if not found
     */
    getMember: function (name) {
        return this._members[name];
    },

    /**
     * Get a member by its name only if it is defined for this class definition
     *
     * @param {String} name Member name
     * @return {_GpfClassDefMember|undefined} Member or undefined if not found
     */
    getOwnMember: function (name) {
        if (this._members.hasOwnProperty(name)) {
            return this._members[name];
        }
    },

    _checkOwnMemberDoesntExist: function (name) {
        if (this._members.hasOwnProperty(name)) {
            throw gpf.Error.classMemberAlreadyExist();
        }
    },

    /**
     * Get the list of member names that were defined / overridden for this class
     *
     * @return {_GpfClassDefMember[]} List of member names
     */
    getOwnMembers: function () {
        var members = this._members;
        return Object.keys(members).map(function (memberName) {
            return members[memberName];
        }, this);
    },

    /**
     * Before adding a member:
     * - Check that it does not already exist for this class definition
     * - If overloading an inherited member, check that it is compatible
     *
     * @param {_GpfClassDefMember} member Member to check
     * @throws {gpf.Error.classMemberAlreadyExist}
     */
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
     * @gpf:chainable
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
    },

    /**
     * Class constructor method
     *
     * @type {Function}
     */
    _constructorMethod: null,

    /**
     * Set the class constructor
     *
     * @param {Function} constructor Constructor function
     */
    setConstructor: function (constructor) {
        _gpfAssert(typeof constructor === "function", "Function expected");
        this._constructorMethod = constructor;
    },

    /**
     * Get the class constructor
     *
     * @return {Function|null} Class constructor if existing
     */
    getConstructor: function () {
        return this._constructorMethod;
    }

};

/*#ifndef(UMD)*/

gpf.internals._GpfClassDefinition = _GpfClassDefinition;

/*#endif*/

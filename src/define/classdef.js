/**
 * @file Class definition (OLD VERSION)
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/
/*global _getOldNewClassConstructor*/ // Allocate a named class constructor
/*global _gpfAssert*/ // Assertion method
/*global _gpfAsserts*/ // Multiple assertion method
/*global _gpfAttributesAdd*/ // Shortcut for gpf.attributes.add
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfHost*/ // Host type
/*global _gpfIdentifierOtherChars*/ // allowed other chars in an identifier
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _GpfOldClassDefinition*/ // (OLD) GPF class definition
/*exported _gpfDecodeAttributeMember*/ // Normalized way to decode an attribute member name
/*exported _gpfEncodeAttributeMember*/ // Normalized way to encode an attribute member name
/*exported _gpfGetClassDefinition*/ // Get GPF class definition for a constructor
/*#endif*/

_gpfErrorDeclare("define", {
    "classMemberOverloadWithTypeChange":
        "You can't overload a member and change its type",
    "classInvalidVisibility":
        "Invalid visibility keyword"
});

//region Helpers shared with attributes.js

function _gpfEncodeAttributeMember (member) {
    if ("constructor" === member) {
        return "constructor ";
    }
    return member;
}

function _gpfDecodeAttributeMember (member) {
    if ("constructor " === member) {
        return "constructor";
    }
    return member;
}

//endregion

//region _super method

/**
 * Detects if the method calls the _super method.
 * The method source is split on the "._super" key and it check first char after to see if it is not an identifier
 * character (meaning it is more than just _super).
 *
 * @param {Function} method
 * @return {Boolean}
 */
function _gpfUsesSuper (method) {
    var parts = method.toString().split("._super");
    return !parts.every(function (part) {/*gpf:inline(array)*/
        return -1 !== _gpfIdentifierOtherChars.indexOf(part.charAt(0));
    });
}

/**
 * Generates a closure in which this._super points to the base method of the overridden member
 *
 * @param {Function} superMethod
 * @param {Function} method
 * @return {Function}
 * @closure
 */
function _gpfGenSuperMember (superMethod, method) {
    return function GpfSuperableMethod () {
        var previousSuper = this._super,
            result;
        // Add a new ._super() method pointing to the base class member
        this._super = superMethod;
        try {
            // Execute the method
            result = method.apply(this, arguments);
        } finally {
            // Remove it after execution
            /* istanbul ignore else */ // I don't expect to define a member named _super to avoid confusion
            if (undefined === previousSuper) {
                delete this._super;
            } else {
                this._super = previousSuper;
            }
        }
        return result;
    };
}

//endregion

//region Class definition

var
// Global dictionary of known class definitions
    _gpfClassDefinitions = {},

// Unique class definition ID
    _gpfClassDefUID = 0,

// Tag to associate class definition to class
    _GPF_CLASSDEF_MARKER = "_gpf_" + gpf.bin.toHexa(gpf.bin.random(), 8);

/**
 * An helper to create class and store its information
 *
 * @param {String|Function} name
 * @param {Function} Super
 * @param {Object} definition
 * @class gpf.ClassDefinition
 * @constructor
 */
function _GpfOldClassDefinition (name, Super, definition) {
    /*jshint validthis:true*/ // constructor
    this._uid = ++_gpfClassDefUID;
    _gpfClassDefinitions[this._uid] = this;
    this._Subs = [];
    if ("function" === typeof name) {
        this._name = name.compatibleName() || "anonymous";
        // TODO how do we grab the parent constructor (?)
        this._Constructor = name;
    } else {
        this._name = name;
        this._Super = Super;
        this._definition = definition;
        this._build();
    }
}

/**
 * Retrieves (or allocate) the class definition object
 *
 * @param {Function} constructor Class constructor
 * @return {gpf.ClassDefinition}
 */
function _gpfGetClassDefinition (constructor) {
    var classDef,
        uid = constructor[_GPF_CLASSDEF_MARKER];
    if (undefined === uid) {
        classDef = new _GpfOldClassDefinition(constructor);
        /*gpf:constant*/ constructor[_GPF_CLASSDEF_MARKER] = classDef._uid;
    } else {
        classDef = _gpfClassDefinitions[uid];
    }
    return classDef;
}

var _gpfVisibilityKeywords      = "public|protected|private|static".split("|"),
    _GPF_VISIBILITY_UNKNOWN     = -1,
    _GPF_VISIBILITY_PUBLIC      = 0,
    _GPF_VISIBILITY_PROTECTED   = 1,
//  _GPF_VISIBILITY_PRIVATE     = 2,
    _GPF_VISIBILITY_STATIC      = 3;

_GpfOldClassDefinition.prototype = {

    constructor: _GpfOldClassDefinition,

    // Unique identifier
    _uid: 0,

    // Full class name
    _name: "",

    getName: function () {
        return this._name;
    },

    // Super class
    _Super: Object,

    // @property {Function[]} Child classes
    _Subs: [],

    // @property {Object|null} Dictionary of attributes to define (null if none)
    _definitionAttributes: null,

    // Class constructor (as it is exposed)
    _Constructor: _gpfEmptyFunc,

    // Class constructor according to the definition
    _definitionConstructor: null,

    // Resolved constructor (_definitionConstructor or _Super)
    _resolvedConstructor: _gpfEmptyFunc,

    // @property {Object} Class definition (as provided to define)
    _definition: null,

    /**
     * Adds a member to the class definition.
     *
     * @param {String} member
     * @param {*} memberValue
     * @param {String|number} [visibility=_GPF_VISIBILITY_PUBLIC] visibility
     */
    addMember: function (member, memberValue, visibility) {
        if (undefined === visibility) {
            visibility = _GPF_VISIBILITY_PUBLIC;
        } else {
            visibility = _gpfVisibilityKeywords.indexOf(visibility);
            if (-1 === visibility) {
                throw gpf.Error.classInvalidVisibility();
            }
        }
        this._addMember(member, memberValue, visibility);
    },

    /**
     * Adds a member to the class definition
     *
     * @param {String} member
     * @param {*} memberValue
     * @param {number} visibility
     */
    _addMember: function (member, memberValue, visibility) {
        if (_GPF_VISIBILITY_STATIC === visibility) {
            _gpfAssert(undefined === this._Constructor[member], "Static members can't be overridden");
            /*gpf:constant*/ this._Constructor[member] = memberValue;
        } else if ("constructor" === member) {
            this._addConstructor(memberValue, visibility);
        } else {
            this._addNonStaticMember(member, memberValue, visibility);
        }
    },

    /**
     * Adds a constructor the class definition
     *
     * @param {*} memberValue Must be a function
     * @param {number} visibility
     * @closure
     */
    _addConstructor: function (memberValue, visibility) {
        _gpfAsserts({
            "Constructor must be a function": "function" === typeof memberValue,
            "Own constructor can't be overridden": null === this._definitionConstructor
        });
        if (_gpfUsesSuper(memberValue)) {
            memberValue = _gpfGenSuperMember(this._Super, memberValue);
        }
        _gpfIgnore(visibility); // TODO Handle constructor visibility
        this._definitionConstructor = memberValue;
    },

    /**
     * Defines a new non-static member of the class
     *
     * @param {String} member Name of the member to define
     * @param {*} memberValue
     * @param {Number} visibility Visibility of the members
     * @closure
     */
    _addNonStaticMember: function (member, memberValue, visibility) {
        var newType = typeof memberValue,
            baseMemberValue,
            baseType,
            prototype = this._Constructor.prototype;
        _gpfAssert(!prototype.hasOwnProperty(member), "Existing own member can't be overridden");
        baseMemberValue = this._Super.prototype[member];
        baseType = typeof baseMemberValue;
        if ("undefined" !== baseType) {
            if (null !== baseMemberValue && newType !== baseType) {
                throw gpf.Error.classMemberOverloadWithTypeChange();
            }
            if ("function" === newType && _gpfUsesSuper(memberValue)) {
                memberValue = _gpfGenSuperMember(baseMemberValue, memberValue);
            }
        }
        _gpfIgnore(visibility); // TODO Handle constructor visibility
        prototype[member] = memberValue;
    },

    // Check if the member represents an attribute and extracts the name
    _extractAttributeName: function (member) {
        if ("[" !== member.charAt(0) || "]" !== member.charAt(member.length - 1)) {
            return "";
        }
        return _gpfEncodeAttributeMember(member.substr(1, member.length - 2)); // Extract & encode member name
    },

    // store the attribute for later usage
    _addToDefinitionAttributes: function (attributeName, attributeValue) {
        var attributeArray;
        if (this._definitionAttributes) {
            attributeArray = this._definitionAttributes[attributeName];
        } else {
            this._definitionAttributes = {};
        }
        if (undefined === attributeArray) {
            attributeArray = [];
        }
        this._definitionAttributes[attributeName] = attributeArray.concat(attributeValue);
    },

    /**
     * Check if the current member is an attribute declaration.
     * If so, stores it into a temporary map that will be processed as the last step.
     *
     * @param {String} member
     * @param {*} memberValue
     * @returns {Boolean} True when an attribute is detected
     */
    _filterAttribute: function (member, memberValue) {
        var attributeName = this._extractAttributeName(member);
        if (!attributeName) {
            return false;
        }
        this._addToDefinitionAttributes(attributeName, memberValue);
        return true;
    },

    // Default member visibility
    _defaultVisibility: _GPF_VISIBILITY_UNKNOWN,

    // Compute member visibility from default visibility & member name
    _deduceVisibility: function (memberName) {
        var visibility = this._defaultVisibility;
        if (_GPF_VISIBILITY_UNKNOWN === visibility) {
            if (memberName.charAt(0) === "_") {
                visibility = _GPF_VISIBILITY_PROTECTED;
            } else {
                visibility = _GPF_VISIBILITY_PUBLIC;
            }
        }
        return visibility;
    },

    /**
     * Process definition member.
     * The member may be a visibility keyword, in that case _processDefinition is called recursively
     *
     * @param {*} memberValue
     * @param {string} memberName
     */
    _processDefinitionMember: function (memberValue, memberName) {
        if (this._filterAttribute(memberName, memberValue)) {
            return;
        }
        var newVisibility = _gpfVisibilityKeywords.indexOf(memberName);
        if (_GPF_VISIBILITY_UNKNOWN === newVisibility) {
            return this._addMember(memberName, memberValue, this._deduceVisibility(memberName));
        }
        if (_GPF_VISIBILITY_UNKNOWN !== this._defaultVisibility) {
            throw gpf.Error.classInvalidVisibility();
        }
        this._processDefinition(memberValue, newVisibility);
    },

    /**
     * Process class definition
     *
     * @param {Object} definition
     * @param {Number} visibility
     */
    _processDefinition: function (definition, visibility) {
        var isWScript = _GPF_HOST.WSCRIPT === _gpfHost;
        this._defaultVisibility = visibility;
        _gpfObjectForEach(definition, this._processDefinitionMember, this); /*gpf:inline(object)*/
        /* istanbul ignore next */ // WSCRIPT specific #78
        if (isWScript && definition.hasOwnProperty("toString")) {
            this._processDefinitionMember(definition.toString, "toString");
        }
        this._defaultVisibility = _GPF_VISIBILITY_UNKNOWN;
        /* istanbul ignore next */ // WSCRIPT specific #14
        if (isWScript && definition.hasOwnProperty("constructor")) {
            this._addConstructor(definition.constructor, this._defaultVisibility);
        }
    },

    /**
     * Process the attributes collected in the definition
     *
     * NOTE: gpf.attributes._add is defined in attributes.js
     */
    _processAttributes: function () {
        var
            attributes = this._definitionAttributes,
            Constructor,
            newPrototype;
        if (attributes) {
            _gpfAssert("function" === typeof _gpfAttributesAdd, "Attributes can't be defined before they exist");
            Constructor = this._Constructor;
            newPrototype = Constructor.prototype;
            _gpfObjectForEach(attributes, function (attributeList, attributeName) {/*gpf:inline(object)*/
                attributeName = _gpfDecodeAttributeMember(attributeName);
                if (attributeName in newPrototype || attributeName === "Class") {
                    _gpfAttributesAdd(Constructor, attributeName, attributeList);
                } else {
                    // 2013-12-15 ABZ Exceptional, trace it only
                    console.error("gpf.define: Invalid attribute name '" + attributeName + "'");
                }
            });
        }
    },

    // Create the new Class constructor
    _build: function () {
        var
            newClass,
            newPrototype,
            baseClassDef;

        // The new class constructor
        newClass = _getOldNewClassConstructor(this);
        /*gpf:constant*/ this._Constructor = newClass;
        /*gpf:constant*/ newClass[_GPF_CLASSDEF_MARKER] = this._uid;

        // Basic JavaScript inheritance mechanism: Defines the newClass prototype as an instance of the super class
        newPrototype = Object.create(this._Super.prototype);

        // Populate our constructed prototype object
        newClass.prototype = newPrototype;

        // Enforce the constructor to be what we expect
        newPrototype.constructor = newClass;

        /*
         * Defines the link between this class and its base one
         * (It is necessary to do it here because of the gpf.addAttributes that will test the parent class)
         */
        baseClassDef = _gpfGetClassDefinition(this._Super);
        baseClassDef._Subs.push(newClass);

        /*
         * 2014-04-28 ABZ Changed again from two passes on all members to two passes in which the first one also
         * collects attributes to simplify the second pass.
         */
        this._processDefinition(this._definition, _GPF_VISIBILITY_UNKNOWN);
        this._processAttributes();

        // Optimization for the constructor
        this._resolveConstructor();
    },

    _resolveConstructor: function () {
        if (this._definitionConstructor) {
            this._resolvedConstructor = this._definitionConstructor;
        } else if (Object !== this._Super) {
            this._resolvedConstructor = this._Super;
        }
    }

};

//endregion

/*#ifndef(UMD)*/

gpf.internals._gpfGetClassDefinition = _gpfGetClassDefinition;

/*#endif*/

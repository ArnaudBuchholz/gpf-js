/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST_WSCRIPT*/ // gpf.HOST_WSCRIPT
/*global _gpfAttributesAdd*/ // Shortcut for gpf.attributes.add
/*global _gpfContext*/ // Resolve contextual string
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfHost*/ // Host type
/*global _gpfIdentifierOtherChars*/ // allowed other chars in an identifier
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _GpfClassDefinition*/
/*exported _gpfDefine*/
/*exported _gpfGenDefHandler*/
/*exported _gpfGetClassDefinition*/
/*#endif*/

_gpfErrorDeclare("define", {
    "ClassMemberOverloadWithTypeChange":
        "You can't overload a member and change its type",
    "ClassInvalidVisibility":
        "Invalid visibility keyword"
});

//region Class constructor

var
    // Critical section to prevent constructor call when creating inheritance relationship
    _gpfClassConstructorAllowed = true;

/**
 * Template for new class constructor
 * - Uses closure to keep track of the class definition
 * - Class name will be injected at the right place by _gpfNewClassConstructorSrc
 *
 * NOTE: As this is used inside a new function (src), we loose parameter.
 * Also, google closure compiler will try to replace any use of arguments[idx] by a named parameter and it can't work,
 * so the arguments are copied in a variable and used to call _gpfClassInit
 *
 * @param {_GpfClassDefinition} classDef
 * @return {Function}
 * @closure
 */
function _gpfClassConstructorTpl () {
    var classDef = arguments[0],
        constructor = function /* name will be injected here */ () {
            if (_gpfClassConstructorAllowed) {
                classDef._resolvedConstructor.apply(this, arguments);
            }
        };
    return constructor;
}

/**
 * Returns the source of _gpfClassConstructorTpl with the appropriate function name
 *
 * @param {String} name
 * @return {String}
 */
function _gpfNewClassConstructorSrc (name) {
    var
        src = _gpfClassConstructorTpl.toString(),
        start,
        end;
    // Extract body
    start = src.indexOf("{") + 1;
    end = src.lastIndexOf("}") - 1;
    src = src.substr(start, end - start + 1);
    // Inject name of the function
    return src.replace("function", "function " + name);
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
    /*gpf:inline(array)*/ return !parts.every(function (part) {
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
    return function () {
        var previousSuper = this._super,
            result;
        // Add a new ._super() method pointing to the base class member
        this._super = superMethod;
        try {
            // Execute the method
            result = method.apply(this, arguments);
        } finally {
            // Remove it after execution
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
function  _GpfClassDefinition (name, Super, definition) {
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
        classDef = new _GpfClassDefinition(constructor);
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

_GpfClassDefinition.prototype = {

    constructor: _GpfClassDefinition,

    // Unique identifier
    _uid: 0,

    // Full class name
    _name: "",

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
        } else if ("string" === typeof visibility) {
            visibility = _gpfVisibilityKeywords.indexOf(visibility);
            if (-1 === visibility) {
                throw gpf.Error.ClassInvalidVisibility();
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
            gpf.ASSERT(undefined === this._Constructor[member], "Static members can't be overridden");
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
        gpf.ASSERT("function" === typeof memberValue, "Constructor must be a function");
        gpf.ASSERT(null === this._definitionConstructor, "Own constructor can't be overridden");
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
        gpf.ASSERT(!prototype.hasOwnProperty(member), "Existing own member can't be overridden");
        baseMemberValue = this._Super.prototype[member];
        baseType = typeof baseMemberValue;
        if ("undefined" !== baseType) {
            if (null !== baseMemberValue && newType !== baseType) {
                throw gpf.Error.ClassMemberOverloadWithTypeChange();
            }
            if ("function" === newType && _gpfUsesSuper(memberValue)) {
                memberValue = _gpfGenSuperMember(baseMemberValue, memberValue);
            }
        }
        _gpfIgnore(visibility); // TODO Handle constructor visibility
        prototype[member] = memberValue;
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
        var attributeArray;
        if ("[" !== member.charAt(0) || "]" !== member.charAt(member.length - 1)) {
            return false;
        }
        member = member.substr(1, member.length - 2); // Extract member name
        if (this._definitionAttributes) {
            attributeArray = this._definitionAttributes[member];
        } else {
            this._definitionAttributes = {};
        }
        if (undefined === attributeArray) {
            attributeArray = [];
        }
        this._definitionAttributes[member] = attributeArray.concat(memberValue);
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
            throw gpf.Error.ClassInvalidVisibility();
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
        this._defaultVisibility = visibility;
        /*gpf:inline(object)*/ _gpfObjectForEach(definition, this._processDefinitionMember, this);
        this._defaultVisibility = _GPF_VISIBILITY_UNKNOWN;
        // 2014-05-05 #14
        if (_GPF_HOST_WSCRIPT === _gpfHost && definition.constructor !== Object) {
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
            gpf.ASSERT("function" === typeof _gpfAttributesAdd, "Attributes can't be defined before they exist");
            Constructor = this._Constructor;
            newPrototype = Constructor.prototype;
            /*gpf:inline(object)*/ _gpfObjectForEach(attributes, function (attributeList, attributeName) {
                if (attributeName in newPrototype || attributeName === "Class") {
                    _gpfAttributesAdd(Constructor, attributeName, attributeList);
                } else {
                    // 2013-12-15 ABZ Exceptional, trace it only
                    console.error("gpf.define: Invalid attribute name '" + attributeName + "'");
                }
            });
        }
    },

    // Wraps super constructor within critical section to prevents class initialization (and unexpected side effects)
    _safeNewSuper: function () {
        var result;
        _gpfClassConstructorAllowed = false;
        result = new this._Super();
        _gpfClassConstructorAllowed = true;
        return result;
    },

    // Create the new Class constructor
    _build: function () {
        var
            newClass,
            newPrototype,
            baseClassDef,
            constructorName;

        // Build the function name for the constructor
        constructorName = this._name.split(".").pop();

        // The new class constructor
        newClass = _gpfFunc(_gpfNewClassConstructorSrc(constructorName))(this);
        /*gpf:constant*/ this._Constructor = newClass;
        /*gpf:constant*/ newClass[_GPF_CLASSDEF_MARKER] = this._uid;

        // Basic JavaScript inheritance mechanism: Defines the newClass prototype as an instance of the super class
        newPrototype = this._safeNewSuper();

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

//region define

/**
 * Defines a new class by setting a contextual name
 *
 * @param {String} name New class contextual name
 * @param {String} base Base class contextual name
 * @param {Object} definition Class definition
 * @return {Function}
 */
function _gpfDefine (name, base, definition) {
    gpf.ASSERT("string" === typeof name, "name is required (String)");
    gpf.ASSERT("string" === typeof base || base instanceof Function, "base is required (String|Function)");
    gpf.ASSERT("object" === typeof definition, "definition is required (Object)");
    var
        result,
        path,
        ns,
        leafName,
        classDef;
    if (-1 < name.indexOf(".")) {
        path = name.split(".");
        leafName = path.pop();
        ns = _gpfContext(path, true);
    }
    if ("string" === typeof base) {
        // Convert base into the function
        base = _gpfContext(base.split("."));
        gpf.ASSERT(base instanceof Function, "base must resolve to a function");
    }
    classDef = new _GpfClassDefinition(name, base, definition);
    result = classDef._Constructor;
    if (undefined !== ns) {
        ns[leafName] = result;
    }
    return result;
}

/**
 * Defines a new class by setting a contextual name
 *
 * @param {String} name New class contextual name
 * @param {String} [base=undefined] base Base class contextual name
 * @param {Object} [definition=undefined] definition Class definition
 * @return {Function}
 */
gpf.define = function (name, base, definition) {
    if ("object" === typeof base) {
        definition = base;
        base = undefined;
    }
    if (undefined === base) {
        base = Object; // Root class
    }
    return _gpfDefine(name, base, definition || {});
};

/**
 * Allocate a new class handler that is specific to a class type (used for interfaces & attributes)
 *
 * @param {String} ctxRoot Default context root (for intance: gpf.interfaces)
 * @param {String} defaultBase Default contextual root class (for instance: Interface)
 * @return {Function}
 * @closure
 */
function _gpfGenDefHandler (ctxRoot, defaultBase) {
    ctxRoot = ctxRoot + ".";
    defaultBase = ctxRoot + defaultBase;
    return function (name, base, definition) {
        if (undefined === definition && "object" === typeof base) {
            definition = base;
            base = defaultBase;
        }
        if (-1 === name.indexOf(".")) {
            name = ctxRoot + name;
        }
        return _gpfDefine(name, base || defaultBase, definition || {});
    };
}

//endregion

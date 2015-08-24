/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST_WSCRIPT*/ // gpf.HOST_WSCRIPT
/*global _gpfContext*/ // Resolve contextual string
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfIdentifierOtherChars*/ // allowed other chars in an identifier
/*exported _gpfDefine*/
/*exported _gpfGenDefHandler*/
/*exported _gpfGetClassDefinition*/
/*#endif*/

_gpfErrorDeclare("define", {
    "FileNotFound":
        "File not found"
});

var
    _gpfVisibilityKeywords      = "public|protected|private|static".split("|"),
    _GPF_CLASSDEF_MARKER        = "_gpf_" + gpf.bin.toHexa(gpf.bin.random(), 8),
    _GPF_VISIBILITY_PUBLIC      = 0,
    _GPF_VISIBILITY_PROTECTED   = 1,
//  _GPF_VISIBILITY_PRIVATE     = 2,
    _GPF_VISIBILITY_STATIC      = 3,
    _gpfClassInitAllowed        = true,
    _gpfClassDefUID             = 0,

    /**
     * Shortcut for gpf.define
     */
    _gpfDefine = gpf.define, // Fools JSHint, it points to undefined

    /**
     * Template for new class constructor (using name that includes namespace)
     * - Uses closure to keep track of constructor and pass it to _gpfClassInit
     * - _CONSTRUCTOR_ will be replaced with the actual class name
     *
     * As this is used inside a new function (src), we loose parameter
     * Also, google closure compiler will try to replace any use of
     * arguments[idx] by a named parameter (can't work), so...
     *
     * @param {Function} classInit _gpfClassInit
     * @return {Function}
     * @private
     * @closure
     */
    _gpfClassConstructorTpl = function () {
        var
            args = arguments,
            constructor = function /* name will be injected here */ () {
                args[0].apply(this, [constructor, arguments]);
            };
        return constructor;
    },

    /**
     * Returns the source of _newClassConstructor with the appropriate function
     * name
     *
     * @param {String} name
     * @return {String}
     * @private
     */
    _gpfNewClassConstructorSrc = function (name) {
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
    },

    /**
     * Detects if the function uses ._super
     * The function source is split on the "._super" key and I look for the
     * first char after to see if it is not an identifier character.
     *
     * @param {Function} member
     * @return {Boolean}
     * @private
     */
    _gpfUsesSuper = function (member) {
        var
            parts,
            len,
            idx;
        parts = member.toString().split("._super");
        len = parts.length;
        for (idx = 1; idx < len; ++idx) {
            if (-1 === _gpfIdentifierOtherChars.indexOf(parts[idx].charAt(0))) {
                return true; // Used
            }
        }
        return false; // Not used
    },

    /**
     * Generates a closure in which this._super points to the base definition of
     * the overridden member
     *
     * @param {Function} superMember
     * @param {Function} member
     * @return {Function}
     * @private
     * @closure
     */
    _gpfGenSuperMember = function (superMember, member) {
        return function () {
            var
                previousSuper = this._super,
                result;
            // Add a new ._super() method pointing to the base class member
            this._super = superMember;
            try {
                // Execute the method
                result = member.apply(this, arguments);
            } finally {
                // Remove it when we're done executing
                if (undefined === previousSuper) {
                    delete this._super;
                } else {
                    this._super = previousSuper;
                }
            }
            return result;
        };
    },

    /**
     * Allocate a new class handler that is specific to a class type
     * (used for interfaces & attributes)
     *
     * @param {String} ctxRoot Default context root
     * @param {String} defaultBase Default contextual root class
     * @private
     */
    _gpfGenDefHandler = function (ctxRoot, defaultBase) {
        ctxRoot = ctxRoot + ".";
        return function (name, base, definition) {
            var result;
            if (undefined === definition && "object" === typeof base) {
                definition = base;
                base = ctxRoot + defaultBase;
            } else if (undefined === base) {
                base = ctxRoot + defaultBase;
            }
            if (-1 === name.indexOf(".")) {
                name = ctxRoot + name;
            }
            result = _gpfDefine(name, base, definition);
            return result;
        };
    },

//region Class definition helper

    /**
     * Global dictionary of known class definitions
     *
     * @type {Object}
     * @private
     */
    _gpfClassDefinitions = {},

    /**
     * An helper to create class and store its information
     *
     * @class gpf.ClassDefinition
     * @constructor
     * @param {String|Function} name
     * @param {Function} Super
     * @param {Object} definition
     * @private
     */
    _GpfClassDefinition = function  (name, Super, definition) {
        this._uid = ++_gpfClassDefUID;
        _gpfClassDefinitions[this._uid] = this;
        this._Subs = [];
        if ("function" === typeof name) {
            // TODO use js tokenizer to extract function name (if any)
            this._name = "anonymous";
            // TODO how do we grab the parent constructor (?)
            this._Constructor = name;
        } else {
            this._name = name;
            this._Super = Super;
            this._definition = definition;
            this._build();
        }
    },

    /**
     * Retrieves (or allocate) the class definition object
     *
     * @param {Function} constructor Class constructor
     * @return {gpf.ClassDefinition}
     */
    _gpfGetClassDefinition = function (constructor) {
        var classDef,
            uid = constructor[_GPF_CLASSDEF_MARKER];
        if (undefined === uid) {
            classDef = new _GpfClassDefinition(constructor);
            /*gpf:constant*/ constructor[_GPF_CLASSDEF_MARKER] = classDef.uid();
        } else {
            classDef = _gpfClassDefinitions[uid];
        }
        return classDef;
    },

    /**
     * Class initializer: it triggers the call to this._defConstructor only if
     * _gpfClassInitAllowed is true.
     *
     * @param {Function} constructor Class constructor
     * @param {*[]} args Arguments
     * @private
     */
    _gpfClassInit = function (constructor, args) {
        if (_gpfClassInitAllowed) {
            var classDef = _gpfGetClassDefinition(constructor);
            // TODO Implement deferred class building here
            if (classDef._defConstructor) {
                classDef._defConstructor.apply(this, args);
            } else {
                classDef._Super.apply(this, args);
            }
        }
    };

_GpfClassDefinition.prototype = {

    constructor: _GpfClassDefinition,

    //region Members

    /**
     * Unique identifier
     *
     * @type {Number}
     * @private
     */
    _uid: 0,

    /**
     * Unique identifier
     *
     * @return {Number}
     */
    uid: function () {
        return this._uid;
    },

    /**
     * Full class name
     *
     * @type {String}
     * @private
     */
    _name: "",

    /**
     * Full class name
     *
     * @return {String}
     */
    name: function () {
        return this._name;
    },

    /**
     * Class name (without namespace)
     *
     * @return {String}
     */
    nameOnly: function () {
        var name = this._name,
            pos = name.lastIndexOf(".");
        if (-1 === pos) {
            return name;
        } else {
            return name.substr(pos + 1);
        }
    },

    /**
     * Super class
     *
     * @type {Function}
     * @private
     */
    _Super: Object,

    /**
     * Super class
     *
     * @return {Function}
     */
    Super: function () {
        return this._Super;
    },

    /**
     * Child classes
     *
     * @type {Function[}}
     * @private
     */
    _Subs: [],

    /**
     * Child classes
     *
     * @return {Function[}}
     */
    Subs: function () {
        return this._Subs;
    },

    /**
     * Attributes of this class
     *
     * NOTE: during definition, this member is used as a simple JavaScript
     * Object
     *
     * @type {gpf.attributes.Map}
     * @private
     */
    _attributes: null,

    /**
     * Attributes of this class
     *
     * @return {gpf.attributes.Map}
     */
    attributes: function () {
        if (!this._attributes) {
            this._attributes = new gpf.attributes.Map();
        }
        return this._attributes;
    },

    /**
     * Class constructor
     *
     * @type {Function}
     * @private
     */
    _Constructor: function () {},

    /**
     * Class 'definition' constructor
     *
     * @type {Function}
     * @private
     */
    _defConstructor: null,

    /**
     * Class constructor
     *
     * @return {Function}
     */
    Constructor: function () {
        return this._Constructor;
    },

    //endregion

    //region Class construction

    /**
     * Class definition
     *
     * @type {Object}
     * @private
     */
    _definition: null,

    /**
     * Adds a member to the class definition.
     * This method must not be used for
     * - constructor
     * - overriding an existing member
     *
     * @param {String} member
     * @param {*} value
     * @param {String|number} [visibility=_GPF_VISIBILITY_PUBLIC] visibility
     */
    addMember: function (member, value, visibility) {
        var
            newPrototype = this._Constructor.prototype;
        gpf.ASSERT(member !== "constructor", "No constructor can be added");
        gpf.ASSERT(undefined === newPrototype[member],
            "No member can be overridden");
        if (undefined === visibility) {
            visibility = _GPF_VISIBILITY_PUBLIC;
        } else if ("string" === typeof visibility) {
            visibility = _gpfVisibilityKeywords.indexOf(visibility);
            if (-1 === visibility) {
                visibility = _GPF_VISIBILITY_PUBLIC;
            }
        }
        this._addMember(member, value, visibility);
    },

    /**
     * Adds a member to the class definition
     *
     * @param {String} member
     * @param {*} value
     * @param {number} visibility
     * @private
     */
    _addMember: function (member, value, visibility) {
        var
            newPrototype = this._Constructor.prototype;
        if (_GPF_VISIBILITY_STATIC === visibility) {
            /*gpf:constant*/ newPrototype.constructor[member] = value;
        } else {
            newPrototype[member] = value;
        }
    },

    /**
     * Defines a new member of the class
     *
     * @param {String} member Name of the member to define
     * @param {Number} visibility Visibility of the members
     * @private
     * @closure
     */
    _processMember: function (member, visibility) {
        // Don't know yet how I want to handle visibility
        var
            defMember = this._definition[member],
            isConstructor = member === "constructor",
            newType,
            baseMember,
            baseType;
        newType = typeof defMember;
        if (_GPF_VISIBILITY_STATIC === visibility) {
            // No inheritance can be applied here
            this._addMember(member, defMember, _GPF_VISIBILITY_STATIC);
            return;
        }
        if (isConstructor) {
            baseMember = this._Super;
        } else {
            baseMember = this._Super.prototype[member];
        }
        baseType = typeof baseMember;
        if ("undefined" !== baseType
            && null !== baseMember // Special case as null is common
            && newType !== baseType) {
            throw gpf.Error.ClassMemberOverloadWithTypeChange();
        }
        if ("function" === newType
            && "undefined" !== baseType
            && _gpfUsesSuper(defMember)) {
            /*
             * As it is a function override, _super is a way to access the
             * base function.
             */
            defMember = _gpfGenSuperMember(baseMember, defMember);
        }
        if (isConstructor) {
            this._defConstructor = defMember;
        } else {
            this._addMember(member, defMember, visibility);
        }
    },

    /**
     * An attribute definition is found in the class definition, store it
     * into a temporary map: it will be processed later
     *
     * @param {String} key Attribute name of the member to associate the
     * attributes to ([name])
     * @private
     */
    _processAttribute: function (key) {
        var
            attributeArray,
            newAttributeArray = this._definition[key];
        key = key.substr(1, key.length - 2); // Extract member name
        if (!this._attributes) {
            this._attributes = {};
        }
        attributeArray = this._attributes[key];
        if (undefined === attributeArray) {
            attributeArray = [];
        }
        this._attributes[key] = attributeArray.concat(newAttributeArray);
    },

    /**
     * Process class definition including visibility
     *
     * NOTE: alters this._definition
     *
     * @param {Number} visibility Visibility of the members
     * @private
     */
    _processDefWithVisibility: function (visibility) {
        var
            initialDefinition = this._definition,
            definition,
            member;
        member = _gpfVisibilityKeywords[visibility];
        definition = initialDefinition[member];
        this._definition = definition;
        try {
            for (member in definition) {
                if (definition.hasOwnProperty(member)) {

                    // Attribute
                    if ("[" === member.charAt(0)
                        && "]" === member.charAt(member.length - 1)) {

                        this._processAttribute(member);

                        // Visibility
                    } else if ("public" === member
                        || "private" === member
                        || "protected" === member
                        || "static" === member) {
                        throw gpf.Error.ClassInvalidVisibility();
                        // Usual member
                    } else {
                        this._processMember(member, visibility);
                    }
                }
            }
            // 2014-05-05 #14
            if (_GPF_HOST_WSCRIPT === _gpfHost
                && definition.constructor !== Object) {
                this._processMember("constructor", visibility);
            }
        } finally {
            this._definition = initialDefinition;
        }
    },

    /**
     * Process definition
     *
     * @private
     */
    _processDefinition: function () {
        var
            definition = this._definition,
            member,
            visibility;
        for (member in definition) {
            if (definition.hasOwnProperty(member)) {
                if ("[" === member.charAt(0)
                    && "]" === member.charAt(member.length - 1)) {
                    // Attribute
                    this._processAttribute(member);
                } else {
                    visibility = _gpfVisibilityKeywords
                        .indexOf(member);
                    if (-1 === visibility) {
                        // Usual member, protected if starting with _
                        if (member.charAt(0) === "_") {
                            visibility = _GPF_VISIBILITY_PROTECTED;
                        } else {
                            visibility = _GPF_VISIBILITY_PUBLIC;
                        }
                        this._processMember(member, visibility);
                    } else {
                        // Visibility
                        this._processDefWithVisibility(visibility);
                    }
                }
            }
        }
        // 2014-05-05 #14
        if (_GPF_HOST_WSCRIPT === _gpfHost && definition.constructor !== Object) {
            this._processMember("constructor", _GPF_VISIBILITY_PUBLIC);
        }
    },

    /**
     * Process the attributes collected in the definition
     *
     * NOTE: gpf.attributes._add is defined in attributes.js
     *
     * @private
     */
    _processAttributes: function () {
        var
            attributes = this._attributes,
            Constructor,
            newPrototype,
            attributeName;
        if (attributes) {
            delete this._attributes;
            Constructor = this._Constructor;
            newPrototype = Constructor.prototype;
            for (attributeName in attributes) {
                if (attributes.hasOwnProperty(attributeName)) {
                    if (attributeName in newPrototype
                        || attributeName === "Class") {
                        gpf.attributes.add(Constructor, attributeName,
                            attributes[attributeName]);
                    } else {
                        // 2013-12-15 ABZ Exceptional, trace it only
                        console.error("gpf.define: Invalid attribute name '"
                        + attributeName + "'");
                    }
                }
            }
        }
    },

    /**
     * Create the new Class constructor
     *
     * @closure
     */
    _build: function () {
        var
            newClass,
            newPrototype,
            baseClassDef,
            name = this._name,
            constructorName;

        // Build the function name for the constructor
        // if "." is not found, lastIndexOf = -1 and lastIndexOf + 1 = 0
        constructorName = name.substr(name.lastIndexOf(".") + 1);
        // The new class constructor
        newClass = _gpfFunc(_gpfNewClassConstructorSrc(constructorName))
            (_gpfClassInit);
        this._Constructor = newClass;
        /*gpf:constant*/ newClass[_GPF_CLASSDEF_MARKER] = this._uid;

        /*
         * Basic JavaScript inheritance mechanism:
         * Defines the newClass prototype as an instance of the base class
         * Do it in a critical section that prevents class initialization
         */
        _gpfClassInitAllowed = false;
        newPrototype = new this._Super();
        _gpfClassInitAllowed = true;

        // Populate our constructed prototype object
        newClass.prototype = newPrototype;

        // Enforce the constructor to be what we expect
        newPrototype.constructor = newClass;

        /*
         * Defines the link between this class and its base one
         * (It is necessary to do it here because of the gpf.addAttributes
         * that will test the parent class)
         */
        baseClassDef = _gpfGetClassDefinition(this._Super);
        baseClassDef.Subs().push(newClass);

        /*
         * 2014-04-28 ABZ Changed again from two passes on all members to
         * two passes in which the first one also collects attributes to
         * simplify the second pass.
         */
        this._processDefinition();
        this._processAttributes();
    }

    //endregion
};

//endregion

/**
 * Defines a new class by setting a contextual name
 *
 * @param {String} name New class contextual name
 * @param {String} [base=undefined] base Base class contextual name
 * @param {Object} [definition=undefined] definition Class definition
 * @return {Function}
 */
_gpfDefine = gpf.define = function (name, base, definition) {
    var
        result,
        path,
        ns,
        leafName,
        classDef;
    if ("string" === typeof base) {
        // Convert base into the function
        base = _gpfContext(base.split("."));

    } else if ("object" === typeof base) {
        definition = base;
        base = undefined;
    }
    if (undefined === base) {
        base = Object; // Root class
    }
    if (-1 < name.indexOf(".")) {
        path = name.split(".");
        leafName = path.pop();
        ns = _gpfContext(path, true);
    }
    classDef = new _GpfClassDefinition(name, base, definition || {});
    result = classDef.Constructor();
    if (undefined !== ns) {
        ns[leafName] = result;
    }
    return result;
};
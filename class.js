/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

/*
 * Rewrote class management to be more compatible with other frameworks.
 * Especially, it should not be necessary to inherit from a give root class
 * (as previously with gpf.Class).
 *
 * Only one function is available to create a class but it is not mandatory:
 * gpf.define(name, baseClass, definition)
 *
 * definition is an object describing members of the class and its attributes.
 *
 * NEW: use private, protected, static and public to declare visibility.
 *
 * As a first step, this won't change the way the object is created but I plan
 * to add validations in the future.
 *
 * The constructor function is based on the constructor member of the definition
 *
 * for instance:
 * var Test = gpf.define("Test", {
 *
 *   private: {
 *     _member: 0
 *   },
 *
 *   reset: function () {
 *   },
 *
 *   static: {
 *     DEFAULT_VALUE: 0
 *   },
 *
 *   constructor: function (value) {
 *     if (undefined === value) {
 *       value = this.static.DEFAULT_VALUE;
 *     }
 *     this._member = value;
 *     this.reset();
 *   }
 * });
 *
 * Per JavaScript prototype model, this.constructor returns the initialisation
 * function. This object also receives these new members:
 * - static members
 * - Base member (the case for inheritance)
 *   Base.prototype is assigned to object prototype.super
 *   so that the following is possible:
 *   function myMethod(param) {
 *     this.constructor.Base.prototype.myMethod.apply(this, param)
 *   }
 * - _attributes (for attributes)
 *
 *
 */

    var
        _CLASS_PUBLIC       = 0,
        _CLASS_PROTECTED    = 1,
        _CLASS_PRIVATE      = 2,
        _CLASS_STATIC       = 3,

        _classInitAllowed   = true;

    /**
     * An helper to store class information
     *
     * @class ClassInfo
     * @constructor
     * @private
     */
    function ClassInfo() {
        this._Subs = [];
    }

    gpf.extend(ClassInfo.prototype, {

        /**
         * Base class
         *
         * @type {Function}
         * @private
         */
        _Base: null,

        /**
         * Base class
         *
         * @return {Function}
         */
        Base: function () {
            return this._Base;
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
            /*__begin__thread_safe__*/
            if (!this._attributes) {
                this._attributes = new gpf.attributes.Map();
            }
            /*__end_thread_safe__*/
            return this._attributes;
        },

        /**
         * Class constructor (when used with gpf.define)
         *
         * @type {Function}
         * @private
         */
        _constructor: function () {}
    });

    /**
     * Retrieves (or allocate) the class information object
     *
     * @param {Function} constructor Class constructor
     * @returns {ClassInfo}
     */
    gpf.classInfo = function (constructor) {
        if (undefined === constructor._gpf) {
            constructor._gpf = new ClassInfo();
        }
        return constructor._gpf;
    };

    /**
     * Class initializer: it triggers the call to this._constructor only if
     * _classInitAllowed is true.
     *
     * @param {Function} constructor Class constructor
     * @param {*[]} args Arguments
     * @private
     */
    gpf._classInit = function (constructor, args) {
        if (_classInitAllowed) {
            gpf.classInfo(constructor)._constructor.apply(this, args);
        }
    };

    /**
     * Defines a new member of the class
     *
     * @param {Object} definition Class definition
     * @param {Object} basePrototype Base prototype
     * @param {Object} newPrototype Class prototype
     * @param {String} member Name of the member to define
     * @param {Number} visibility Visibility of the members
     * @private
     */
    function /*gpf:inline*/ _processMember(definition, basePrototype,
        newPrototype, member/*, visibility*/) {
        // Don't know yet how I want to handle visibility
        var
            defMember = definition[member],
            newType = typeof defMember,
            baseMember = basePrototype[member],
            baseType = typeof baseMember,
            baseName;
        if ("undefined" !== baseType && newType !== baseType) {
            throw {
                message: "You can't overload a member to change its type"
            };
        }
        if ("function" === newType && "undefined" !== baseType) {
            /*
             * As it is a function overload, defines a new member that will give
             * a quick access to the base function. This should answer 90% of
             * the cases.
             *
             * TODO how do we handle possible conflict name
             */
            baseName = member;
            if ("_" === baseName.charAt(0)) {
                baseName = baseName.substr(1);
            }
            // Capitalize
            baseName = baseName.charAt(0).toUpperCase() + baseName.substr(1);
            newPrototype["_base" + baseName] = baseMember;
        }
        if ("constructor" === member) {
            gpf.classInfo(newPrototype.constructor)._constructor = defMember;
        } else {
            newPrototype[member] = defMember;
        }
    }

    /**
     * Add the attribute to the map
     *
     * @param {Object} definition Class definition
     * @param {String} member Name of the member to define
     * @param {Object} attributes Map of name to attribute list
     * @private
     */
    function /*gpf:inline*/ _processAttribute(definition, member, attributes) {
        var
            attributeArray = attributes[member],
            newAttributeArray = definition[member];
        member = member.substr(1, member.length - 2);
        if (undefined === attributeArray) {
            attributeArray = [];
        }
        attributes[member] = attributeArray.concat(newAttributeArray);
    }

    /**
     * Process class definition including visibility
     *
     * @param {Object} definition Class definition
     * @param {Object} basePrototype Base prototype
     * @param {Object} newPrototype Class prototype
     * @param {Object} attributes Map of name to attribute list
     * @param {Number} visibility Visibility of the members
     * @private
     */
    function _processDefWithVisibility(definition, basePrototype, newPrototype,
        attributes, visibility) {
        var
            member;
        for (member in definition) {
            if (definition.hasOwnProperty(member)) {

                // Attribute
                if ("[" === member.charAt(0)
                    && "]" === member.charAt(member.length - 1)) {

                    _processAttribute(definition, member, attributes);

                // Visibility
                } else if ("public" === member
                           || "private" === member
                           || "protected" === member
                           || "static" === member) {
                    throw {
                        message: "Invalid visibility keyword"
                    };

                // Usual member
                } else {
                    _processMember(definition, basePrototype, newPrototype,
                        member, visibility);
                }
            }
        }
    }

    /**
     * Process class definition
     *
     * @param {Object} definition Class definition
     * @param {Object} basePrototype Base prototype
     * @param {Object} newPrototype Class prototype
     * @param {Object} attributes Map of name to attribute list
     * @private
     */
    function /*gpf:inline*/ _processDefinition(definition, basePrototype,
        newPrototype, attributes) {
        var
            member;
        for (member in definition) {
            if (definition.hasOwnProperty(member)) {

                // Attribute
                if ("[" === member.charAt(0)
                    && "]" === member.charAt(member.length - 1)) {

                    _processAttribute(definition, member, attributes);

                // Visibility
                } else if ("public" === member) {
                    _processDefWithVisibility(definition[member], basePrototype,
                        newPrototype, attributes, _CLASS_PUBLIC);
                } else if ("private" === member) {
                    _processDefWithVisibility(definition[member], basePrototype,
                        newPrototype, attributes, _CLASS_PRIVATE);
                } else if ("protected" === member) {
                    _processDefWithVisibility(definition[member], basePrototype,
                        newPrototype, attributes, _CLASS_PROTECTED);
                } else if ("static" === member) {
                    _processDefWithVisibility(definition[member], basePrototype,
                        newPrototype, attributes, _CLASS_STATIC);

                // Usual member
                } else {
                    _processMember(definition, basePrototype, newPrototype,
                        member, _CLASS_PUBLIC /*default*/);
                }
            }
        }
    }

    /**
     * Process the attributes collected in the definition
     *
     * NOTE: gpf.attributes._add is defined in attributes.js

     * @param {Object} attributes Map of name to attribute list
     * @param {Function} newClass
     * @param {Object} newPrototype Class prototype
     * @private
     */
    function /*gpf:inline*/ _processAttributes(attributes, newClass,
        newPrototype) {
        var
            attributeName;
        for (attributeName in attributes) {
            if (attributes.hasOwnProperty(attributeName)) {
                if (attributeName in newPrototype
                    || attributeName === "Class") {
                    gpf.attributes.add(newClass, attributeName,
                        attributes[attributeName]);
                } else {
                    // 2013-12-15 ABZ Consider this as exceptional, trace it
                    console.error("gpf.Class::extend: Invalid attribute name '"
                        + attributeName + "'");
                }
            }
        }
    }

    /**
     * Create a new Class
     *
     * @param {String} name Name of the class
     * @param {Function} Base Base class to inherit from
     * @param {Object} definition Members / Attributes of the class
     * @return {Function} new class constructor
     * @closure
     */
    function _createClass(name, Base, definition) {
        var
            basePrototype = Base.prototype,
            newClass,
            newPrototype,
            newClassInfo,
            baseClassInfo,
            attributes = {};

        // The new class constructor (uses closure)
        newClass = (gpf._func("var constructor = function " + name + "() {" +
                "gpf._classInit.apply(this, [constructor, arguments]);" +
            "}; return constructor;"))();

        /*
         * Basic JavaScript inheritance mechanism:
         * Defines the newClass prototype as an instance of the base class
         * Do it in a critical section that prevents class initialization
         */
        /*__begin__thread_safe__*/
        _classInitAllowed = false;
        newPrototype = new Base();
        _classInitAllowed = true;
        /*__end_thread_safe__*/

        // Populate our constructed prototype object
        newClass.prototype = newPrototype;

        // Enforce the constructor to be what we expect
        newPrototype.constructor = newClass;

        /*
         * Defines the link between this class and its base one
         * (It is necessary to do it here because of the gpf.addAttributes that
         * will test the parent class)
         */
        newClassInfo = gpf.classInfo(newClass);
        newClassInfo._Base = Base;
        baseClassInfo = gpf.classInfo(Base);
        baseClassInfo.Subs().push(newClass);

        /*
         * 2014-04-28 ABZ Changed again from two passes on all members to two
         * passes in which the first one also collects attributes to simplify
         * the second pass.
         */
        _processDefinition(definition, basePrototype, newPrototype, attributes);
        _processAttributes(attributes, newClass, newPrototype);
        return newClass;
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
        var
            result,
            ns,
            path;
        if ("string" === typeof base) {
            // Convert base into the function
            base = gpf.context(base);

        } else if ("object" === typeof base) {
            definition = base;
            base = undefined;
        }
        if (undefined === base) {
            base = Object; // Root class
        }
        if (-1 < name.indexOf(".")) {
            path = name.split(".");
            name = path.pop();
            ns = gpf.context(path);
        }
        result = _createClass(name, base, definition || {});
        if (undefined !== ns) {
            ns[name] = result;
        }
        return result;
    };

    /**
     * Allocate a new class handler that is specific to a class type
     * (used for interfaces & attributes)
     *
     * @param {String} ctxRoot Default context root
     * @param {String} defaultBase Default contextual root class
     * @private
     */
    gpf._genDefHandler = function (ctxRoot, defaultBase) {
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
            result = gpf.define(name, base, definition);
            return result;
        };
    };

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/
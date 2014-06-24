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
 * 2014-05-05 #14
 *  Found that the 'constructor' member is treated in a special way with
 *  cscript.exe. hasOwnProperty returns false with it.
 *
 */

    /**
     * An helper to create class and store its information
     *
     * @class ClassDefinition
     * @constructor
     * @private
     */
    function ClassDefinition (name, base, definition) {
        this._Subs = [];
        if ("function" === typeof name) {
            // Should try to extract class info from there
            this._constructor = name;
        } else {
            this._name = name;
            this._Base = base;
        }
    }

    /* Statics */
    ClassDefinition._PUBLIC      = 0;
    ClassDefinition._PROTECTED   = 1;
    ClassDefinition._PRIVATE     = 2;
    ClassDefinition._STATIC      = 3;
    ClassDefinition._initAllowed = true;

    gpf.extend(ClassDefinition.prototype, {

        /**
         * Class name
         *
         * @type {String}
         * @private
         */
        _name: "",

        /**
         * Class name
         *
         * @return {String}
         */
        name: function () {
            return this._name;
        },

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
        _factory: function () {},

        Factory
    });

    /**
     * Retrieves (or allocate) the class information object
     *
     * @param {Function} constructor Class constructor
     * @returns {ClassInfo}
     */
    gpf.classDef = function (constructor) {
        if (undefined === constructor._gpf) {
            constructor._gpf = new ClassDefinition(constructor);
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
        if (ClassDefinition._initAllowed) {
            gpf.classDef(constructor)._constructor.apply(this, args);
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
        newPrototype, member, visibility) {
        // Don't know yet how I want to handle visibility
        var
            defMember = definition[member],
            newType,
            baseMember,
            baseType,
            baseName;
        newType = typeof defMember;
        if (_CLASS_STATIC === visibility) {
            // No inheritance can be applied here
            newPrototype.constructor[member] = defMember;
            return;
        }
        baseMember = basePrototype[member];
        baseType = typeof baseMember;
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
        // 2014-05-05 #14
        if ("wscript" === gpf.host() && definition.constructor !== Object) {
            _processMember(definition, basePrototype, newPrototype,
                "constructor", visibility);
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
        // 2014-05-05 #14
        if ("wscript" === gpf.host() && definition.constructor !== Object) {
            _processMember(definition, basePrototype, newPrototype,
                "constructor", _CLASS_PUBLIC /*default*/);
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
     * Template for new class constructor
     * - Uses closure to keep track of gpf handle and constructor function
     * - _CONSTRUCTOR_ will be replaced with the actual class name
     *
     * @returns {Function}
     * @private
     */
    function _newClassConstructor() {
        var
            gpf = arguments[0],
            constructor = function _CONSTRUCTOR_ () {
                gpf._classInit.apply(this, [constructor, arguments]);
            };
        return constructor;
    }

    /**
     * Returns the source of _newClassConstructor with the appropriate class
     * name
     *
     * @param {String} name
     * @return {String}
     * @private
     */
    function _getNewClassConstructorSrc(name) {
        var
            src = _newClassConstructor
                    .toString()
                    .replace("_CONSTRUCTOR_", name),
            start = src.indexOf("{") + 1,
            end = src.lastIndexOf("}") - 1;
        return src.substr(start, end - start + 1);
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

        // The new class constructor
        newClass = gpf._func(_getNewClassConstructorSrc(name))(gpf);

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
        newClassInfo._name = name;
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

        /*
         * If no constructor was defined, use the inherited one
         * TODO: Not sure this is the best way to handle the situation but at
         * least, it is isolated here
         */
        if (!newClassInfo.hasOwnProperty("_constructor")) {
            newClassInfo._constructor = Base;
        }

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
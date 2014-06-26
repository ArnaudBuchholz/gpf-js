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
 * 2014-06-25
 *  Rewrote to consolidate everything in a single class that handles both
 *  definition and information
 *
 */

    /**
     * An helper to create class and store its information
     *
     * @class ClassDefinition
     * @constructor
     * @param {String|Function} name
     * @param {Function} Base
     * @param {Object} definition
     * @private
     */
    function ClassDefinition (name, Base, definition) {
        this._Subs = [];
        if ("function" === typeof name) {
            // Should try to extract class info from there
            this._Constructor = name;
        } else {
            this._name = name;
            this._Base = Base;
            this._definition = definition;
        }
    }

    /* Statics */
    ClassDefinition._visibilityKeywords =
        "public|protected|private|static".split("|");
    ClassDefinition._PUBLIC      = 0;
    ClassDefinition._PROTECTED   = 1;
    ClassDefinition._PRIVATE     = 2;
    ClassDefinition._STATIC      = 3;
    ClassDefinition._initAllowed = true;

    gpf.extend(ClassDefinition.prototype, {

        //region Members

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
         * NOTE: during definition, this member is used as a simple JavaScript
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
         * Class constructor
         *
         * @type {Function}
         * @private
         */
        _Constructor: function () {},

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
         * Defines a new member of the class
         *
         * @param {String} member Name of the member to define
         * @param {Number} visibility Visibility of the members
         * @private
         */
        _processMember: function (member, visibility) {
            // Don't know yet how I want to handle visibility
            var
                newPrototype = this._Constructor.prototype,
                defMember = this._definition[member],
                newType,
                baseMember,
                baseType,
                baseName;
            newType = typeof defMember;
            if (ClassDefinition._STATIC === visibility) {
                // No inheritance can be applied here
                newPrototype.constructor[member] = defMember;
                return;
            }
            baseMember = this._Base.prototype[member];
            baseType = typeof baseMember;
            if ("undefined" !== baseType && newType !== baseType) {
                throw {
                    message: "You can't overload a member to change its type"
                };
            }
            if ("function" === newType && "undefined" !== baseType) {
                /*
                 * As it is a function overload, defines a new member that will
                 * give a quick access to the base function. This should answer
                 * 90% of the cases.
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
            member = ClassDefinition._visibilityKeywords[visibility];
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
                            throw {
                                message: "Invalid visibility keyword"
                            };

                            // Usual member
                        } else {
                            this._processMember(member, visibility);
                        }
                    }
                }
                // 2014-05-05 #14
                if ("wscript" === gpf.host()
                    && definition.constructor !== Object) {
                    this._processMember("constructor", visibility);
                }
            } catch (e) {
                throw e;
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
                        visibility = ClassDefinition._visibilityKeywords
                            .indexOf(member);
                        if (-1 === visibility) {
                            // Usual member
                            this._processMember(member,
                                ClassDefinition._PUBLIC);
                        } else {
                            // Visibility
                            this._processDefWithVisibility(visibility);
                        }
                    }
                }
            }
            // 2014-05-05 #14
            if ("wscript" === gpf.host() && definition.constructor !== Object) {
                this._processMember("constructor", ClassDefinition._PUBLIC);
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

        //endregion
    });

    //region Class related helpers

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
     * NOTE: it must belong to gpf as the created closure will use gpf as an
     * anchor point.
     *
     * @param {Function} constructor Class constructor
     * @param {*[]} args Arguments
     * @private
     */
    gpf._classInit = function (constructor, args) {
        if (ClassDefinition._initAllowed) {
            gpf.classDef(constructor)._Constructor.apply(this, args);
        }
    };

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

    //endregion

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
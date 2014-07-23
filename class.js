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

    var
        _visibilityKeywords     = "public|protected|private|static".split("|"),
        _VISIBILITY_PUBLIC      = 0,
//        _VISIBILITY_PROTECTED   = 1,
//        _VISIBILITY_PRIVATE     = 2,
        _VISIBILITY_STATIC      = 3,
        _initAllowed = true;

    /**
     * An helper to create class and store its information
     *
     * @class gpf.ClassDefinition
     * @constructor
     * @param {String|Function} name
     * @param {Function} Base
     * @param {Object} definition
     */
    gpf.ClassDefinition = function  (name, Base, definition) {
        this._Subs = [];
        if ("function" === typeof name) {
            // TODO to extract class info from there
            this._Constructor = name;
        } else {
            this._name = name;
            this._Base = Base;
            this._definition = definition;
            this._build();
        }
    };

    gpf.extend(gpf.ClassDefinition.prototype, {

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
        _Base: Object,

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
            if (_VISIBILITY_STATIC === visibility) {
                // No inheritance can be applied here
                newPrototype.constructor[member] = defMember;
                return;
            }
            baseMember = this._Base.prototype[member];
            baseType = typeof baseMember;
            if ("undefined" !== baseType
                && null !== baseMember // Special case as null is common
                && newType !== baseType) {
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
                baseName = gpf.capitalize(baseName);
                newPrototype["_base" + baseName] = baseMember;
            }
            if ("constructor" === member) {
                this._defConstructor = defMember;
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
            member = _visibilityKeywords[visibility];
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
                        visibility = _visibilityKeywords
                            .indexOf(member);
                        if (-1 === visibility) {
                            // Usual member
                            this._processMember(member,
                                _VISIBILITY_PUBLIC);
                        } else {
                            // Visibility
                            this._processDefWithVisibility(visibility);
                        }
                    }
                }
            }
            // 2014-05-05 #14
            if ("wscript" === gpf.host() && definition.constructor !== Object) {
                this._processMember("constructor", _VISIBILITY_PUBLIC);
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
                baseClassDef;

            // The new class constructor
            newClass = gpf._func(_getNewClassConstructorSrc(this._name))(gpf);
            this._Constructor = newClass;
            newClass._gpf = this;

            /*
             * Basic JavaScript inheritance mechanism:
             * Defines the newClass prototype as an instance of the base class
             * Do it in a critical section that prevents class initialization
             */
            /*__begin__thread_safe__*/
            _initAllowed = false;
            newPrototype = new this._Base();
            _initAllowed = true;
            /*__end_thread_safe__*/

            // Populate our constructed prototype object
            newClass.prototype = newPrototype;

            // Enforce the constructor to be what we expect
            newPrototype.constructor = newClass;

            /*
             * Defines the link between this class and its base one
             * (It is necessary to do it here because of the gpf.addAttributes
             * that will test the parent class)
             */
            baseClassDef = gpf.classDef(this._Base);
            baseClassDef.Subs().push(newClass);

            /*
             * 2014-04-28 ABZ Changed again from two passes on all members to
             * two passes in which the first one also collects attributes to
             * simplify the second pass.
             */
            this._processDefinition();
            this._processAttributes();

            /*
             * 2014-07-23 ABZ Adding a 'base' constructor to ease the build of
             * consructors
             */
            if (this._defConstructor) {
                newPrototype._baseConstructor =
                    _getNewBaseConstructorFunc(this._Base);
            }
        }

        //endregion
    });

    //region Class related helpers

    /**
     * Retrieves (or allocate) the class definition object
     *
     * @param {Function} constructor Class constructor
     * @returns {gpf.ClassDefinition}
     */
    gpf.classDef = function (constructor) {
        if (undefined === constructor._gpf) {
            constructor._gpf = new gpf.ClassDefinition(constructor);
        }
        return constructor._gpf;
    };

    /**
     * Class initializer: it triggers the call to this._defConstructor only if
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
        if (_initAllowed) {
            var classDef = gpf.classDef(constructor);
            // TODO resolve prototype if not yet done
            if (classDef._defConstructor) {
                classDef._defConstructor.apply(this, args);
            } else {
                classDef._Base.apply(this, args);
            }
        }
    };

    /*global _CONSTRUCTOR_:true*/
    /**
     * Template for new class constructor (using name that includes namespace)
     * - Uses closure to keep track of gpf handle and constructor function
     * - _CONSTRUCTOR_ will be replaced with the actual class name
     *
     * @returns {Function}
     * @private
     * @closure
     */
    function _newClassConstructorFromFullName() {
        var
            gpf = arguments[0],
            /*jshint -W120*/
            constructor = _CONSTRUCTOR_ = function () {
                gpf._classInit.apply(this, [constructor, arguments]);
            };
        return constructor;
    }

    /**
     * Template for new class constructor (using name without namespace)
     * - Uses closure to keep track of gpf handle and constructor function
     * - _CONSTRUCTOR_ will be replaced with the actual class name
     *
     * @returns {Function}
     * @private
     * @closure
     */
    function _newClassConstructorFromName() {
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
            constructorDef,
            src,
            start,
            end;
        if (-1 < name.indexOf(".")) {
            constructorDef = _newClassConstructorFromFullName;
        } else {
            constructorDef = _newClassConstructorFromName;
        }
        src = constructorDef.toString().replace("_CONSTRUCTOR_", name);
        start = src.indexOf("{") + 1;
        end = src.lastIndexOf("}") - 1;
        return src.substr(start, end - start + 1);
    }

    /**
     * Returns the definition of _baseConstructor
     *
     * @param {Function} Base
     * @private
     * @closure
     */
    function _getNewBaseConstructorFunc(Base) {
        /*jslint -W040*/
        return function () {
            Base.apply(this, arguments);
        };
        /*jslint +W040*/
    }

    //endregion

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
            path,
            ns,
            leafName,
            classDef;
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
            leafName = path.pop();
            ns = gpf.context(path);
        }
        classDef = new gpf.ClassDefinition(name, base, definition || {});
        result = classDef.Constructor();
        if (undefined !== ns) {
            ns[leafName] = result;
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
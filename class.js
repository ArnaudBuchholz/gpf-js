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
        _classInitAllowed = true;

    /**
     * Class initializer
     * Triggers the call to this._constructor i
     * @private
     */
    gpf._classInit = function () {
        if (_classInitAllowed) {
            this._constructor.apply(this, arguments);
        }
    };

    function /*gpf:inline*/ _extendMember(_super, newPrototype, properties,
        member) {
        // Check if we're overwriting an existing function
        if ("function" === typeof properties[member]
            && "function" === typeof _super[member]
            && _classFnUsesSuper(properties[member])) {
            /*
             * Create a bootstrap before calling new method that redefines
             * the identifier _super to match the inherited method.
             */
            newPrototype[member] = (function (member, method) {
                return function () {
                    var
                        backup = this._super,
                        result;
                    /*
                     * Add a new ._super() method that is the same method
                     * but on the super-class
                     */
                    this._super = _super[member];
                    /*
                     * The method only need to be bound temporarily, so we
                     * remove it when we're done executing
                     */
                    try {
                        result = method.apply(this, arguments);
                    } catch (e) {
                        throw e;
                    } finally {
                        if (undefined !== backup) {
                            this._super = backup;
                        }
                    }
                    return result;
                };
            })(member, properties[member]);
        } else {
            newPrototype[member] = properties[member];
        }
    }

    function /*gpf:inline*/ _extendAttribute(newClass, newPrototype, properties,
        member) {
        /*
         * Attributes placeholder
         * Most of the functions used below are defined *later*:
         * - gpf.attributes._add comes from attributes.js
         * - gpf.ClassAttributeError comes from att_class.js
         */
        var attributeName = member.substr(1, member.length - 2);
        if (attributeName in properties
            || attributeName in newPrototype
            || attributeName === "Class") {
            gpf.attributes.add(newClass, attributeName,
                properties[member]);
        } else {
            // 2013-12-15 ABZ Consider this as exceptional, trace it
            console.error("gpf.Class::extend: Invalid attribute name '"
                + attributeName + "'");
        }
    }

    /**
     * Create a new Class
     *
     * @param {String} name Name of the class
     * @param {Function} Base Base class to inherit from
     * @param {Object} definition Members / Attributes of the class
     * @return {Function} new class constructor
     */
    function _createClass(name, Base, definition) {
        var
            _super = Base.prototype,
            newClass,
            newPrototype,
            member;

        // The new class constructor
        newClass = (gpf._func("return function " + name + "() {" +
                "gpf._classInit.apply(this, arguments);" +
            "};"))();

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
        newClass.Base = Base;
        if (undefined === Base.Subs) {
            Base.Subs = [];
        }
        if (Base.Subs instanceof Array) {
            Base.Subs.push(newClass);
        }

        /*
         * 2014-01-23 ABZ Changed it into two passes to process members first
         * and then attributes. Indeed, some attributes may alter the prototype
         * differently depending on what it contains.
         */

        // STEP 1: Copy the properties/methods onto the new prototype
        for (member in properties) {
            if (properties.hasOwnProperty(member)
                && "[" !== member.charAt(0)) {
                _extendMember(_super, newPrototype, properties, member);
            }
        }

        // STEP 2: Copy the attributes onto the new prototype
        for (member in properties) {
            if (properties.hasOwnProperty(member)
                && "[" === member.charAt(0)
                && "]" === member.charAt(member.length - 1)) {
                _extendAttribute(newClass, newPrototype, properties, member);
            }
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
            base = null;
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
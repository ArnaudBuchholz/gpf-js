/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    // Class inspired by http://ejohn.org/blog/simple-javascript-inheritance
    var
        _classInit = false,
/*
    09/07/2013 22:59:59 ABZ
    The original code from J.Reisig is using the following test
    /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.<star>/;
    However, this breaks the release compiler and, as far as understand it,
    it forces the use of _super when the /xyz/.test(function...) fails.
    I propose a version that does not break the compiler *and* is more
    efficient if the initial test fails.
 */
        _reSuper = new RegExp("\\b_super\\b"),
        _superSample = function () {
            this._super();
        },
        _classFnUsesSuper = (function () {
            if (_reSuper.test(_superSample.toString())) {
                return function () {
                    return _reSuper.test(arguments[0]);
                };
            } else {
                return function () {
                    return -1 < ("" + arguments[0]).indexOf("_super");
                };
            }
        })();

    // The base Class implementation
    gpf.Class = function Class() {
    };

    // Class decoration used to store information about the class
    function ClassInfo(baseClass) {
        this._name = "";
        this._base = baseClass;
        this._subs = [];
        this._attributes = null;
    }

    gpf.Class._info = new ClassInfo(null);
    gpf.Class._info._name = "gpf.Class";

    gpf.Class._init = function () {
        if (!_classInit && "function" === typeof this.init) {
            this.init.apply(this, arguments);
        }
    };

    /*jshint -W040*/

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
     * Create a new Class that inherits from 'this' class
     *
     * @param {object} properties methods of the class
     * @return {Function} new class constructor
     */
    function _extend(properties, name) {
        var
            _super = this.prototype,
            newPrototype,
            newClass,
            member;

        if (undefined === name) {
            name = "noName";
        }

        // The new class constructor
        newClass = (gpf._func("return function " + name + "() {" +
                "gpf.Class._init.apply(this, arguments);" +
            "};"))();

        /*
         * Basic JavaScript inheritance mechanism:
         * Defines the newClass prototype as an instance of the base class
         * Do it in a critical section to prevent class initialization
         */
        /*__begin__thread_safe__*/
        _classInit = true;
        newPrototype = new this();
        _classInit = false;
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
        newClass._info = new ClassInfo(this);
        this._info._subs.push(newClass);

        // And allow class extension
        newClass.extend = _extend;

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

    /*jshint +W040*/

    gpf.Class.extend = _extend;

    /**
     * Defines a new class by setting a contextual name
     *
     * @param {string} name New class contextual name
     * @param {string} [base=undefined] base Base class contextual name
     * @param {object} [definition=undefined] definition Class definition
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
            base = gpf.Class; // Root class
        }
        if (-1 < name.indexOf(".")) {
            path = name.split(".");
            name = path.pop();
            ns = gpf.context(path);
        }
        result = base.extend(definition || {}, name);
        if (undefined !== ns) {
            ns[name] = result;
        }
        return result;
    };

    /**
     * Allocate a new class handler that is specific to a class type
     * (used for interfaces & attributes)
     *
     * @param {string} ctxRoot Default context root
     * @param {string} defaultBase Default contextual root class
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
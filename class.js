(function () { /* Begin of privacy scope */
    "use strict";
    /*global document,window,console*/
    /*global process,require,exports,global*/
    /*global gpf*/
    /*jslint continue: true, nomen: true, plusplus: true*/

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

    /**
     * Create a new Class that inherits from 'this' class
     *
     * @param {object} properties methods of the class
     * @returns {Function} new class constructor
     */
    function _extend(properties) {
        var
            _super = this.prototype,
            newPrototype,
            newClass,
            member,
            attributeName;

        // The new class constructor
        newClass = function () {
            if (!_classInit && "function" === typeof this.init)
                this.init.apply(this, arguments);
        };

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
            if (!properties.hasOwnProperty(member)) {
                continue;
            }

            // Skip Attributes
            if ("[" === member.charAt(0)
                && "]" === member.charAt(member.length - 1)) {
                continue;
            }

            // Check if we're overwriting an existing function
            else if ("function" === typeof properties[member]
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
                            this._super = backup;
                        }
                        return result;
                    };
                })(member, properties[member]);
            } else {
                newPrototype[member] = properties[member];
            }
        }
        // STEP 2: Copy the attributes onto the new prototype
        for (member in properties) {
            if (!properties.hasOwnProperty(member)) {
                continue;
            }

            /*
             * Attributes placeholder
             * Most of the functions used below are defined *later*:
             * - gpf.attributes._add comes from attributes.js
             * - gpf.ClassAttributeError comes from att_class.js
             */
            if ("[" === member.charAt(0)
                && "]" === member.charAt(member.length - 1)) {
                attributeName = member.substr(1, member.length - 2);
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
        }

        return newClass;
    }

    gpf.Class.extend = _extend;

}()); /* End of privacy scope */

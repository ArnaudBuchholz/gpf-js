/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    var
        _emptyMember = 0,
        _defAttrBase = gpf._genDefHandler("gpf.attributes", "Attribute");

    gpf.attributes = {};

    /**
     * Generates a factory capable of creating a new instance of a class
     *
     * @param {Function} objectClass Object constructor
     * @param {String} name Alias name (will be prefixed by $)
     * @private
     * @closure
     */
    function _alias(objectClass, name) {
        name = "$" + name;
        gpf[name] = (function(){
            var Proxy = (gpf._func("return function " + name + "(args) {" +
                "this.constructor.apply(this, args);" +
            "};"))();
            Proxy.prototype = objectClass.prototype;
            return function() {
                return new Proxy(arguments);
            };
        }());
    }

    /**
     * Defines an attribute (relies on gpf.define)
     *
     * @param {String} name Attribute name. If it contains a dot, it is
     * treated as absolute contextual. Otherwise, it is relative to
     * "gpf.attributes". If starting with $ (and no dot), the contextual name
     * will be the "gpf.attributes." + name(without $) + "Attribute" and an
     * alias is automatically created (otherwise, use $Alias attribute on class)
     * @param {Function|string} [base=undefined] base Base attribute
     * (or contextual name)
     * @param {Object} [definition=undefined] definition Attribute definition
     * @return {Function}
     * @private
     */
    gpf._defAttr = function (name, base, definition) {
        var
            isAlias = name.charAt(0) === "$",
            fullName,
            result;
        if (isAlias) {
            name = name.substr(1);
            fullName = name + "Attribute";
        } else {
            fullName = name;
        }
        result = _defAttrBase(fullName, base, definition);
        if (isAlias) {
            _alias(result, name);
        }
        return result;
    };

    /**
     * Base class for any attribute
     *
     * @class gpf.attributes.Attribute
     */
    gpf._defAttr("Attribute", {

        _member: "",

        /**
         * get/set member name
         *
         * @param {String} name member name
         * @return {String}
         */
        member: function (name) {
            var value = this._member;
            if (name) {
                this._member = name;
            }
            return value;
        },

        /**
         * This method is the implementation of the attribute: it receives
         * the prototype to alter.
         *
         * NOTE: this is called *after* all declared members are set
         *
         * @param {Object} objPrototype Class prototype
         */
        alterPrototype: function /*abstract*/ (objPrototype) {
            gpf.interfaces.ignoreParameter(objPrototype);
        }

    });

    /**
     * Generates an alias for the attribute. An alias is a factory function that
     * allocates an attribute instance (parameters are forwarded).
     * As a result, instead of using:
     * "[Class]" : [new gpf.attributes.AliasAttribute("Name")]
     * It is reduced to:
     * "[Class]" : [$Alias("Name")]
     *
     * @param {String} name Name of the alias to build below gpf
     *
     * @class gpf.attributes.AliasAttribute
     * @extends gpf.attributes.Attribute
     * @alias gpf.$Alias
     */
    gpf._defAttr("$Alias", {

        /**
         * Name of the alias to create
         *
         * @type {String}
         */
        _name: "",

        constructor: function (name) {
            this._name = name;
        },

        /**
         * @inheritDoc gpf.attributes.Attribute:alterPrototype
         */
        alterPrototype: function (objPrototype) {
            _alias(objPrototype.constructor, this._name);
        }

    });

    /**
     * Attribute array, generally used to list attributes on a class member
     *
     * @class gpf.attributes.Array
     */
    gpf.define("gpf.attributes.Array", {

        // "[_array]": [gpf.$ClassIArray(false)],
        _array: [],

        constructor: function () {
            this._array = []; // Create a new instance of the array
        },

        /**
         * Return the first occurrence of the expected class
         *
         * @param {Function} expectedClass the class to match
         * @return {gpf.attributes.Attribute}
         */
        has: function (expectedClass) {
            gpf.ASSERT("function" === typeof expectedClass);
            var
                idx,
                item;
            for (idx = 0; idx < this._array.length; ++idx) {
                item = this._array[idx];
                if (item instanceof expectedClass) {
                    return item;
                }
            }
            return null;
        },

        /**
         * Returns a new array with all attributes matching the expected
         * class
         *
         * @param {Function} expectedClass the class to match
         * @return {gpf.attributes.Array}
         */
        filter: function (expectedClass) {
            gpf.ASSERT("function" === typeof expectedClass);
            var
                idx,
                attribute,
                result = new gpf.attributes.Array();
            for (idx = 0; idx < this._array.length; ++idx) {
                attribute = this._array[idx];
                if (attribute instanceof expectedClass) {
                    result._array.push(attribute);
                }
            }
            return result;
        }

    });

    /**
     * Attribute map, generally used to list attributes of a class
     *
     * @class gpf.attributes.Map
     */
    gpf.define("gpf.attributes.Map", {

        _members: {},
        _count: 0,

        /**
         *
         * @param {Object} [object=undefined] object Object to read
         *        attributes from
         */
        constructor: function (object) {
            this._members = {}; // Creates a new dictionary
            this._count = 0;
            if (undefined !== object) {
                this.fillFromObject(object);
            }
        },

        /**
         * Gives the total number of attributes enclosed in the map
         *
         * @return {Number}
         */
        count: function () {
            return this._count;
        },

        /**
         * Associate an attribute to a member
         *
         * @param {String} member member name
         * @param {gpf.attributes.Attribute} attribute attribute to map
         */
        add: function (member, attribute) {
            var array = this._members[member];
            if (undefined === array) {
                array = this._members[member] = new gpf.attributes.Array();
            }
            array._array.push(attribute);
            ++this._count;
        },

        /**
         * Copy the content of this map to a new one
         *
         * @param {gpf.attributes.Map} attributesMap recipient of the copy
         * @param {Function} [callback=undefined] callback callback function
         * to test if the mapping should be added
         * @param {*} [param=undefined] param additional parameter for the
         * callback
         * @private
         */
        _copyTo: function (attributesMap, callback, param) {
            var
                member,
                array,
                idx,
                attribute;
            if (this._count) {
                for (member in this._members) {
                    if (this._members.hasOwnProperty(member)) {
                        array = this._members[member]._array;
                        for (idx = 0; idx < array.length; ++idx) {
                            attribute = array[ idx ];
                            if (!callback
                                || callback(member, attribute, param)) {
                                attributesMap.add(member, attribute);
                            }
                        }
                    }
                }
            }
        },

        /**
         * Callback for _copyTo, test if attribute is of a given class
         *
         * @param {String} member
         * @param {gpf.attributes.Attribute} attribute
         * @param {Function} expectedClass
         * @return {Boolean}
         * @private
         */
        _filterCallback: function (member, attribute, expectedClass) {
            gpf.interfaces.ignoreParameter(member);
            return attribute instanceof expectedClass;
        },

        /**
         * Fill the map using object's attributes
         *
         * @param {Object} object object to get attributes from
         * @return {Number} number of attributes in the resulting map
         */
        fillFromObject: function (object) {
            var
                classDef = gpf.classDef(object.constructor),
                attributes;
            while (classDef) { // !undefined && !null
                attributes = classDef.attributes();
                if (attributes) {
                    attributes._copyTo(this);
                }
                if (classDef.Base()) {
                    classDef = gpf.classDef(classDef.Base());
                } else {
                    break;
                }
            }
            return this._count;
        },

        /**
         * Creates a new map that contains only instances of the given
         * attribute class
         *
         * @param {Function} expectedClass
         * @return {gpf.attributes.Map}
         */
        filter: function (expectedClass) {
            gpf.ASSERT("function" === typeof expectedClass);
            var result = new gpf.attributes.Map();
            this._copyTo(result, this._filterCallback, expectedClass);
            return result;
        },

        /**
         * Returns the array of map associated to a member
         *
         * @param {String} name
         * @return {gpf.attributes.Array}
         */
        member: function (name) {
            var result = this._members[name];
            if (undefined === result) {
                if (0 === _emptyMember) {
                    _emptyMember = new gpf.attributes.Array();
                }
                result = _emptyMember;
            }
            return result;
        },

        /**
         * Returns the list of members stored in this map
         *
         * @perf_warn Result is computed on each call
         * @return {String[]}
         */
        members: function () {
            var
                result = [],
                member;
            for (member in this._members) {
                if (this._members.hasOwnProperty(member)) {
                    result.push(member);
                }
            }
            return result;
        }

    });

    /**
     * Add the attribute list to the given prototype associated with the
     * provided member name
     *
     * @param {Function} objectClass class constructor
     * @param {String} name member name
     * @param {gpf.attributes.Attribute[]} attributes
     */
    gpf.attributes.add = function (objectClass, name, attributes) {
        var
            attributeList,
            len,
            idx,
            attribute;
        attributeList = gpf.classDef(objectClass).attributes();
        len = attributes.length;
        for (idx = 0; idx < len; ++idx) {
            attribute = attributes[idx];
            attribute.member(name); // Assign member name
            attributeList.add(name, attribute);
            attribute.alterPrototype(objectClass.prototype);
        }
    };

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/
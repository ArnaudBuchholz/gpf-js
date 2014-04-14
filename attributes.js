/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    var
        _emptyMember = 0;

    gpf.attributes = {};

    function _alias(objectClass, name) {
        gpf[ "$" + name ] = (function(){
            var Proxy = (gpf._func("return function $" + name + "(args) {" +
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
     * @param {string} name Attribute name. If it contains a dot, it is
     * treated as absolute contextual. Otherwise, it is relative to
     * "gpf.attributes"
     * @param {function|string} [base=undefined] base Base attribute
     * (or contextual name)
     * @param {object} [definition=undefined] definition Attribute definition
     * @return {function}
     */
    gpf.attribute = gpf._genDefHandler("gpf.attributes", "Attribute");

    /**
     * Base class for any attribute
     */
    gpf.define("gpf.attributes.Attribute", {

        _member: "",

        /**
         * get/set member name
         *
         * @param {string} name member name
         * @returns {string}
         */
        member: function (name) {
            var value = this._member;
            if (name) {
                this._member = name;
            }
            return value;
        },

        /**
         * Called when a class is created with an attribute. It allows to
         * manipulate the object prototype through attributes.
         *
         * @param {object} objPrototype object's prototype
         */
        alterPrototype: function /*abstract*/ (objPrototype) {
            gpf.interfaces.ignoreParameter(objPrototype);
        }

    });

    gpf.attribute("AliasAttribute", {

        init: function (name) {
            this._name = name;
        },

        alterPrototype: function (objPrototype) {
            _alias(objPrototype.constructor, this._name);
        }

    });

    /**
     * Attribute array, generally used to list attributes on a class member
     */
    gpf.define("gpf.attributes.Array", {

        // "[_array]": [gpf.$ClassIArray(false)],
        _array: [],

        init: function () {
            this._array = []; // Create a new instance of the array
        },

        /**
         * Return the first occurrence of the expected class
         *
         * @param {function} expectedClass the class to match
         * @returns {gpf.attributes.Attribute}
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
         * @param {function} expectedClass the class to match
         * @returns {gpf.attributes.Array}
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
     */
    gpf.define("gpf.attributes.Map", {

        _members: {},
        _count: 0,

        /**
         *
         * @param {object} [object=undefined] object Object to read
         *        attributes from
         */
        init: function (object) {
            this._members = {}; // Creates a new dictionary
            this._count = 0;
            if (undefined !== object) {
                this.fillFromObject(object);
            }
        },

        /**
         * Gives the total number of attributes enclosed in the map
         *
         * @returns {number}
         */
        count: function () {
            return this._count;
        },

        /**
         * Associate an attribute to a member
         *
         * @param {string} member member name
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
         * @param {function} [callback=undefined] callback callback function
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
         * @param {string} member
         * @param {gpf.attributes.Attribute} attribute
         * @param {function} expectedClass
         * @returns {boolean}
         * @private
         */
        _filterCallback: function (member, attribute, expectedClass) {
            gpf.interfaces.ignoreParameter(member);
            return attribute instanceof expectedClass;
        },

        /**
         * Fill the map using object's attributes
         *
         * @param {object} object object to get attributes from
         * @returns {number} number of attributes in the resulting map
         */
        fillFromObject: function (object) {
            var
                info = object.constructor._info,
                attributes;
            while (info) { // !undefined && !null
                attributes = info._attributes;
                if (attributes) {
                    attributes._copyTo(this);
                }
                if (info._base) {
                    info = info._base._info;
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
         * @param {function} expectedClass
         * @returns {gpf.attributes.Map}
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
         * @param {string} name
         * @returns {gpf.attributes.Array}
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
         * @returns {string[]}
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
     * @param {function} objectClass class constructor
     * @param {string} name member name
     * @param {gpf.attributes.Attribute[]} attributes
     */
    gpf.attributes.add = function (objectClass, name, attributes) {
        var
            attributeList,
            idx,
            attribute;
        /*__begin__thread_safe__*/
        attributeList = objectClass._info._attributes;
        if (null === attributeList) {
            objectClass._info._attributes
                = attributeList
                = new gpf.attributes.Map();
        }
        /*__end_thread_safe__*/
        for (idx = 0; idx < attributes.length; ++idx) {
            attribute = attributes[idx];
            attribute.member(name); // Assign member name
            attributeList.add(name, attribute);
            attribute.alterPrototype(objectClass.prototype);
        }
    };

    _alias(gpf.attributes.AliasAttribute, "Alias");

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/
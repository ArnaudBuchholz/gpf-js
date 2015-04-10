/*#ifndef(UMD)*/
"use strict";
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfGenDefHandler*/ // Class handler for class types (interfaces...)
/*global _gpfResolveScope*/ // Translate the parameter into a valid scope
/*global _gpfBuildParamArray*/ // Build a parameter array
/*global _gpfDoApply*/ // Apply the parameter array through a function
/*global _gpfGetClassDefinition*/ // Get GPF class definition for a constructor
// /*#endif*/

var
    /**
     * gpf.attributes shortcut
     *
     * @type {Object}
     * @private
     */
    _gpfA = gpf.attributes = {},

    /**
     * Used for empty members
     *
     * @type {gpf.attributes.Array}
     * @private
     */
    _gpfEmptyMemberArray = 0,

    /**
     * Generates a factory capable of creating a new instance of a class
     *
     * @param {Function} objectClass Object constructor
     * @param {String} name Alias name (will be prefixed by $)
     * @private
     * @closure
     */
    _gpfAlias = function (objectClass, name) {
        name = "$" + name;
        gpf[name] = (function(){
            var Proxy = (_gpfFunc("return function " + name + "(args) {" +
                "this.constructor.apply(this, args);" +
            "};"))();
            Proxy.prototype = objectClass.prototype;
            return function() {
                return new Proxy(arguments);
            };
        }());
    },

    /**
     * gpf.define handler for attributes
     *
     * @type {Function}
     * @private
     */
    _gpfDefAttrBase = _gpfGenDefHandler("gpf.attributes", "Attribute"),

    /**
     * gpf.define for attributes
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
    _gpfDefAttr = function (name, base, definition) {
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
        result = _gpfDefAttrBase(fullName, base, definition);
        if (isAlias) {
            _gpfAlias(result, name);
        }
        return result;
    };

/**
 * Base class for any attribute
 *
 * @class gpf.attributes.Attribute
 */
_gpfDefAttr("Attribute", {

    protected: {

        /**
         * Name of the member the attribute is associated to
         *
         * @type {String}
         * @protected
         * @friend {gpf.attributes.add}
         */
        _member: "",

        /**
         * This method is the implementation of the attribute: it receives
         * the prototype to alter.
         *
         * NOTE: this is called *after* all declared members are set
         *
         * @param {Object} objPrototype Class prototype
         * @protected
         * @friend {gpf.attributes.add}
         */
        _alterPrototype: function /*abstract*/ (objPrototype) {
            _gpfIgnore(objPrototype);
        }

    },

    public: {

        /**
         * Get the member name
         *
         * @return {String}
         */
        member: function () {
            return this._member;
        }

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
_gpfDefAttr("$Alias", {

    private: {

        /**
         * Name of the alias to create
         *
         * @type {String}
         * @private
         */
        _name: ""

    },

    protected: {

        /**
         * @inheritDoc gpf.attributes.Attribute:_alterPrototype
         */
        _alterPrototype: function (objPrototype) {
            _gpfAlias(objPrototype.constructor, this._name);
        }

    },

    public: {

        /**
         * Defines an alias
         *
         * @param {String} name Name of the alias to create
         * @constructor
         */
        constructor: function (name) {
            this._name = name;
        }

    }

});

/**
 * Attribute array, generally used to list attributes on a class member
 *
 * @class gpf.attributes.Array
 * TODO implements gpf.interfaces.IReadOnlyArray
 */
gpf.define("gpf.attributes.Array", {

    private: {

        /**
         * @type {gpf.attributes.Attribute[]}
         * @private
         */
        _array: []

    },

    public: {

        /**
         * @constructor
         */
        constructor: function () {
            this._array = []; // Create a new instance of the array
        },

        /**
         * Gives the number of attributes in the array
         *
         * @return {Number}
         */
        count: function () {
            return this._array.length;
        },

        /**
         * Return the first occurrence of the expected class
         *
         * @param {gpf.attributes.Attribute} expectedClass the class to
         * match
         * @return {gpf.attributes.Attribute}
         */
        has: function (expectedClass) {
            gpf.ASSERT("function" === typeof expectedClass,
                "Expected a class parameter");
            gpf.ASSERT(
                expectedClass.prototype instanceof _gpfA.Attribute,
                "Expected an Attribute-like class parameter");
            var
                idx,
                array = this._array,
                len = array.length,
                item;
            for (idx = 0; idx < len; ++idx) {
                item = array[idx];
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
            gpf.ASSERT("function" === typeof expectedClass,
                "Expected a class parameter");
            gpf.ASSERT(
                expectedClass.prototype instanceof _gpfA.Attribute,
                "Expected an Attribute-like class parameter");
            var
                idx,
                array = this._array,
                len = array.length,
                attribute,
                result = new _gpfA.Array(),
                resultArray = result._array;
            for (idx = 0; idx < len; ++idx) {
                attribute = array[idx];
                if (attribute instanceof expectedClass) {
                    resultArray.push(attribute);
                }
            }
            return result;
        },

        /**
         * Apply the callback for each attribute in the array.
         * If the callback returns anything, the loop stops and the result
         * is returned to the caller.
         *
         * @param {Function} callback will receive parameters
         * <ul>
         *     <li>{gpf.attributes.Attribute} attribute<li>
         *     <li>{Number} index<li>
         *     <li>{Number} array length<li>
         * </ul>
         * If a result is returned, the enumeration stops and this result is returned
         * @param {Object} [scope=undefined] scope
         * @param {*} [params=undefined] params Additional parameters
         * appended at the end of the expected parameter list
         * @return {*}
         */
        each: function (callback, scope, params) {
            scope = _gpfResolveScope(scope);
            params = _gpfBuildParamArray(1, params);
            var
                idx,
                array = this._array,
                len = array.length,
                result;
            for (idx = 0; idx < len; ++idx) {
                result = _gpfDoApply(callback, scope, params, array[idx]);
                if (undefined !== result) {
                    return result;
                }
            }
        }
    }

});

/**
 * Attribute map, generally used to list attributes of a class
 *
 * @class gpf.attributes.Map
 */
gpf.define("gpf.attributes.Map", {

    private: {

        /**
         * @type {Object} Map(String,gpf.attributes.Array)
         * @private
         */
        _members: {},

        /**
         * @type {Number}
         * @private
         */
        _count: 0,

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
                members = this._members,
                member,
                array,
                idx,
                attribute;
            if (this._count) {
                for (member in members) {
                    if (members.hasOwnProperty(member)) {
                        array = members[member]._array;
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
            _gpfIgnore(member);
            return attribute instanceof expectedClass;
        }

    },

    public: {

        /**
         * @param {Object} [object=undefined] object Object to read
         *        attributes from
         * @constructor
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
                array = this._members[member] = new _gpfA.Array();
            }
            array._array.push(attribute);
            ++this._count;
        },

        /**
         * Fill the map using object's attributes
         *
         * @param {Object} object object to get attributes from
         * @return {Number} number of attributes in the resulting map
         */
        fillFromObject: function (object) {
            var classDef = _gpfGetClassDefinition(object.constructor);
            return this.fillFromClassDef(classDef);
        },

        /**
         * Fill the map using class definition object
         *
         * @param {gpf.classDef} classDef class definition
         * @return {Number} number of attributes in the resulting map
         */
        fillFromClassDef: function (classDef) {
            var
                attributes,
                Super;
            while (classDef) { // !undefined && !null
                attributes = classDef.attributes();
                if (attributes) {
                    attributes._copyTo(this);
                }
                Super = classDef.Super();
                if (Super !== Object) { // Can't go upper
                    classDef = _gpfGetClassDefinition(Super);
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
            gpf.ASSERT("function" === typeof expectedClass,
                "Expected a class parameter");
            gpf.ASSERT( expectedClass.prototype instanceof _gpfA.Attribute,
                "Expected an Attribute-like class parameter");
            var result = new _gpfA.Map();
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
            /**
             * When member is a known Object member (i.e. constructor),
             * this generates weird results. Filter out by testing the
             * result type.
             */
            var result = this._members[name];
            if (undefined === result
                || !(result instanceof _gpfA.Array)) {
                if (0 === _gpfEmptyMemberArray) {
                    _gpfEmptyMemberArray = new _gpfA.Array();
                }
                result = _gpfEmptyMemberArray;
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
                members = this._members,
                result = [],
                member;
            for (member in members) {
                if (members.hasOwnProperty(member)) {
                    result.push(member);
                }
            }
            return result;
        },

        /**
         * Apply the callback for each member in the map
         * If the callback returns anything, the loop stops and the result
         * is returned to the caller.
         *
         * @param {Function} callback, defined with parameters
         * * {String} member
         * * {gpf.attributes.Array} attributes
         * No result is expected
         * @param {Object} [scope=undefined] scope
         * @param {*} [params=undefined] params Additional parameters
         * appended at the end of the expected parameter list
         * @return {*}
         */
        each: function (callback, scope, params) {
            scope = _gpfResolveScope(scope);
            params = _gpfBuildParamArray(2, params);
            var
                members = this._members,
                member,
                result;
            for (member in members) {
                if (members.hasOwnProperty(member)) {
                    result = _gpfDoApply(callback, scope, params,
                        member, members[member]);
                    if (undefined !== result) {
                        return result;
                    }
                }
            }
        },

        /**
         * Add the attributes contained in the map to the given prototype
         *
         * @param {Function} objectClass
         */
        addTo: function (objectClass) {
            var
                members = this._members,
                member;
            for (member in members) {
                if (members.hasOwnProperty(member)) {
                    _gpfA.add(objectClass, member,
                        members[member]);
                }
            }
        }

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
_gpfA.add = function (objectClass, name, attributes) {
    var
        attributeList,
        len,
        idx,
        attribute;
    attributeList = _gpfGetClassDefinition(objectClass).attributes();
    len = attributes.length;
    for (idx = 0; idx < len; ++idx) {
        attribute = attributes[idx];
        attribute._member = name; // Assign member name
        attributeList.add(name, attribute);
        attribute._alterPrototype(objectClass.prototype);
    }
};
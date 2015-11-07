/*#ifndef(UMD)*/
"use strict";
/*global _gpfAssert*/ // Assertion method
/*global _gpfAsserts*/ // Multiple assertion method
/*global _GpfClassDefinition*/ // GPF class definition
/*global _gpfDecodeAttributeMember*/
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfEncodeAttributeMember*/
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfGenDefHandler*/ // Class handler for class types (interfaces...)
/*global _gpfGetClassDefinition*/ // Get GPF class definition for a constructor
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _gpfA*/
/*exported _gpfAttribute*/
/*exported _gpfAttributesAdd*/
/*exported _gpfDefAttr*/
/*exported _gpfIArrayGetItem*/
/*exported _gpfIArrayGetItemsCount*/
/*#endif*/

// @property {gpf.attributes.Map|null} Attributes of this class (null if none)
_GpfClassDefinition.prototype._attributes = null;

var
    // gpf.attributes shortcut
    _gpfA = gpf.attributes = {},

    /**
     * Used for empty members
     *
     * @type {gpf.attributes.Array}
     */
    _gpfEmptyMemberArray;

/**
 * Generates a factory capable of creating a new instance of a class
 *
 * @param {Function} objectClass Object constructor
 * @param {String} name Alias name (will be prefixed by $)
 * @closure
 */
function _gpfAlias (objectClass, name) {
    name = "$" + name;
    gpf[name] = (function () {
        var Proxy = _gpfFunc("return function " + name + "(args) {this.constructor.apply(this, args);};")();
        Proxy.prototype = objectClass.prototype;
        return function () {
            return new Proxy(arguments);
        };
    }());
}

// gpf.interfaces.IReadOnlyArray#getItemsCount factory
function _gpfIArrayGetItemsCount (member) {
    return _gpfFunc("return this." + member + ".length;");
}

// gpf.interfaces.IReadOnlyArray#getItem factory
function _gpfIArrayGetItem (member) {
    return _gpfFunc(["idx"], "return this." + member + "[idx];");
}

/**
 * gpf.define handler for attributes
 *
 * @type {Function}
 */
var _gpfDefAttrBase = _gpfGenDefHandler("gpf.attributes", "Attribute");

/**
 * gpf.define for attributes
 *
 * @param {String} name Attribute name. If it contains a dot, it is treated as absolute contextual.
 * Otherwise, it is relative to "gpf.attributes". If starting with $ (and no dot), the contextual name will be the
 * "gpf.attributes." + name(without $) + "Attribute" and an alias is automatically created
 * @param {Function|string} [base=undefined] base Base attribute (or contextual name)
 * @param {Object} [definition=undefined] definition Attribute definition
 * @return {Function}
 */
function _gpfDefAttr (name, base, definition) {
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
}

/**
 * Base class for any attribute
 *
 * @class gpf.attributes.Attribute
 */
var _gpfAttribute = _gpfDefine("gpf.attributes.Attribute", Object, {
    "#": {

        // Name of the member the attribute is associated to
        _member: "",

        /**
         * This method is the implementation of the attribute: it receives the prototype to alter
         * NOTE: this is called *after* all declared members are set
         *
         * @param {Object} objPrototype Class prototype
         */
        _alterPrototype: function (objPrototype) {
            _gpfIgnore(objPrototype);
        }

    },
    "+": {

        getMemberName: function () {
            return this._member;
        }

    }
});

/*#ifdef(DEBUG)*/

var _gpfAssertAttributeClassOnly,
    _gpfAssertAttributeOnly;

// DEBUG specifics

_gpfAssertAttributeClassOnly = function (value) {
    _gpfAsserts({
        "Expected a class parameter": "function" === typeof value,
        "Expected an Attribute-like class parameter": value.prototype instanceof _gpfAttribute
    });
};

_gpfAssertAttributeOnly = function (value) {
    _gpfAssert(value instanceof _gpfAttribute, "Expected an Attribute-like parameter");
};

/* istanbul ignore if */ // Because tested in DEBUG
if (!_gpfAssertAttributeClassOnly) {

/*#else*/

    /*gpf:nop*/ _gpfAssertAttributeClassOnly = _gpfEmptyFunc;
    /*gpf:nop*/ _gpfAssertAttributeOnly = _gpfEmptyFunc;

/*#endif*/

/*#ifdef(DEBUG)*/

}

/**
 * Attribute array, generally used to list attributes on a class member
 *
 * @class gpf.attributes.Array
 */
_gpfDefine("gpf.attributes.Array", Object, {
    "-": {

        // @property {gpf.attributes.Attribute[]}
        _array: []

    },
    "+": {

        constructor: function () {
            this._array = []; // Create a new instance of the array
        },

        // @inheritdoc gpf.interfaces.IReadOnlyArray#getItem
        getItemsCount: _gpfIArrayGetItemsCount("_array"),

        // @inheritdoc gpf.interfaces.IReadOnlyArray#getItem
        getItem: _gpfIArrayGetItem("_array"),

        /**
         * Return the first occurrence of the expected class
         *
         * @param {gpf.attributes.Attribute} expectedClass the class to match
         * @return {Boolean}
         */
        has: function (expectedClass) {
            _gpfAssertAttributeClassOnly(expectedClass);
            /*gpf:inline(array)*/ return !this._array.every(function (attribute) {
                return !(attribute instanceof expectedClass);
            });
        },

        /**
         * Returns a new array with all attributes matching the expected class
         *
         * @param {Function} expectedClass the class to match
         * @return {gpf.attributes.Array}
         */
        filter: function (expectedClass) {
            _gpfAssertAttributeClassOnly(expectedClass);
            var result = new _gpfA.Array();
            /*gpf:inline(array)*/ result._array = this._array.filter(function (attribute) {
                return attribute instanceof expectedClass;
            });
            return result;
        },

        // [].forEach
        forEach: function (callback, thisArg) {
            /*gpf:inline(array)*/ this._array.forEach(callback, thisArg);
        },

        // [].every
        every: function (callback, thisArg) {
            return /*gpf:inline(array)*/ this._array.every(callback, thisArg);
        }

    }

});

_gpfEmptyMemberArray = new _gpfA.Array();

/**
 * Attribute map, generally used to list attributes of a class.
 *
 * There are two known particular cases:
 * - constructor: added as "constructor " to avoid collisions with JS member (wscript)
 * - Class: that represents class attributes
 *
 * @class gpf.attributes.Map
 */
_gpfDefine("gpf.attributes.Map", Object, {
    "-": {

        // Dictionary of attributes per member
        _members: {},

        // Attributes count
        _count: 0,

        /**
         * Copy the content of this map to a new one
         *
         * @param {gpf.attributes.Map} to recipient of the copy
         * @param {Function} [callback=undefined] callback function to test if the mapping should be added
         * @param {*} [param=undefined] param additional parameter for the callback
         * @return {gpf.attributes.Map} to
         */
        _copy: function (to, callback, param) {
            /*gpf:inline(object)*/ _gpfObjectForEach(this._members, function (attributeArray, member) {
                member = _gpfDecodeAttributeMember(member);
                /*gpf:inline(array)*/ attributeArray._array.forEach(function (attribute) {
                    if (!callback || callback(member, attribute, param)) {
                        to.add(member, attribute);
                    }
                });
            });
            return to;
        },

        /**
         * Callback for _copy, test if attribute is of a given class
         *
         * @param {String} member
         * @param {gpf.attributes.Attribute} attribute
         * @param {Function} expectedClass
         * @return {Boolean}
         */
        _filterCallback: function (member, attribute, expectedClass) {
            _gpfIgnore(member);
            return attribute instanceof expectedClass;
        }

    },
    "+": {

        // @param {Object|Function} [object=undefined] object Object or constructor to read attributes from
        constructor: function (object) {
            this._members = {};
            if (object instanceof Function) {
                this.fillFromClassDef(_gpfGetClassDefinition(object));
            } else if (undefined !== object) {
                this.fillFromObject(object);
            }
        },

        /**
         * Fill the map using class definition object
         *
         * @param {gpf.classDef} classDef class definition
         * @return {gpf.attributes.Map}
         * @chainable
         */
        fillFromClassDef: function (classDef) {
            var attributes,
                Super;
            while (classDef) { // !undefined && !null
                attributes = classDef._attributes;
                if (attributes) {
                    attributes._copy(this);
                }
                Super = classDef._Super;
                if (Super === Object) { // Can't go upper
                    break;
                } else {
                    classDef = _gpfGetClassDefinition(Super);
                }
            }
            return this;
        },

        /**
         * Fill the map using object's attributes
         *
         * @param {Object} object object to get attributes from
         * @return {gpf.attributes.Map}
         * @chainable
         */
        fillFromObject: function (object) {
            var classDef = _gpfGetClassDefinition(object.constructor);
            return this.fillFromClassDef(classDef);
        },

        getCount: function () {
            return this._count;
        },

        /**
         * Associate an attribute to a member
         *
         * @param {String} member member name
         * @param {gpf.attributes.Attribute} attribute attribute to map
         */
        add: function (member, attribute) {
            _gpfAssertAttributeOnly(attribute);
            member = _gpfEncodeAttributeMember(member);
            var array = this._members[member];
            if (undefined === array) {
                array = this._members[member] = new _gpfA.Array();
            }
            array._array.push(attribute);
            ++this._count;
        },

        /**
         * Creates a new map that contains only instances of the given
         * attribute class
         *
         * @param {Function} expectedClass
         * @return {gpf.attributes.Map}
         */
        filter: function (expectedClass) {
            _gpfAssertAttributeClassOnly(expectedClass);
            return this._copy(new _gpfA.Map(), this._filterCallback, expectedClass);
        },

        /**
         * Returns the array of attributes associated to a member
         *
         * @param {String} member
         * @return {gpf.attributes.Array}
         */
        getMemberAttributes: function (member) {
            member = _gpfEncodeAttributeMember(member);
            var result = this._members[member];
            if (undefined === result || !(result instanceof _gpfA.Array)) {
                return _gpfEmptyMemberArray;
            }
            return result;
        },

        /**
         * Returns the list of members stored in this map
         *
         * @return {String[]}
         */
        getMembers: function () {
            var result = [];
            /*gpf:inline(object)*/ _gpfObjectForEach(this._members, function (attributes, member) {
                _gpfIgnore(attributes);
                result.push(_gpfDecodeAttributeMember(member));
            });
            return result;
        },

        /**
         * The forEach() method executes a provided function once per member
         *
         * @param {Function} callback function to execute for each element, taking three arguments
         * - {gpf.attributes.Array} array
         * - {String} member
         * - {Object} dictionary
         * @param {Object} [thisArg=undefined] thisArg value to use as this when executing callback
         */
        forEach: function (callback, thisArg) {
            /*gpf:inline(object)*/ _gpfObjectForEach(this._members, function (attributes, member, dictionary) {
                callback.apply(thisArg, [attributes, _gpfDecodeAttributeMember(member), dictionary]);
            });
        }

    }
});

/**
 * Add the attribute list to the given prototype associated with the provided member name
 *
 * @param {Function} objectClass class constructor
 * @param {String} name member name
 * @param {gpf.attributes.Attribute|gpf.attributes.Attribute[]} attributes
 */
var _gpfAttributesAdd = _gpfA.add = function (objectClass, name, attributes) {
    // Check attributes parameter
    if (!(attributes instanceof Array)) {
        attributes = [attributes];
    }
    var
        classDef = _gpfGetClassDefinition(objectClass),
        objectClassOwnAttributes = classDef._attributes,
        len,
        idx,
        attribute;
    if (!objectClassOwnAttributes) {
        objectClassOwnAttributes = classDef._attributes = new _gpfA.Map();
    }
    len = attributes.length;
    for (idx = 0; idx < len; ++idx) {
        attribute = attributes[idx];
        _gpfAssert(attribute instanceof _gpfAttribute, "Expected attribute");
        attribute._member = name; // Assign member name
        objectClassOwnAttributes.add(name, attribute);
        attribute._alterPrototype(objectClass.prototype);
    }
};

/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefAttr*/ // gpf.define for attributes
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfGetClassDefinition*/ // Get GPF class definition for a constructor
/*global _gpfStringCapitalize*/ // Capitalize the string
/*exported _gpfANoSerial*/
/*#endif*/

var
    /**
     * Base class for class-specific attributes
     *
     * @class gpf.attributes._gpfClassAttribute
     * @extends gpf.attributes.Attribute
     */
    _gpfClassAttribute = _gpfDefAttr("ClassAttribute"),

    /**
     * alias for gpf.attributes.ClassNonSerializedAttribute
     *
     * @type {Function}
     */
    _gpfANoSerial;

/**
 * Read-only property accessor template
 *
 * @returns {*}
 * @this instance
 */
function _gpfGetProperty () {
    /*jshint validthis:true*/
    return this._MEMBER_;
}

/**
 * Property accessor template
 *
 * @returns {*} former value
 * @this instance
 */
function _gpfSetProperty (value) {
    /*jshint validthis:true*/
    var result = this._MEMBER_;
    this._MEMBER_ = value;
    return result;
}

/**
 * Builds a new property function
 *
 * @param {Boolean} template Template to be used
 * @param {String} member Value of _MEMBER_
 * @return {Function}
 */
function _gpfBuildPropertyFunc (template, member) {
    var src,
        params,
        start,
        end;
    // Replace all occurrences of _MEMBER_ with the right name
    src = template.toString().split("_MEMBER_").join(member);
    // Extract parameters
    start = src.indexOf("(") + 1;
    end = src.indexOf(")", start) - 1;
    params = src.substr(start, end - start + 1).split(",").map(function (name) {
        return name.trim();
    });
    // Extract body
    start = src.indexOf("{") + 1;
    end = src.lastIndexOf("}") - 1;
    src = src.substr(start, end - start + 1);
    return _gpfFunc(params, src);
}

/**
 * Creates getter (and setter) methods for a private member. The created
 * accessor is a method with the following signature:
 * {type} MEMBER({type} [value=undefined] value)
 * When value is not set, the member acts as a getter
 *
 *
 * @class gpf.attributes.ClassPropertyAttribute
 * @extends gpf.attributes._gpfClassAttribute
 * @alias gpf.$ClassProperty
 */
_gpfDefAttr("$ClassProperty", _gpfClassAttribute, {
    "[Class]": [gpf.$MemberAttribute(), gpf.$UniqueAttribute(false)],
    "-": {

        // If true, generates a write wrapper
        _writeAllowed: false,

        /**
         * If set, provides the member name. Otherwise, name is based on member.
         *
         * @type {String|undefined}
         */
        _publicName: undefined,

        /**
         * If set, provides the member visibility. Default is 'public' member.
         *
         * @type {String|undefined}
         */
        _visibility: undefined

    },
    "#": {

        // @inheritdoc gpf.attributes.Attribute#_alterPrototype
        _alterPrototype: function (objPrototype) {
            var
                member = this._member,
                name = this._publicName,
                visibility = this._visibility,
                classDef = _gpfGetClassDefinition(objPrototype.constructor);
            if (!name) {
                if ("_" === member.charAt(0)) {
                    name = member.substr(1); // starts with _
                } else {
                    name = member;
                }
            }
            name = _gpfStringCapitalize(name);
            if (this._writeAllowed) {
                classDef.addMember("set" + name, _gpfBuildPropertyFunc(_gpfSetProperty, member), visibility);
            }
            classDef.addMember("get" + name, _gpfBuildPropertyFunc(_gpfGetProperty, member), visibility);
        }

    },
    "+": {

        /**
         * @param {Boolean} writeAllowed
         * @param {String} [publicName=undefined] publicName When not specified, the member name (without _) is applied
         * @param {String} [visibility=undefined] visibility When not specified, public is used
         * @constructor
         */
        constructor: function (writeAllowed, publicName, visibility) {
            if (writeAllowed) {
                this._writeAllowed = true;
            }
            if ("string" === typeof publicName) {
                this._publicName = publicName;
            }
            if ("string" === typeof visibility) {
                this._visibility = visibility;
            }
        }

    }
});

/**
 * Used to flag a method which owns a last parameter being an event handler
 *
 * @class gpf.attributes.ClassEventHandlerAttribute
 * @extends gpf.attributes._gpfClassAttribute
 * @alias gpf.$ClassEventHandler
 */
_gpfDefAttr("$ClassEventHandler", _gpfClassAttribute, {
    "[Class]": [gpf.$MemberAttribute(), gpf.$UniqueAttribute(false)]
});

/**
 * Used to flag a member as non serializable
 *
 * @class gpf.attributes.ClassNonSerializedAttribute
 * @extends gpf.attributes._gpfClassAttribute
 * @alias gpf.$ClassNonSerialized
 */
_gpfANoSerial = _gpfDefAttr("$ClassNonSerialized", _gpfClassAttribute, {
    "[Class]": [gpf.$MemberAttribute(), gpf.$UniqueAttribute(false)]
});

/**
 * Defines a class extension (internal)
 *
 * @param {String} ofClass
 * @param {String} [publicName=undefined] publicName When not specified, the original method name is used
 *
 * @class gpf.attributes.ClassExtensionAttribute
 * @extends gpf.attributes._gpfClassAttribute
 * @alias gpf.$ClassExtension
 */
_gpfDefAttr("$ClassExtension", _gpfClassAttribute, {
    "-": {

        // Constructor of the class to extend
        _ofClass: _gpfEmptyFunc,

        // Name of the method if added to the class
        _publicName: ""

    },
    "+": {

        /**
         * @param {Function} ofClass Constructor of the class to extend
         * @param {String} publicName Name of the method if added to the class
         */
        constructor: function (ofClass, publicName) {
            this._ofClass = ofClass;
            if ("string" === typeof publicName) {
                this._publicName = publicName;
            }
        }

    }
});

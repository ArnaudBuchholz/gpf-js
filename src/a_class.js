/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefAttr*/ // gpf.define for attributes
/*global _gpfGetClassDefinition*/ // Get GPF class definition for a constructor
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfFunc*/ // Create a new function using the source
/*#endif*/

var
    /**
     * Read-only property accessor template
     *
     * @return {*}
     */
    _gpfROProperty = function () {
        return this._MEMBER_;
    },

    /**
     * Property accessor template
     *
     * @return {*}
     */
    _gpfRWProperty = function () {
        var result = this._MEMBER_;
        if (0 < arguments.length) {
            this._MEMBER_ = arguments[0];
        }
        return result;
    },

    /**
     * Base class for class-specific attributes
     *
     * @class gpf.attributes._gpfClassAttribute
     * @extends gpf.attributes.Attribute
     */
    _gpfClassAttribute = _gpfDefAttr("ClassAttribute");

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

    private: {

        /**
         * If true, generates a write wrapper
         *
         * @type {Boolean}
         * @private
         */
        _writeAllowed: false,

        /**
         * If set, provides the member name. Otherwise, name is based on
         * member.
         *
         * @type {String|undefined}
         * @private
         */
        _publicName: undefined,

        /**
         * If set, provides the member visibility.
         * Default is 'public'
         * member.
         *
         * @type {String|undefined}
         * @private
         */
        _visibility: undefined

    },

    protected: {

        /**
         * @inheritdoc gpf.attributes.Attribute:_alterPrototype
         */
        _alterPrototype: function (objPrototype) {
            var
                member = this._member,
                publicName = this._publicName,
                classDef = _gpfGetClassDefinition(objPrototype.constructor),
                params,
                src,
                start,
                end;
            if (!publicName) {
                // TODO check if member really starts with _
                publicName = member.substr(1); // starts with _
            }
            if (this._writeAllowed) {
                // Parameter is not used but this will change function length
                params = ["value"];
                src = _gpfRWProperty.toString();
            } else {
                params = [];
                src = _gpfROProperty.toString();
            }
            // Replace all occurrences of _MEMBER_ with the right name
            src = src.split("_MEMBER_").join(member);
            // Extract content of resulting function source
            start = src.indexOf("{") + 1;
            end = src.lastIndexOf("}") - 1;
            src = src.substr(start, end - start + 1);
            classDef.addMember(publicName, _gpfFunc(params, src),
                this._visibility);
        }

    },

    public: {

        /**
         * @param {Boolean} writeAllowed
         * @param {String} [publicName=undefined] publicName When not
         * specified, the member name (without _) is applied
         * @param {String} [visibility=undefined] visibility When not
         * specified, public is used
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
_gpfDefAttr("$ClassEventHandler", _gpfClassAttribute, {});

/**
 * Defines a class extension (internal)
 *
 * @param {String} ofClass
 * @param {String} [publicName=undefined] publicName When not specified, the
 * original method name is used
 *
 * @class gpf.attributes.ClassExtensionAttribute
 * @extends gpf.attributes._gpfClassAttribute
 * @alias gpf.$ClassExtension
 */
_gpfDefAttr("$ClassExtension", _gpfClassAttribute, {

    private: {

        /**
         * Constructor of the class to extend
         *
         * @type {Function}
         * @private
         */
        _ofClass: _gpfEmptyFunc,

        /**
         * Name of the method if added to the class
         *
         * @type {String}
         * @private
         */
        _publicName: ""

    },

    public: {

        /**
         * @param {Function} ofClass Constructor of the class to extend
         * @param {String} publicName Name of the method if added to the
         * class
         * @constructor
         */
        constructor: function (ofClass, publicName) {
            this._ofClass = ofClass;
            if ("string" === typeof publicName) {
                this._publicName = publicName;
            }
        }

    }

});


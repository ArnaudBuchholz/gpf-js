/*#ifndef(UMD)*/
"use strict";
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfFunc*/ // Create a new function using the source
/*#endif*/

var
    /**
     * Read-only property accessor template
     *
     * @return {*}
     */
    _roProperty = function () {
        return this._MEMBER_;
    },

    /**
     * Property accessor template
     *
     * @return {*}
     */
    _rwProperty = function () {
        var result = this._MEMBER_;
        if (0 < arguments.length) {
            this._MEMBER_ = arguments[0];
        }
        return result;
    },

    /**
     * Base class for class-specific attributes
     *
     * @class gpf.attributes._ClassAttribute
     * @extends gpf.attributes.Attribute
     */
    _ClassAttribute = gpf._defAttr("ClassAttribute");

/**
 * Creates getter (and setter) methods for a private member. The created
 * accessor is a method with the following signature:
 * {type} MEMBER({type} [value=undefined] value)
 * When value is not set, the member acts as a getter
 *
 *
 * @class gpf.attributes.ClassPropertyAttribute
 * @extends gpf.attributes._ClassAttribute
 * @alias gpf.$ClassProperty
 */
gpf._defAttr("$ClassProperty", _ClassAttribute, {

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
                classDef = gpf.classDef(objPrototype.constructor),
                src,
                start,
                end;
            if (!publicName) {
                publicName = member.substr(1); // starts with _
            }
            if (this._writeAllowed) {
                src = _rwProperty.toString();
            } else {
                src = _roProperty.toString();
            }
            // Replace all occurrences of _MEMBER_ with the right name
            src = src.split("_MEMBER_").join(member);
            // Extract content of resulting function source
            start = src.indexOf("{") + 1;
            end = src.lastIndexOf("}") - 1;
            src =  src.substr(start, end - start + 1);
            classDef.addMember(publicName, _gpfFunc(src),
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
 * @extends gpf.attributes._ClassAttribute
 * @alias gpf.$ClassEventHandler
 */
gpf._defAttr("$ClassEventHandler", _ClassAttribute, {});

/**
 * Defines a class extension (internal)
 *
 * @param {String} ofClass
 * @param {String} [publicName=undefined] publicName When not specified,
 * the original method name is used
 *
 * @class gpf.attributes.ClassExtensionAttribute
 * @extends gpf.attributes._ClassAttribute
 * @alias gpf.$ClassExtension
 */
gpf._defAttr("$ClassExtension", _ClassAttribute, {

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


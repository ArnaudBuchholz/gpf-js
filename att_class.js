/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    var
        /**
         * Generates a read-only property accessor
         *
         * @param {String} member
         * @return {Function}
         * @closure
         */
        _roProperty = function (member) {
            return gpf._func("return this." + member + ";");
        },

        /**
         * Generates a property accessor
         *
         * @param {String} member
         * @return {Function}
         * @closure
         */
        _rwProperty = function (member) {
            return gpf._func("var r = this." + member
                + "; if (0 < arguments.length) { this." + member
                + " = arguments[0]; } return r;");
        },

        /**
         * Base class for class-specific attributes
         *
         * @class gpf.attributes.ClassAttribute
         * @extends gpf.attributes.Attribute
         */
        _base = gpf._defAttr("ClassAttribute");

    /**
     * Creates getter (and setter) methods for a private member. The created
     * accessor is a method with the following signature:
     * {type} MEMBER({type} [value=undefined] value)
     * When value is not set, the member acts as a getter
     *
     *
     * @class gpf.attributes.ClassPropertyAttribute
     * @extends gpf.attributes.ClassAttribute
     * @alias gpf.$ClassProperty
     */
    gpf._defAttr("$ClassProperty", _base, {

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
                    accessor;
                if (!publicName) {
                    publicName = member.substr(1); // starts with _
                }
                if (this._writeAllowed) {
                    accessor = _rwProperty(member);
                } else {
                    accessor = _roProperty(member);
                }
                classDef.addMember(publicName, accessor, this._visibility);
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
     * @extends gpf.attributes.ClassAttribute
     * @alias gpf.$ClassEventHandler
     */
    gpf._defAttr("$ClassEventHandler", _base, {});

    /**
     * Defines a class extension (internal)
     *
     * @param {String} ofClass
     * @param {String} [publicName=undefined] publicName When not specified,
     * the original method name is used
     *
     * @class gpf.attributes.ClassExtensionAttribute
     * @extends gpf.attributes.ClassAttribute
     * @alias gpf.$ClassExtension
     */
    gpf._defAttr("$ClassExtension", _base, {

        private: {

            /**
             * Constructor of the class to extend
             *
             * @type {Function}
             * @private
             */
            _ofClass: gpf.emptyFunction(),

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

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/
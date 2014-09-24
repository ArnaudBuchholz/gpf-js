/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    var
        /*
         * 2013-12-15 ABZ
         *  Decided to make it as simple as possible
         */
        _roProperty = function (member) {
            return gpf._func("return this." + member + ";");
        },

        _rwProperty = function (member) {
            return gpf._func("var r = this." + member
                + "; if (0 < arguments.length) { this." + member
                + " = arguments[0]; } return r;");
        },

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

        _writeAllowed: false,
        _publicName: undefined,
        _visibility: undefined,

        /**
         * @param {Boolean} writeAllowed
         * @param {String} [publicName=undefined] publicName When not specified,
         * the member name (without _) is applied
         * @param {String} [visibility=undefined] visibility When not specified,
         * public is used
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
        },

        _alterPrototype: function (objPrototype) {
            var
                member = this._member,
                publicName = this._publicName,
                classDef = gpf.classDef(objPrototype.constructor),
                accessor;
            if (!publicName) {
                publicName = member.substr(1); // Considering it starts with _
            }
            if (this._writeAllowed) {
                accessor = _rwProperty(member);
            } else {
                accessor = _roProperty(member);
            }
            classDef.addMember(publicName, accessor, this._visibility);
        }

    });

    /**
     * Used to flag a method which owns a last parameter being an event handler
     *
     * @class gpf.attributes.ClassEventMethodAttribute
     * @extends gpf.attributes.ClassAttribute
     * @alias gpf.$ClassEventMethod
     */
    gpf._defAttr("$ClassEventMethod", _base, {});

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

//        "[Class]": [gpf.$Alias("ClassExtension")],

        _ofClass: 0,
        _publicName: "",

        constructor: function (ofClass, publicName) {
            this._ofClass = ofClass;
            if ("string" === typeof publicName) {
                this._publicName = publicName;
            }
        }

    });

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/
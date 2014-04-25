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
     * @param {Boolean} writeAllowed
     * @param {String} [publicName=undefined] publicName When not specified,
     * the member name (without _) is applied
     *
     * @class gpf.attributes.ClassPropertyAttribute
     * @extends gpf.attributes.ClassAttribute
     * @alias gpf.$ClassProperty
     */
    gpf._defAttr("$ClassProperty", _base, {

//        "[Class]": [gpf.$Alias("ClassProperty")],

        _writeAllowed: false,
        _publicName: "",

        init: function (writeAllowed, publicName) {
            if (writeAllowed) {
                this._writeAllowed = true;
            }
            if ("string" === typeof publicName) {
                this._publicName = publicName;
            }
        },

        alterPrototype: function (objPrototype) {
            var
                member = this._member,
                publicName = this._publicName;
            if (!publicName) {
                publicName = member.substr(1); // Considering it starts with _
            }
            if (this._writeAllowed) {
                objPrototype[publicName] = _rwProperty(member);
            } else {
                objPrototype[publicName] = _roProperty(member);
            }
        }

    });

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

        init: function (ofClass, publicName) {
            this._ofClass = ofClass;
            if ("string" === typeof publicName) {
                this._publicName = publicName;
            }
        }

    });

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/
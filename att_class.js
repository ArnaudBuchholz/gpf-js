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

        _base = gpf.define("gpf.attributes.ClassAttribute",
                    "gpf.attributes.Attribute");

    gpf.define("gpf.attributes.ClassPropertyAttribute", _base, {

        "[Class]": [gpf.$Alias("ClassProperty")],

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

    gpf.define("gpf.attributes.ClassExtensionAttribute", _base, {

        "[Class]": [gpf.$Alias("ClassExtension")],

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
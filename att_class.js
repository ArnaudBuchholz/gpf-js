(function () { /* Begin of privacy scope */
    "use strict";
    /*global document,window,console*/
    /*global process,require,exports,global*/
    /*global gpf*/
    /*jslint continue: true, nomen: true, plusplus: true*/

    var
        /*
         * 2013-12-15 ABZ
         *  Decided to make it as simple as possible
         */
        _roProperty = function (member) {
            return new Function("return this." + member + ";");
        },

        _rwProperty = function (member) {
            return new Function("var r = this." + member
                + "; if (0 < arguments.length) { this." + member
                + " = arguments[0]; } return r;");
        },

        _base = gpf.attributes.Attribute.extend({});

    gpf.attributes.ClassAttribute = _base;

    gpf.attributes.ClassPropertyAttribute = _base.extend({

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

    gpf.attributes.ClassExtensionAttribute = _base.extend({

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

}()); /* End of privacy scope */

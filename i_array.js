(function () { /* Begin of privacy scope */
    "use strict";

    gpf.interfaces.IReadOnlyArray = gpf.interfaces.Interface.extend({

        /**
         * Return the number of items in the array
         * @returns {number}
         */
        length: function () {
            return 0;
        },

        /**
         * Return the item inside the array (idx is 0-based)
         *
         * @param {number} idx index
         * @returns {*}
         */
        get: function (idx) {
            gpf.interfaces.ignoreParameter(idx);
            return undefined;
        }

    });

    gpf.interfaces.IArray = gpf.interfaces.IReadOnlyArray.extend({

        /**
         * Set the item inside the array (idx is 0-based)
         * Return the value that was previously set (or undefined)
         *
         * @param {number} idx index
         * @param {*} value
         * @returns {*}
         */
        set: function (idx, value) {
            gpf.interfaces.ignoreParameter(idx);
            gpf.interfaces.ignoreParameter(value);
            return undefined;
        }

    });

    gpf.attributes.ClassArrayInterfaceAttribute =
        gpf.attributes.ClassAttribute.extend({

        "[Class]": [gpf.$Alias("ClassIArray")],

        _writeAllowed: false,

        init: function (writeAllowed) {
            if (writeAllowed) {
                this._writeAllowed = true;
            }
        },

        alterPrototype: function (objPrototype) {
            var
                implementedInterface;
            if (this._writeAllowed) {
                implementedInterface = gpf.interfaces.IArray;
            } else {
                implementedInterface = gpf.interfaces.IReadOnlyArray;
            }
            gpf.attributes.add(objPrototype.constructor, "Class",
                [gpf.$InterfaceImplement(implementedInterface)]);
            objPrototype.length = gpf._func("return this."
                + this._member + ".length;");
            objPrototype.get = gpf._func("return this."
                + this._member + "[arguments[0]];");
            if (this._writeAllowed) {
                objPrototype.set = gpf._func("var i=arguments[0],"
                + "v=this." + this._name + "[i];this."
                + this._member + "[i]=arguments[1];return v;");
            }
        }

    });

    gpf.attributes.add(gpf.attributes.Array, "_array",
        [gpf.$ClassIArray(false)]);

}()); /* End of privacy scope */

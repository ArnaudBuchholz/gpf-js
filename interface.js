(function () { /* Begin of privacy scope */

    gpf.interfaces = {

        /**
         * Verify that the object implements the current interface
         *
         * @param {object} objectInstance object to inspect
         * @param {gpf.interfaces.Interface} interfaceDefinition reference
         * interface
         * @returns {boolean}
         */
        isImplementedBy: function (objectInstance, interfaceDefinition) {
            var member;
            /*
             * IMPORTANT note: we test the object itself (i.e. own members and
             * the prototype). That's why the hasOwnProperty is skipped
             */
            for (member in interfaceDefinition.prototype) {
                if ("constructor" === member                           // Object
                    || "extend" === member) {                       // gpf.Class
                    continue;
                }
                if (typeof interfaceDefinition.prototype[member]
                    !== typeof objectInstance[member]) {
                    return false;
                }
                // TODO: check function arity
            }
            return true;
        },

        /**
         * Used to remove warnings about unused parameters
         */
        ignoreParameter: function () {
            // TODO remove at build time
        }

    };

    gpf.interfaces.Interface = gpf.Class.extend({
    });

    gpf.attributes.InterfaceImplementAttribute
        = gpf.attributes.Attribute.extend({

        "[Class]": [gpf.$Alias("InterfaceImplement")],

        _interfaceDefinition: 0,

        init: function (interfaceDefinition) {
            this._interfaceDefinition = interfaceDefinition;
        }

    });

}()); /* End of privacy scope */

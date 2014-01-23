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
            //noinspection JSUnfilteredForInLoop
            for (member in interfaceDefinition.prototype) {
                if ("constructor" === member                           // Object
                    || "extend" === member) {                       // gpf.Class
                    continue;
                }
                //noinspection JSUnfilteredForInLoop
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
        ignoreParameter: function (value) {
            // TODO remove at build time
            return value;
        },

        /**
         * Retrieve an object implementing the expected interface from an
         * object.
         * This is done in two passes:
         * - Either the object implements the interface, it is returned
         * - Or the object implements IUnknown, then queryInterface is used
         *
         * @param {object} objectInstance object to inspect
         * @param {gpf.interfaces.Interface} interfaceDefinition reference
         * interface
         * @returns {object|null}
         */
        query: function (objectInstance, interfaceDefinition) {
            if (gpf.interfaces.isImplementedBy(objectInstance,
                interfaceDefinition)) {
                return objectInstance;
            } else if (gpf.interfaces.isImplementedBy(objectInstance,
                gpf.interfaces.IUnknown)) {
                return objectInstance.queryInterface(interfaceDefinition);
            } else {
                return null;
            }
        },

        //region Interface base class

        Interface: gpf.Class.extend({
        }),

        //endregion

        //region IUnknown

        /**
         * Provide a way for any object to implement an interface using an
         * intermediate object (this avoids overloading the object with
         * temporary / useless members)
         */
        IUnknown: gpf.interfaces.Interface.extend({

            /**
             * Retrieves an object supporting the provided interface
             * (maybe the object itself)
             *
             * @param {gpf.interfaces.Interface} interfaceDefinition The
             * expected * interface
             * @returns {object|null} The object supporting the interface (or
             * null)
             */
            queryInterface: function (interfaceDefinition) {
                gpf.interfaces.ignoreParameter(interfaceDefinition);
                return null;
            }

        })

        //endregion

    };

    //region InterfaceImplement attribute

    gpf.attributes.InterfaceImplementAttribute
        = gpf.attributes.Attribute.extend({

        "[Class]": [gpf.$Alias("InterfaceImplement")],

        _interfaceDefinition: 0,

        init: function (interfaceDefinition) {
            this._interfaceDefinition = interfaceDefinition;
        }

    });

    //endregion

}()); /* End of privacy scope */

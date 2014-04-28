/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    gpf.interfaces = {

        /**
         * Verify that the object implements the current interface
         *
         * @param {Object} objectInstance object to inspect
         * @param {gpf.interfaces.Interface} interfaceDefinition reference
         * interface
         * @return {Boolean}
         */
        isImplementedBy: function (objectInstance, interfaceDefinition) {
            var member;
            /*
             * IMPORTANT note: we test the object itself (i.e. own members and
             * the prototype). That's why the hasOwnProperty is skipped
             */
            /*jslint forin:false*/
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
            /*jslint forin:true*/
            return true;
        },

/*#ifdef(DEBUG)*/

        /**
         * Used to remove warnings about unused parameters
         */
        ignoreParameter: function (value) {
            // TODO remove at build time
            return value;
        },

/*#endif*/

        /**
         * Retrieve an object implementing the expected interface from an
         * object.
         * This is done in two passes:
         * - Either the object implements the interface, it is returned
         * - Or the object implements IUnknown, then queryInterface is used
         *
         * @param {Object} objectInstance object to inspect
         * @param {gpf.interfaces.Interface} interfaceDefinition reference
         * interface
         * @return {Object|null}
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
        }

    };

/*#ifndef(DEBUG)*/

    if (!gpf.interfaces.ignoreParameter) {

        gpf.interfaces.ignoreParameter = function /*gpf:inline*/ () {};

    }

/*#endif*/

    /**
     * Defines an interface (relies on gpf.define)
     *
     * @param {String} name Interface name. If it contains a dot, it is
     * treated as absolute contextual. Otherwise, it is relative to
     * "gpf.interfaces"
     * @param {Function|string} [base=undefined] base Base interface
     * (or contextual name)
     * @param {Object} [definition=undefined] definition Interface definition
     * @return {Function}
     * @private
     */
    gpf._defIntrf = gpf._genDefHandler("gpf.interfaces", "Interface");

    gpf._defIntrf("Interface");

    //region IUnknown

    /**
     * Provide a way for any object to implement an interface using an
     * intermediate object (this avoids overloading the object with temporary
     * / useless members)
     */
    gpf._defIntrf("IUnknown", {

        /**
         * Retrieves an object supporting the provided interface
         * (maybe the object itself)
         *
         * @param {gpf.interfaces.Interface} interfaceDefinition The expected
         * interface
         * @return {Object|null} The object supporting the interface (or null)
         */
        queryInterface: function (interfaceDefinition) {
            gpf.interfaces.ignoreParameter(interfaceDefinition);
            return null;
        }

    });

    //endregion

    //region InterfaceImplement attribute

    /**
     * Retrieves an object supporting the provided interface
     * (maybe the object itself). This function (added to any object declaring
     * the attribute InterfaceImplementAttribute with a builder) uses the
     * InterfaceImplementAttribute attribute list to see if the one
     * corresponding to the interface provides a builder and calls it
     *
     * @param {gpf.interfaces.Interface} interfaceDefinition The expected
     * interface
     * @return {Object|null} The object supporting the interface (or null)
     */
    function _queryInterface (interfaceDefinition) {
        /*jslint -W040*/
        var
            array = (new gpf.attributes.Map(this))
                .member("Class")
                .filter(gpf.attributes.InterfaceImplementAttribute),
            idx,
            attribute;
        for (idx = 0; idx < array.length(); ++idx) {
            attribute = array.get(idx);
            if (attribute._interfaceDefinition === interfaceDefinition) {
                if (attribute._builder) {
                    return attribute._builder(this);
                }
                break;
            }
        }
        // Otherwise
        return null;
        /*jslint +W040*/
    }

    /**
     * Creates a wrapper calling _queryInterface and, if no result is built, the
     * original one defined in the object prototype.
     *
     * @param {Function} orgQueryInterface
     * @private
     * @closure
     */
    function _wrapQueryInterface (orgQueryInterface) {
        return function () {
            var result = _queryInterface.apply(this, arguments);
            if (null === result) {
                result = orgQueryInterface.apply(this, arguments);
            }
            return result;
        };
    }

    /**
     * Extend the class to provide an array-like interface
     *
     * @param {Function} interfaceDefinition Implemented interface definition
     * @param {Function} [queryInterfaceBuilder=undefined] queryInterfaceBuilder
     * Function applied if the implemented interface is requested
     *
     * @class gpf.attributes.ClassArrayInterfaceAttribute
     * @extends gpf.attributes.ClassAttribute
     * @alias gpf.$ClassIArray
     */
    gpf._defAttr("$InterfaceImplement", {

//        "[Class]": [gpf.$Alias("InterfaceImplement")],

        "[_interfaceDefinition]": [gpf.$ClassProperty(false, "which")],
        _interfaceDefinition: 0,

        "[_builder]": [gpf.$ClassProperty(false, "how")],
        _builder: null,

        init: function (interfaceDefinition, queryInterfaceBuilder) {
            this._interfaceDefinition = interfaceDefinition;
            if (queryInterfaceBuilder) {
                this._builder = queryInterfaceBuilder;
            }
        },

        alterPrototype: function (objPrototype) {
            if (!this._builder) {
                // Nothing to do
                return;
            }
            if (undefined !== objPrototype.queryInterface) {
                /*
                 * Two situations here:
                 * - Either the class (or one of its parent) already owns
                 *   the $InterfaceImplement attribute
                 * - Or the class (or one of its parent) implements its
                 *   own queryInterface
                 * In that last case, wrap it to use the attribute version first
                 *
                 * In both case, we take the assumption that the class already
                 * owns gpf.$InterfaceImplement(gpf.interfaces.IUnknown)
                 */
                if (_queryInterface !== objPrototype.queryInterface) {
                    objPrototype.queryInterface =
                        _wrapQueryInterface(objPrototype.queryInterface);
                }
            } else {
                objPrototype.queryInterface = _queryInterface;
                gpf.attributes.add(objPrototype.constructor, "Class",
                    [gpf.$InterfaceImplement(gpf.interfaces.IUnknown)]);
            }
        }

    });

    //endregion

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/
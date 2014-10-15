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
            }
            /*jslint forin:true*/
            return true;
        },

/*#ifdef(DEBUG)*/

        /**
         * Used to remove warnings about unused parameters
         */
        ignoreParameter: function /*gpf:ignore*/ (value) {
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
         * @param {Boolean} [throwError=false] throwError Throws an error if the
         * interface is not found (otherwise, null is returned)
         * @return {Object|null}
         */
        query: function (objectInstance, interfaceDefinition, throwError) {
            var result = null;
            if (gpf.interfaces.isImplementedBy(objectInstance,
                interfaceDefinition)) {
                return objectInstance;
            } else if (gpf.interfaces.isImplementedBy(objectInstance,
                gpf.interfaces.IUnknown)) {
                result = objectInstance.queryInterface(interfaceDefinition);
            }
            if (null === result && throwError) {
                gpf.Error.InterfaceExpected({
                    name: gpf.classDef(interfaceDefinition).name()
                });
            }
            return result;
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

    //region IEventTarget

    gpf._defIntrf("IEventTarget", {

        /**
         * Add an event listener to the target
         *
         * @param {String} event name
         * @param {Function|gpf.Callback} callback
         * @param {Object|Boolean} scope scope of callback or useCapture
         * parameter. NOTE: if a gpf.Callback object is used and a scope
         * specified, a new gpf.Callback object is created.
         * @param {Boolean} [useCapture=false] useCapture push it on top of the
         * triggering queue
         * @return {gpf.interfaces.IEventTarget}
         * @chainable
         */
        addEventListener: function (event, callback, scope, useCapture) {
            gpf.interfaces.ignoreParameter(event);
            gpf.interfaces.ignoreParameter(callback);
            gpf.interfaces.ignoreParameter(scope);
            gpf.interfaces.ignoreParameter(useCapture);
        },

        /**
         * Remove an event listener to the target
         *
         * @param {String} event name
         * @param {Function|gpf.Callback} callback
         * @param {Object} [scope=undefined] scope scope of callback
         * @return {gpf.interfaces.IEventTarget}
         * @chainable
         */
        removeEventListener: function (event, callback, scope) {
            gpf.interfaces.ignoreParameter(event);
            gpf.interfaces.ignoreParameter(callback);
            gpf.interfaces.ignoreParameter(scope);
        }

    });

    //endregion

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

        private: {

            /**
             * Interface definition
             *
             * @type {Function}
             * @private
             */
            "[_interfaceDefinition]": [gpf.$ClassProperty(false, "which")],
            _interfaceDefinition: gpf.emptyFunction(),

            /**
             * Builder function
             *
             * @type {Function|null}
             * @private
             */
            "[_builder]": [gpf.$ClassProperty(false, "how")],
            _builder: null

        },

        protected: {

            /**
             * @inheritdoc gpf.attributes.Attribute:_alterPrototype
             */
            _alterPrototype: function (objPrototype) {
                var
                    iProto = this._interfaceDefinition.prototype,
                    iClassDef = gpf.classDef(this._interfaceDefinition),
                    member,
                    attributes;
                // Get the interface's attributes apply them to the obj
                attributes = new gpf.attributes.Map();
                attributes.fillFromClassDef(iClassDef);
                attributes.addTo(objPrototype.constructor);
                if (!this._builder) {
                    // Fill the missing methods
                    for (member in iProto) {
                        if (!(member in objPrototype)) {
                            objPrototype[member] = iProto[member];
                        }
                    }
                    return;
                }
                // Handle the queryInterface logic
                if (undefined !== objPrototype.queryInterface) {
                    /*
                     * Two situations here:
                     * - Either the class (or one of its parent) already owns
                     *   the $InterfaceImplement attribute
                     * - Or the class (or one of its parent) implements its
                     *   own queryInterface
                     * In that last case, wrap it to use the attribute version
                     * first
                     *
                     * In both case, we take the assumption that the class
                     * already owns
                     * gpf.$InterfaceImplement(gpf.interfaces.IUnknown)
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

        },

        public: {

            /**
             * @param {Function} interfaceDefinition Interface definition
             * @param {Function|null} [queryInterfaceBuilder=null]
             * queryInterfaceBuilder Builder function
             * @constructor
             */
            constructor: function (interfaceDefinition, queryInterfaceBuilder) {
                this._interfaceDefinition = interfaceDefinition;
                if (queryInterfaceBuilder) {
                    this._builder = queryInterfaceBuilder;
                }
            }

        }

    });

    //endregion

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/
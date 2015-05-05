/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfGetClassDefinition*/ // Get GPF class definition for a constructor
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfGenDefHandler*/ // Class handler for class types (interfaces...)
/*global _gpfDefAttr*/ // gpf.define for attributes
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*#endif*/

_gpfErrorDeclare("interfaces", {
    InterfaceExpected:
        "Expected interface not implemented: {name}"
});

gpf.interfaces = {

    /**
     * Verify that the object implements the current interface
     *
     * @param {Object|Function} inspectedObject object (or class) to inspect
     * @param {gpf.interfaces.Interface} interfaceDefinition reference
     * interface
     * @return {Boolean}
     */
    isImplementedBy: function (inspectedObject, interfaceDefinition) {
        var member,
            memberReference,
            memberValue,
            memberType;
        if (inspectedObject instanceof Function) {
            inspectedObject = inspectedObject.prototype;
        }
        /*
         * IMPORTANT note: we test the object itself (i.e. own members and
         * the prototype). That's why the hasOwnProperty is skipped
         */
        /*jslint forin:false*/
        for (member in interfaceDefinition.prototype) {
            if ("constructor" === member                               // Object
                || "extend" === member) {                           // gpf.Class
                continue;
            }
            memberReference = interfaceDefinition.prototype[member];
            memberValue = inspectedObject[member];
            memberType = typeof memberValue;
            if (typeof memberReference !== memberType) {
                return false;
            }
            if ("function" === memberType
                && memberReference.length !== memberValue.length) {
                return false;
            }
        }
        /*jslint forin:true*/
        return true;
    },

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
     * @param {Boolean} [throwError=true] throwError Throws an error if the
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
        if (undefined === throwError) {
            throwError = true;
        }
        if (null === result && throwError) {
            throw gpf.Error.InterfaceExpected({
                name: _gpfGetClassDefinition(interfaceDefinition).name()
            });
        }
        return result;
    }

};

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
var _gpfDefIntrf = _gpfGenDefHandler("gpf.interfaces", "Interface");

_gpfDefIntrf("Interface");

//region IEventTarget

_gpfDefIntrf("IEventDispatcher", {

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
     * @return {gpf.interfaces.IEventDispatcher}
     * @chainable
     */
    addEventListener: function (event, callback, useCapture) {
        _gpfIgnore(event);
        _gpfIgnore(callback);
        _gpfIgnore(useCapture);
        return this;
    },

    /**
     * Remove an event listener to the target
     *
     * @param {String} event name
     * @param {Function|gpf.Callback} callback
     * @param {Object} [scope=undefined] scope scope of callback
     * @return {gpf.interfaces.IEventDispatcher}
     * @chainable
     */
    removeEventListener: function (event, callback) {
        _gpfIgnore(event);
        _gpfIgnore(callback);
        return this;
    }

});

//endregion

//region IUnknown

/**
 * Provide a way for any object to implement an interface using an
 * intermediate object (this avoids overloading the object with temporary
 * / useless members)
 */
_gpfDefIntrf("IUnknown", {

    /**
     * Retrieves an object supporting the provided interface
     * (maybe the object itself)
     *
     * @param {gpf.interfaces.Interface} interfaceDefinition The expected
     * interface
     * @return {Object|null} The object supporting the interface (or null)
     */
    queryInterface: function (interfaceDefinition) {
        _gpfIgnore(interfaceDefinition);
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
    for (idx = 0; idx < array.count(); ++idx) {
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
_gpfDefAttr("$InterfaceImplement", {

    private: {

        /**
         * Interface definition
         *
         * @type {Function}
         * @private
         */
        "[_interfaceDefinition]": [gpf.$ClassProperty(false, "which")],
        _interfaceDefinition: _gpfEmptyFunc,

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
                iClassDef = _gpfGetClassDefinition(this._interfaceDefinition),
                member,
                attributes;
            // Get the interface's attributes apply them to the obj
            attributes = new gpf.attributes.Map();
            attributes.fillFromClassDef(iClassDef);
            attributes.addTo(objPrototype.constructor);
            if (!this._builder) {
                // Fill the missing methods
                /*jshint -W089*/ // Because I also want inherited ones
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
        /*jshint +W089*/

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
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAttributesAdd*/ // Shortcut for gpf.attributes.add
/*global _gpfDefAttr*/ // gpf.define for attributes
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfGenDefHandler*/ // Class handler for class types (interfaces...)
/*global _gpfGetClassDefinition*/ // Get GPF class definition for a constructor
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*exported _gpfI*/
/*exported _gpfDefIntrf*/
/*#endif*/

_gpfErrorDeclare("interfaces", {
    InterfaceExpected:
        "Expected interface not implemented: {name}"
});

/**
 * Verify that the object implements the current interface
 *
 * @param {Object} inspectedObject object (or class) to inspect
 * @param {gpf.interfaces.Interface} interfaceDefinition reference interface
 * @return {Boolean}
 */
function _gpfIsImplementedBy(inspectedObject, interfaceDefinition) {
    var member,
        memberReference,
        memberValue,
        memberType;
    /*
     * IMPORTANT note: we test the object itself (i.e. own members and the prototype).
     * That's why the hasOwnProperty is skipped
     */
    /*jslint forin:true*/
    for (member in interfaceDefinition.prototype) {
        if ("constructor" === member) { // Object
            continue;
        }
        memberReference = interfaceDefinition.prototype[member];
        memberValue = inspectedObject[member];
        memberType = typeof memberValue;
        if (typeof memberReference !== memberType) {
            return false;
        }
        if ("function" === memberType && memberReference.length !== memberValue.length) {
            return false;
        }
    }
    return true;
}

var
    /**
     * gpf.attributes shortcut
     *
     * @type {Object}
     * @private
     */
    _gpfI = gpf.interfaces = {

        /**
         * Verify that the object (or class) implements the current interface
         *
         * @param {Object|Function} inspectedObject object (or class) to inspect
         * @param {gpf.interfaces.Interface} interfaceDefinition reference interface
         * @return {Boolean}
         */
        isImplementedBy: function (inspectedObject, interfaceDefinition) {
            if (inspectedObject instanceof Function) {
                inspectedObject = inspectedObject.prototype;
            }
            return _gpfIsImplementedBy(inspectedObject, interfaceDefinition);
        },

        /**
         * Retrieve an object implementing the expected interface from an object.
         * This is done in two tests:
         * - Either the object implements the interface, it is returned
         * - Or the object implements IUnknown, then queryInterface is used
         *
         * @param {Object} objectInstance object to inspect
         * @param {gpf.interfaces.Interface} interfaceDefinition reference interface
         * @param {Boolean} [throwError=true] throwError Throws an error if the interface is not found (otherwise, null
         * is returned)
         * @return {Object|null}
         */
        query: function (objectInstance, interfaceDefinition, throwError) {
            var result = null;
            if (_gpfIsImplementedBy(objectInstance, interfaceDefinition)) {
                return objectInstance;
            } else if (_gpfIsImplementedBy(objectInstance, gpf.interfaces.IUnknown)) {
                result = objectInstance.queryInterface(interfaceDefinition);
            }
            if (null === result && (undefined === throwError || throwError)) {
                throw gpf.Error.InterfaceExpected({
                    name: _gpfGetClassDefinition(interfaceDefinition)._name
                });
            }
            return result;
        }

    };

/**
 * Defines an interface (relies on gpf.define)
 *
 * @param {String} name Interface name. If it contains a dot, it is treated as absolute contextual.
 * Otherwise, it is relative to "gpf.interfaces"
 * @param {Function|string} [base=undefined] base Base interface (or contextual name)
 * @param {Object} [definition=undefined] definition Interface definition
 * @return {Function}
 */
var _gpfDefIntrf = _gpfGenDefHandler("gpf.interfaces", "Interface");

/**
 * Base class for any interface
 *
 * @class gpf.interfaces.Interface
 */
_gpfDefine("gpf.interfaces.Interface", Object, {});

//region IEventTarget

_gpfDefIntrf("IEventDispatcher", {

    /**
     * Add an event listener to the dispatcher
     *
     * @param {String} event name
     * @param {gpf.events.Handler} eventsHandler
     * @return {gpf.interfaces.IEventDispatcher}
     * @chainable
     */
    addEventListener: function (event, eventsHandler) {
        _gpfIgnore(event, eventsHandler);
        return this;
    },

    /**
     * Remove an event listener from the dispatcher
     *
     * @param {String} event name
     * @param {gpf.events.Handler} eventsHandler
     * @return {gpf.interfaces.IEventDispatcher}
     * @chainable
     */
    removeEventListener: function (event, eventsHandler) {
        _gpfIgnore(event, eventsHandler);
        return this;
    },

    /**
     * Broadcast the event
     *
     * @param {String|gpf.events.Event} event name or object
     * @param {Object} [params={}] event parameters
     * @return {gpf.events.Event}
     */
    dispatchEvent: function (event, params) {
        _gpfIgnore(event, params);
    }

});

//endregion

//region IUnknown

/**
 * Provide a way for any object to implement an interface using an intermediate object (this avoids overloading the
 * object with temporary / useless members)
 */
var _gpfIUnknown = _gpfDefIntrf("IUnknown", {

    /**
     * Retrieves an object supporting the provided interface (maybe the object itself)
     *
     * @param {gpf.interfaces.Interface} interfaceDefinition The expected interface
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
 * Retrieves an object supporting the provided interface (maybe the object itself).
 * This function (added to any object declaring the attribute InterfaceImplementAttribute with a builder) uses the
 * InterfaceImplementAttribute attribute list to see if the one corresponding to the interface provides a builder and
 * calls it
 *
 * @param {gpf.interfaces.Interface} interfaceDefinition The expected interface
 * @return {Object|null} The object supporting the interface (or null)
 */
function _queryInterface (interfaceDefinition) {
    /*jshint validthis:true*/ // Called with apply
    var
        array = (new gpf.attributes.Map(this))
            .getMemberAttributes("Class")
            .filter(gpf.attributes.InterfaceImplementAttribute),
        builder;
    if (array.every(function (attribute) {
        builder = attribute._builder;
        return attribute._interfaceDefinition !== interfaceDefinition || !builder;
    })) {
        if ("function" === typeof builder) {
            return builder(this);
        }
        // Expects a member name
        return this[builder]();
    }
    // Otherwise
    return null;
}

/**
 * Creates a wrapper calling _queryInterface and, if no result is built, the original one defined in the object
 * prototype
 *
 * @param {Function} orgQueryInterface
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
 * Document the class by telling the interface is implemented and may provide a builder to access it
 *
 * @param {Function} interfaceDefinition Implemented interface definition
 * @param {Function|String} [queryInterfaceBuilder=undefined] queryInterfaceBuilder Function or member name to executed
 * if the implemented interface is requested
 *
 * @class gpf.attributes.InterfaceImplementAttribute
 * @extends gpf.attributes.ClassAttribute
 * @alias gpf.$InterfaceImplement
 */
_gpfDefAttr("$InterfaceImplement", {
    private: {

        // Interface definition
        "[_interfaceDefinition]": [gpf.$ClassProperty(false)],
        _interfaceDefinition: _gpfEmptyFunc,

        /**
         * Builder function
         *
         * @type {Function|null}
         */
        "[_builder]": [gpf.$ClassProperty(false)],
        _builder: null,

        _addMissingInterfaceMembers: function (objPrototype) {
            var
                iProto = this._interfaceDefinition.prototype,
                member;
            // Fill the missing methods
            /*jslint forin:true*/ // Wants inherited members too
            for (member in iProto) {
                if (!(member in objPrototype)) {
                    objPrototype[member] = iProto[member];
                }
            }
        },

        _addQueryInterface: function (objPrototype) {
            if (undefined !== objPrototype.queryInterface) {
                /*
                 * Two situations here:
                 * - Either the class (or one of its parent) already owns the $InterfaceImplement attribute
                 * - Or the class (or one of its parent) implements its own queryInterface
                 * In that last case, wrap it to use the attribute version first
                 *
                 * In both case, we take the assumption that the class already owns
                 * gpf.$InterfaceImplement(gpf.interfaces.IUnknown)
                 */
                if (_queryInterface !== objPrototype.queryInterface) {
                    objPrototype.queryInterface = _wrapQueryInterface(objPrototype.queryInterface);
                }
            } else {
                objPrototype.queryInterface = _queryInterface;
                _gpfAttributesAdd(objPrototype.constructor, "Class", [gpf.$InterfaceImplement(_gpfIUnknown)]);
            }
        }

    },
    protected: {

        // @inheritdoc gpf.attributes.Attribute#_alterPrototype
        _alterPrototype: function (objPrototype) {
            if (!this._builder) {
                this._addMissingInterfaceMembers(objPrototype);
                // Get the interface's attributes apply them to the obj
                new gpf.attributes.Map()
                    .fillFromClassDef(_gpfGetClassDefinition(this._interfaceDefinition))
                    .forEach(function (attributes, member) {
                        _gpfAttributesAdd(objPrototype.constructor, member, attributes);
                    });
            } else {
                this._addQueryInterface(objPrototype);
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

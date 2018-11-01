/**
 * @file Interfaces
 * @since 0.1.8
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAssert*/ // Assertion method
/*global _gpfContext*/ // Resolve contextual string
/*global _gpfCreateAbstractFunction*/ // Build a function that throws the abstractMethod exception
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _gpfDefineInterface*/ // Internal interface definition helper
/*exported _gpfI*/ // gpf.interfaces
/*exported _gpfInterfaceQuery*/ // gpf.interfaces.query
/*#endif*/

_gpfErrorDeclare("interfaces", {

    /**
     * ### Summary
     *
     * Expected interface not implemented
     *
     * ### Description
     *
     * This error is used when a function expects a specific interface and it can't be resolved with the provided
     * parameter.
     * @since 0.1.8
     */
    interfaceExpected:
        "Expected interface not implemented: {name}"
});

function _gpfInterfaceIsInvalidMethod (referenceMethod, method) {
    return typeof method !== "function" || referenceMethod.length !== method.length;
}

/**
 * Verify that the object implements the specified interface
 *
 * @param {Function} interfaceSpecifier Reference interface
 * @param {Object} inspectedObject Object (or class prototype) to inspect
 * @return {Boolean} True if implemented
 * @since 0.1.8
 */
function _gpfInterfaceIsImplementedBy (interfaceSpecifier, inspectedObject) {
    var result = true;
    _gpfObjectForEach(interfaceSpecifier.prototype, function (referenceMethod, name) {
        if (name === "constructor") {
            // ignore
            return;
        }
        if (_gpfInterfaceIsInvalidMethod(referenceMethod, inspectedObject[name])) {
            result = false;
        }
    });
    return result;
}

/**
 * Retrieve an object implementing the expected interface from an object using the IUnknown interface
 *
 * @param {Function} interfaceSpecifier Reference interface
 * @param {Object} queriedObject Object to query
 * @return {Object|null} Object implementing the interface or null
 * @since 0.1.8
 */
function _gpfInterfaceQueryThroughIUnknown (interfaceSpecifier, queriedObject) {
    var result = queriedObject.queryInterface(interfaceSpecifier);
    _gpfAssert(result === null || _gpfInterfaceIsImplementedBy(interfaceSpecifier, result),
        "Invalid result of queryInterface (must be null or an object implementing the interface)");
    return result;
}

/**
 * Retrieve an object implementing the expected interface from an object trying the IUnknown interface
 *
 * @param {Function} interfaceSpecifier Reference interface
 * @param {Object} queriedObject Object to query
 * @return {Object|null|undefined} Object implementing the interface or null,
 * undefined is returned when IUnknown is not implemented
 * @since 0.1.8
 */
function _gpfInterfaceQueryTryIUnknown (interfaceSpecifier, queriedObject) {
    if (_gpfInterfaceIsImplementedBy(gpf.interfaces.IUnknown, queriedObject)) {
        return _gpfInterfaceQueryThroughIUnknown(interfaceSpecifier, queriedObject);
    }
}

/**
 * Retrieve an object implementing the expected interface from an object:
 * - Either the object implements the interface, it is returned
 * - Or the object implements IUnknown, then queryInterface is used
 *
 * @param {Function} interfaceSpecifier Reference interface
 * @param {Object} queriedObject Object to query
 * @return {Object|null|undefined} Object implementing the interface or null,
 * undefined is returned when IUnknown is not implemented
 * @since 0.1.8
 */
function _gpfInterfaceQuery (interfaceSpecifier, queriedObject) {
    if (_gpfInterfaceIsImplementedBy(interfaceSpecifier, queriedObject)) {
        return queriedObject;
    }
    return _gpfInterfaceQueryTryIUnknown(interfaceSpecifier, queriedObject);
}

function _gpfInterfaceResolveSpecifier (interfaceSpecifier) {
    if (typeof interfaceSpecifier === "string") {
        return _gpfContext(interfaceSpecifier.split("."));
    }
    return interfaceSpecifier;
}

function _gpfInterfaceToInspectableObject (inspectedObject) {
    if (inspectedObject instanceof Function) {
        return inspectedObject.prototype;
    }
    return inspectedObject;
}

/**
 * @namespace gpf.interfaces
 * @description Root namespace for GPF interfaces
 * @since 0.1.8
 */
var _gpfI = gpf.interfaces = {

    /**
     * Verify that the object (or class) implements the current interface
     *
     * @param {Function|String} interfaceSpecifier Interface specifier
     * @param {Object|Function} inspectedObject object (or class) to inspect.
     * @return {Boolean} True if implemented
     * @since 0.1.8
     */
    isImplementedBy: function (interfaceSpecifier, inspectedObject) {
        if (!inspectedObject) {
            return false;
        }
        return _gpfInterfaceIsImplementedBy(_gpfInterfaceResolveSpecifier(interfaceSpecifier),
            _gpfInterfaceToInspectableObject(inspectedObject));
    },

    /**
     * Retrieve an object implementing the expected interface from an object:
     * - Either the object implements the interface, it is returned
     * - Or the object implements IUnknown, then queryInterface is used
     *
     * @param {Function|String} interfaceSpecifier Interface specifier
     * @param {Object} queriedObject Object to query
     * @return {Object|null|undefined} Object implementing the interface or null,
     * undefined is returned when IUnknown is not implemented
     * @since 0.1.8
     */
    query: function (interfaceSpecifier, queriedObject) {
        return _gpfInterfaceQuery(_gpfInterfaceResolveSpecifier(interfaceSpecifier), queriedObject);
    }

};

/**
 * Internal interface definition helper
 *
 * @param {String} name Interface name
 * @param {Object} definition Interface definition association method names to the number
 * of parameters
 * @return {Function} Interface specifier
 * @since 0.1.9
 */
function _gpfDefineInterface (name, definition) {
    var interfaceDefinition = {
        $interface: "gpf.interfaces.I" + name
    };
    Object.keys(definition).forEach(function (methodName) {
        interfaceDefinition[methodName] = _gpfCreateAbstractFunction(definition[methodName]);
    });
    return _gpfDefine(interfaceDefinition);
}

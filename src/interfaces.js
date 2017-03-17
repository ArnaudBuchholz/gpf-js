/**
 * @file Interfaces
 * @since 0.1.8
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfContext*/ // Resolve contextual string
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _gpfI*/ // gpf.interfaces
/*exported _gpfQueryInterface*/ // gpf.interfaces.query
/*#endif*/

_gpfErrorDeclare("interfaces", {
    interfaceExpected:
        "Expected interface not implemented: {name}"
});

function _gpfInterfaceIsInvalidMethod (referenceMethod, method) {
    return "function" !== typeof method || referenceMethod.length !== method.length;
}

/**
 * Verify that the object implements the specified interface
 *
 * @param {gpf.interfaces.Interface} interfaceSpecifier Reference interface
 * @param {Object} inspectedObject Object (or class) to inspect
 * @return {Boolean} True if implemented
 * @since 0.1.8
 */
function _gpfInterfaceIsImplementedBy (interfaceSpecifier, inspectedObject) {
    var result = true;
    _gpfObjectForEach(interfaceSpecifier.prototype, function (referenceMethod, name) {
        if (_gpfInterfaceIsInvalidMethod(referenceMethod, inspectedObject[name])) {
            result = false;
        }
    });
    return result;
}

function _gpfInterfaceResolveSpecifier (interfaceSpecifier) {
    if ("string" === typeof interfaceSpecifier) {
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
     * @param {Object|Function} inspectedObject object (or class) to inspect
     * @return {Boolean} True if implemented
     * @since 0.1.8
     */
    isImplementedBy: function (interfaceSpecifier, inspectedObject) {
        return _gpfInterfaceIsImplementedBy(_gpfInterfaceResolveSpecifier(interfaceSpecifier),
            _gpfInterfaceToInspectableObject(inspectedObject));
    }

};


/*#ifndef(UMD)*/

// gpf.internals._gpfQueryInterface = _gpfQueryInterface;

/*#endif*/

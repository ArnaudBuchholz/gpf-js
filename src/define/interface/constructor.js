/**
 * @file Interface constructor
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfFunctionBuild*/ // Build function from description and context
/*exported _gpfDefineGetInterfaceConstructor*/ // Allocate an interface constructor
/*#endif*/

_gpfErrorDeclare("define/interface/constructor", {
    "interfaceConstructorFunction":
        "This is an interface constructor function, do not invoke"
});


function _gpfDefineGetInterfaceConstructorDefinition (interfaceDefinition) {
    var name = interfaceDefinition._name;
    return {
        name: name,
        body: "gpf.Error.interfaceConstructorFunction();"
    };
}

function _gpfDefineGetInterfaceConstructorContext (interfaceDefinition) {
    return {
        gpf: gpf,
        _classDef_: interfaceDefinition
    };
}

/**
 * Allocate a secured named constructor
 *
 * @param {_GpfInterfaceDefinition} interfaceDefinition Interface definition
 * @return {Function} Secured named constructor
 * @gpf:closure
 */
function _gpfDefineGetInterfaceConstructor (interfaceDefinition) {
    return _gpfFunctionBuild(_gpfDefineGetInterfaceConstructorDefinition(interfaceDefinition),
        _gpfDefineGetInterfaceConstructorContext(interfaceDefinition));
}

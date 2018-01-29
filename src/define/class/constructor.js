/**
 * @file Class constructor
 * @since 0.1.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfFunctionBuild*/ // Build function from description and context
/*global _gpfFunctionDescribe*/ // Extract function description
/*exported _gpfDefineGetClassSecuredConstructor*/ // Allocate a secured named constructor
/*#endif*/

_gpfErrorDeclare("define/class/constructor", {
    "classConstructorFunction":
        "This is a class constructor function, use with new"
});


Object.assign(_GpfClassDefinition.prototype, {

    /**
     * Resolved constructor
     *
     * @type {Function}
     * @since 0.1.6
     */
    _resolvedConstructor: _gpfEmptyFunc

});

function _gpfDefineGetClassSecuredConstructorDefinition (classDefinition) {
    var name = classDefinition._name;
    return {
        name: name,
        parameters: _gpfFunctionDescribe(classDefinition._resolvedConstructor).parameters,
        body: "if (!(this instanceof _classDef_._instanceBuilder)) gpf.Error.classConstructorFunction();\n"
            + "_classDef_._resolvedConstructor.apply(this, arguments);"
    };
}

function _gpfDefineGetClassSecuredConstructorContext (classDefinition) {
    return {
        gpf: gpf,
        _classDef_: classDefinition
    };
}

/**
 * Allocate a secured named constructor
 *
 * @param {_GpfClassDefinition} classDefinition Class definition
 * @return {Function} Secured named constructor
 * @gpf:closure
 * @since 0.1.6
 */
function _gpfDefineGetClassSecuredConstructor (classDefinition) {
    return _gpfFunctionBuild(_gpfDefineGetClassSecuredConstructorDefinition(classDefinition),
        _gpfDefineGetClassSecuredConstructorContext(classDefinition));
}

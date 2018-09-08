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
/*exported _gpfDefineClassConstructorAddCodeWrapper*/ // Adds a constructor code wrapper
/*exported _gpfDefineGetClassSecuredConstructor*/ // Allocate a secured named constructor
/*#endif*/

_gpfErrorDeclare("define/class/constructor", {

    /**
     * ### Summary
     *
     * This is a class constructor function, use with new
     *
     * ### Description
     *
     * Class constructors are not designed to be called without `new`
     *
     * @since 0.1.6
     */
    classConstructorFunction: "This is a class constructor function, use with new"

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


var _gpfDefineClassConstructorCodeWrappers = [];

/**
 * Adds a constructor code wrapper
 *
 * @param {Function} codeWrapper Function receiving class definition and current code
 * @since 0.2.8
 */
function _gpfDefineClassConstructorAddCodeWrapper (codeWrapper) {
    _gpfDefineClassConstructorCodeWrappers.push(codeWrapper);
}

function _gpfDefineGetClassSecuredConstructorBody (classDefinition) {
    return "if (!(this instanceof _classDef_._instanceBuilder)) gpf.Error.classConstructorFunction();\n"
        + _gpfDefineClassConstructorCodeWrappers.reduce(function (body, codeWrapper) {
            return codeWrapper(classDefinition, body);
        }, "_classDef_._resolvedConstructor.apply(this, arguments);");
}

function _gpfDefineGetClassSecuredConstructorDefinition (classDefinition) {
    return {
        name: classDefinition._name,
        parameters: _gpfFunctionDescribe(classDefinition._resolvedConstructor).parameters,
        body: _gpfDefineGetClassSecuredConstructorBody(classDefinition)
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

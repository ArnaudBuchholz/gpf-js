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
/*global _gpfDefineClassAbstractGetInConstructorCheck*/ // Abstract class instantiation check
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
    classConstructorFunction: "This is a class constructor function, use with new",

    /**
     * ### Summary
     *
     * Abstract Class
     *
     * ### Description
     *
     * An abstract class can not be instantiated
     * @since 0.2.7
     */
    abstractClass: "Abstract Class"
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


function _gpfDefineGetClassSecuredConstructorBody (classDefinition) {
    return [
        "if (!(this instanceof _classDef_._instanceBuilder)) gpf.Error.classConstructorFunction();",
        _gpfDefineClassAbstractGetInConstructorCheck(classDefinition),
        "_classDef_._resolvedConstructor.apply(this, arguments);"
    ].join("\n");
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

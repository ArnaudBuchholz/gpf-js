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
/*exported _gpfDefineGetClassSecuredConstructor*/ // Allocate a secured named constructor
/*#endif*/

_gpfErrorDeclare("define/class/constructor", {
    "classConstructorFunction":
        "This is a class constructor function, use with new"
});


Object.assign(_GpfClassDefinition.prototype, /** @lends _GpfClassDefinition.prototype */ {

    /**
     * Resolved constructor
     *
     * @type {Function}
     * @since 0.1.6
     */
    _resolvedConstructor: _gpfEmptyFunc

});

/**
 * Allocate a secured named constructor
 *
 * @param {_GpfClassDefinition} classDefinition Entity definition
 * @return {Function} Secured named constructor
 * @gpf:closure
 * @since 0.1.6
 */
function _gpfDefineGetClassSecuredConstructor (classDefinition) {
    return _gpfFunctionBuild({
        name: classDefinition._name,
        body: "if (!(this instanceof a._instanceBuilder)) $.Error.classConstructorFunction();\n"
            + "a._resolvedConstructor.apply(this, arguments);"
    }, {
        $: gpf,
        a: classDefinition
    });
}

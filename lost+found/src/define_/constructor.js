/**
 * @file Class constructor (OLD VERSION)
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfFunctionBuilder*/ // Function builder
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*exported _getOldNewClassConstructor*/ // Allocate a named class constructor
/*#endif*/

_gpfErrorDeclare("define/constructor", {
    "constructorFunctionOLD":
        "This is a constructor function, use with new"
});

/**
 * Template for new class constructor
 * - Function can't be used without new
 * - Uses closure to keep track of the class definition
 * - Class name will be injected at the right place
 *
 * @param {_GpfOldClassDefinition} classDef
 * @return {Function}
 * @gpf:closure
 */
function _gpfNewClassConstructorTpl (classDef) {
    return function () {
        var me = this; //eslint-disable-line no-invalid-this
        if (!(me instanceof classDef._Constructor)) {
            gpf.Error.constructorFunctionOLD();
        }
        classDef._resolvedConstructor.apply(me, arguments);
    };
}

/**
 * Allocate a named class constructor for a class definition
 *
 * @param {_GpfOldClassDefinition} classDef Class definition
 * @returns {Function} Constructor
 */
// Build a new constructor
function _getOldNewClassConstructor (classDef) {
    var builder = new _GpfFunctionBuilder(_gpfNewClassConstructorTpl),
        constructorName = classDef.getName().split(".").pop();
    builder.replaceInBody({
        "function": "function " + constructorName
    });
    return builder.generate()(classDef);
}

/*#endif*/

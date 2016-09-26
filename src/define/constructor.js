/**
 * @file Class constructor
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfFunctionBuilder*/ // Function builder
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*exported _getNewClassConstructor*/ // Allocate a named class constructor
/*#endif*/

_gpfErrorDeclare("define/constructor", {
    "constructorFunction":
        "This is a constructor function, use with new"
});

/**
 * Template for new class constructor
 * - Function can't be used without new
 * - Uses closure to keep track of the class definition
 * - Class name will be injected at the right place
 *
 * @param {_GpfClassDefinition} classDef
 * @return {Function}
 * @closure
 */
function _gpfNewClassConstructorTpl (classDef) {
    return function () {
        var me = this; //eslint-disable-line no-invalid-this
        if (!(me instanceof classDef._Constructor)) {
            throw gpf.Error.constructorFunction();
        }
        classDef._resolvedConstructor.apply(me, arguments);
    };
}

/**
 * Allocate a named class constructor for a class definition
 *
 * @param {_GpfClassDefinition} classDef Class definition
 * @returns {Function} Constructor
 */
// Build a new constructor
function _getNewClassConstructor (classDef) {
    var builder = new _GpfFunctionBuilder(_gpfNewClassConstructorTpl),
        constructorName = classDef.getName().split(".").pop();
    builder.replaceInBody({
        "function": "function " + constructorName
    });
    return builder.generate()(classDef);
}

/*#endif*/

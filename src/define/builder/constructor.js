/**
 * @file Generic and secured class constructor
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfFunctionBuilder*/ // Function builder
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*exported _getNewClassConstructor*/ // Allocate a named class constructor
/*#endif*/

_gpfErrorDeclare("define/builder/constructor", {
    "constructorFunction":
        "This is a constructor function, use with new"
});

/**
 * Template for new class constructor
 * - Function can't be used without new
 * - Uses closure to keep track of the class definition
 * - Class name will be injected at the right place
 *
 * @param {Function} innerConstructor Constructor as defined by the class
 * @return {Function} Constructor
 * @gpf:closure
 */
function _gpfNewClassConstructorTpl (innerConstructor) {
    var constructor = function () {
        var me = this; //eslint-disable-line no-invalid-this
        if (!(me instanceof constructor)) {
            throw gpf.Error.constructorFunction();
        }
        innerConstructor.apply(me, arguments);
    };
    return constructor;
}

/**
 * Allocate a named class constructor for a class definition
 *
 * @param {_GpfOldClassDefinition} classDef Class definition
 * @param {Function} innerConstructor Constructor as defined by the class
 * @return {Function} Constructor
 */
// Build a new constructor
function _getNewClassConstructor (classDef, innerConstructor) {
    var builder = new _GpfFunctionBuilder(_gpfNewClassConstructorTpl);
    builder.replaceInBody({
        "function": "function " + classDef.getName()
    });
    return builder.generate()(innerConstructor);
}

/*#endif*/

/**
 * @file Class constructor
 * @since 0.1.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfExtend*/ // gpf.extend
/*global _gpfFunctionBuild*/ // Build function from description and context
/*global _gpfFunctionDescribe*/ // Extract function description
/*exported _gpfDefineGetClassSecuredConstructor*/ // Allocate a secured named constructor
/*#endif*/

_gpfErrorDeclare("define/class/constructor", {
    "classConstructorFunction":
        "This is a class constructor function, use with new"
});


_gpfExtend(_GpfClassDefinition.prototype, /** @lends _GpfClassDefinition.prototype */ {

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

    function template () {
        /*jshint validthis:true*/ // constructor
        /*eslint-disable no-invalid-this*/
        if (!(this instanceof classDefinition._instanceBuilder)) {
            gpf.Error.classConstructorFunction();
        }
        classDefinition._resolvedConstructor.apply(this, arguments);
        /*eslint-enable no-invalid-this*/
    }

    var templateDef = _gpfFunctionDescribe(template);
    templateDef.name = classDefinition._name;
    return _gpfFunctionBuild(templateDef, {
        gpf: gpf,
        classDefinition: classDefinition
    });
}

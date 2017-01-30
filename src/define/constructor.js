/**
 * @file Default constructor
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _GpfEntityDefinition*/ // Entity definition
/*global _gpfFunctionBuild*/ // Build function from description and context
/*global _gpfFunctionDescribe*/ // Extract function description
/*global _gpfExtend*/ // gpf.extend
/*exported _gpfDefineGetSecuredNamedConstructor*/ // Allocate a secured named constructor
/*#endif*/

_gpfErrorDeclare("define/constructor", {
    "constructorFunction":
        "This is a constructor function, use with new"
});


_gpfExtend(_GpfEntityDefinition.prototype, /** @lends _GpfEntityDefinition.prototype */ {

    /**
     * Instance initializer function (a.k.a. private constructor)
     *
     * @type {Function}
     */
    _instanceInitializer: _gpfEmptyFunc

});

/**
 * Allocate a secured named constructor
 *
 * @param {_GpfEntityDefinition} entityDefinition Entity definition
 * @return {Function} Secured named constructor
 * @gpf:closure
 */
function _gpfDefineGetSecuredNamedConstructor (entityDefinition) {

    function template () {
        /*jshint validthis:true*/ // constructor
        /*eslint-disable no-invalid-this*/
        if (!(this instanceof entityDefinition._instanceBuilder)) {
            gpf.Error.constructorFunction();
        }
        entityDefinition._instanceInitializer.apply(this, arguments);
        /*eslint-enable no-invalid-this*/
    }

    var templateDef = _gpfFunctionDescribe(template);
    templateDef.name = entityDefinition._name;
    return _gpfFunctionBuild(templateDef, {
        gpf: gpf,
        entityDefinition: entityDefinition
    });
}

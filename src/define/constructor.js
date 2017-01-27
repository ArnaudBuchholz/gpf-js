/**
 * @file Default constructor
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _GpfEntityDefinition*/ // Entity definition
/*global _gpfFunctionBuild*/ // Build function from description and context
/*global _gpfFunctionDescribe*/ // Extract function description
/*exported _gpfDefineGetSecuredNamedConstructor*/ // Allocate a secured named constructor
/*#endif*/

_gpfErrorDeclare("define/constructor", {
    "constructorFunction":
        "This is a constructor function, use with new"
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
        if (!(this instanceof entityDefinition._Constructor)) {
            gpf.Error.constructorFunction();
        }
        entityDefinition._resolvedConstructor.apply(this, arguments);
        /*eslint-enable no-invalid-this*/
    }

    var templateDef = _gpfFunctionDescribe(template);
    templateDef.name = entityDefinition._name;
    return _gpfFunctionBuild(templateDef, {
        gpf: gpf,
        entityDefinition: entityDefinition
    });
}

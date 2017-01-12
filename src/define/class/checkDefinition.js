/**
 * @file Checking class dictionary
 */
/*#ifndef(UMD)*/
/*exported _gpfDefineCheckClassDefinition*/ // Check the dictionary passed to gpf.define
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
"use strict";
/*#endif*/

_gpfErrorDeclare("define/class/checkDefinition", {
    /**
     * ### Summary
     *
     * The class name is invalid
     *
     * ### Description
     *
     * Only a valid JavaScript identifier (starting with an uppercase letter or _) is allowed
     */
    invalidClassName: "Invalid class name",

    /**
     * ### Summary
     *
     * The class definition contains an invalid keyword
     *
     * ### Description
     *
     * Some keywords are reserved
     */
    invalidClassProperty: "Invalid property in class definition"

});

function _gpfDefineCheckClassDefinitionFor$Propos (definition) {
    var properties = Object.keys(definition);
    if (properties.filter(function (name) {
        return name.charAt(0) === "$" && -1 === ["$class", "$extend"].indexOf(name);

    }).length) {
        gpf.Error.invalidClassProperty();
    }
}

function _gpfDefineCheckClassDefinitionForVisibility (definition) {
    if ("super,public,private,protected,static,mixin".split(",").some(function (key) {
        return undefined !== definition[key];
    })) {
        gpf.Error.invalidClassProperty();
    }
}

/**
 * Check the class definition
 *
 * @param {Object} definition Class definition
 * @throws {gpf.Error.InvalidClassProperty}
 */
function _gpfDefineCheckClassDefinition (definition) {
    _gpfDefineCheckClassDefinitionFor$Propos(definition);
    _gpfDefineCheckClassDefinitionForVisibility(definition);
}


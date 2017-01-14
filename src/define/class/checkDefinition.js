/**
 * @file Checking class dictionary
 */
/*#ifndef(UMD)*/
/*global _gpfDefineAllowedCommon$Keys*/ // Common list of allowed $ keys
/*global _gpfDefineTypedCheckers*/ // Dictionary of typed definition checker
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
     * Only a valid JavaScript identifier (starting with an uppercase letter, $ or _) is allowed
     */
    invalidClassName: "Invalid class name",

    /**
     * ### Summary
     *
     * The class definition contains an property
     *
     * ### Description
     *
     * Some keywords are reserved
     */
    invalidClassProperty: "Invalid class property"

});

var _gpfClassNameValidationRegExp = /^[A-Z_$][a-zA-Z0-9]+$/;

function _gpfDefineCheckClassDefinitionName (name) {
    _gpfClassNameValidationRegExp.lastIndex = 0;
    if (!_gpfClassNameValidationRegExp.exec(name)) {
        gpf.Error.invalidClassName();
    }
}

function _gpfDefineCheckClassDefinitionFor$Keys (definition) {
    var properties = Object.keys(definition);
    if (properties.filter(function (name) {
        return name.charAt(0) === "$" && -1 === ["$class", "$extend"].indexOf(name);

    }).length) {
        gpf.Error.invalidClassProperty();
    }
}

function _gpfDefineCheckClassDefinitionForFordbiddenKeywords (definition) {
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
_gpfDefineTypedCheckers["class"] = function (definition) {
    _gpfDefineCheckClassDefinitionName(definition.$name);
    _gpfDefineCheckClassDefinitionFor$Keys(definition);
    _gpfDefineCheckClassDefinitionForFordbiddenKeywords(definition);
};

/**
 * @file Checking class dictionary
 * @since 0.1.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefineAllowedCommon$Keys*/ // Common list of allowed $ keys
/*global _gpfDefineGenerate$Keys*/ // Generate an array of names prefixed with $ from a comma separated list
/*global _gpfDefineTypedCheckers*/ // Dictionary of typed definition checker
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
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
     * @since 0.1.6
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
     * @since 0.1.6
     */
    invalidClassProperty: "Invalid class property"

});

var _gpfClassNameValidationRegExp = /^[A-Z_$][a-zA-Z0-9]*$/;

function _gpfDefineCheckClassDefinitionName (name) {
    _gpfClassNameValidationRegExp.lastIndex = 0;
    if (!_gpfClassNameValidationRegExp.exec(name)) {
        gpf.Error.invalidClassName();
    }
}

var _gpfDefineClassAllowed$Kes = _gpfDefineAllowedCommon$Keys.concat(_gpfDefineGenerate$Keys("extend"));

function _gpfDefineCheckClassDefinitionFor$Keys (definition) {
    var properties = Object.keys(definition);
    if (properties.filter(function (name) {
        return "$" === name.charAt(0) && -1 === _gpfDefineClassAllowed$Kes.indexOf(name);
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
 * @since 0.1.6
 */
_gpfDefineTypedCheckers["class"] = function (definition) {
    _gpfDefineCheckClassDefinitionName(definition.$name);
    _gpfDefineCheckClassDefinitionFor$Keys(definition);
    _gpfDefineCheckClassDefinitionForFordbiddenKeywords(definition);
};

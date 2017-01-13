/**
 * @file Check define dictionary
 */
/*#ifndef(UMD)*/
/*exported _gpfDefineAllowedCommon$Keys*/ // Common list of allowed $ keys
/*exported _gpfDefineCheckDefinition*/ // Check the dictionary passed to gpf.define
/*exported _gpfDefineTypedCheckers*/ // Dictionary of typed definition checker
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
"use strict";
/*#endif*/

_gpfErrorDeclare("define/checkDefinition", {
    /**
     * ### Summary
     *
     * Entity type is invalid in the definition passed to {@link gpf.define}
     *
     * ### Description
     *
     * This error is thrown when the entity type is either missing or invalid
     */
    invalidEntityType: "Invalid entity type",

    /**
     * ### Summary
     *
     * Entity namespace is invalid in the definition passed to {@link gpf.define}
     *
     * ### Description
     *
     * This error is thrown when the namespace is invalid
     */
    invalidEntityNamespace: "Invalid entity namespace"
});

/**
 * Common list of allowed $ keys
 *
 * @type {String[]}
 */
var _gpfDefineAllowedCommon$Keys = "type,name,namespace".split(",").map(function (name) {
    return "$" + name;
});

//region Key transformations

/**
 * Dictionary of key transformations:
 * - $class => $type="class", $name=value (overwrite)
 * - $name => $name if none specified
 */
var _gpfDefineKeyTransformations = {

    "$class": function (value, definition, transformed) {
        transformed.$type = "class";
        transformed.$name = value; // Overwrite even if existing
    },

    "$name": function (value, definition, transformed) {
        if (!transformed.$name) { // Ignore if existing
            transformed.$name = value;
        }
    }

};

/**
 * Apply key transformations
 *
 * @param {Object} definition Entity definition given to gpf.define
 * @return {Object} Definition (not the same object) where key transformation were applied
 * @see _gpfDefineKeyTransformations
 */
function _gpfDefineApplyKeyTransformations (definition) {
    var transformed = {};
    Object.keys(definition).forEach(function (key) {
        var transform = _gpfDefineKeyTransformations[key],
            value = definition[key];
        if (transform) {
            transform(value, definition, transformed);
        } else {
            transformed[key] = value;
        }
    });
    return transformed;
}

function _gpfDefineConvertNamespacedName (transformed, name) {
    var relNamespace = name.split("."),
        namespace;
    transformed.$name = relNamespace.pop();
    namespace = transformed.$namespace;
    if (namespace) {
        relNamespace.unshift(namespace);
    }
    transformed.$namespace = relNamespace.join(".");
}

var _gpfNamespaceValidationRegExp = /^[a-z_$][a-zA-Z0-9]+(:?\.[a-z_$][a-zA-Z0-9]+)*$/;

function _gpfDefineCheckNamespace (transformed) {
    var namespace = transformed.$namespace;
    _gpfNamespaceValidationRegExp.lastIndex = 0;
    if (namespace && !_gpfNamespaceValidationRegExp.exec(namespace)) {
        gpf.Error.invalidEntityNamespace();
    }
}

/**
 * If $name looks like a namespace (contains .), append to or define in $namespace
 * @param {Object} transformed Transformed definition where key transformation were applied
 */
function _gpfDefineProcessNameAndNamespace (transformed) {
    var name = transformed.$name || "";
    if (name.indexOf(".") > -1) {
        _gpfDefineConvertNamespacedName(transformed, name);
    }
    _gpfDefineCheckNamespace(transformed);
}

/**
 * Transform the definition object so that shortcuts are resolved:
 * - $class="a.b.C": => $type="class", $name="C" and $namespace="a.b"
 *   (note that the $name namespace might be relative to the initial $namespace)
 *
 * @param {Object} definition Entity definition given to gpf.define
 * @return {Object} Transformed entity definition
 */
function _gpfDefineTransformDefinition (definition) {
    var transformed = _gpfDefineApplyKeyTransformations(definition);
    _gpfDefineProcessNameAndNamespace(transformed);
    return transformed;
}

//endregion

/** Dictionary of typed definition checker */
var _gpfDefineTypedCheckers = {};

/**
 * Check the dictionary passed to gpf.define
 *
 * @param {Object} definition Entity definition
 * @return {Object} Checked entity definition
 * @throws {gpf.Error.InvalidEntityType}
 */
function _gpfDefineCheckDefinition (definition) {
    var transformed = _gpfDefineTransformDefinition(definition),
        typedChecker = _gpfDefineTypedCheckers[transformed.$type];
    if (undefined === typedChecker) {
        gpf.Error.invalidEntityType();
    }
    typedChecker(transformed);
    return transformed;
}

/*#ifndef(UMD)*/

gpf.internals._gpfDefineTransformDefinition = _gpfDefineTransformDefinition;

/*#endif*/

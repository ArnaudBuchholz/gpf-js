/**
 * @file Checking define dictionary
 */
/*#ifndef(UMD)*/
/*exported _gpfDefineCheckDefinition*/ // Check the dictionary passed to gpf.define
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfDefineCheckClassDefinition*/ // Check the class definition
"use strict";
/*#endif*/

_gpfErrorDeclare("define/checkDefinition", {
    /**
     * ### Summary
     *
     * Entity type is missing in the definition passed to {@link gpf.define}
     *
     * ### Description
     *
     * This error is thrown when the entity type is not specified
     */
    missingEntityType: "Entity type not specified"

});

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

/**
 * If $name looks like a namespace (contains .), append to or define in $namespace
 * @param {Object} transformed Transformed definition where key transformation were applied
 */
function _gpfDefineProcessNameAndNamespace (transformed) {
    var name = transformed.$name,
        relNamespace,
        namespace;
    if (name && name.indexOf(".") > -1) {
        relNamespace = name.split(".");
        transformed.$name = relNamespace.pop();
        namespace = transformed.$namespace;
        if (namespace) {
            relNamespace.unshift(namespace);
        }
        transformed.$namespace = relNamespace.join(".");
    }
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

/**
 * Check the dictionary passed to gpf.define
 *
 * @param {Object} definition Entity definition
 * @return {Object} Checked entity definition, it contains a method generate that returns the constructor function
 * @throws {gpf.Error.MissingEntityType}
 */
function _gpfDefineCheckDefinition (definition) {
    var transformed = _gpfDefineTransformDefinition(definition);
    if (transformed.type !== "class") {
        gpf.Error.missingEntityType();
    }
    return _gpfDefineCheckClassDefinition(transformed);
}

/*#ifndef(UMD)*/

gpf.internals._gpfDefineTransformDefinition = _gpfDefineTransformDefinition;

/*#endif*/

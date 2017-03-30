/**
 * @file Sorting helper
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfFunc*/ // Create a new function using the source
/*#endif*/

//region test

/**
 * @typedef gpf.typedef.sortItem
 * @property {String} property Name of the property to sort by
 * @property {String} [type="number"] Property type, only allowed values are "number" and "string"
 * @property {Boolean} [ascending=true] Descending if false
 */

function _gpfCreateSortVariables (specifications, body) {
    body.push("var ");
    specifications.forEach(function (specification, index) {
        if (0 !== index) {
            body.push(",\n    ");
        }
        body.push("a", index, " = a.", specification.property, ",\n    b", index, " = b.", specification.property);
    });
    body.push(";\n");
}

function _gpfCreateSortComparison (type, left, right) {
    if (!type || "number" === type) {
        return left + " - " + right + ";";
    }// else if ("string" === specification.type) {
    return left + ".localeCompare(" + right + ");";
}

function _gpfCreateSortCondition (body, specification, index) {
    var left,
        right;
    if (specification.ascending === false) {
        left = "b" + index;
        right = "a" + index;
    } else {
        left = "a" + index;
        right = "b" + index;
    }
    body.push("if (", left, " !== ", right, ") {\n    return ",
        _gpfCreateSortComparison(specification.type, left, right), "\n}\n");
}

function _gpfCreateSortBody (specifications) {
    var body = [];
    _gpfCreateSortVariables(specifications, body);
    specifications.forEach(_gpfCreateSortCondition.bind(null, body));
    body.push("return 0;");
    return body;
}
/**
 * Create a sorting function based on the given specification
 *
 * @param {gpf.typedef.sortItem[]} specifications Sort specification
 * @return {Function} Function that can compare two objects
 */
function _gpfCreateSortFunction (specifications) {
    return _gpfFunc(["a", "b"], _gpfCreateSortBody(specifications).join(""));
}

/**
 * Create a sorting function based on the given specification
 *
 * @param {gpf.typedef.sortItem|gpf.typedef.sortItem[]} specifications Sort specification
 * @return {Function} Function that can compare two objects
 */
gpf.createSortFunction = function (specifications) {
    if (!Array.isArray(specifications)) {
        specifications = [specifications];
    }
    return _gpfCreateSortFunction(specifications);
};

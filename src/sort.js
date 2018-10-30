/**
 * @file Sorting helper
 * @since 0.1.9
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfIsArray*/ // Return true if the parameter is an array
/*#endif*/

//region test

/**
 * Property sorting specification
 *
 * @typedef gpf.typedef.sortItem
 * @property {String} property Name of the property to sort by
 * @property {String} [type="number"] Property type, only allowed values are "number" and "string"
 * @property {Boolean} [ascending=true] Descending if false
 * @since 0.1.9
 */

function _gpfCreateSortVariables (specifications) {
    return "var " + specifications.map(function (specification, index) {
        return "a" + index + "=a." + specification.property + ",b" + index + "=b." + specification.property;
    }).join(",") + ";";
}

function _gpfCreateSortComparison (type, left, right) {
    if ("string" === type) {
        return left + ".localeCompare(" + right + ")";
    }
    // default is number
    return left + "-" + right;
}

function _gpfCreateSortCondition (specification, index) {
    var left,
        right;
    if (specification.ascending === false) {
        left = "b" + index;
        right = "a" + index;
    } else {
        left = "a" + index;
        right = "b" + index;
    }
    return "if(" + left + "!==" + right + ")return " + _gpfCreateSortComparison(specification.type, left, right) + ";";
}

function _gpfCreateSortBody (specifications) {
    return _gpfCreateSortVariables(specifications)
        + specifications.map(_gpfCreateSortCondition).join("")
        + "return 0;";
}

/**
 * Create a sorting function based on the given specification
 *
 * @param {gpf.typedef.sortItem[]} specifications Sort specification
 * @return {Function} Function that can compare two objects
 * @since 0.1.9
 */
function _gpfCreateSortFunction (specifications) {
    return _gpfFunc(["a", "b"], _gpfCreateSortBody(specifications));
}

/**
 * Create a sorting function based on the given specification
 *
 * @param {gpf.typedef.sortItem|gpf.typedef.sortItem[]} specifications Sort specification
 * @return {Function} Function that can compare two objects
 * @since 0.1.9
 */
gpf.createSortFunction = function (specifications) {
    var arrayOfSpecifications;
    if (_gpfIsArray(specifications)) {
        arrayOfSpecifications = specifications;
    } else {
        arrayOfSpecifications = [specifications];
    }
    return _gpfCreateSortFunction(arrayOfSpecifications);
};

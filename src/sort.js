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
    body.push("var ", specifications.map(function (specification, index) {
        return "a" + index + "=a." + specification.property + ",b" + index + "=b." + specification.property;
    }).join(","), ";");
}

function _gpfCreateSortComparison (type, left, right) {
    if ("string" === type) {
        return left + ".localeCompare(" + right + ")";
    }
    // default is number
    return left + "-" + right;
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
    body.push("if(", left, "!==", right, ")return ",
        _gpfCreateSortComparison(specification.type, left, right), ";");
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

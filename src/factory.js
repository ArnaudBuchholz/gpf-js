/**
 * @file Generic factory
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfFunc*/ // Create a new function using the source
/*exported _gpfNewApply*/ // Apply new operator with an array of parameters
/*#endif*/

function _gpfBuildFactoryParameterList (maxParameters) {
    return new Array(maxParameters).join(" ").split(" ").map(function (value, index) {
        return "p" + index;
    });
}

function _gpfGenerateGenericFactorySource (parameters) {
    var src = [
        "var C = this, l = arguments.length;",
        "if (0 === l) { return new C();}"
    ];
    parameters.forEach(function (value, index) {
        var count = index + 1;
        src.push("if (" + count + " === l) { return new C(" + parameters.slice(0, count).join(", ") + ");}");
    });
    return src.join("\r\n");
}

function _gpfGenerateGenericFactory (maxParameters) {
    var parameters = _gpfBuildFactoryParameterList(maxParameters);
    return _gpfFunc(parameters, _gpfGenerateGenericFactorySource(parameters));
}

/**
 * Create any class by passing the right number of parameters
 *
 * @this {Function} constructor to invoke
 * @since 0.1.5
 */
var _gpfGenericFactory = _gpfGenerateGenericFactory(10);

/**
 * Call a constructor with an array of parameters.
 *
 * It is impossible to mix [new](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new)
 * and [apply](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)
 * in the same call.
 *
 * This helper workarounds this problem.
 *
 * @param {Function} Constructor Class constructor
 * @param {Array} parameters Parameters to pass to the constructor
 * @return {Object} New object
 * @since 0.1.5
 */
function _gpfNewApply (Constructor, parameters) {
    if (parameters.length > _gpfGenericFactory.length) {
        _gpfGenericFactory = _gpfGenerateGenericFactory(parameters.length);
    }
    return _gpfGenericFactory.apply(Constructor, parameters);
}

/*#ifndef(UMD)*/

gpf.internals._gpfNewApply = _gpfNewApply;

/*#endif*/

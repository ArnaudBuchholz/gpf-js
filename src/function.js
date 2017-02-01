/**
 * @file Function builder
 * @since 0.1.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfJsCommentsRegExp*/ // Find all JavaScript comments
/*global _gpfStringTrim*/ // Trim the string
/*exported _gpfFunctionBuild*/ // Build function from description and context
/*exported _gpfFunctionDescribe*/ // Extract function description
/*#endif*/

/**
 * @typedef {Object} gpf.typedef.functionDescription
 * @property {String} [name] Function name
 * @property {String[]} [parameters] Function parameters
 * @property {String} [body] Function body
 * @since 0.1.6
 */

function _gpfFunctionDescribeName (functionToDescribe, resultDescription) {
    var name = functionToDescribe.compatibleName();
    if (name) {
        resultDescription.name = name;
    }
}

function _gpfFunctionDescribeParameters (functionToDescribe, functionSource, resultDescription) {
    if (functionToDescribe.length) {
        resultDescription.parameters = new RegExp("\\(\\s*(\\w+(?:\\s*,\\s*\\w+)*)\\s*\\)").exec(functionSource)[1]
            .split(",")
            .map(_gpfStringTrim);
    }
}

function _gpfFunctionDescribeBody (functionSource, resultDescription) {
    var body = _gpfStringTrim(new RegExp("{((?:.*\\n)*.*)}").exec(functionSource)[1]);
    if (body) {
        resultDescription.body = body;
    }
}

function _gpfFunctionDescribeSource (functionToDescribe, resultDescription) {
    var source = _gpfEmptyFunc.toString.call(functionToDescribe).replace(_gpfJsCommentsRegExp, "");
    _gpfFunctionDescribeParameters(functionToDescribe, source, resultDescription);
    _gpfFunctionDescribeBody(source, resultDescription);
}

/**
 * Extract function description
 *
 * @param {Function} functionToDescribe Function to describe
 * @return {gpf.typedef.functionDescription} Function description
 * @since 0.1.6
 */
function _gpfFunctionDescribe (functionToDescribe) {
    var result = {};
    _gpfFunctionDescribeName(functionToDescribe, result);
    _gpfFunctionDescribeSource(functionToDescribe, result);
    return result;
}

function _gpfFunctionBuildSourceName (functionDescription) {
    if (functionDescription.name) {
        return " " + functionDescription.name;
    }
    return "";
}

function _gpfFunctionBuildSourceParameters (functionDescription) {
    if (functionDescription.parameters) {
        return functionDescription.parameters.join(", ");
    }
    return "";
}

function _gpfFunctionBuildSourceBody (functionDescription) {
    if (functionDescription.body) {
        return functionDescription.body.toString();
    }
    return "";
}

/**
 * Build function source from description
 *
 * @param {gpf.typedef.functionDescription} functionDescription Function description
 * @return {String} Function source
 * @since 0.1.6
 */
function _gpfFunctionBuildSource (functionDescription) {
    return "function"
        + _gpfFunctionBuildSourceName(functionDescription)
        + "("
        + _gpfFunctionBuildSourceParameters(functionDescription)
        + ") {\n"
        + "\t\"use strict\"\n"
        + _gpfFunctionBuildSourceBody(functionDescription)
        + "\n}";
}

function _gpfFunctionBuildWithContext (functionDescription, context) {
    var parameterNames = Object.keys(context),
        parameterValues = parameterNames.map(function (name) {
            return context[name];
        });
    return _gpfFunc(parameterNames, "return " + functionDescription).apply(null, parameterValues);
}

function _gpfFunctionBuildContextless (functionDescription) {
    return _gpfFunc("return " + functionDescription)();
}

/**
 * Build function from description and context
 *
 * @param {gpf.typedef.functionDescription} functionDescription Function description
 * @param {Object} [context] Function context
 * @return {Function} Function
 * @since 0.1.6
 */
function _gpfFunctionBuild (functionDescription, context) {
    var functionSource = _gpfFunctionBuildSource(functionDescription);
    if (context) {
        return _gpfFunctionBuildWithContext(functionSource, context);
    }
    return _gpfFunctionBuildContextless(functionSource);
}

/*#ifndef(UMD)*/

gpf.internals._gpfFunctionDescribe = _gpfFunctionDescribe;
gpf.internals._gpfFunctionBuild = _gpfFunctionBuild;

/*#endif*/

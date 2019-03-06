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
/*exported _gpfGetFunctionName*/ // Get the function name
/*#endif*/

//region Function name

var _GPF_FUNCTION_KEYWORD = "function";

function _gpfExtractFunctionName (func) {
    // Use simple parsing
    var functionSource = _gpfEmptyFunc.toString.call(func),
        functionKeywordPos = functionSource.indexOf(_GPF_FUNCTION_KEYWORD) + _GPF_FUNCTION_KEYWORD.length,
        parameterListStartPos = functionSource.indexOf("(", functionKeywordPos);
    return functionSource
        .substring(functionKeywordPos, parameterListStartPos)
        .replace(_gpfJsCommentsRegExp, "") // remove comments
        .trim();
}

/**
 * Get the function name
 *
 * @param {Function} func Function
 * @return {String} Function name
 * @since 0.2.9
 */
var _gpfGetFunctionName;

// Handling function name properly
if ((function () {
    // Trick source minification
    var testFunction = _gpfFunc("return function functionName () {};")();
    return testFunction.name !== "functionName";
})()) {

    _gpfGetFunctionName = _gpfExtractFunctionName;

} else {

    _gpfGetFunctionName = function (func) {
        return func.name;
    };

}

//endregion

/**
 * @typedef {Object} gpf.typedef._functionDescription
 * @property {String} [name] Function name
 * @property {String[]} [parameters] Function parameters
 * @property {String} [body] Function body
 * @since 0.1.6
 */

function _gpfFunctionDescribeName (functionToDescribe, resultDescription) {
    var name = _gpfGetFunctionName(functionToDescribe);
    if (name) {
        resultDescription.name = name;
    }
}

function _gpfFunctionDescribeParameters (functionToDescribe, functionSource, resultDescription) {
    if (functionToDescribe.length) {
        var match = new RegExp("\\(\\s*(\\w+(?:\\s*,\\s*\\w+)*)\\s*\\)").exec(functionSource),
            PARAMETERS = 1;
        resultDescription.parameters = match[PARAMETERS]
            .split(",")
            .map(_gpfStringTrim);
    }
}

function _gpfFunctionDescribeBody (functionSource, resultDescription) {
    var match = new RegExp("{((?:.*\\r?\\n)*.*)}").exec(functionSource),
        BODY = 1,
        body = _gpfStringTrim(match[BODY]);
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
 * @return {gpf.typedef._functionDescription} Function description
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
 * @param {gpf.typedef._functionDescription} functionDescription Function description
 * @return {String} Function source
 * @since 0.1.6
 */
function _gpfFunctionBuildSource (functionDescription) {
    return "function"
		+ _gpfFunctionBuildSourceName(functionDescription)
		+ "("
		+ _gpfFunctionBuildSourceParameters(functionDescription)
		+ ") {\n\t\"use strict\"\n"
		+ _gpfFunctionBuildSourceBody(functionDescription)
		+ "\n}";
}

function _gpfFunctionBuildWithContext (functionSource, context) {
    var parameterNames = Object.keys(context),
        parameterValues = parameterNames.map(function (name) {
            return context[name];
        });
    return _gpfFunc(parameterNames, "return " + functionSource).apply(null, parameterValues);
}

/**
 * Build function from description and context
 *
 * @param {gpf.typedef._functionDescription} functionDescription Function description
 * @param {Object} [context] Function context
 * @return {Function} Function
 * @since 0.1.6
 */
function _gpfFunctionBuild (functionDescription, context) {
    return _gpfFunctionBuildWithContext(_gpfFunctionBuildSource(functionDescription), context || {});
}

/*#ifndef(UMD)*/

gpf.internals._gpfFunctionDescribe = _gpfFunctionDescribe;
gpf.internals._gpfFunctionBuild = _gpfFunctionBuild;
gpf.internals._gpfExtractFunctionName = _gpfExtractFunctionName;

/*#endif*/

/**
 * @file Function methods polyfill
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfBuildFunctionParameterList*/ // Builds an array of parameters
/*global _gpfCompatibilityInstallMethods*/ // Define and install compatible methods on standard objects
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfJsCommentsRegExp*/ // Find all JavaScript comments
/*#endif*/

var _gpfArrayPrototypeSlice = Array.prototype.slice;

function _generateBindBuilderSource (length) {
    return "var me = this;\n"
        + "return function (" + _gpfBuildFunctionParameterList(length).join(", ") + ") {\n"
        + "   var args = _gpfArrayPrototypeSlice.call(arguments, 0);\n"
        + "    return me.apply(thisArg, prependArgs.concat(args));\n"
        + "};";
}

_gpfCompatibilityInstallMethods("Function", {
    on: Function,

    methods: {

        // Introduced with JavaScript 1.8.5
        bind: function (thisArg) {
            var me = this,
                prependArgs = _gpfArrayPrototypeSlice.call(arguments, 1),
                builderSource = _generateBindBuilderSource(Math.max(this.length - prependArgs.length, 0));
            return _gpfFunc(["thisArg", "prependArgs", "_gpfArrayPrototypeSlice"], builderSource)
                .call(me, thisArg, prependArgs, _gpfArrayPrototypeSlice);
        }

    }

});

//region Function name

var _GPF_COMPATIBILITY_FUNCTION_KEYWORD = "function";

function _gpfGetFunctionName () {
    // Use simple parsing
    /*jshint validthis:true*/
    var functionSource = _gpfEmptyFunc.toString.call(this), //eslint-disable-line no-invalid-this
        functionKeywordPos = functionSource.indexOf(_GPF_COMPATIBILITY_FUNCTION_KEYWORD)
            + _GPF_COMPATIBILITY_FUNCTION_KEYWORD.length,
        parameterListStartPos = functionSource.indexOf("(", functionKeywordPos);
    return functionSource
        .substr(functionKeywordPos, parameterListStartPos - functionKeywordPos)
        .replace(_gpfJsCommentsRegExp, "") // remove comments
        .trim();
}

// Handling function name properly
if ((function () {
    // Trick source minification
    var testFunction = _gpfFunc("return function functionName () {};")();
    return testFunction.name !== "functionName";
})()) {

    Function.prototype.compatibleName = _gpfGetFunctionName;

} else {

    /**
     * Return function name
     *
     * @return {String} Function name
     * @since 0.1.5
     */
    Function.prototype.compatibleName = function () {
        return this.name;
    };

}

//endregion

/*#ifndef(UMD)*/

gpf.internals._gpfGetFunctionName = _gpfGetFunctionName;

/*#endif*/

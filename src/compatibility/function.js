/**
 * @file Function methods polyfill
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfArraySlice*/ // [].slice.call
/*global _gpfArrayTail*/ // [].slice.call(,1)
/*global _gpfBuildFunctionParameterList*/ // Builds an array of parameters
/*global _gpfCompatibilityInstallMethods*/ // Define and install compatible methods on standard objects
/*global _gpfFunc*/ // Create a new function using the source
/*#endif*/

function _generateBindBuilderSource (length) {
    return "var me = this;\n"
        + "return function (" + _gpfBuildFunctionParameterList(length).join(", ") + ") {\n"
        + "    var args = _gpfArraySlice(arguments);\n"
        + "    return me.apply(thisArg, prependArgs.concat(args));\n"
        + "};";
}

var _GPF_COMPATIBILITY_FUNCTION_MIN_LENGTH = 0;

_gpfCompatibilityInstallMethods("Function", {
    on: Function,

    methods: {

        // Introduced with JavaScript 1.8.5
        bind: function (thisArg) {
            var me = this,
                prependArgs = _gpfArrayTail(arguments),
                length = Math.max(this.length - prependArgs.length, _GPF_COMPATIBILITY_FUNCTION_MIN_LENGTH),
                builderSource = _generateBindBuilderSource(length);
            return _gpfFunc(["thisArg", "prependArgs", "_gpfArraySlice"], builderSource)
                .call(me, thisArg, prependArgs, _gpfArraySlice);
        }

    }

});

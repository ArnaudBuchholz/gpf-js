/**
 * @file Function builder
 * @since 0.1.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfAssert*/ // Assertion method
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfJsCommentsRegExp*/ // Find all JavaScript comments
/*global _gpfStringReplaceEx*/ // String replacement using dictionary map
/*exported _GpfFunctionBuilder*/ // Function builder
/*#endif*/

function _gpfStringTrim (string) {
    return string.trim();
}

/**
 * Function builder.
 * This helper class is capable of generating new functions.
 *
 * @param {Function} [referenceFunction] Function to analyze
 * @constructor
 * @since 0.1.6
 */
function _GpfFunctionBuilder (referenceFunction) {
    /*jshint validthis:true*/ // constructor
    /*eslint-disable no-invalid-this*/
    this.parameters = [];
    if (undefined !== referenceFunction) {
        _gpfAssert(_gpfEmptyFunc.toString.call(referenceFunction).indexOf("[native") !== 0, "No native function");
        this._extract(referenceFunction);
    }
    /*eslint-enable no-invalid-this*/
}

_GpfFunctionBuilder.prototype = {

    /**
     * Function name
     * @since 0.1.6
     */
    name: "",

    /**
     * Parameter names
     *
     * @type {String[]}
     * @since 0.1.6
     */
    parameters: [],

    /**
     * Function body: comments are removed from referenceFunction
     * @since 0.1.6
     */
    body: "",

    /**
     * Replace strings in the body
     *
     * @param {Object} replacements Dictionary of string replacements
     * @since 0.1.6
     */
    replaceInBody: function (replacements) {
        this.body = _gpfStringReplaceEx(this.body, replacements);
    },

    /**
     * Extract function information
     *
     * @param {Function} [referenceFunction] Function to analyze
     * @since 0.1.6
     */
    _extract: function (referenceFunction) {
        this.name = referenceFunction.compatibleName();
        var source = _gpfEmptyFunc.toString.call(referenceFunction).replace(_gpfJsCommentsRegExp, ""),
            start,
            end;
        if (0 < referenceFunction.length) {
            start = source.indexOf("(") + 1;
            end = source.indexOf(")", start) - 1;
            this.parameters = source.substr(start, end - start + 1).split(",").map(_gpfStringTrim);
        } else {
            this.parameters = [];
        }
        start = source.indexOf("{") + 1;
        end = source.lastIndexOf("}") - 1;
        this.body = source.substr(start, end - start + 1);
    },

    /**
     * Build a new function using name, parameters and body
     *
     * @return {Function} New function
     * @since 0.1.6
     */
    generate: function () {
        return _gpfFunc("return " + this._toSource())();
    },

    // build the source of the function
    _toSource: function () {
        var name;
        if (this.name) {
            name = " " + this.name;
        } else {
            name = "";
        }
        return [
            "function",
            name,
            " ("
        ].concat(this.parameters).concat([
            ") {\n",
            this.body,
            "\n}"
        ]).join("");
    }
};

/*#ifndef(UMD)*/

gpf.internals._GpfFunctionBuilder = _GpfFunctionBuilder;

/*#endif*/

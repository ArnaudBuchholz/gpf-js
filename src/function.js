/*#ifndef(UMD)*/
"use strict";
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfJsCommentsRegExp*/ // Find all JavaScript comments
/*global _gpfStringReplaceEx*/ // String replacement using dictionary map
/*exported _GpfFunctionBuilder*/
/*#endif*/

function _gpfStringTrim (string) {
    return string.trim();
}

/**
 * Function builder
 *
 * @class _GpfFunctionBuilder
 * @constructor
 */
function _GpfFunctionBuilder (functionToAnalyze) {
    /*jshint validthis:true*/ // constructor
    this.parameters = [];
    if (undefined !== functionToAnalyze) {
        this._extract(functionToAnalyze);
    }
}

_GpfFunctionBuilder.prototype = {

    // @property {Boolean} is a native function
    isNative: false,

    // @property {String} function name
    name: "",

    // @property {String[]} paremeter names
    parameters: [],

    // @property {String} function body (comments are removed)
    body: "",

    /**
     * Replace strings in the body
     *
     * @param {Object} replacements map of strings to search and replace
     */
    replaceInBody: function (replacements) {
        this.body = _gpfStringReplaceEx(this.body, replacements);
    },

    /**
     * Extract function information
     *
     * @param {Function} functionObject
     */
    _extract: function (functionObject) {
        this.name = functionObject.compatibleName();
        var source = Function.prototype.toString.call(functionObject).replace(_gpfJsCommentsRegExp, ""),
            start,
            end;
        if (0 < functionObject.length) {
            start = source.indexOf("(") + 1;
            end = source.indexOf(")", start) - 1;
            this.parameters = source.substr(start, end - start + 1).split(",").map(_gpfStringTrim);
        } else {
            this.parameters = [];
        }
        if (-1 < source.indexOf("[native")) {
            this.isNative = true;
        } else {
            start = source.indexOf("{") + 1;
            end = source.lastIndexOf("}") - 1;
            this.body = source.substr(start, end - start + 1);
        }
    },

    /**
     * Build a new function using name, parameters and body
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

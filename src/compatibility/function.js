/*#ifndef(UMD)*/
"use strict";
/*global _gpfInstallCompatibility*/ // Define and install compatible methods
/*exported _gpfJsCommentsRegExp*/ // Find all JavaScript comments
/*#endif*/

var _gpfArrayPrototypeSlice = Array.prototype.slice;

_gpfInstallCompatibility("Function", {
    on: Function,

    methods: {

        // Introduced with JavaScript 1.8.5
        bind: function (thisArg) {
            var me = this,
                prependArgs = _gpfArrayPrototypeSlice.call(arguments, 1);
            return function () {
                var args = _gpfArrayPrototypeSlice.call(arguments, 0);
                me.apply(thisArg, prependArgs.concat(args));
            };
        }

    }

});

//region Function name

// Get the name of a function if bound to the call
var _gpfJsCommentsRegExp =  new RegExp("//.*$|/\\*(?:[^\\*]*|\\*[^/]*)\\*/", "gm");
function _gpfGetFunctionName () {
    // Use simple parsing
    /*jshint validthis:true*/
    var functionSource = Function.prototype.toString.call(this), //eslint-disable-line no-invalid-this
        functionKeywordPos = functionSource.indexOf("function"),
        parameterListStartPos = functionSource.indexOf("(", functionKeywordPos);
    return functionSource
            .substr(functionKeywordPos + 9, parameterListStartPos - functionKeywordPos - 9)
            .replace(_gpfJsCommentsRegExp, "") // remove comments
            .trim();
}

// Handling function name properly
/* istanbul ignore if */ // NodeJS exposes Function.prototype.name
if ((function () {
    /* istanbul ignore next */ // Will never be evaluated
    function functionName () {}
    return functionName.name !== "functionName";
})()) {

    Function.prototype.compatibleName = _gpfGetFunctionName;

} else {

    /**
     * Return function name
     *
     * @return {String}
     */
    Function.prototype.compatibleName = function () {
        return this.name;
    };

}

//endregion

/*#ifndef(UMD)*/

gpf.internals._gpfGetFunctionName = _gpfGetFunctionName;

/*#endif*/

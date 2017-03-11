/**
 * @file Abstract method helper
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfFunctionBuild*/ // Build function from description and context
/*global _gpfBuildFunctionParameterList*/ // Builds an array of parameters
/*exported _gpfCreateAbstractFunction*/ // Build a function that throws the abstractMethod exception
/*#endif*/

_gpfErrorDeclare("abstract", {

    /**
     * ### Summary
     *
     * Method is abstract
     *
     * ### Description
     *
     * This error is used to implement abstract methods. Mostly used for interfaces.
     * @since 0.1.5
     */
    abstractMethod: "Abstract method"

});

/**
 * Build a function that throws the abstractMethod exception
 *
 * @param {Number} numberOfParameters Defines the signature of the resulting function
 * @return {Function} Function that throws the abstractMethod exception
 */
function _gpfCreateAbstractFunction (numberOfParameters) {
    return _gpfFunctionBuild({
        parameters: _gpfBuildFunctionParameterList(numberOfParameters),
        body: "_throw_();"
    }, {
        _throw_: gpf.Error.abstractMethod
    });
}

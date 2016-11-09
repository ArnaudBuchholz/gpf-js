/**
 * @file Error base class
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*global _gpfStringReplaceEx*/ // String replacement using dictionary map
/*exported _gpfErrorDeclare*/ // Declare new gpf.Error names
/*#endif*/

/**
 * GPF Error class
 *
 * @constructor
 * @alias gpf.Error
 */
var _GpfError = gpf.Error = function () {};

_GpfError.prototype = {

    constructor: _GpfError,

    /**
     * Error code
     *
     * @readonly
     */
    code: 0,

    /**
     * Error name
     *
     * @readonly
     */
    name: "Error",

    /**
     * Error message
     *
     * @readonly
     */
    message: ""

};

function _gpfErrorFactory (code, name, message) {
    return function (context) {
        var error = new _GpfError(),
            finalMessage,
            replacements;
        error.code = code;
        error.name = name;
        if (context) {
            replacements = {};
            _gpfObjectForEach(context, function (value, key) {
                replacements["{" + key + "}"] = value.toString();
            });
            finalMessage = _gpfStringReplaceEx(message, replacements);
        } else {
            finalMessage = message;
        }
        error.message = finalMessage;
        return error;
    };
}

/**
 * Generates an error class
 *
 * @param {Number} code Error code
 * @param {String} name Error name
 * @param {String} message Error message
 * @return {Function} New error class
 * @closure
 */
function _gpfGenenerateErrorFunction (code, name, message) {
    var result = _gpfErrorFactory(code, name, message);
    result.CODE = code;
    result.NAME = name;
    result.MESSAGE = message;
    return result;
}

// Last allocated error code
var _gpfLastErrorCode = 0;

/**
 * Declare error messages.
 * Each source declares its own errors.
 *
 * @param {String} source Source name
 * @param {Object} dictionary Dictionary of error name to message
 */
function _gpfErrorDeclare (source, dictionary) {
    _gpfIgnore(source);
    _gpfObjectForEach(dictionary, function (message, name) {
        var code = ++_gpfLastErrorCode;
        gpf.Error["CODE_" + name.toUpperCase()] = code;
        gpf.Error[name] = _gpfGenenerateErrorFunction(code, name, message);
    });
}

_gpfErrorDeclare("boot", {
    /**
     * A method is not implemented
     *
     * @method gpf.Error.notImplemented
     * @return {gpf.Error}
     */
    notImplemented:
        "Not implemented",

    /**
     * An abstract method was invoked
     *
     * @method gpf.Error.abstractMethod
     * @return {gpf.Error}
     */
    abstractMethod:
        "Abstract method",

    /**
     * An assertion failed
     *
     * @param {Object} context Exception context
     * - {String} message: Assertion message
     *
     * @method gpf.Error.assertionFailed
     * @return {gpf.Error}
     */
    assertionFailed:
        "Assertion failed: {message}",

    /**
     * A method is invoked with an invalid parameter
     *
     * @method gpf.Error.invalidParameter
     * @return {gpf.Error}
     */
    invalidParameter:
        "Invalid parameter"
});

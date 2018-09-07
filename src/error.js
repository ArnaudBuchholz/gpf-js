/**
 * @file Error base class
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfFunctionBuild*/ // Build function from description and context
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*global _gpfStringCapitalize*/ // Capitalize the string
/*global _gpfStringReplaceEx*/ // String replacement using dictionary map
/*exported _gpfErrorDeclare*/ // Declare new gpf.Error names
/*#endif*/

/**
 * GPF Error class
 *
 * @constructor
 * @alias gpf.Error
 * @since 0.1.5
 */
var _GpfError = gpf.Error = function () {};

_GpfError.prototype = new Error();
Object.assign(_GpfError.prototype, /** @lends gpf.Error.prototype */ {

    constructor: _GpfError,

    /**
     * Error code
     *
     * @readonly
     * @since 0.1.5
     */
    code: 0,

    /**
     * Error name
     *
     * @readonly
     * @since 0.1.5
     */
    name: "Error",

    /**
     * Error message
     *
     * @readonly
     * @since 0.1.5
     */
    message: "",

    /**
     * Build message by substituting context variables
     *
     * @param {Object} context Dictionary of named keys
     * @since 0.1.5
     */
    _buildMessage: function (context) {
        var  replacements;
        if (context) {
            replacements = {};
            _gpfObjectForEach(context, function (value, key) {
                replacements["{" + key + "}"] = value.toString();
            });
            this.message = _gpfStringReplaceEx(this.message, replacements);
        }
    }

});

function _gpfErrorFactory (code, name, message) {
    var capitalizedName = _gpfStringCapitalize(name),
        NewErrorClass = _gpfFunctionBuild({
            name: capitalizedName,
            parameters: ["context"],
            body: "this._buildMessage(context);"
        });
    NewErrorClass.prototype = new _GpfError();
    Object.assign(NewErrorClass.prototype, {
        code: code,
        name: name,
        message: message
    });
    // constructor can't be enumerated with wscript
    NewErrorClass.prototype.constructor = NewErrorClass;
    _GpfError[capitalizedName] = NewErrorClass;
    return function (context) {
        throw new NewErrorClass(context);
    };
}

/**
 * Generates an error class
 *
 * @param {Number} code Error code
 * @param {String} name Error name
 * @param {String} message Error message
 * @return {Function} New error class
 * @gpf:closure
 * @since 0.1.5
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
 * @since 0.1.5
 */
function _gpfErrorDeclare (source, dictionary) {
    _gpfIgnore(source);
    _gpfObjectForEach(dictionary, function (message, name) {
        var code = ++_gpfLastErrorCode;
        gpf.Error["CODE_" + name.toUpperCase()] = code;
        gpf.Error[name] = _gpfGenenerateErrorFunction(code, name, message);
    });
}

_gpfErrorDeclare("error", {
    /**
     * ### Summary
     *
     * Method or function is not implemented
     *
     * ### Description
     *
     * This error is used to flag methods or functions that are not yet implemented.
     * @since 0.1.5
     */
    notImplemented:
        "Not implemented",

    /**
     * ### Summary
     *
     * An assertion failed
     *
     * ### Description
     *
     * This error is triggered when an assertion fails
     *
     * @see {@link gpf.assert}
     * @see {@link gpf.asserts}
     * @since 0.1.5
     */
    assertionFailed:
        "Assertion failed: {message}",

    /**
     * ### Summary
     *
     * Method or function was called with an invalid parameter
     *
     * ### Description
     *
     * This error is used when a parameter is invalid
     * @since 0.1.5
     */
    invalidParameter:
        "Invalid parameter"
});

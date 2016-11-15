/**
 * @file Error base class
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfExtend*/ // gpf.extend
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
 */
var _GpfError = gpf.Error = function () {};

_GpfError.prototype = new Error();
_gpfExtend(_GpfError.prototype, /** @lends gpf.Error.prototype */ {

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
    message: "",

    /**
     * Build message by substituting context variables
     *
     * @param {Object} context Dictionary of named keys
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
    function NewErrorClass (context) {
        this._buildMessage(context);
    }
    NewErrorClass.prototype = new _GpfError();
    _gpfExtend(NewErrorClass.prototype, {
        constructor: NewErrorClass,
        code: code,
        name: name,
        message: message
    });
    _GpfError[_gpfStringCapitalize(name)] = NewErrorClass;
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
    /** @gpf:error A method is not implemented */
    notImplemented:
        "Not implemented",

    /**
     * An abstract method was invoked
     *
     * @method gpf.Error.abstractMethod
     * @throws {gpf.Error.AbstractMethod}
     */
    /**
     * An abstract method was invoked
     *
     * @class gpf.Error.AbstractMethod
     */
    abstractMethod:
        "Abstract method",

    /**
     * An assertion failed
     *
     * @param {Object} context Exception context
     * - {String} message: Assertion message
     *
     * @class gpf.Error.AssertionFailed
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

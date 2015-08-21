/*#ifndef(UMD)*/
"use strict";
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*global _gpfSetConstant*/ // If possible, defines a constant (i.e. read-only property)
/*global _gpfStringReplaceEx*/ // String replacement using dictionary map
/*exported _gpfErrorDeclare*/
/*#endif*/

/**
 * GPF Error class
 *
 * @constructor
 * @class _GpfError
 * @alias gpf.Error
 */
var _GpfError = gpf.Error = function () {};

_GpfError.prototype = {

    constructor: _GpfError,

    // Error code @readonly
    code: 0,

    // Error name @readonly
    name: "Error",

    // Error message @readonly
    message: ""

};

/**
 * Generates an error function
 *
 * @param {Number} code
 * @param {String} name
 * @return {Function}
 * @closure
 */
 function _gpfGenErrorName (code, name, message) {
    var result = function (context) {
        var error = new _GpfError(),
            finalMessage,
            replacements;
        _gpfSetConstant(error, {
            name: "code",
            value: code
        });
        _gpfSetConstant(error, {
            name: "name",
            value: name
        });
        if (context) {
            replacements = {};
            _gpfObjectForEach(context, function (value, key) {
                replacements["{" + key + "}"] = value.toString();
            });
            finalMessage = _gpfStringReplaceEx(message, replacements);
        } else {
            finalMessage = message;
        }
        _gpfSetConstant(error, {
            name: "message",
            value: finalMessage
        });
        return error;
    };
    _gpfSetConstant(result, {
        name: "CODE",
        value: code
    });
    _gpfSetConstant(result, {
        name: "NAME",
        value: name
    });
    _gpfSetConstant(result, {
        name: "MESSAGE",
        value: message
    });
    return result;
}

// Last allocated error code
var _gpfLastErrorCode = 0;

/**
 * Declare error messages.
 * Each module declares its own errors.
 *
 * @param {String} module
 * @param {Object} list Dictionary of name to message
 */
function _gpfErrorDeclare (module, list) {
    var
        name,
        code;
    _gpfIgnore(module);
    for (name in list) {
        if (list.hasOwnProperty(name)) {
            code = ++_gpfLastErrorCode;
            gpf.Error["CODE_" + name.toUpperCase()] = code;
            gpf.Error[name] = _gpfGenErrorName(code, name, list[name]);
        }
    }
}

_gpfErrorDeclare("boot", {
    NotImplemented:
        "Not implemented",
    Abstract:
        "Abstract",
    AssertionFailed:
        "Assertion failed: {message}",
    InvalidParameter:
        "Invalid parameter"
});

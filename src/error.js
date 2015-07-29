/*#ifndef(UMD)*/
"use strict";
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfSetConstant*/ // If possible, defines a constant (i.e. read-only property)
/*global _gpfStringReplaceEx*/ // String replacement using dictionary map
/*exported _gpfErrorDeclare*/
/*#endif*/

var
    /**
     * GPF Error class
     *
     * @constructor
     * @class _GpfError
     * @alias gpf.Error
     */
    _GpfError = gpf.Error = function () {
    },

    /**
     * Generates an error function
     *
     * @param {Number} code
     * @param {String} name
     * @return {Function}
     * @closure
     * @private
     */
    _gpfGenErrorName = function (code, name, message) {
        var result = function (context) {
            var
                error = new gpf.Error(),
                finalMessage,
                replacements,
                key;
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
                for (key in context) {
                    if (context.hasOwnProperty(key)) {
                        replacements["{" + key + "}"] =
                            context[key].toString();
                    }
                }
                finalMessage = _gpfStringReplaceEx(message,
                    replacements);
            } else {
                finalMessage = message;
            }
            _gpfSetConstant(error, "message", finalMessage);
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
    },

    /**
     * Last allocated error code
     *
     * @type {number}
     * @private
     */
    _gpfLastErrorCode = 0,

    /**
     * Declare error messages.
     * Each module declares its own errors.
     *
     * @param {String} module
     * @param {Object} list Dictionary of name to message
     * @private
     */
    _gpfErrorDeclare = function (module, list) {
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
    };

_GpfError.prototype = {

    constructor: _GpfError,

    /**
     * Error code
     *
     * @type {Number}
     * @read-only
     */
    code: 0,

    /**
     * Error name
     *
     * @type {String}
     * @read-only
     */
    name: "Error",

    /**
     * Error message
     *
     * @type {String}
     * @read-only
     */
    message: ""

};

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
/*#ifndef(UMD)*/
"use strict";
/*global _gpfStringReplaceEx*/ // String replacement using dictionary map
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*#endif*/

// TODO make this list disappear
/**
 * Each module declare its errors, only the most common ones are below
 */

var
    _GPF_ERRORS = {
        // boot.js

        // define.js
        "ClassMemberOverloadWithTypeChange":
            "You can't overload a member to change its type",
        "ClassInvalidVisibility":
            "Invalid visibility keyword",

        // i_enumerable.js
        "EnumerableInvalidMember":
            "$Enumerable can be associated to arrays only",

        // parser.js
        "PatternUnexpected":
            "Invalid syntax (unexpected)",
        "PatternEmpty":
            "Empty pattern",
        "PatternInvalidSyntax":
            "Invalid syntax",
        "PatternEmptyGroup":
            "Syntax error (empty group)",

        // html.js
        "HtmlHandlerMultiplicityError":
            "Too many $HtmlHandler attributes for '{member}'",
        "HtmlHandlerMissing":
            "No $HtmlHandler attributes",
        "HtmlHandlerNoDefault":
            "No default $HtmlHandler attribute",

        // engine.js
        "EngineStackUnderflow":
            "Stack underflow",
        "EngineTypeCheck":
            "Type check",

        // encoding.js
        "EncodingNotSupported":
            "Encoding not supported",
        "EncodingEOFWithUnprocessedBytes":
            "Unexpected end of stream: unprocessed bytes",

        // xml.js
        "XmlInvalidName":
            "Invalid XML name",

        // params.js
        "ParamsNameRequired":
            "Missing name",
        "ParamsTypeUnknown":
            "Type unknown",
        "ParamsRequiredMissing":
            "Required parameter '{name}' is missing",

        // fs.js
        "FileNotFound":
            "File not found"
    },

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
            gpf.setReadOnlyProperty(error, "code", code);
            gpf.setReadOnlyProperty(error, "name", name);
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
            gpf.setReadOnlyProperty(error, "message", finalMessage);
            return error;
        };
        gpf.setReadOnlyProperty(result, "CODE", code);
        gpf.setReadOnlyProperty(result, "NAME", name);
        gpf.setReadOnlyProperty(result, "MESSAGE", message);
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
     * Declare error messages
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
        "Assertion failed: {message}"
});

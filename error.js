/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    /**
     * Error object, contains error information
     *
     * @class gpf.Error
     */
    gpf.define("gpf.Error", {

        public: {

            /**
             * Error code
             *
             * @type {Number}
             */
            code: 0,

            /**
             * Error name
             *
             * @type {String}
             */
            name: "Error",

            /**
             * Error message
             *
             * @type {String}
             */
            message: ""
        }

    });

    var
        ERRORS = {
            // boot.js
            "NotImplemented":
                "Not implemented",
            "Abstract":
                "Abstract",
            "AssertionFailed":
                "Assertion failed: {message}",

            // class.js
            "ClassMemberOverloadWithTypeChange":
                "You can't overload a member to change its type",
            "ClassInvalidVisibility":
                "Invalid visibility keyword",

            // interface.js
            "InterfaceExpected":
                "Expected interface not implemented: {name}",

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
                "Required parameter '{name}' is missing"
        },

        /**
         * Generates an error function
         *
         * @param {Number} code
         * @param {String} name
         * @return {Function}
         * @closure
         */
        genThrowError = function (code, name) {
            return function (context) {
                var
                    error = new gpf.Error(),
                    replacements,
                    key;
                error.code = code;
                error.name = name;
                if (context) {
                    replacements = {};
                    for (key in context) {
                        if (context.hasOwnProperty(key)) {
                            replacements["{" + key + "}"] =
                                context[key].toString();
                        }
                    }
                    error.message = gpf.replaceEx(ERRORS[name], replacements);
                } else {
                    error.message = ERRORS[name];
                }
                throw error;
            };
        },

        name,
        code = 0;
    for (name in ERRORS) {
        if (ERRORS.hasOwnProperty(name)) {
            ++code;
            gpf.Error["CODE_" + name.toUpperCase()] = code;
            gpf.Error[name] = genThrowError(code, name);
        }
    }

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/
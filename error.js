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

        private: {

            /**
             * Error code
             *
             * @type {String}
             * @private
             */
            _code: 0,

            /**
             * Error name
             *
             * @type {String}
             * @private
             */
            _name: "",

            /**
             * Error message
             *
             * @type {String}
             * @private
             */
            _message: ""
        },

        public: {

            /**
             * Error code
             *
             * @return {String}
             */
            code: function () {
                return this._code;
            },

            /**
             * Error name
             *
             * @return {String}
             */
            name: function () {
                return this._name;
            },

            /**
             * Error message
             *
             * @return {String}
             */
            message: function () {
                return this._message;
            }
        }
    });

    var
        ERRORS = {
            // boot.js
            "NotImplemented":
                "Not implemented",
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

            // xml.js
            "XmlInvalidName":
                "Invalid XML name"
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
            // TODO handle contextual parameters (see HtmlHandlerMultiplicityError)
            return function () {
                var error = new gpf.Error();
                error._code = code;
                error._name = name;
                error._message = ERRORS[name];
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
(function () { /* Begin of privacy scope */
    /*global document,window,console*/
    /*global process,require,exports,global*/
    /*global gpf*/
    /*jslint continue: true, nomen: true, plusplus: true*/
    "use strict";

    /*
     * 2013-11-05 ABZ
     * Removed __rewriter_replace_with_values and other helpers that are useless
     * Indeed, the 'minifier' should detect the following:
     * - value is simple (string, number)
     * - value is never set but always used
     */

    var
        /*
         * These are the types provided in the callback
         */
        _TOKEN_ERROR                    = "error",
        _TOKEN_UNKNOWN                  = "unknown",
        /*
         * break, case, catch, continue, debugger, default
         * delete, do, else, finally, for, function, if, in
         * instanceof, new, return, switch, this, throw, try
         * typeof, var, void, while, with
         */
        _TOKEN_KEYWORD                  = "keyword",
        // [_a-zA-Z][_a-zA-Z0-9]*
        _TOKEN_IDENTIFIER               = "identifier",
        // "[^"]" or '[^']'
        _TOKEN_STRING                   = "string",
        // [0-9]+
        _TOKEN_NUMBER                   = "number",
        // \[\]\{\}\(\)...
        _TOKEN_SYMBOL                   = "symbol",
        _TOKEN_COMMENT                  = "comment",
        _TOKEN_SPACE                    = "space",

        /*
         * these are the internal parser state
         */
        _TOKEN_STATE_ERROR              = 99,
        _TOKEN_STATE_NONE               = 0,
        /* IDENTIFIER, separate first char from the next ones */
        _TOKEN_STATE_IDENTIFIER         = 2,
        /* STRING, detect begin, escape char */
        _TOKEN_STATE_STRING1_CHAR       = 3,
        _TOKEN_STATE_STRING1_ESCAPE     = 4,
        _TOKEN_STATE_STRING2_CHAR       = 5,
        _TOKEN_STATE_STRING2_ESCAPE     = 6,
        /* Intermediate before COMMENT or LCOMMENT */
        _TOKEN_STATE_SLASH              = 7,
        /* LCOMMENT, line comment */
        _TOKEN_STATE_LCOMMENT           = 8,
        /* COMMENT, other comment */
        _TOKEN_STATE_COMMENT            = 9,
        _TOKEN_SYMBOL_LIST              = "(){}[]<>|&?,.;:!=+-*/%^~",
        _TOKEN_STATE_SYMBOL             = 10,
        _TOKEN_STATE_NUMBER             = 11,
        _TOKEN_SPACE_LIST               = " \t\r\n",
        _TOKEN_STATE_SPACE              = 12,

        /*
         *  Error management:
         *  May have/need a central error message management,
         *  hence the variable BASE
         */
        _TOKEN_ERROR_BASE_              = 0,
        _TOKEN_ERROR_ABORT              = 0,
        _TOKEN_ERROR_UTOKEN             = 1,
        _TOKEN_ERROR_USTRING            = 2,
        _TOKEN_ERROR_UCOMMENT           = 3,
        _TOKEN_ERROR_STRINGESC          = 4,

        _TOKEN_ERRORS = [
            "Parsing aborted",
            "Unknown token",
            "Unterminated string",
            "Unterminated comment",
            "Invalid or unsupported string escape"
        ],

        /**
         * Generates a new tokenizer context
         * 
         * @returns {object} tokenizer context
         * @internal
         */
        _tokenizerInit = function () {

            return {
                pos: 0,                     // Position of token start
                line: 0,                    //    Translated to line
                column: 0,                  //    And column
                state: _TOKEN_STATE_NONE,   // State
                chars: [],                  // Current token
                nextPos: 0,                 // Real position
                nextLine: 0,                //    Translated to line
                nextColumn: 0,              //    And column
                eventsHandler: null,        // Events handler
                that: null                  // Transported this
            };

        },

        /**
         * Handles tokenizer events
         * 
         * @param {object} context tokenizer context
         * @param {number} errorCode error
         * @returns {undefined}
         * @internal
         */
        _tokenizerCallback = function (context, errorCode) {
            var
                token,
                type,
                event,
                eventParams = {
                    token: "",
                    pos: context.pos,
                    line: context.line,
                    column: context.column,
                    code: 0,
                    message: ""
                };
            if (undefined !== errorCode) {
                // Error
                type = _TOKEN_ERROR;
                context.state = _TOKEN_STATE_ERROR;
                eventParams.code = errorCode;
                eventParams.message = _TOKEN_ERRORS[errorCode -
                    _TOKEN_ERROR_BASE_];
            } else {
                // Token
                token = context.chars.join("");
                if (_TOKEN_STATE_IDENTIFIER === context.state) {
                    if ("break" === token
                            || "case" === token
                            || "catch" === token
                            || "continue" === token
                            || "debugger" === token
                            || "default" === token
                            || "delete" === token
                            || "do" === token
                            || "else" === token
                            || "finally" === token
                            || "for" === token
                            || "function" === token
                            || "if" === token
                            || "in" === token
                            || "instanceof" === token
                            || "new" === token
                            || "return" === token
                            || "switch" === token
                            || "this" === token
                            || "throw" === token
                            || "try" === token
                            || "typeof" === token
                            || "var" === token
                            || "void" === token
                            || "while" === token
                            || "with" === token) {
                        type = _TOKEN_KEYWORD;
                    } else {
                        type = _TOKEN_IDENTIFIER;
                    }
                } else if (_TOKEN_STATE_NONE === context.state) {
                    type = _TOKEN_UNKNOWN;
                } else if (_TOKEN_STATE_SYMBOL === context.state) {
                    type = _TOKEN_SYMBOL;
                } else if (_TOKEN_STATE_LCOMMENT === context.state
                        || _TOKEN_STATE_COMMENT === context.state) {
                    type = _TOKEN_COMMENT;
                } else if (_TOKEN_STATE_STRING1_CHAR === context.state
                        || _TOKEN_STATE_STRING2_CHAR === context.state) {
                    type = _TOKEN_STRING;
                } else if (_TOKEN_STATE_NUMBER === context.state) {
                    type = _TOKEN_NUMBER;
                } else if (_TOKEN_STATE_SPACE === context.state) {
                    type = _TOKEN_SPACE;
                }
            }
            eventParams.token = token;
            event = gpf.events.fire.apply(context.that, [type, eventParams,
                context.eventsHandler]);
            if (event.defaultPrevented()) {
                _tokenizerCallback(context, _TOKEN_ERROR_ABORT);
            } else if (undefined !== errorCode) {
                throw 0; // Interrupt processing, will be caught at top level
            }
            context.state = _TOKEN_STATE_NONE;
            context.chars = [];
            // New position
            context.pos = context.nextPos;
            context.line = context.nextLine;
            context.column = context.nextColumn;
        },

        /**
         * Detects JavaScript symbols
         * 
         * @param {string[]} chars the already recognized characters
         * @param {string} newChar the next char to recognize
         * @returns {Boolean} true if the next char makes a valid symbol
         */
        _isValidSymbol = function (chars, newChar) {
            var firstChar = chars[0];
            if (1 === chars.length) {
                if (-1 < "(){}[].,;:?".indexOf(firstChar)) {
                    return false;
                } else if (-1 < "!^~*/%".indexOf(firstChar)) {
                    return "=" === newChar;
                } else {
                    return "=" === newChar || firstChar === newChar;
                }
            } else if (2 === chars.length) {
                if (-1 < "+-|&".indexOf(firstChar)) {
                    return false;
                } else if ("<" === firstChar) {
                    return "<" === chars[1] && "=" === newChar;
                } else if (-1 < "=!".indexOf(firstChar)) {
                    return "=" === newChar;
                } else if (">" === firstChar) {
                    return "=" !== chars[1]
                        && ("=" === newChar || ">" === newChar);
                }
            } else if (3 === chars.length) {
                return ">" === firstChar && "=" !== chars[2] && "=" === newChar;
            }
            return false;
        },

        /**
         * Main parser function
         * 
         * @param {object} context tokenizer context
         * @param {string} newChar next char to analyze
         * @returns {undefined}
         */
        _analyzeChar = function (context, newChar) {

            if (_TOKEN_STATE_IDENTIFIER === context.state) {
                if (("a" > newChar || newChar > "z")
                        && ("A" > newChar || newChar > "Z")
                        && ("0" > newChar || newChar > "9")
                        && "_" !== newChar && "$" !== newChar) {
                    _tokenizerCallback(context);
                } else {
                    context.chars.push(newChar);
                }

            } else if (_TOKEN_STATE_NUMBER === context.state) {
                if ("0" > newChar || newChar > "9") {
                    _tokenizerCallback(context);
                } else {
                    context.chars.push(newChar);
                }

            } else if (_TOKEN_STATE_STRING1_CHAR === context.state
                        || _TOKEN_STATE_STRING2_CHAR === context.state) {
                context.chars.push(newChar);
                if ("\\" === newChar) {
                    ++context.state; // _ESCAPE
                } else if ("\n" === newChar) {
                    _tokenizerCallback(context, _TOKEN_ERROR_USTRING);
                } else if (_TOKEN_STATE_STRING1_CHAR === context.state
                        && "\"" === newChar) {
                    _tokenizerCallback(context);
                    return;
                } else if (_TOKEN_STATE_STRING2_CHAR === context.state
                        && "'" === newChar) {
                    _tokenizerCallback(context);
                    return;
                }

            } else if (_TOKEN_STATE_STRING1_ESCAPE === context.state
                        || _TOKEN_STATE_STRING2_ESCAPE === context.state) {
                if ("\\" === newChar
                        || "r" === newChar
                        || "n" === newChar
                        || "t" === newChar
                        || "\"" === newChar
                        || "'" === newChar) {
                    --context.state;
                    context.chars.push(newChar);
                } else {
                    _tokenizerCallback(context, _TOKEN_ERROR_STRINGESC);
                }

            } else if (_TOKEN_STATE_SLASH === context.state) {
                if ("/" === newChar) {
                    context.state = _TOKEN_STATE_LCOMMENT;
                    context.chars.push(newChar);
                } else if ("*" === newChar) {
                    context.state = _TOKEN_STATE_COMMENT;
                    context.chars.push(newChar);
                } else {
                    context.state = _TOKEN_STATE_SYMBOL;
                    if (_isValidSymbol(context.chars, newChar)) {
                        context.chars.push(newChar);
                    } else {
                        _tokenizerCallback(context);
                    }
                }

            } else if (_TOKEN_STATE_LCOMMENT === context.state) {
                context.chars.push(newChar);
                if ("\n" === newChar) {
                    _tokenizerCallback(context);
                }
            } else if (_TOKEN_STATE_COMMENT === context.state) {
                context.chars.push(newChar);
                if ("/" === newChar
                        && context.chars[context.chars.length - 2] === "*") {
                    _tokenizerCallback(context);
                    return;
                }

            } else if (_TOKEN_STATE_SPACE === context.state) {
                if (-1 < _TOKEN_SPACE_LIST.indexOf(newChar)) {
                    context.chars.push(newChar);
                } else {
                    _tokenizerCallback(context);
                }

            } else if (_TOKEN_STATE_SYMBOL === context.state) {
                if (-1 < _TOKEN_SYMBOL_LIST.indexOf(newChar)) {
                    if (_isValidSymbol(context.chars, newChar)) {
                        context.chars.push(newChar);
                    } else {
                        _tokenizerCallback(context);
                    }
                } else {
                    _tokenizerCallback(context);
                }
            }

            if (_TOKEN_STATE_NONE === context.state) {
                context.chars = [newChar];
                if (("a" <= newChar && newChar <= "z")
                        || ("A" <= newChar && newChar <= "Z")
                        || "_" === newChar || "$" === newChar) {
                    context.state = _TOKEN_STATE_IDENTIFIER;
                } else if ("0" <= newChar && newChar <= "9") {
                    context.state = _TOKEN_STATE_NUMBER;
                } else if ("\"" === newChar) {
                    context.state = _TOKEN_STATE_STRING1_CHAR;
                } else if ("'" === newChar) {
                    context.state = _TOKEN_STATE_STRING2_CHAR;
                } else if ("/" === newChar) {
                    context.state = _TOKEN_STATE_SLASH;
                } else if (-1 < _TOKEN_SYMBOL_LIST.indexOf(newChar)) {
                    context.state = _TOKEN_STATE_SYMBOL;
                } else if (-1 < _TOKEN_SPACE_LIST.indexOf(newChar)) {
                    context.state = _TOKEN_STATE_SPACE;
                } else {
                    _tokenizerCallback(context, _TOKEN_ERROR_UTOKEN);
                }
            }
        },

        /**
         * Compute next char position
         * 
         * @param {object} context tokenizer context
         * @param {string} newChar char that has been analyzed
         * @returns {undefined}
         */
        _computeNextPos = function (context, newChar) {
            ++context.nextPos;
            if ("\n" === newChar) {
                ++context.nextLine;
                context.nextColumn = 0;
            } else {
                ++context.nextColumn;
            }
        },

        /**
         * Inject next char in the tokenizer
         * 
         * @param {object} context tokenizer context
         * @param {string} newChar char that will be analyzed
         * @returns {undefined}
         */
        _tokenizeChar = function (context, newChar) {
            _analyzeChar(context, newChar);
            _computeNextPos(context, newChar);
        },

        /**
         * Finalize tokenizer
         * 
         * @param {object} context tokenizer context
         */
        _tokenizerFinalize = function (context) {
            if (_TOKEN_STATE_IDENTIFIER === context.state
                    || _TOKEN_STATE_NUMBER === context.state
                    || _TOKEN_STATE_LCOMMENT === context.state
                    || _TOKEN_STATE_SYMBOL === context.state) {
                _tokenizerCallback(context);
            } else if (_TOKEN_STATE_SLASH === context.state) {
                context.state = _TOKEN_STATE_SYMBOL;
                _tokenizerCallback(context);
            } else if (_TOKEN_STATE_COMMENT === context.state) {
                _tokenizerCallback(context, _TOKEN_ERROR_UCOMMENT);
            } else if (_TOKEN_STATE_STRING1_CHAR === context.state
                        || _TOKEN_STATE_STRING2_CHAR === context.state
                        || _TOKEN_STATE_STRING1_ESCAPE === context.state
                        || _TOKEN_STATE_STRING2_ESCAPE === context.state) {
                _tokenizerCallback(context, _TOKEN_ERROR_USTRING);
            }
            gpf.ASSERT(_TOKEN_STATE_NONE === context.state
                || _TOKEN_STATE_ERROR === context.state
                || _TOKEN_STATE_SPACE === context.state,
                "Unexpected non-final state");
        };

    gpf.js = {};

    gpf.extend(gpf.js, {

        /**
         * Identify tokens in the provided text, the source is supposed to be
         * complete (and valid).
         * @param {string} text Text to analyze
         * @param {object/function} eventsHandler
         * @returns {undefined}
         * 
         * @eventParam {string} token The token value
         * @eventParam {number} pos Absolute position of the error (0-based)
         * @eventParam {number} line Absolute line position of the error (0-based)
         * @eventParam {number} column Column position relatively to the current
         *             line (0-based)
         * @eventParam {number} code Error code (0 if token found)
         * @eventParam {string} message Error message (empty if token found)
         * 
         * @eventDefault If prevented, an error is generated (abort) and the
         *               processing is stopped
         * 
         * @eventThis Transmitted from the function call
         * 
         * @event error A parsing error occured, the parameters code and message 
         *        are set accordingly
         * 
         * @event keyword A keyword has been recognized
         * 
         * @event identifier An identifier has been recognized
         * 
         * @event string A string has been recognized. NOTE: the token keeps the
         *        string notation intact (i.e. with surrounding quotes and
         *        escapes)
         * 
         * @event number A number has been recognized. NOTE: this version
         *        handles only positive integers (with no sign)
         * 
         * @event symbol A symbol has been recognized
         * 
         * @event comment A comment has been recognized. NOTE: the token keeps
         *        the comment notation
         * 
         * @event space One or more spaces has been recognized (i.e. space, tab
         *        and any carriage return combination)
         *
         */
        tokenize: function (text, eventsHandler) {
            var
                idx,
                len,
                context = _tokenizerInit();
            context.eventsHandler = eventsHandler;
            context.that = this;
            try {
                for (idx = 0, len = text.length; idx < len; ++idx) {
                    _tokenizeChar(context, text.charAt(idx));
                }
                _tokenizerFinalize(context);
            } catch (e) {
                // used for quick exit
                if ('number' !== typeof e) {
                    throw e; // TODO: wrap and forward 
                }
            }
        },

        /**
         * @see gpf.tokenize
         * 
         * Identify tokens in the provided text, the parsing context is returned
         * so that it can be chained with consecutive calls.

         * @param {string} text Text to analyze. Use null to finalize the
         *        parsing
         * @param {object/function} eventsHandler
         * @param {object} context Tokenizer context (initialized if not set)
         * @returns {undefined}
         *
         */
        tokenizeEx: function (text, eventsHandler, context) {
            var
                idx,
                len;
            if (undefined === context) {
                context = _tokenizerInit();
            }
            context.eventsHandler = eventsHandler;
            context.that = this;
            try {
                if (null === text) {
                    _tokenizerFinalize(context);
                    context = null; // Must not be reused
                } else {
                    for (idx = 0, len = text.length; idx < len; ++idx) {
                        _tokenizeChar(context, text.charAt(idx));
                    }
                }
            } catch (e) {
                // used for quick exit
                if ('number' !== typeof e) {
                    throw e; // TODO: wrap and forward 
                }
            }
            return context;
        }

    });

}()); /* End of privacy scope */

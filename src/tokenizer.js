/*#ifndef(UMD)*/
"use strict";
/*global _gpfAlpha*/ // Letters (lowercase)
/*global _gpfALPHA*/ // Letters (uppercase)
/*global _gpfAssert*/ // Assertion method
/*global _gpfExtend*/ // gpf.extend
/*#endif*/

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

    _TOKEN_IDENTIFIER_FIRSTCHAR = _gpfAlpha + _gpfALPHA + "_$",
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
     * @return {Object} tokenizer context
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
     * Hard coded list of keywords
     *
     * @type {string[]}
     * @private
     */
    _keywords = ("break,case,catch,continue,debugger,default,delete,do,"
        + "else,finally,for,function,if,in,instanceof,new,return,switch,"
        + "this,throw,try,typeof,var,void,while,with").split(","),

    /**
     * Association between engine state and corresponding token
     *
     * @type {object}
     * @private
     */
    _tokenStateMapping = (function () {
        var result = {};
        result[_TOKEN_STATE_NONE] = _TOKEN_UNKNOWN;
        result[_TOKEN_STATE_SYMBOL] = _TOKEN_SYMBOL;
        result[_TOKEN_STATE_LCOMMENT] = _TOKEN_COMMENT;
        result[_TOKEN_STATE_COMMENT] = _TOKEN_COMMENT;
        result[_TOKEN_STATE_STRING1_CHAR] = _TOKEN_STRING;
        result[_TOKEN_STATE_STRING2_CHAR] = _TOKEN_STRING;
        result[_TOKEN_STATE_NUMBER] = _TOKEN_NUMBER;
        result[_TOKEN_STATE_SPACE] = _TOKEN_SPACE;
        return result;
    })(),

    /**
     * Handles tokenizer events
     *
     * @param {Object} context tokenizer context
     * @param {Number} [errorCode=undefined] errorCode error
     * @return {undefined}
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
                if (undefined !== gpf.test(_keywords, token)) {
                    type = _TOKEN_KEYWORD;
                } else {
                    type = _TOKEN_IDENTIFIER;
                }
            } else {
                type = _tokenStateMapping[context.state];
            }
            eventParams.token = token;
        }
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
     * As the validation is distinct depending on the symbol length,
     * this has been split in N functions (to reduce cyclomatic complexity)
     *
     * @type {function[]}
     * @private
     */
    _symbolValidator = [
        0,

        // chars.length == 1
        function (firstChar, chars, newChar) {
            gpf.interfaces.ignoreParameter(chars);
            if (-1 < "(){}[].,;:?".indexOf(firstChar)) {
                return false;
            }
            if (-1 < "!^~*/%".indexOf(firstChar)) {
                return "=" === newChar;
            }
            return "=" === newChar || firstChar === newChar;
        },

        // chars.length == 2
        function (firstChar, chars, newChar) {
            if (-1 < "+-|&".indexOf(firstChar)) {
                return false;
            }
            if ("<" === firstChar) {
                return "<" === chars[1] && "=" === newChar;
            }
            if (-1 < "=!".indexOf(firstChar)) {
                return "=" === newChar;
            }
            if (">" === firstChar) {
                return "=" !== chars[1]
                    && ("=" === newChar || ">" === newChar);
            }
            return false;
        },

        // chars.length == 3
        function (firstChar, chars, newChar) {
            return ">" === firstChar && "=" !== chars[2] && "=" === newChar;
        },

        function () {
            return false;
        }
    ],

    /**
     * Detects JavaScript symbols
     *
     * @param {String[]} chars the already recognized characters
     * @param {String} newChar the next char to recognize
     * @return {Boolean} true if the next char makes a valid symbol
     * @internal
     */
    _isValidSymbol = function (chars, newChar) {
        var firstChar = chars[0];
        return _symbolValidator[chars.length](firstChar, chars, newChar);
    },

    /**
     * To reduce cyclomatic complexity, a map containing the analyzer
     * function per state has been created
     *
     * @type {function[]}
     * @private
     */
    _stateAnalyzer = (function () {
        var result = {};

        result[_TOKEN_STATE_IDENTIFIER] = function (context, newChar) {
            if (-1 === _TOKEN_IDENTIFIER_FIRSTCHAR.indexOf(newChar)
                && ("0" > newChar || newChar > "9")) {
                _tokenizerCallback(context);
            } else {
                context.chars.push(newChar);
            }
        };

        result[_TOKEN_STATE_NUMBER] = function (context, newChar) {
            if ("0" > newChar || newChar > "9") {
                _tokenizerCallback(context);
            } else {
                context.chars.push(newChar);
            }
        };

        result[_TOKEN_STATE_STRING1_CHAR] =
        result[_TOKEN_STATE_STRING2_CHAR] = function (context, newChar) {
            context.chars.push(newChar);
            if ("\\" === newChar) {
                ++context.state; // _ESCAPE
            } else if ("\n" === newChar) {
                _tokenizerCallback(context, _TOKEN_ERROR_USTRING);
            } else if (_TOKEN_STATE_STRING1_CHAR === context.state
                && "\"" === newChar) {
                _tokenizerCallback(context);
                return true;
            } else if (_TOKEN_STATE_STRING2_CHAR === context.state
                && "'" === newChar) {
                _tokenizerCallback(context);
                return true;
            }
            return false;
        };

        result[_TOKEN_STATE_STRING1_ESCAPE] =
        result[_TOKEN_STATE_STRING2_ESCAPE] = function (context, newChar) {
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
        };

        result[_TOKEN_STATE_SLASH] = function (context, newChar) {
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
        };

        result[_TOKEN_STATE_LCOMMENT] = function (context, newChar) {
            if ("\n" === newChar) {
                _tokenizerCallback(context);
            } else {
                context.chars.push(newChar);
            }
        };

        result[_TOKEN_STATE_COMMENT] = function (context, newChar) {
            context.chars.push(newChar);
            if ("/" === newChar
                && context.chars[context.chars.length - 2] === "*") {
                _tokenizerCallback(context);
                return true;
            }
            return false;
        };

        result[_TOKEN_STATE_SPACE] = function (context, newChar) {
            if (-1 < _TOKEN_SPACE_LIST.indexOf(newChar)) {
                context.chars.push(newChar);
            } else {
                _tokenizerCallback(context);
            }
        };

        result[_TOKEN_STATE_SYMBOL] = function (context, newChar) {
            if (-1 < _TOKEN_SYMBOL_LIST.indexOf(newChar)) {
                if (_isValidSymbol(context.chars, newChar)) {
                    context.chars.push(newChar);
                } else {
                    _tokenizerCallback(context);
                }
            } else {
                _tokenizerCallback(context);
            }
        };

        return result;
    }()),

    /**
     * Default analyzer (when no state is active)
     *
     * @param {Object} context
     * @param {String} newChar
     * @private
     */
    _noStateAnalyzer = function (context, newChar) {
        context.chars = [newChar];
        if (-1 < _TOKEN_IDENTIFIER_FIRSTCHAR.indexOf(newChar)) {
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
    },

    /**
     * Main parser function
     *
     * @param {Object} context tokenizer context
     * @param {String} newChar next char to analyze
     * @return {undefined}
     * @internal
     */
    _analyzeChar = function (context, newChar) {
        var stateAnalyzer = _stateAnalyzer[context.state];
        if (undefined !== stateAnalyzer) {
            if (stateAnalyzer(context, newChar)) {
                return;
            }
        }
        if (_TOKEN_STATE_NONE === context.state) {
            _noStateAnalyzer(context, newChar);
        }
    },

    /**
     * Compute next char position
     *
     * @param {Object} context tokenizer context
     * @param {String} newChar char that has been analyzed
     * @return {undefined}
     * @internal
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
     * @param {Object} context tokenizer context
     * @param {String} newChar char that will be analyzed
     * @return {undefined}
     * @internal
     */
    _tokenizeChar = function (context, newChar) {
        _analyzeChar(context, newChar);
        _computeNextPos(context, newChar);
    },

    /**
     * To reduce cyclomatic complexity, a map has been created to associate
     * last state to a specific action
     *
     * @type {object}
     * @internal
     */
    _finalStatesAction = (function () {
        var result = {};
        // Need to throw final callback
        result[_TOKEN_STATE_IDENTIFIER] = 1;
        result[_TOKEN_STATE_NUMBER] = 1;
        result[_TOKEN_STATE_LCOMMENT] = 1;
        result[_TOKEN_STATE_SYMBOL] = 1;
        // Symbol waiting to be thrown
        result[_TOKEN_STATE_SLASH] = 2;
        // Unterminated comment
        result[_TOKEN_STATE_COMMENT] = 3;
        // Unterminated string
        result[_TOKEN_STATE_STRING1_CHAR] = 4;
        result[_TOKEN_STATE_STRING2_CHAR] = 4;
        result[_TOKEN_STATE_STRING1_ESCAPE] = 4;
        result[_TOKEN_STATE_STRING2_ESCAPE] = 4;
        return result;
    }()),

    /**
     * Finalize tokenizer
     *
     * @param {Object} context tokenizer context
     * @internal
     */
    _tokenizerFinalize = function (context) {
        var action = _finalStatesAction[context.state];
        if (1 === action) {                  // Need to throw final callback
            _tokenizerCallback(context);
        } else if (2 === action) {            // Symbol waiting to be thrown
            context.state = _TOKEN_STATE_SYMBOL;
            _tokenizerCallback(context);
        } else if (3 === action) {                   // Unterminated comment
            _tokenizerCallback(context, _TOKEN_ERROR_UCOMMENT);
        } else if (4 === action) {                    // Unterminated string
            _tokenizerCallback(context, _TOKEN_ERROR_USTRING);
        }
        _gpfAssert(_TOKEN_STATE_NONE === context.state
            || _TOKEN_STATE_ERROR === context.state
            || _TOKEN_STATE_SPACE === context.state,
            "Unexpected non-final state");
    };

gpf.js = {};

_gpfExtend(gpf.js, {

    /**
     * Returns the list of known keyword
     *
     * @return {String[]}
     */
    keywords: function () {
        return _keywords;
    },

    /**
     * Identify tokens in the provided text, the source is supposed to be
     * complete (and valid).
     * @param {String} text Text to analyze
     * @param {Object/function} eventsHandler
     * @return {undefined}
     *
     * @eventParam {string} token The token value
     * @eventParam {number} pos Absolute position of the error (0-based)
     * @eventParam {number} line Absolute line position of the error
     *             (0-based)
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
    "[tokenize]": [gpf.$ClassEventHandler()],
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
            if ("number" !== typeof e) {
                throw e; // TODO: wrap and forward
            }
        }
    },

    /**
     * @see gpf.tokenize
     *
     * Identify tokens in the provided text, the parsing context is returned
     * so that it can be chained with consecutive calls.

     * @param {String} text Text to analyze. Use null to finalize the
     *        parsing
     * @param {Object/function} eventsHandler
     * @param {Object} context Tokenizer context (initialized if not set)
     * @return {undefined}
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
            if ("number" !== typeof e) {
                throw e; // TODO: wrap and forward
            }
        }
        return context;
    }

});

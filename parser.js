(function () { /* Begin of privacy scope */
    "use strict";

    var
        gpfI = gpf.interfaces;

    //region Pattern

    /*
     * Pattern grammar
     *
     * pattern
     *      : item+
     *
     * item
     *      : '[' char_match_include
     *      | char
     *
     * char_match_include : '^' char_match_exclude
     *                    | ']'
     *                    | char char_range_sep char_match_include
     *
     * char_match_exclude : ']'
     *                    | char char_range_sep char_match_exclude
     *
     * char_range_sep : '-' char
     *                |
     *
     * char : '\' escaped_char
     *      | <any char>
     */

    var
        _PATTERN_STATE_ITEM                     = 0,
        _PATTERN_STATE_CHAR_MATCH_INCLUDE       = 1,
        _PATTERN_STATE_CHAR_MATCH_EXCLUDE       = 2,
        _PATTERN_STATE_CHAR_RANGE_SEP           = 3,
        _PATTERN_STATE_CHAR                     = 5,
        _PATTERN_STATE_ESCAPED_CHAR             = 6,
        _PATTERN_STATES                         = 0,
        _PATTERN_TYPE_CHARS                     = 0,
        _PATTERN_TYPE_MATCH_CHAR                = 1,

        _patternNewItem = function (type) {
            var curItem = this.item;
            if (null === curItem || curItem.type !== type) {
                if (null !== this.last) {
                    this.last.then = curItem;
                }
                this.last = curItem;
                curItem = {
                    type: type
                };
                if (null === this.root) {
                    this.root = curItem;
                }
                this.item = curItem;
                this.then = null;
                if (_PATTERN_TYPE_CHARS === type) {
                    curItem.chars = [];
                } else if (_PATTERN_TYPE_MATCH_CHAR === type) {
                    curItem.include = [];
                    curItem.exclude = [];
                }
            }
        },
        _patternAddChar = function (char) {
            var
                curItem = this.item,
                type = curItem.type,
                arrayOfChars,
                first, last,
                idx;
            if (_PATTERN_TYPE_CHARS === type) {
                curItem.chars.push(char);
            } else if (_PATTERN_TYPE_MATCH_CHAR === type) {
                if (_PATTERN_STATE_CHAR_MATCH_INCLUDE === this.inState) {
                    arrayOfChars = curItem.include;
                } else {
                    arrayOfChars = curItem.exclude;
                }
                if (_PATTERN_STATE_CHAR_RANGE_SEP === this.afterChar) {
                    // First char of a range
                    arrayOfChars.push(char)
                } else {
                    first = arrayOfChars[arrayOfChars.length - 1].charCodeAt(0);
                    last = char.charCodeAt(0);
                    for (idx = first + 1; idx < last; ++idx) {
                        arrayOfChars.push(String.fromCharCode(idx));
                    }
                    arrayOfChars.push(char);
                }
            }
        },
        _patternDoChar = function (context, char, afterChar) {
            context.afterChar = afterChar;
            context.state = _PATTERN_STATE_CHAR;
            _PATTERN_STATES[context.state].apply(context, [char]);
        },
        _patternItem = function (char) {
            if ("[" === char) {
                _patternNewItem.apply(this, [_PATTERN_TYPE_MATCH_CHAR]);
                this.state = _PATTERN_STATE_CHAR_MATCH_INCLUDE;
            } else {
                _patternNewItem.apply(this, [_PATTERN_TYPE_CHARS]);
                _patternDoChar(this, char, _PATTERN_STATE_ITEM);
            }
        },
        _patternCharMatchInclude = function (char) {
            if ("^" === char) {
                this.state = _PATTERN_STATE_CHAR_MATCH_EXCLUDE;
            } else if ("]" === char) {
                this.state = _PATTERN_STATE_ITEM;
            } else {
                this.inState = _PATTERN_STATE_CHAR_MATCH_INCLUDE;
                _patternDoChar(this, char, _PATTERN_STATE_CHAR_RANGE_SEP);
            }
        },
        _patternCharMatchExclude = function (char) {
            if ("]" === char) {
                this.state = _PATTERN_STATE_ITEM;
            } else {
                this.inState = _PATTERN_STATE_CHAR_MATCH_EXCLUDE;
                _patternDoChar(this, char, _PATTERN_STATE_CHAR_RANGE_SEP);
            }
        },
        _patternCharRangeSep = function (char) {
            if ("-" === char) {
                this.afterChar = this.inState;
                this.state = _PATTERN_STATE_CHAR;
            } else {
                this.state = this.inState;
            }
            _PATTERN_STATES[this.state].apply(this, arguments);
        },
        _patternChar = function (char) {
            if ("\\" === char) {
                this.state = _PATTERN_STATE_ESCAPED_CHAR;
            } else {
                _patternAddChar.apply(this, arguments);
                this.state = this.afterChar;
            }
        },
        _patternEscapedChar = function (char) {
            _patternAddChar.apply(this, arguments);
            this.state = this.afterChar;
        },

        _patternParseContext = function () {
            if (0 === _PATTERN_STATES) {
                _PATTERN_STATES = [
                    // _PATTERN_STATE_ITEM
                    _patternItem,
                    // _PATTERN_STATE_CHAR_MATCH_INCLUDE
                    _patternCharMatchInclude,
                    // _PATTERN_STATE_CHAR_MATCH_EXCLUDE
                    _patternCharMatchExclude,
                    // _PATTERN_STATE_CHAR_RANGE_SEP
                    _patternCharRangeSep,
                    // _PATTERN_STATE_CHAR
                    _patternChar,
                    // _PATTERN_STATE_ESCAPED_CHAR
                    _patternEscapedChar
                ];
            }
            return {
                state: _PATTERN_STATE_ITEM,
                root: null,
                last: null,
                item: null
            };
        }

        ;


    /**
     * Patterns are designed to be an efficient and stream-able alternative to
     * regular expressions. However, the coverage is not the same
     *
     * Supported operators:
     *  [a-z^0-9], [^abc], ., ?, +, *
     *  [^a-z] exclude
     *  . any character
     *
     *
     * @class gpf.Pattern
     */
    gpf.Pattern = gpf.Class.extend({

        _root: null,

        /**
         * Constructor, check and compile the pattern
         *
         * @param {string} pattern
         */
        init: function (pattern) {
            var
                ctx = _patternParseContext(),
                idx,
                len = pattern.length;
            for (idx = 0; idx < len; ++idx) {
                _PATTERN_STATES[ctx.state].apply(ctx, [pattern.charAt(idx)]);
            }
            if (ctx.state !== _PATTERN_STATE_ITEM) {
                throw {
                    message: "Invalid syntax"
                };
            }
            this._root = ctx.root;
        },

        /**
         * Allocate a context to be used with write.
         * Context content may change, do not rely on its structure.
         *
         * @returns {object}
         */
        allocate: function () {
            return null;
        },

        /**
         * Write the characters to the provided context
         *
         * @param {object} context
         * @param {string} chars
         * @returns {number}
         *          0 if more data is needed
         *          -1 if the pattern is not matched
         *          Otherwise the length of the recognized pattern (since the
         *          first written character)
         */
        write: function (context, chars) {
            gpf.interfaces.ignoreParameter(context);
            gpf.interfaces.ignoreParameter(chars);
            return -1;
        }

    });

    //endregion

    //region Parser

    /**
     * This parser base class maintain the current stream position
     * And also offers some basic features to improve parsing speed
     *
     * @class gpf.Parser
     */
    gpf.Parser = gpf.Class.extend({

        "[Class]": [gpf.$InterfaceImplement(gpfI.ITextStream)],

        _pos: 0,
        _line: 0,
        _column: 0,
        _state: 0, // Initial state

        init: function () {
            this._init();
        },

        /**
         * Initialize Parser specific members
         *
         * @private
         */
        _init: function () {
            this._pos = 0;
            this._line = 0;
            this._column = 0;
            this._state = 0;
        },

        /**
         * Get current position
         *
         * @returns {{pos: number, line: number, column: number}}
         */
        currentPos: function () {
            return {
                pos: this._pos,
                line: this._line,
                column: this._column
            };
        },

        /**
         * Process the character
         *
         * @param {string} char
         *
         * @abstract
         * @private
         */
        _parse: function (char) {
            gpf.interfaces.ignoreParameter(char);
        },

        /**
         * Consider the current state and finalize the current token (if any),
         * go back to the initial state
         *
         * @abstract
         * @private
         */
        _reset: function () {
        },

        //region gpf.interfaces.ITextStream

        /**
         * @implements gpf.interfaces.ITextStream.read
         */
        read: function(count) {
            gpf.interfaces.ignoreParameter(count);
            return "";
        },

        /**
         * @implements gpf.interfaces.ITextStream.write
         */
        write: gpfI.ITextStream._write,

        write_: function (buffer) {
            var
                idx,
                char;
            if (null === buffer) {
                this._reset();
                this._init();
            } else {
                for (idx = 0; idx < buffer.length; ++idx) {
                    char = buffer.charAt(idx);
                    this._parse(char);
                    ++this._pos;
                    if ("\n" === char) {
                        ++this._line;
                        this._column = 0;
                    } else {
                        ++this._column;
                    }
                }
            }
        }

        //endregion

    });

    //endregion

}()); /* End of privacy scope */

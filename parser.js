(function () { /* Begin of privacy scope */
    "use strict";

    var
        gpfI = gpf.interfaces;

    //region Pattern

    /*
     * Pattern 'grammar'
     *
     * pattern
     *      : expression+
     *
     * expression
     *      : item ( '|' item )*
     *
     * item
     *      : match count?
     *
     * count
     *      : '?'
     *      | '*'
     *      | '+'
     *      | '{' <number> '}'
     *      | e
     *
     * match
     *      : '[' char_match_include
     *      | '(' expression ')'
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
     *                | e
     *
     * char : '\' escaped_char
     *      | <any char but ?*+{[(-[>
     */

/*
    var
        // abc
        _sample1 = [{seq: "abc"}],
        // [a-z]
        _sample2 = [{inc: "abc...xyz"}],
        // [a-z^de]
        _sample3 = [{inc: "abc...xyz", exc: "de"}],
        // a|b|c
        _sample4 = [{or: [[{seq: "a"}], [{seq: "b"}], [{seq: "c"}]]}]
        // ? => max: 1
        // * => min:0
        // + => min:1
    ;
*/

    function PatternParserContext() {
        this._root = [];
        this._stack = [];
        // The stack maintain the current pattern at first pos
        this._stack.push(this._root);
        this.parse = this._stateItem;
    }

    gpf.extend(PatternParserContext.prototype, {
        _root: [],
        _stack: [],
        _item : null,
        _inRange: false,
        _afterChar: null,

        parse: null, // Will be overridden

        get: function () {
            if (this.parse !== this._stateItem
                && this.parse !== this._stateCount) {
                throw {
                    message: "Invalid syntax"
                };
            }
            // T
            // Should return the internal representation of the pattern
            return this._root;
        },

        // Get or create the item corresponding to the requested type
        _getItem: function (type) {
            var curItem = this._item;
            if (null === curItem
                || "seq" !== type && undefined === curItem[type]) {
                curItem = {};
                this._stack[0].push(curItem);
                this._item = curItem;
                if ("seq" === type) {
                    curItem.seq = [];
                } else if ("inc" === type) {
                    curItem.inc = [];
                }
            }
            return curItem;
        },

        _addCharToItem: function (char) {
            var
                curItem = this._item,
                arrayOfChars,
                first, last,
                idx;
            if (undefined !== curItem.seq) {
                curItem.seq.push(char);
            } else if (undefined !== curItem.inc) {
                if (undefined !== curItem.exc) {
                    arrayOfChars = curItem.exc;
                } else {
                    arrayOfChars = curItem.inc;
                }
                if (this._inRange) {
                    first = arrayOfChars[arrayOfChars.length - 1].charCodeAt(0);
                    last = char.charCodeAt(0);
                    for (idx = first + 1; idx < last; ++idx) {
                        arrayOfChars.push(String.fromCharCode(idx));
                    }
                    arrayOfChars.push(char);
                } else {
                    // First char of a range
                    arrayOfChars.push(char);
                }
            }
        },

        _stateItem: function (char) {
            if ("[" === char) {
                this.parse = this._stateCharMatchRange;
            } else {
                this._getItem("seq");
                this._afterChar = this._stateCount;
                this._stateChar(char);
            }
        },

        _stateCharMatchRange: function (char) {
            var curItem = this._getItem("inc");
            if ("^" === char && undefined === curItem.exc) {
                curItem.exc = [];
                // this.parse = this._stateCharMatchRange;
            } else if ("]" === char) {
                this.parse = this._stateCount;
            } else {
                this._inRange = false;
                this._afterChar = this._stateCharRangeSep;
                this._stateChar(char);
            }
        },

        _stateCharRangeSep: function (char) {
            if ("-" === char) {
                this._inRange = true;
                this._afterChar = this._stateCharMatchRange;
                this.parse = this._stateChar;
            } else {
                this.parse = this._stateCharMatchRange;
            }
            this.parse(char);
        },

        _stateChar: function (char) {
            if ("\\" === char) {
                this.parse = this.stateEscapedChar;
            } else {
                this._addCharToItem(char);
                this.parse = this._afterChar;
            }
        },

        stateEscapedChar: function (char) {
            this._addCharToItem(char);
            this.parse = this._afterChar;
        },

        _stateCountByChar: {

            "?": function () {
                this._item.min = 0;
                this._item.max = 1;
            },

            "+": function () {
                this._item.min = 1;
            },

            "*": function () {
                this._item.min = 0;
            }

        },

        _stateCount: function (char) {
            var byChar = this._stateCountByChar[char];
            if (undefined === byChar) {
                this._stateItem(char);
            } else {
                byChar.apply(this, arguments);
            }
        }

    });

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
                context = new PatternParserContext(),
                idx,
                len = pattern.length;
            for (idx = 0; idx < len; ++idx) {
                context.parse(pattern.charAt(idx));
            }
            this._root = context.get();
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

(function () { /* Begin of privacy scope */
    "use strict";

    var
        gpfI = gpf.interfaces;

    //region ITokenizer

    gpfI.ITokenizer = gpfI.Interface.extend({

        /**
         * Submit a character to the tokenizer, result indicates if the token
         * is recognized
         *
         * @param {string} char One character to analyze
         * @returns {number} < 0 means won't recognize
         *                     0 means need more chars
         *                   > 0 means a token is recognized (length returned)
         *
         * NOTE: if the result is positive, you may submit more chars until
         */
        write: function (char) {
            gpf.interfaces.ignoreParameter(char);
            return 0;
        }

    });

    // endregion

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
     *
     * match
     *      : '[' char_match_include
     *      | '(' expression ')'
     *      | char
     *
     * char_match_include : '^' char_match_exclude
     *                    | ']'
     *                    | char char_range_sep? char_match_include
     *
     * char_match_exclude : ']'
     *                    | char char_range_sep? char_match_exclude
     *
     * char_range_sep : '-' char
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
            this._finalizeItem(this._item);
            // Should return the internal representation of the pattern
            return this._root;
        },

        _finalizeItem: function (item) {
            var member;
            for (member in item) {
                if (item.hasOwnProperty(member)) {
                    if (item[member] instanceof Array
                        && "string" === typeof item[member][0]) {
                        item[member] = item[member].join("");
                    }
                }
            }
        },

        // Get or create the item corresponding to the requested type
        _getItem: function (type) {
            var curItem = this._item;
            if (null === curItem
                || "seq" !== type && undefined === curItem[type]) {
                if (null !== curItem) {
                    this._finalizeItem(curItem);
                }
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
                this._stateCharMatchRange(char);
            }
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
            },

            "|": function () {
                var
                    item;
                if (1 === this._stack.length
                    || undefined === this._stack[1].or) {
                    this._stack.splice(1, 0, [{
                        or: []
                    }]);
                    if (this._root === this._stack[0]) {
                        this._root = this._stack[1];
                    }
                }
                item = this._stack[1][0];
                item.or.push(this._stack[0]);
                this._stack[0] = [];
                this._item = null;
            }

        },

        _stateCount: function (char) {
            var byChar = this._stateCountByChar[char];
            if (undefined === byChar) {
                this._stateItem(char);
            } else {
                byChar.apply(this, arguments);
                this.parse = this._stateItem;
            }
        }

    });

    var PatternTokenizer = gpf.Class.extend({

        "[Class]": [gpf.$InterfaceImplement(gpfI.ITokenizer)],

        /**
         * @member {gpf.Pattern} _pattern
         * @private
         */
        _pattern: null,

        /**
         * @member {object[]} _items Current items
         * @private
         */
        _items: null,

        /**
         * @member {number} _itemIdx Current item index
         * @private
         */
        _itemIdx: 0,

        /**
         * @member {number} _pos Current position inside the current item
         * @private
         */
        _pos: 0,

        /**
         * @member {number} _length Match length
         * @private
         */
        _length: 0,

        /**
         *
         * @param {gpf.Pattern} pattern
         */
        init: function (pattern) {
            this._pattern = pattern;
            this._items = pattern._root;
        },

        //region ITokenizer

        /**
         * @implements gpf.interfaces.ITokenizer:write
         */
        write: function (char) {
            if (this._itemIdx === this._items.length || -1 === this._length) {
                // Nothing else to match
                return this._length;
            }
            var item = this._items[this._itemIdx];
            if (undefined !== item.seq) {
                if (char !== item.seq.charAt(this._pos)) {
                    this._length = -1;
                    return -1; // No match
                }
                ++this._length;
                if (++this._pos < item.seq.length) {
                    return 0; // Need more data
                }
            } else if (undefined !== item.inc) {
                if ((item.inc.length !== 0 && -1 === item.inc.indexOf(char))
                    || (item.exc && -1 < item.exc.indexOf(char))) {
                    this._length = -1;
                    return -1; // No match
                }
                ++this._length;
            }
            this._pos = 0;
            if (++this._itemIdx < this._items.length) {
                return 0; // Need more data (what if optional?)
            }
            return this._length;
        }

        //endregion

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
         * @returns {PatternTokenizer}
         */
        allocate: function () {
            return new PatternTokenizer(this);
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

(function () { /* Begin of privacy scope */
    "use strict";

    var
        gpfI = gpf.interfaces;

    //region ITokenizer

    /**
     * @interface
     */
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
            return -1;
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

    var
        /**
         * Pattern item: an atomic character matching item
         *
         * @class {PatternItem}
         */
        PatternItem = gpf.Class.extend({

            /**
             * Returns the item type (PatternItem.TYPE_xxx)
             *
             * @type {number}
             */
            "[_type]": [gpf.$ClassProperty()],
            _type: -1,

            /**
             * Item parent (may be null)
             *
             * @type {PatternItem}
             */
            "[_parent]": [gpf.$ClassProperty(true)],
            _parent: null,

            /**
             * Next item: used to chain items together
             *
             * @type {PatternItem}
             */
            next: function (value) {
                if (undefined === value) {
                    return this._next;
                } else {
                    this._next = value;
                    // Forward parent
                    value.parent(this._parent);
                }
            },
            _next: null,

            /**
             * Min number of item iteration
             *
             * @type {number}
             */
            "[_min]": [gpf.$ClassProperty(true)],
            _min: 1,

            /**
             * Maximum number of item iteration
             * 0 means unlimited
             *
             * @type {number}
             */
            "[_max]": [gpf.$ClassProperty(true)],
            _max: 1,

            /**
             * @constructor
             * @param {number} type
             */
            init: function (type) {
                this._type = type;
            },

            /**
             * Compiling time:
             *  adds a character to the item
             *
             * @param {string} char Character to add
             * @param {boolean} inRange Used for range parsing (preceded by -)
             */
            add: function (char, inRange) {
                gpf.interfaces.ignoreParameter(char);
                gpf.interfaces.ignoreParameter(inRange);
            },

            /**
             * Compiling time:
             *  finalize the item
             */
            finalize: function () {
            },

            /**
             * Run time:
             *  item will be evaluated, reset tokenizer state
             *
             * @param {object} state Free structure to add values to
             */
            reset: function (state) {
                gpf.interfaces.ignoreParameter(state);
            },

            /**
             * Run time:
             *  item evaluation with a character
             *
             * @param {object} state Free structure containing current state
             * @param {string} char character to test the pattern with
             * @return {number} Matching result, see PatternItem.WRITE_xxx
             */
            write: function (state, char) {
                gpf.interfaces.ignoreParameter(state);
                gpf.interfaces.ignoreParameter(char);
                return -1;
            }

        }),

        /**
         * Simple pattern item: recognizes a sequence of characters
         *
         * @class {PatternSimpleItem}
         * @extend {PatternItem}
         */
        PatternSimpleItem  = PatternItem.extend({

            /**
             * The character sequence ([] at design time)
             * @type {string|string[]}
             */
            "[_seq]": [gpf.$ClassProperty(false, "sequence")],
            _seq: "",

            /**
             * @constructor
             */
            init: function () {
                this._super(PatternItem.TYPE_SIMPLE);
                this._seq = [];
            },

            /**
             * @inheritDoc PatternItem:add
             */
            add: function (char, inRange) {
                gpf.interfaces.ignoreParameter(inRange);
                this._seq.push(char);
            },

            /**
             * @inheritDoc PatternItem:finalize
             */
            finalize: function () {
                this._seq = this._seq.join("");
            },

            /**
             * @inheritDoc PatternItem:reset
             */
            reset: function (state) {
                state.pos = 0;
            },

            /**
             * @inheritDoc PatternItem:write
             */
            write: function (state, char) {
                if (char !== this._seq.charAt(state.pos)) {
                    return PatternItem.WRITE_NO_MATCH;
                }
                ++state.pos;
                if (state.pos < this._seq.length) {
                    return PatternItem.WRITE_NEED_DATA;
                } else {
                    return PatternItem.WRITE_MATCH;
                }
            }
        }),


        /**
         * Range pattern item: recognizes one char
         * (using include/exclude patterns)
         *
         * @class {PatternRangeItem}
         * @extend {PatternItem}
         */
        PatternRangeItem = PatternItem.extend({

            /**
             * Included characters
             * @type {string|string[]}
             */
            _inc: "",

            /**
             * Excluded characters
             * @type {string|string[]}
             */
            _exc: "",

            init: function () {
                this._super(PatternItem.TYPE_RANGE);
                this._inc = [];
            },

            /**
             * Returns true if the exclude part is defined
             *
             * @returns {boolean}
             */
            hasExclude: function () {
                return this.hasOwnProperty("_exc");
            },

            /**
             * Defines the exclude part
             *
             * @returns {boolean}
             */
            enterExclude: function () {
                this._exc = [];
            },

            /**
             * @inheritDoc PatternItem:add
             */
            add: function (char, inRange) {
                var
                    arrayOfChars,
                    first,
                    last;
                if (this.hasExclude()) {
                    arrayOfChars = this._exc;
                } else {
                    arrayOfChars = this._inc;
                }
                if (inRange) {
                    first = arrayOfChars[arrayOfChars.length - 1].charCodeAt(0);
                    last = char.charCodeAt(0);
                    while (--last > first) {
                        arrayOfChars.push(String.fromCharCode(last));
                    }
                    arrayOfChars.push(char);
                } else {
                    // First char of a range
                    arrayOfChars.push(char);
                }
            },

            /**
             * @inheritDoc PatternItem:finalize
             */
            finalize: function () {
                this._inc = this._inc.join("");
                if (this.hasExclude()) {
                    this._exc = this._exc.join("");
                }
            },

            /**
             * @inheritDoc PatternItem:write
             */
            write: function (state, char) {
                gpf.interfaces.ignoreParameter(state);
                var match;
                if (this._inc.length) {
                    match = -1 < this._inc.indexOf(char);
                } else {
                    match = true;
                }
                if (match && this._exc.length) {
                    match = -1 === this._exc.indexOf(char);
                }
                if (match) {
                    return PatternItem.WRITE_MATCH;
                } else {
                    return PatternItem.WRITE_NO_MATCH;
                }
            }

        }),

        PatternChoiceItem = PatternItem.extend({

            /**
             * @type {PatternItem[]}
             */
            _choices: [],

            /**
             * @inheritDoc PatternItem:next
             *
             * Overridden to 'add' the choice
             */
            next: function (item) {
                if (undefined === item) {
                    /*
                     * The only way to have something *after* is to use ()
                     * In that case, it would go through the parent
                     */
                    return null;
                } else {
                    var
                        parent = item.parent(),
                        pos;
                    this._choices.push(item);
                    item.parent(this);
                    if (1 === this._choices.length) {
                        // Care about parent
                        if (null === parent) {
                            return; // Nothing to care about
                        }
                        if (parent.type() !== PatternItem.TYPE_GROUP) {
                            throw {
                                message: "Unexpected"
                            };
                        }
                        // TODO should be the last
                        pos = gpf.test(parent._items, item);
                        if (undefined === pos) {
                            throw {
                                message: "Unexpected"
                            };
                        }
                        parent._items[pos] = this;
                        this._parent = parent;
                    }
                }
            },

            init: function () {
                this._super(PatternItem.TYPE_CHOICE);
                this._choices = [];
            },

            /**
             * @inheritDoc PatternItem:write
             */
            write: function (state, char) {
                // Try all choices and stop on the first one that works
                var
                    tmpState = {},
                    idx,
                    item,
                    result;
                for (idx = this._choices.length; idx > 0;) {
                    item = this._choices[--idx];
                    item.reset(tmpState);
                    result = item.write(tmpState, char);
                    if (PatternItem.WRITE_NO_MATCH !== result) {
                        state.replaceItem = item;
                        gpf.extend(state, tmpState);
                        return result;
                    }
                }
                return PatternItem.WRITE_NO_MATCH;
            }

        }),

        PatternGroupItem = PatternItem.extend({

            /**
             * @type {PatternItem[]}
             */
            _items: [],

            /**
             * @inheritDoc PatternItem:next
             *
             * Overridden to 'add' the choice
             */
            next: function (value) {
                if (undefined === value) {
                    return this._next;
                } else {
                    if (this._items.length) {
                        this._next = value;
                        value.parent(this._parent);
                    } else {
                        this._items.push(value);
                        value.parent(this);
                    }
                }
            },

            init: function () {
                this._super(PatternItem.TYPE_GROUP);
                this._items = [];
            },

            /**
             * @inheritDoc PatternItem:reset
             */
            reset: function (state) {
                this._items[0].reset(state);
            },

            /**
             * @inheritDoc PatternItem:write
             */
            write: function (state, char) {
                var item = this._items[0];
                state.replaceItem = item;
                return item.write(state, char);
            }

        });

    gpf.extend(PatternItem, {
        TYPE_SIMPLE: 0,
        TYPE_RANGE: 1,
        TYPE_CHOICE: 2,
        TYPE_GROUP: 3,

        WRITE_NO_MATCH: -1,
        WRITE_NEED_DATA: 0,
        WRITE_MATCH: 1,

        _factory: null,

        /**
         * Factory of PatternItem
         *
         * @param {number} type
         * @returns {PaternItem}
         */
        create: function (type) {
            var factory = PatternItem._factory;
            if (!factory) {
                factory = PatternItem._factory = {};
                factory[this.TYPE_SIMPLE] = PatternSimpleItem;
                factory[this.TYPE_RANGE] = PatternRangeItem;
                factory[this.TYPE_CHOICE] = PatternChoiceItem;
                factory[this.TYPE_GROUP] = PatternGroupItem;
            }
            return new (factory[type])();
        }
    });

    var PatternParserContext = gpf.Class.extend({

        _root: null,
        _item : null,
        _inRange: false,
        _afterChar: null,

        parse: null, // Will be overridden

        init: function() {
            this.parse = this._stateItem;
        },

        /**
         * Finalizes the last item and returns the root
         *
         * @returns {PatternItem}
         */
        root: function () {
            if (null === this._item) {
                throw {
                    message: "Empty pattern"
                };
            }
            this._item.finalize();
            if (this.parse !== this._stateItem
                && this.parse !== this._stateCount) {
                throw {
                    message: "Invalid syntax"
                };
            }
            return this._root;
        },

        /**
         * Get or create the item corresponding to the requested type
         *
         * @param {number} type See PatternItem.TYPE_xxx
         * @param {boolean} force Ignore current item type, allocate new one
         * @returns {PatternItem}
         * @private
         */
        _getItem: function (type, force) {
            var
                item = this._item,
                nextItem;
            if (force || null === item || type !== item.type()) {
                nextItem = PatternItem.create(type);
                if (null !== item) {
                    item.finalize();
                    item.next(nextItem);
                } else {
                    this._root = nextItem;
                }
                this._item = nextItem;
                item = nextItem;
            }
            return item;
        },

        /**
         * Parsing automate state
         * @param {string} char
         * @private
         */
        _stateItem: function (char) {
            if ("[" === char) {
                this._getItem(PatternItem.TYPE_RANGE, true);
                this.parse = this._stateCharMatchRange;
            } else if ("(" === char) {
                this._getItem(PatternItem.TYPE_GROUP, true);
            } else {
                this._getItem(PatternItem.TYPE_SIMPLE);
                this._afterChar = this._stateCount;
                this._stateChar(char);
            }
        },

        /**
         * Parsing automate state
         * @param {string} char
         * @private
         */
        _stateCharMatchRange: function (char) {
            var curItem = this._getItem(PatternItem.TYPE_RANGE);
            if ("^" === char && !curItem.hasExclude()) {
                curItem.enterExclude();
                // this.parse = this._stateCharMatchRange;
            } else if ("]" === char) {
                this.parse = this._stateCount;
            } else {
                this._inRange = false;
                this._afterChar = this._stateCharRangeSep;
                this._stateChar(char);
            }
        },

        /**
         * Parsing automate state
         * @param {string} char
         * @private
         */
        _stateCharRangeSep: function (char) {
            if ("-" === char) {
                this._inRange = true;
                this._afterChar = this._stateCharMatchRange;
                this.parse = this._stateChar;
            } else {
                this._stateCharMatchRange(char);
            }
        },

        /**
         * Parsing automate state
         * @param {string} char
         * @private
         */
        _stateChar: function (char) {
            if ("\\" === char) {
                this.parse = this._stateEscapedChar;
            } else {
                this._item.add(char, this._inRange);
                this.parse = this._afterChar;
            }
        },

        /**
         * Parsing automate state
         * @param {string} char
         * @private
         */
        _stateEscapedChar: function (char) {
            this._item.add(char, this._inRange);
            this.parse = this._afterChar;
        },

        /**
         * Parsing automate state
         * @type {object} map character to parsing function
         * @private
         */
        _stateCountByChar: {

            "?": function () {
                var item = this._splitSimpleOnMinMax();
                item.min(0);
            },

            "+": function () {
                var item = this._splitSimpleOnMinMax();
                item.max(0);
            },

            "*": function () {
                var item = this._splitSimpleOnMinMax();
                item.min(0);
                item.max(0);
            },

            "|": function () {
                var
                    item = this._item,
                    choice = item.parent();
                if (null === choice
                    || choice.type() !== PatternItem.TYPE_CHOICE) {
                    choice = PatternItem.create(PatternItem.TYPE_CHOICE);
                    choice.next(item); // Overridden to 'add' the choice
                }
                if (item === this._root) {
                    this._root = choice;
                }
                item.finalize();
                this._item = choice;
            },

            ")": function () {
                var
                    item = this._item;
                item.finalize();
                while (item.type() !== PatternItem.TYPE_GROUP) {
                    item = item.parent();
                }
                if (item === this._item) {
                    throw {
                        message: "Syntax error (empty group)"
                    };
                }
                this._item = item;
                return 0; // !undefined
            }

        },

        /**
         * Split current item if necessary for min/max
         * @return {ParserItem}
         * @private
         */
        _splitSimpleOnMinMax: function () {
            var
                item = this._item,
                lastChar;
            if (item.type() === PatternItem.TYPE_SIMPLE
                && item.sequence().length > 1) {
                lastChar = item.sequence().pop();
                item = this._getItem(PatternItem.TYPE_SIMPLE, true);
                item.add(lastChar);
            }
            return item;
        },

        /**
         * Parsing automate state
         * @param {string} char
         * @private
         */
        _stateCount: function (char) {
            var byChar = this._stateCountByChar[char];
            if (undefined === byChar) {
                this._stateItem(char);
            } else {
                if (undefined === byChar.apply(this, arguments)) {
                    this.parse = this._stateItem;
                }
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
         * @member {PatternItem} _item Current item
         * @private
         */
        _item: null,

        _state: {
            result: 0,
            length : 0,
            matchingLength: 0,
            count: 0
        },

        /**
         * @param {gpf.Pattern} pattern
         */
        init: function (pattern) {
            this._pattern = pattern;
            this._item = pattern._root;
            this._state = {
                result: 0,
                length : 0,
                matchingLength: 0,
                count: 0
            };
            this._item.reset(this._state);
        },

        /**
         * Get the item following the provided one
         *
         * @param {PatternItem} item
         * @returns {PatternItem|null}
         * @private
         */
        _getNext: function (item) {
            var
                result = item.next();
            while (null === result) {
                item = item.parent();
                if (null === item) {
                    break;
                }
                result = item.next();
            }
            return result;
        },

        /**
         * Handles situation when current item does not match on char
         *
         * @param {string} char
         * @returns {number} write result
         * @private
         */
        _writeNoMatch: function (char) {
            var
                state = this._state,
                item = this._item;
            if (state.count < item.min() // Not enough match
                // or at least two characters went through
                || state.length > state.matchingLength + 1) {
                // Terminal error
                state.result = -1;
                this._item = null; // No need to go any further
                return -1;
            }
            item = this._getNext(item);
            if (null === item) {
                if (0 === state.matchingLength) {
                    state.result = -1;
                } else {
                    state.result = state.matchingLength;
                }
                this._item = null;
                return state.result;
            }
            item.reset(state);
            this._item = item;
            state.count = 0;
            --state.length;
            return this.write(char); // Try with this one
        },

        /**
         * Handles situation when current item matches on char
         *
         * @returns {number} write result
         * @private
         */
        _writeMatch: function () {
            var
                state = this._state,
                item = this._item,
                nextItem = this._getNext(item);
            state.matchingLength = state.length;
            ++state.count;
            if (0 === item.max()) {
                // Unlimited
                item.reset(state);
                if (null !== nextItem) {
                    state.result = PatternItem.WRITE_NEED_DATA;
                } else {
                    // Last item with unlimited occurrences
                    state.result = state.length;
                }
            } else if (state.count === item.max()) {
                item = nextItem;
                this._item = item;
                if (null === item) {
                    state.result = state.length;
                } else {
                    item.reset(state);
                    state.count = 0;
                    state.result = 0;
                    if (0 === item.min()) {
                        // TODO this search should be done only once
                        nextItem = this._getNext(item);
                        while (nextItem && 0 === nextItem.min()) {
                            nextItem = this._getNext(nextItem);
                        }
                        if (!nextItem) {
                            // The rest being optional...
                            state.result = state.matchingLength;
                        }
                    }
                }
            } else {
                state.result = PatternItem.WRITE_NEED_DATA;
            }
            return state.result;
        },

        //region ITokenizer

        /**
         * @implements gpf.interfaces.ITokenizer:write
         */
        write: function (char) {
            var
                result,
                state = this._state,
                item = this._item;
            if (null !== item) {
                result = item.write(state, char);
                ++state.length;
                if (undefined !== state.replaceItem) {
                    this._item = state.replaceItem;
                }
                // Not enough data to conclude
                if (PatternItem.WRITE_NEED_DATA === result) {
                    return state.result; // Whatever the previous result
                }
                if (PatternItem.WRITE_NO_MATCH === result) {
                    return this._writeNoMatch(char);
                } else {
                    return this._writeMatch();
                }
            }
            return state.result;
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
            this._root = context.root();
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

/*#ifndef(UMD)*/
"use strict";
/*global _gpfAssert*/ // Assertion method
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _GpfEventsIsValidHandler*/ // Check event handler validity
/*#endif*/

_gpfErrorDeclare("pattern", {
    "patternUnexpected":
        "Invalid syntax (unexpected)",
    "patternEmpty":
        "Empty pattern",
    "patternInvalidSyntax":
        "Invalid syntax",
    "patternEmptyGroup":
        "Syntax error (empty group)"
});

var
    bitTest = gpf.bin.test,
    bitClear = gpf.bin.clear,

//region ITokenizer

    /**
     * Tokenizer interface
     *
     * @interface gpf.interfaces.ITokenizer
     * @extends gpf.interfaces.Interface
     */
    _ITokenizer = gpf._defIntrf("ITokenizer", {

        /**
         * Submit a character to the tokenizer, result indicates if the
         * token is recognized
         *
         * @param {String} char One character to analyze
         * @return {Number} < 0 means won't recognize
         *                    0 means need more chars
         *                  > 0 means a token is recognized (length result)
         *
         * NOTE: if the result is positive, you may submit more chars and
         * check if it changes.
         */
        write: function (char) {
            gpf.interfaces.ignoreParameter(char);
            return -1;
        }

    }),

// endregion

//region Pattern

/**
 * Pattern structure
 * -----------------
 *
 * [a-zA-Z][a-zA-Z0-9]* is represented by
 *
 * PatternGroup
 * |
 * +- PatternRange
 * |
 * +- PatternRange(max:0)
 *
 *
 * Pattern 'grammar'
 * -----------------
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

    /**
     * Pattern item: an atomic character matching item
     *
     * @class PatternItem
     * @abstract
     * @private
     * @abstract
     */
    PatternItem = _gpfDefine("PatternItem", {

        "-": {

            /**
             * Min number of item iteration
             *
             * @type {Number}
             * @private
             */
            "[_min]": [gpf.$ClassProperty(true)],
            _min: 1,

            /**
             * Maximum number of item iteration
             * 0 means unlimited
             *
             * @type {Number}
             * @private
             */
            "[_max]": [gpf.$ClassProperty(true)],
            _max: 1

        },

        "+": {

            //region Parsing time

            /**
             * Parse the character (in the context of the pattern item)
             *
             * @param {String} char Character to parse
             * @return {Number} see PatternItem.PARSE_xxx
             * @abstract
             */
            parse: function (char) {
                gpf.interfaces.ignoreParameter(char);
                throw gpf.Error.abstract();
                // return PatternItem.PARSE_IGNORED;
            },

            /**
             * finalize the item
             *
             * @abstract
             */
            finalize: function () {
            },

            //endregion

            //region Execution time

            /**
             * item will be evaluated, reset tokenizer state
             *
             * @param {Object} state Free structure to add values to
             * @abstract
             */
            reset: function (state) {
                gpf.interfaces.ignoreParameter(state);
            },

            /**
             * item evaluation with a character
             *
             * @param {Object} state Free structure containing current state
             * @param {String} char character to test the pattern with
             * @return {Number} Matching result, see PatternItem.WRITE_xxx
             * @abstract
             */
            write: function (state, char) {
                gpf.interfaces.ignoreParameter(state);
                gpf.interfaces.ignoreParameter(char);
                throw gpf.Error.abstract();
                // return -1;
            }

            //endregion

        },

        "~": {

            PARSE_IGNORED: 0,
            PARSE_PROCESSED: 1,
            PARSE_END_OF_PATTERN: 2,
            PARSE_PROCESSED_EOP: 3, // PROCESSED + END OF PATTERN

            CHARS_QUANTIFICATION: "?*+",

            WRITE_NO_MATCH: -1,
            WRITE_NEED_DATA: 0,
            WRITE_MATCH: 1,
            WRITE_PATTERN_END: 2,
            WRITE_FINAL_MATCH: 3

        }

    }),

    /**
     * Char pattern: recognizes one character
     *
     * @class PatternChar
     * @extends PatternItem
     * @private
     */
    PatternChar = _gpfDefine("PatternChar", PatternItem, {

        "-": {

            /**
             * The character to match
             *
             * @type {string}
             * @private
             */
            _match: ""

        },

        "+": {

            /**
             * @inheritdoc PatternItem#parse
             */
            parse: function (char) {
                this._match = char;
                return PatternItem.PARSE_PROCESSED_EOP;
            },

            /**
             * @inheritdoc PatternItem#write
             */
            write: function (state, char) {
                gpf.interfaces.ignoreParameter(state);
                if (char === this._match) {
                    return PatternItem.WRITE_FINAL_MATCH;
                }
                return PatternItem.WRITE_NO_MATCH;
            }

        }

    }),

    /**
     * Range pattern: recognizes one char defined by a range
     * (using include/exclude patterns)
     *
     * @class PatternRange
     * @extends PatternItem
     * @private
     */
    PatternRange = _gpfDefine("PatternRange", PatternItem, {

        "-": {

            /**
             * Included characters
             *
             * @type {string|string[]}
             * @private
             */
            _inc: "",

            /**
             * Excluded characters
             *
             * @type {string|string[]}
             * @private
             */
            _exc: "",

            /**
             * While parsing: the next char is used for a range
             * specification
             *
             * @type {Boolean}
             * @private
             */
            _inRange: false,

            /**
             * Reduce the cyclomatic complexity of parse
             *
             * @param {String} char Character to parse
             * @param {String[]} chars Character array of already parsed
             * chars
             * @return {Boolean} True means PARSE_PROCESSED_EOP, otherwise
             * PARSE_PROCESSED is returned
             */
            _parse: function (char, chars) {
                var
                    first,
                    last;
                if ("^" === char) {
                    this._exc = [];
                } else if ("]" === char) {
                    if (this._inRange) {
                        throw gpf.Error.patternInvalidSyntax();
                    }
                    return true;
                } else if ("-" === char) {
                    if (this._inRange || 0 === chars.length) {
                        throw gpf.Error.patternInvalidSyntax();
                    }
                    this._inRange = true;
                } else {
                    if (this._inRange) {
                        first = chars[chars.length - 1].charCodeAt(0);
                        last = char.charCodeAt(0);
                        while (--last > first) {
                            chars.push(String.fromCharCode(last));
                        }
                        chars.push(char);
                        delete this._inRange;
                    } else {
                        // First char of a range
                        chars.push(char);
                    }
                }
                return false;
            }

        },

        "+": {

            /**
             * @inheritdoc PatternItem#parse
             */
            parse: function (char) {
                var
                    chars;
                if (this.hasOwnProperty("_exc")) {
                    if ("^" === char) {
                        throw gpf.Error.patternInvalidSyntax();
                    }
                    chars = this._exc;
                } else {
                    chars = this._inc;
                }
                if ("[" === char) {
                    if (this.hasOwnProperty("_inc")) {
                        throw gpf.Error.patternInvalidSyntax();
                    }
                    this._inc = [];
                } else if (this._parse(char, chars)) {
                    return PatternItem.PARSE_PROCESSED_EOP;
                }
                return PatternItem.PARSE_PROCESSED;
            },

            /**
             * @inheritdoc PatternItem#finalize
             */
            finalize: function () {
                this._inc = this._inc.join("");
                if (this.hasOwnProperty("_exc")) {
                    this._exc = this._exc.join("");
                }
            },

            /**
             * @inheritdoc PatternItem#write
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
                    return PatternItem.WRITE_FINAL_MATCH;
                } else {
                    return PatternItem.WRITE_NO_MATCH;
                }
            }

        }

    }),

    /**
     * Group pattern: group several patterns
     * May also be a 'choice' pattern
     *
     * @class PatternGroup
     * @extends PatternItem
     * @private
     */
    PatternGroup = _gpfDefine("PatternGroup", PatternItem, {

        "-": {

            /**
             * Contains either an item list or a list of item list
             * (if transformed into a choice)
             *
             * @type {PatternItem[]|(PatternItem[])[]}
             * @private
             */
            _items: [],

            /**
             * Choice group (with |)
             *
             * @type {Boolean}
             * @private
             */
            _choice: false,

            /**
             * Computed during the finalization phase, this array keep track
             * of the index of last item that is not optional in the group.
             *
             * @type {Number[]}
             * @private
             */
            _optionals: [],

            /**
             * True if the opening parenthesis has been parsed
             *
             * @type {Boolean}
             * @private
             */
            _parsedParenthesis: false,

            /**
             * Currently parsed item
             *
             * @type {PatternItem}
             * @private
             */
            _parsedItem: null,

            /**
             * Get the current list of items
             *
             * @param {Number} [pos=undefined] When choices, get the items
             * at the given position (last one when undefined). Ignored
             * otherwise.
             * @return {PatternItem[]}
             * @private
             */
            _getItems: function (pos) {
                if (this._choice) {
                    if (undefined === pos) {
                        pos = this._items.length - 1;
                    }
                    return this._items[pos];
                }
                return this._items;
            },

            /**
             * Get the last parsed item
             *
             * @type {PatternItem}
             * @private
             */
            _lastItem: function () {
                var
                    items = this._getItems();
                return items[items.length - 1];
            },

            /**
             * Push a new item to be parsed
             *
             * @param {PatternItem} item
             * @return {PatternItem}
             * @private
             */
            _push: function (item) {
                this._getItems().push(item);
                this._parsedItem = item;
                return item;
            },

            /**
             * Reduce the cyclomatic complexity of parse
             * Process current item
             *
             * @param {String} char
             * @return {Number}
             * @private
             */
            _parseItem: function (char) {
                var
                    parsedItem = this._parsedItem,
                    result;
                if (parsedItem) {
                    result = parsedItem.parse(char);
                    if (bitTest(result, PatternItem.PARSE_END_OF_PATTERN)) {
                        parsedItem.finalize();
                        this._parsedItem = null;
                        // Remove the flag
                        result = bitClear(result,
                            PatternItem.PARSE_END_OF_PATTERN);
                    }
                } else {
                    result = 0;
                }
                return result;
            },

            /**
             * Reduce the cyclomatic complexity of parse
             * Process quantification char
             *
             * @param {String} char
             * @return {Number}
             * @private
             */
            _parseQuantity: function (char) {
                var
                    parsedItem = this._lastItem();
                if ("*" === char) {
                    parsedItem._min = 0;
                    parsedItem._max = 0;
                } else if ("+" === char) {
                    parsedItem._max = 0;
                } else if ("?" === char) {
                    parsedItem._min = 0;
                }
                return PatternItem.PARSE_PROCESSED;
            },

            /**
             * Return the position from which all items can be optional
             *
             * @param {PatterItem[]} items
             * @return {Number}
             * @private
             */
            _getOptional: function (items) {
                var
                    idx;
                idx = items.length;
                while (idx--) {
                    if (0 !== items[idx].min()) {
                        ++idx;
                        break;
                    }
                }
                return idx;
            },

            /**
             * Reset for the provided item
             *
             * @param {PatternItem} item
             * @param {Object} state
             * @private
             */
            _reset: function (item, state) {
                state.count = 0;
                state.sub = {};
                item.reset(state.sub);
            },

            /**
             * Modify state to move to (and get) the next item (if any)
             *
             * @param {Object} state
             * @param {Number} index
             * @return {PatternItem}
             * @private
             */
            _getItem: function (state, index) {
                var items = this._getItems(state.choice);
                if (index < items.length) {
                    return items[index];
                }
                return null;
            },

            /**
             * Handles situation when current item does not match on char
             *
             * @param {PatternItem} item
             * @param {Object} state
             * @param {String} char
             * @return {Number} write result
             * @private
             */
            _writeNoMatch: function (item, state, char) {
                if (state.count < item.min() // Not enough match
                        // or at least two characters went through
                    || state.length > state.matchingLength + 1) {
                    // Terminal error
                    return PatternItem.WRITE_NO_MATCH;
                }
                item = this._getItem(state, state.index + 1);
                if (null === item) {
                    return PatternItem.WRITE_NO_MATCH;
                }
                ++state.index;
                this._reset(item, state);
                return this.write(state, char); // Try with this one
            },

            /**
             * Handles situation when current item matches on char
             *
             * @param {PatternItem} item
             * @return {Number} write result
             * @private
             */
            _writeMatch: function (item, state) {
                var
                    nextItem = this._getItem(state, state.index + 1),
                    optional;
                if (this._choice && -1 < state.choice) {
                    optional = this._optionals[state.choice];
                } else {
                    optional = this._optionals[0];
                }
                ++state.count;
                if (0 === item.max()) {
                    // Unlimited
                    this._reset(item, state);
                    if (null !== nextItem && optional > state.index) {
                        return PatternItem.WRITE_NEED_DATA;
                    } else {
                        // Last (or equivalent) so...
                        return PatternItem.WRITE_MATCH;
                    }
                } else if (state.count === item.max()) {
                    if (null === nextItem) {
                        return PatternItem.WRITE_FINAL_MATCH;
                    }
                    ++state.index;
                    this._reset(nextItem, state);
                    if (optional <= state.index) {
                        return PatternItem.WRITE_MATCH;
                    }
                }
                return PatternItem.WRITE_NEED_DATA;
            }

        },

        "+": {

            /**
             * @constructor
             */
            constructor: function () {
                this._items = [];
            },

            /**
             * @inheritdoc PatternItem#parse
             */
            parse: function (char) {
                var
                    result = this._parseItem(char);
                if (0 !== result) {
                    return result;
                }
                if (-1 < PatternItem.CHARS_QUANTIFICATION.indexOf(char)) {
                    return this._parseQuantity(char);
                }
                if ("|" === char) {
                    if (!this._choice) {
                        this._items = [this._items];
                        this._choice = true;
                    }
                    this._items.push([]);
                    return PatternItem.PARSE_PROCESSED;
                } else if ("[" === char) {
                    this._push(new PatternRange());
                } else if ("(" === char) {
                    if (this._parsedParenthesis) {
                        this._push(new PatternGroup());
                    } else {
                        this._parsedParenthesis = true;
                        return PatternItem.PARSE_PROCESSED;
                    }
                } else if (")" === char) {
                    return PatternItem.PARSE_PROCESSED_EOP;
                } else {
                    this._push(new PatternChar());
                }
                return this._parseItem(char);
            },

            /**
             * @inheritdoc PatternItem#finalize
             */
            finalize: function () {
                var
                    len,
                    idx,
                    array;
                // Compute optionals
                array = this._optionals = [];
                if (this._choice) {
                    len = this._items.length;
                    for (idx = 0; idx < len; ++idx) {
                        array.push(this._getOptional(this._items[idx]));
                    }
                } else {
                    array.push(this._getOptional(this._items));
                }
                // TODO in case of choice, verify they are exclusive
            },

            /**
             * @inheritdoc PatternItem#reset
             */
            reset: function (state) {
                var item;
                state.index = 0;
                if (this._choice) {
                    state.choice = -1;
                }
                item = this._getItems(0)[0];
                this._reset(item, state);
            },

            /**
             * @inheritdoc PatternItem#write
             */
            write: function (state, char) {
                var
                    len,
                    idx,
                    item,
                    result;
                if (this._choice && -1 === state.choice) {
                    // Enumerate items and stop on first !== NO_MATCH
                    len = this._items.length;
                    for (idx = 0; idx < len; ++idx) {
                        item = this._items[idx][0];
                        this._reset(item, state);
                        result = item.write(state.sub, char);
                        if (PatternItem.WRITE_NO_MATCH !== result) {
                            state.choice = idx;
                            return this._writeMatch(item, state);
                        }
                    }
                    if (idx === len) {
                        return PatternItem.WRITE_NO_MATCH;
                    }
                }
                item = this._getItem(state, state.index);
                result = item.write(state.sub, char);
                if (PatternItem.WRITE_NEED_DATA === result) {
                    return result;
                } else if (PatternItem.WRITE_NO_MATCH === result) {
                    return this._writeNoMatch(item, state, char);
                } else {
                    return this._writeMatch(item, state);
                }
            }

        }

    }),

//        /**
//         * Choice pattern: includes several items, matching only one among
// them
//         *
//         * @class PatternChoice
//         * @extends PatternItem
//         * @private
//         */
//        PatternChoice = _gpfDefine("PatternChoice", PatternItem, {
//
//            "+": {
//
////                /**
////                 * @inheritdoc PatternItem#next
////                 *
////                 * Overridden to 'add' the choice
////                 */
////                next: function (item) {
////                    if (undefined === item) {
////                        /*
////                         * The only way to have something *after* is to use
// ()
////                         * In that case, it would go through the parent
////                         */
////                        return null;
////                    } else {
////                        var
////                            parent = item.parent(),
////                            pos;
////                        this._choices.push(item);
////                        item.parent(this);
////                        if (1 === this._choices.length) {
////                            // Care about parent
////                            if (null === parent) {
////                                return; // Nothing to care about
////                            }
////                            if (parent.type() !== PatternItem.TYPE_GROUP) {
////                                gpf.Error.patternUnexpected();
////                            }
////                            // TODO should be the last
////                            pos = gpf.test(parent._items, item);
////                            if (undefined === pos) {
////                                gpf.Error.patternUnexpected();
////                            }
////                            parent._items[pos] = this;
////                            this._parent = parent;
////                        }
////                    }
////                },
//
//                /**
//                 * @inheritdoc PatternItem#write
//                 */
//                write: function (state, char) {
//                    // Try all choices and stop on the first one that works
//                    var
//                        tmpState = {},
//                        idx,
//                        item,
//                        result;
//                    for (idx = this._choices.length; idx > 0;) {
//                        item = this._choices[--idx];
//                        item.reset(tmpState);
//                        result = item.write(tmpState, char);
//                        if (PatternItem.WRITE_NO_MATCH !== result) {
//                            state.replaceItem = item;
//                            gpf.extend(state, tmpState);
//                            return result;
//                        }
//                    }
//                    return PatternItem.WRITE_NO_MATCH;
//                }
//
//            }
//
//        }),

    /**
     * Pattern parser context.
     * Class used to parse a pattern, will allocated and consolidate
     * PatternItems
     *
     * @class PatternParserContext
     * @extends gpf.Parser
     * @private
     */
    PatternParser = _gpfDefine("PatternParser",  gpf.Parser, {

        "-": {

            /**
             * @type {PatternGroup}
             * @private
             */
            "[_patternItem]": [gpf.$ClassProperty()],
            _patternItem: null

        },

        "#": {

            /**
             * @inheritdoc gpf.Parser#_initialParserState
             */
            _initialParserState: function (char) {
                this._patternItem.parse(char);
            },

            /**
             * @inheritdoc gpf.Parser#_finalizeParserState
             */
            _finalizeParserState: function () {
                var patternItem = this._patternItem;
                patternItem.parse(")");
                patternItem.finalize();
            }

        },

        "+": {

            constructor: function () {
                this._super.apply(this, arguments);
                this._patternItem = new PatternGroup();
                this._patternItem.parse("(");
            }

        }

    }),

    /**
     * Pattern tokenizer
     *
     * @class {PatternTokenizer}
     * @implements gpf.interfaces.ITokenizer
     * @private
     */
    PatternTokenizer = _gpfDefine("PatternTokenizer", {

        "[Class]": [gpf.$InterfaceImplement(_ITokenizer)],

        "-": {

            /**
             * @type {PatternItem}
             * @private
             */
            _patternItem: null,

            /**
             * @type {Boolean}
             * @private
             */
            _stopMatching: false,

            /**
             * @type {Number}
             * @private
             */
            _lastResult: 0,

            /**
             * @type {Number}
             * @private
             */
            _totalLength : 0,

            /**
             * Pattern state
             *
             * @type {Object}
             * @private
             */
            _state: {}
        },

        "+": {

            /**
             * @param {PatternItem} patternItem
             */
            constructor: function (patternItem) {
                this._patternItem = patternItem;
                this._state = {};
                this._patternItem.reset(this._state);
            },

            //region ITokenizer

            /**
             * @implements gpf.interfaces.ITokenizer:write
             */
            write: function (char) {
                var
                    result;
                if (this._stopMatching) {
                    return this._lastResult;
                }
                ++this._totalLength;
                result = this._patternItem.write(this._state, char);
                if (0 < result) {
                    this._lastResult = this._totalLength;
                    this._stopMatching =
                        bitTest(result, PatternItem.WRITE_PATTERN_END);
                } else if (PatternItem.WRITE_NO_MATCH === result) {
                    this._stopMatching = true;
                    if (0 === this._lastResult) {
                        this._lastResult = -1;
                    }
                }
                return this._lastResult;
            }

            //endregion
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
_gpfDefine("gpf.Pattern", {

    "-": {

        /**
         * @type {PatternItem}
         * @private
         */
        _patternItem: null

    },

    "+": {

        /**
         * Constructor, check and compile the pattern
         *
         * @param {String} pattern
         */
        constructor: function (pattern) {
            var
                parser = new PatternParser();
            parser.parse(pattern, null);
            this._patternItem = parser.patternItem();
        },

        /**
         * Allocate a tokenizer based on the pattern
         *
         * @return {gpf.interfaces.ITokenizer}
         */
        allocate: function () {
            return new PatternTokenizer(this._patternItem);
        }

    }

});

//endregion

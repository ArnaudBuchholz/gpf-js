(function () { /* Begin of privacy scope */
    "use strict";

    var
        gpfI = gpf.interfaces;

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

        /**
         * Constructor, check and compile the pattern
         *
         * @param {string} pattern
         */
        init: function (pattern) {
            gpf.interfaces.ignoreParameter(pattern);
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

}()); /* End of privacy scope */

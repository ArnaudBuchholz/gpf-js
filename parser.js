(function () { /* Begin of privacy scope */
    "use strict";
    /*global document,window,console*/
    /*global process,require,exports,global*/
    /*global gpf*/
    /*jslint continue: true, nomen: true, plusplus: true*/

    var
        gpfI = gpf.interfaces;

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
        write: function() {
            gpfI.ITextStream._write(this, arguments);
        },

        //endregion

        _write: function (buffer) {
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

    });

}()); /* End of privacy scope */

/**
 * @file Parser helper
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_EVENT_DATA*/ // gpf.events.EVENT_DATA
/*global _gpfAssert*/ // Assertion method
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _GpfEventsIsValidHandler*/ // Check event handler validity
/*#endif*/

var _GPF_PARSER_FINALIZE = {},
    _GPF_PARSER_END_OF_LINE = {};

/**
 * A parser base class to maintain the parsed stream position
 * It also offers some basic features to ease parsing and improve speed
 *
 * The output has to be transmitted through the protected _output function.
 *
 * @class gpf.Parser
 */
_gpfDefine("gpf.Parser", {
    "+": {

        constructor: function () {
            this.reset();
        },

        /**
         * Resets the parser position & state
         *
         * @param {Function} [state=undefined] state
         */
        reset: function (state) {
            this._pos = 0;
            this._line = 0;
            this._column = 0;
            this._setParserState(state);
        },

        /**
         * Get current position
         *
         * @return {{pos: number, line: number, column: number}}
         */
        currentPos: function () {
            return {
                pos: this._pos,
                line: this._line,
                column: this._column
            };
        },

        /**
         * Parser entry point
         *
         * @param {...String|null} var_args
         */
        parse: function () {
            var len = arguments.length,
                idx,
                arg;
            for (idx = 0; idx < len; ++idx) {
                arg = arguments[idx];
                if (_GPF_PARSER_FINALIZE === arg) {
                    this._finalizeParserState();
                    break; // ignore the rest
                } else {
                    _gpfAssert("string" === typeof arg, "string expected");
                    this._parse(arg);
                }
            }
        },

        /**
         * Defines an handler for the parser output
         *
         * @param {Array|gpf.events.EventHandler} handler
         */
        setOutputHandler: function (handler) {
            _gpfAssert(handler instanceof Array || _GpfEventsIsValidHandler(handler),
                "Expected a valid output handler");
            this._outputHandler = handler;
        }

    },
    "#": {

        // Configuration / pre-defined handlers

         // @property {Function|null} Initial parser state (set with reset)
        _initialParserState: null,

        // @property {Boolean} gpf.Parser.END_OF_LINE will not be transmitted to parser
        _ignoreEndOfLine: false,

        // @property {Boolean} spaces (and tabs) are submitted as one
        _preserveSpace: false,

        /**
         * No more character will be entered, parser must end
         * Default implementation consists in calling current state with _GPF_PARSER_FINALIZE as parameter.
         * Can be overridden.
         */
        _finalizeParserState: function () {
            this._pState(_GPF_PARSER_FINALIZE);
        },

        /**
         * Change parser state
         *
         * @param {Function} [state=null] state
         */
        _setParserState: function (state) {
            if (!state) {
                state = this._initialParserState;
            }
            _gpfAssert("function" === typeof state, "State must be a function");
            if (state !== this._pState) {
                this._pState = state;
            }
        },

        /**
         * The parser generates an output
         *
         * @param {*} item
         */
        _output: function (item) {
            var handler = this._outputHandler;
            if (handler instanceof Array) {
                handler.push(item);
            } else if (null !== handler) {
                _gpfEventsFire.call(this, _GPF_EVENT_DATA, {item: item}, handler);
            }
        }
    },
    "-": {

        // @property {Number} Absolute parser current position
        _pos: 0,

        // @property {Number} Parser current line
        _line: 0,

        // @property {Number} Parser current column
        _column: 0,

        // @property {Function} Parser current state function
        _pState: null,

        // @property {Array|gpf.events.EventHandler} Output handler
        _outputHandler: null,

        /**
         * Parser internal entry point
         *
         * @param {String} buffer
         */
        _parse : function (buffer) {
            var len = buffer.length,
                idx;
            for (idx = 0; idx < len; ++idx) {
                this._parseChar(buffer.charAt(idx));
            }
        },

        /**
         * Parse character
         *
         * @param {String} char
         */
        _parseChar: function (char) {
            var state,
                newLine = false;
            if ("\r" === char && this._ignoreCarriageReturn) {
                char = 0;
            }
            if ("\n" === char && this._ignoreLineFeed) {
                newLine = true;
                char = 0;
            }
            if (char) {
                state = this._pState(char);
                if (undefined !== state) {
                    this._setParserState(state);
                }
            }
            ++this._pos;
            if ("\n" === char || newLine) {
                ++this._line;
                this._column = 0;
            } else {
                ++this._column;
            }
        }

    },
    "~": {

        // Use to finalize the parser state
        FINALIZE: _GPF_PARSER_FINALIZE,

        // End of line marker
        END_OF_LINE: _GPF_PARSER_END_OF_LINE
    }
});

    ////region ParserStream
    //
    ///**
    // * Encapsulate a parser inside a ReadableStream interface
    // *
    // * @class gpf.ParserStream
    // * @extends gpf.stream.BufferedOnRead
    // * @implements gpf.interfaces.IReadableStream
    // */
    //_gpfDefine("gpf.ParserStream", gpf.stream.BufferedOnRead, {
    //
    //    "+": {
    //
    //        /**
    //         * @param {gpf.Parser} parser
    //         * @param {gpf.interfaces.IReadableStream} input
    //         * @constructor
    //         */
    //        constructor: function (parser, input) {
    //            this._super(input);
    //            this._parser = parser;
    //            this._parser.setOutputHandler(this._output.bind(this));
    //        }
    //
    //    },
    //
    //    "#": {
    //
    //        /**
    //         * @inheritdoc gpf.stream.BufferedOnRead#_addToBuffer
    //         */
    //        _addToBuffer: function (buffer) {
    //            this._parser.parse(buffer);
    //        },
    //
    //        /**
    //         * @inheritdoc gpf.stream.BufferedOnRead#_endOfInputStream
    //         */
    //        _endOfInputStream: function () {
    //            this._parser.parse(gpf.Parser.FINALIZE);
    //        },
    //
    //        /**
    //         * @inheritdoc gpf.stream.BufferedOnRead#_readFromBuffer
    //         */
    //        _readFromBuffer:
    //            gpf.stream.BufferedOnRead.prototype._readFromStringBuffer
    //
    //    },
    //
    //    "-": {
    //
    //        /**
    //         * Callback used to grab the parser output that is concatenated to
    //         * the buffer
    //         *
    //         * @param {String} text
    //         * @private
    //         */
    //        _output: function (text) {
    //            this._buffer.push(text);
    //            this._bufferLength += text.length;
    //        }
    //
    //    }
    //
    //});
    //
    ////endregion


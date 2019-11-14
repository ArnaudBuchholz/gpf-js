/**
 * @file CSV Parser
 * @since 0.2.3
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_START*/ // 0
/*global _GpfStreamBufferedRead*/ // gpf.stream.BufferedRead
/*global _gpfArrayForEach*/ // Almost like [].forEach (undefined are also enumerated)
/*global _gpfArrayForEachFalsy*/ // _gpfArrayForEach that returns first truthy value computed by the callback
/*global _gpfAssert*/ // Assertion method
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfStreamSecureWrite*/ // Generates a wrapper to secure multiple calls to stream#write
/*global _gpfStringEscapeForRegexp*/ // String escape for RegExp
/*global _gpfStringReplaceEx*/ // String replacement using dictionary map
/*exported _GpfStreamCsvParser*/ // gpf.stream.csv.Parser
/*#endif*/

_gpfErrorDeclare("csv/parser", {
    invalidCSV:
        "Invalid CSV syntax (bad quote sequence or missing end of file)"
});

/**
 * @typedef gpf.typedef.csvParserOptions
 * @property {String} [header] Header line: if not specified, the first write of the input stream becomes the header
 * @property {String} [separator] Column separator, detected from the header line if not specified (allowed characters
 * are ";" "," and "\t")
 * @property {String} [quote="\""] Quote sign: introduces an escaped value in which quotes, separator and carriage
 * returns are allowed. Consequently, the value may stand on several lines
 * @property {String} [newLine="\n"] New line: each input stream write is considered as a separate line.
 * If a quoted value stands on several lines, this character is used to represents every new line
 * @since 0.2.3
 */

/**
 * @namespace gpf.stream.csv
 * @description Root namespace for CSV related streams
 * @since 0.2.3
 */
gpf.stream.csv = {};

var
    // Usual CSV separators
    _gpfCsvSeparators = ";,\t ".split("");

var
    _GpfStreamCsvParser = _gpfDefine({
        $class: "gpf.stream.csv.Parser",
        $extend: _GpfStreamBufferedRead,

        /**
         * CSV Parser
         *
         * Parses the incoming stream by considering each write as a separate line.
         * It is recommended to use the {@link gpf.stream.LineAdapter} class in between the incoming stream and the CSV
         * parser.
         *
         * Generates objects where properties are matching header columns and values are string extracted from record
         * lines.
         *
         * @param {gpf.typedef.csvParserOptions} [parserOptions] Parser options
         * @constructor gpf.stream.csv.Parser
         * @implements {gpf.interfaces.IReadableStream}
         * @implements {gpf.interfaces.IWritableStream}
         * @implements {gpf.interfaces.IFlushableStream}
         * @extends gpf.stream.BufferedRead
         * @since 0.2.3
         */
        constructor: function (parserOptions) {
            this._readParserOptions(parserOptions);
            if (this._header) {
                this._parseHeader();
            } else {
                this._write = this._writeHeader;
            }
        },

        //region Parser options

        /**
         * Read parser options
         *
         * @param {gpf.typedef.csvParserOptions} [parserOptions] Parser options
         * @since 0.2.3
         */
        _readParserOptions: function (parserOptions) {
            var me = this;
            if (parserOptions) {
                _gpfArrayForEach([
                    "header",
                    "separator",
                    "quote",
                    "newLine"
                ], function (optionName) {
                    if (parserOptions[optionName]) {
                        me["_" + optionName] = parserOptions[optionName];
                    }
                });
            }
        },

        /**
         * Header line
         *
         * @type {String}
         * @since 0.2.3
         */
        _header: "",

        /**
         * Column separator
         *
         * @type {String}
         * @since 0.2.3
         */
        _separator: "",

        /**
         * Deduce separator from header line
         * @since 0.2.3
         */
        _deduceSeparator: function () {
            var header = this._header;
            this._separator = _gpfArrayForEachFalsy(_gpfCsvSeparators, function (separator) {
                if (header.includes(separator)) {
                    return separator;
                }
            }) || _gpfCsvSeparators[_GPF_START];
        },

        /**
         * Quote sign
         *
         * @type {String}
         * @since 0.2.3
         */
        _quote: "\"",

        /**
         * New line
         *
         * @type {String}
         * @since 0.2.3
         */
        _newLine: "\n",

        //endregion

        //region Header processing

        /**
         * @property {String[]} Columns' name
         * @since 0.2.3
         */
        _columns: [],

        _buildParsingHelpers: function () {
            this._unescapeDictionary = {};
            this._unescapeDictionary[this._quote + this._quote] = this._quote;
            this._parser = new RegExp(_gpfStringReplaceEx("^(?:([^QS][^S]*)|Q((?:[^Q]|QQ)+)Q)(?=$|S)", {
                Q: _gpfStringEscapeForRegexp(this._quote),
                S: _gpfStringEscapeForRegexp(this._separator)
            }));
        },

        /**
         * Once header line is known, process it to prepare the parser
         * @since 0.2.3
         */
        _parseHeader: function () {
            if (!this._separator) {
                this._deduceSeparator();
            }
            this._columns = this._header.split(this._separator);
            this._buildParsingHelpers();
            this._write = this._writeContent;
        },

        /**
         * Write header line
         *
         * @param {String} line CSV line
         * @since 0.2.3
         */
        _writeHeader: function (line) {
            this._header = line;
            this._parseHeader();
        },

        //endregion

        //region Content processing

        /**
         * Values being built
         * @since 0.2.3
         */
        _values: [],

        /**
         * Content to parse
         * @since 0.2.3
         */
        _content: "",

        /**
         * Unescape quoted value
         *
         * @param {String} value Quoted value
         * @return {String} unescaped value
         * @since 0.2.3
         */
        _unescapeQuoted: function (value) {
            return _gpfStringReplaceEx(value, this._unescapeDictionary);
        },

        /**
         * Add the matching value to the array of values
         *
         * @param {Object} match Regular expression match
         * @since 0.2.3
         */
        _addValue: function (match) {
            var UNQUOTED = 1,
                QUOTED = 2;
            if (match[UNQUOTED]) {
                this._values.push(match[UNQUOTED]);
            } else /* if (match[QUOTED]) */ {
                this._values.push(this._unescapeQuoted(match[QUOTED]));
            }
        },

        /**
         * Move the content to the next value
         *
         * @param {Number} index Position where the next value starts
         * @return {Boolean} True if some remaining content must be parsed
         * @since 0.2.3
         */
        _nextValue: function (index) {
            this._content = this._content.substring(index);
            return Boolean(this._content.length);
        },

        /**
         * Check what appears after the extracted value
         *
         * @param {Object} match Regular expression match
         * @return {Boolean} True if some remaining content must be parsed
         * @since 0.2.3
         */
        _checkAfterValue: function (match) {
            var lengthOfMatchedString = match[_GPF_START].length,
                charAfterValue = this._content.charAt(lengthOfMatchedString);
            if (charAfterValue) {
                _gpfAssert(charAfterValue === this._separator, "Positive lookahead works");
                return this._nextValue(++lengthOfMatchedString);
            }
            delete this._content;
            return false; // No value means end of content
        },

        /**
         * Extract value
         *
         * @return {Boolean} True if some remaining content must be parsed
         * @since 0.2.3
         */
        _extractValue: function () {
            var match = this._parser.exec(this._content);
            if (!match) {
                return false; // Stop parsing
            }
            this._addValue(match);
            return this._checkAfterValue(match);
        },

        /**
         * Check if the content starts with a separator or assume it's a value
         *
         * @return {Boolean} True if some remaining content must be parsed
         * @since 0.2.3
         */
        _checkForValue: function () {
            if (this._content.startsWith(this._separator)) {
                this._values.push(""); // Separator here means empty value
                return this._nextValue(this._separator.length);
            }
            return this._extractValue();
        },

        /**
         * Extract all values in the content
         *
         * @since 0.2.3
         */
        _parseValues: function () {
            while (this._checkForValue()) {
                _gpfIgnore(); // Not my proudest but avoid empty block warning
            }
        },

        /**
         * Parse content contained in the line (and any previously unterminated content)
         *
         * @return {String[]|undefined} Resulting values or undefined if record is not finalized yet
         * @since 0.2.3
         */
        _parseContent: function () {
            this._parseValues();
            if (this._content) {
                return;
            }
            return this._values;
        },

        /**
         * If some content remains from previous parsing, concatenate it and parse
         *
         * @param {String} line CSV line
         * @return {String[]|undefined} Resulting values or undefined if not yet finalized
         * @since 0.2.3
         */
        _processContent: function (line) {
            if (this._content) {
                this._content = this._content + this._newLine + line;
            } else {
                this._values = [];
                this._content = line;
            }
            return this._parseContent();
        },

        /**
         * Generate a record from values
         *
         * @param {String[]} values Array of values
         * @return {Object} Record based on header names
         * @since 0.2.3
         */
        _getRecord: function (values) {
            var record = {};
            _gpfArrayForEach(this._columns, function (name, idx) {
                var value = values[idx];
                if (value !== undefined) {
                    record[name] = values[idx];
                }
            });
            return record;
        },

        /**
         * Write content line
         *
         * @param {String} line CSV line
         * @since 0.2.3
         */
        _writeContent: function (line) {
            var values = this._processContent(line);
            if (values) {
                this._appendToReadBuffer(this._getRecord(values));
            }
        },

        //endregion

        //region gpf.interfaces.IReadableStream

        /**
         * @gpf:sameas gpf.interfaces.IWritableStream#write
         * @since 0.2.3
         */
        write: _gpfStreamSecureWrite(function (line) {
            var me = this; //eslint-disable-line no-invalid-this
            me._write(line);
            return Promise.resolve();
        }),

        //endregion

        //region gpf.interfaces.IFlushableStream

        /**
         * @gpf:sameas gpf.interfaces.IFlushableStream#flush
         * @since 0.2.3
         */
        flush: function () {
            if (this._content) {
                var error = new gpf.Error.InvalidCSV();
                this._setReadError(error);
                return Promise.reject(error);
            }
            this._completeReadBuffer();
            return Promise.resolve();
        }

        //endregion

    });

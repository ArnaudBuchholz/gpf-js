/**
 * @file CSV Parser
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfStreamBufferedRead*/ // gpf.stream.BufferedRead
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfArrayForEach*/
/*global _gpfArrayForEachFalsy*/ // _gpfArrayForEach that returns first truthy value computed by the callback
/*global _gpfStreamSecureWrite*/ // Generates a wrapper to secure multiple calls to stream#write
/*global _gpfStringReplaceEx*/
/*global  _gpfStringEscapeFor*/ // Make the string content compatible with lang
/*global _gpfIgnore*/
/*global _gpfEmptyFunc*/
/*exported _GpfCsvParser*/ // gpf.csv.Parser
/*#endif*/

_gpfErrorDeclare("csv", {
    invalidCSV:
        "Invalid CSV syntax (bad quote sequence or missing end of file)"
});

/**
 * @typedef gpf.typedef.csvParserOptions
 * @property {String} [header] Header line (if none in the source stream)
 * @property {String} [separator] Column separator (detected from first line if not specified)
 * @property {String} [quote="\""] Quote sign
 * @property {String} [escapeQuote="\""] Character used to escape the quote sign in a value
 * @property {String} [newLine="\n"] New line
 */

var
    // Usual CSV separators
    _gpfCsvSeparators = ";,\t ".split("");

var
    _GpfCsvParser = _gpfDefine(/** @lends gpf.csv.Parser.prototype */ {
        $class: "gpf.csv.Parser",
        $extend: _GpfStreamBufferedRead,

        /**
         * CSV Parser
         *
         * @param {gpf.typedef.csvParserOptions} [parserOptions] Parser options
         * @constructor gpf.csv.Parser
         * @implements {gpf.interfaces.IReadableStream}
         * @implements {gpf.interfaces.IWritableStream}
         * @implements {gpf.interfaces.IFlushableStream}
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
         */
        _readParserOptions: function (parserOptions) {
            var me = this;
            if (parserOptions) {
                _gpfArrayForEach([
                    "header",
                    "separator",
                    "quote",
                    "escapeQuote",
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
         */
        _header: "",

        /**
         * Column separator
         *
         * @type {String}
         */
        _separator: "",

        /**
         * Deduce separator from header line
         */
        _deduceSeparator: function () {
            var header = this._header;
            this._separator = _gpfArrayForEachFalsy(_gpfCsvSeparators, function (separator) {
                if (-1 !== header.indexOf(separator)) {
                    return separator;
                }
            }) || _gpfCsvSeparators[0];
        },

        /**
         * Quote sign
         *
         * @type {String}
         */
        _quote: "\"",

        /**
         * Escape quote sign
         *
         * @type {String}
         */
        _escapeQuote: "\"",

        /**
         * New line
         *
         * @type {String}
         */
        _newLine: "\n",

        //endregion

        //region Header processing

        /** @property {String[]} Columns' name */
        _columns: [],

        _buildParsingHelpers: function () {
            this._unescapeDictionary = {};
            this._unescapeDictionary[this._escapeQuote + this._quote] = this._quote;
            this._parser = new RegExp(_gpfStringReplaceEx("(?:([^QS][^S]*)|Q((?:[^Q]|EQ)+)Q)", {
                Q: _gpfStringEscapeFor(this._quote, "regexp"),
                S: _gpfStringEscapeFor(this._separator, "regexp"),
                E: _gpfStringEscapeFor(this._escapeQuote, "regexp")
            }), "gy");
        },

        /**
         * Once header line is known, process it to prepare the parser
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
         */
        _writeHeader: function (line) {
            this._header = line;
            this._parseHeader();
        },

        //endregion

        //region Content processing

        /**
         * Unescape quoted value
         *
         * @param {String} value Quoted value
         * @return {String} unescaped value
         */
        _unescapeQuoted: function (value) {
            return _gpfStringReplaceEx(value, this._unescapeDictionary);
        },

        /**
         * Add the matching value to the array of values
         *
         * @param {Object} match Regular expression match
         * @param {String[]} values Array of values being built
         */
        _addValue: function (match, values) {
            if (match[1]) {
                values.push(match[1]);
            } else /* if (match[2]) */ {
                values.push(this._unescapeQuoted(match[2]));
            }
        },

        /**
         * Move last parsing index to the next character
         *
         * @param {String} content Line content (might contain remaining content of previous lines)
         * @return {Boolean} True if some remaining content must be parsed
         */
        _nextValue: function (content) {
            return ++this._lastIndex < content.length;
        },

        /**
         * Check if the character is the expected separator, if not this is an error
         *
         * @param {String} content Content to parse
         * @param {String} charAfterValue Character after value
         * @return {Boolean} True if some remaining content must be parsed
         */
        _checkIfSeparator: function (content, charAfterValue) {
            if (charAfterValue === this._separator) {
                return this._nextValue(content);
            }
            this._setReadError(new gpf.Error.InvalidCSV());
            this._write = _gpfEmptyFunc;
            return false;
        },

        /**
         * Check what appears after the extracted value
         *
         * @param {String} content Content to parse
         * @return {Boolean} True if some remaining content must be parsed
         */
        _checkAfterValue: function (content) {
            var charAfterValue;
            this._lastIndex = this._parser.lastIndex;
            charAfterValue = content.charAt(this._lastIndex);
            if (charAfterValue) {
                return this._checkIfSeparator(content, charAfterValue);
            }
            return false; // No value means end of content
        },

        /**
         * Extract value at _lastIndex
         *
         * @param {String} content Content to parse
         * @param {String[]} values Array of values being built
         * @return {Boolean} True if some remaining content must be parsed
         */
        _extractValue: function (content, values) {
            this._parser.lastIndex = this._lastIndex;
            var match = this._parser.exec(content);
            if (!match) {
                return false; // Stop parsing
            }
            this._addValue(match, values);
            return this._checkAfterValue(content, values);
        },

        /**
         * Check if the position referenced by _lastIndex points to a separator or assume it's a value
         *
         * @param {String} content Content to parse
         * @param {String[]} values Array of values being built
         * @return {Boolean} True if some remaining content must be parsed
         */
        _checkForValue: function (content, values) {
            if (content.charAt(this._lastIndex) === this._separator) {
                values.push(""); // Separator here means empty value
                return this._nextValue(content);
            }
            return this._extractValue(content, values);
        },

        /**
         * Extract all values in the content
         *
         * @param {String} content Content to parse
         * @param {String[]} values Array of values being built
         * @return {Number} Parsing index in the content
         */
        _parseValues: function (content, values) {
            this._lastIndex = 0;
            while (this._checkForValue(content, values)) {
                _gpfIgnore(); // Not my proudest but avoid empty block warning
            }
            return this._lastIndex;
        },

        /**
         * Values remaining from the last parse call
         */
        _remainingValues: [],

        /**
         * Content remaining from the last parse call
         */
        _remainingContent: "",

        /**
         * Parse content contained in the line (and any previously unterminated content)
         *
         * @param {String} content Content to parse
         * @param {String[]} values Array of values being built
         * @return {String[]|undefined} Resulting values or undefined if record is not finalized yet
         */
        _parseContent: function (content, values) {
            var lastIndex = this._parseValues(content, values);
            if (lastIndex < content.length) {
                this._remainingValues = values;
                this._remainingContent = content.substr(lastIndex);
                return;
            }
            delete this._remainingContent;
            delete this._remainingValues;
            return values;
        },

        /**
         * If some content remains from previous parsing, concatenate it
         *
         * @param {String} line CSV line
         * @return {String[]|undefined} Resulting values or undefined if not yet finalized
         */
        _processContent: function (line) {
            var values,
                content;
            if (this._remainingContent) {
                values = this._remainingValues;
                content = this._remainingContent + this._newLine + line;
            } else {
                values = [];
                content = line;
            }
            return this._parseContent(content, values);
        },

        /**
         * Generate a record from values
         *
         * @param {String[]} values Array of values
         * @return {Object} Record based on header names
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
         */
        write: _gpfStreamSecureWrite(function (line) {
            var me = this; //eslint-disable-line no-invalid-this
            me._write(line);
            return Promise.resolve();
        }),

        //endregion

        //region gpf.interfaces.IFlushableStream

        /**
         * @gpf:sameas gpf.interfaces.IWritableStream#flush
         */
        flush: function () {
            if (this._remainingContent) {
                var error = new gpf.Error.InvalidCSV();
                this._setReadError(error);
                return Promise.reject(error);
            }
            this._completeReadBuffer();
            return Promise.resolve();
        }

        //endregion

    });

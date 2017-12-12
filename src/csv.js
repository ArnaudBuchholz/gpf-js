/**
 * @file CSV helper
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfStreamBufferedRead*/ // gpf.stream.BufferedRead
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfArrayForEach*/
/*global _gpfArrayForEachFalsy*/ // _gpfArrayForEach that returns first truthy value computed by the callback
/*global _gpfStreamSecureWrite*/ // Generates a wrapper to secure multiple calls to stream#write
/*exported _GpfCsvParser*/ // gpf.csv.Parser
/*#endif*/

_gpfErrorDeclare("csv", {
    InvalidCSV:
        "Invalid CSV syntax (bad quote sequence or missing end of file)"
});

/**
 * @typedef gpf.typedef.csvParserOptions
 * @property {String} [header] Header line (if none in the source stream)
 * @property {String} [separator] Column separator (detected from first line if not specified)
 * @property {String} [quote="\""] Quote sign
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
         * @param {gpf.typedef.csvParserOptions} [options] Parsing options
         * @constructor gpf.csv.Parser
         * @implements {gpf.interfaces.IReadableStream}
         * @implements {gpf.interfaces.IWritableStream}
         * @implements {gpf.interfaces.IFlushableStream}
         */
        constructor: function (options) {
            options = options || {};
            this._getHeader(options);
            this._getSeparator(options);
            this._getQuote(options);
            this._getNewLine(options);
        },

        //region options

        /**
         * Header line
         *
         * @type {String}
         */
        _header: "",

        /**
         * Get header line from the options or the first line of the file
         *
         * @param {gpf.typedef.csvParserOptions} options Parsing options
         */
        _getHeader: function (options) {
            if (options.header) {
                this._header = options.header;
            }
        },

        /**
         * Column separator
         *
         * @type {String}
         */
        _separator: "",

        /**
         * Get separator character from the options or the header
         *
         * @param {gpf.typedef.csvParserOptions} options Parsing options
         */
        _getSeparator: function (options) {
            if (options.separator) {
                this._separator = options.separator;
            }
        },

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
         * Get quote character from the options or use default
         *
         * @param {gpf.typedef.csvParserOptions} options Parsing options
         */
        _getQuote: function (options) {
            if (options.quote) {
                this._quote = options.quote;
            }
        },

        /**
         * New line
         *
         * @type {String}
         */
        _newLine: "\n",

        /**
         * Get new line character from the options or use default
         *
         * @param {gpf.typedef.csvParserOptions} options Parsing options
         */
        _getNewLine: function (options) {
            if (options.newLine) {
                this._newLine = options.newLine;
            }
        },

        //endregion

        /** @property {String[]} Columns' name */
        _columns: [],

        // @property {Boolean} Result of last submission to _unquote
        _unquotedValue: "",

        // When the quote is not ending the value
        _quoteFoundWithinValue: function (pos) {
            var value = this._unquotedValue;
            if (value.charAt(pos + 1) === this._quote) {
                // Double quote means escaped one
                this._unquotedValue = value.substr(0, pos) + value.substr(pos + 1);
                return true;
            }
            gpf.Error.csvInvalid();
        },

        /**
         * Quote character was found at given pos, process
         *
         * @param {Number} pos
         * @returns {Boolean} Quoted string continues
         */
        _quoteFound: function (pos) {
            var value = this._unquotedValue;
            if (pos === value.length - 1) {
                // Last character of the string
                this._unquotedValue = value.substr(0, pos);
                return false;
            }
            return this._quoteFoundWithinValue(pos);
        },

        /**
         * Process quoted value to unescape it properly.
         * Either the quote appears in the middle of the value: it must be followed by another quote.
         * And/Or it appears at the end of the value: it means this ends the quoted value
         *
         * @param {String} value
         * @returns {Boolean} Quoted string continues
         */
        _unquote: function (value) {
            var quote = this._quote,
                pos = value.indexOf(quote),
                inQuotedString = true;
            this._unquotedValue = value;
            while (-1 < pos && inQuotedString) {
                inQuotedString = this._quoteFound(pos);
                pos = this._unquotedValue.indexOf(quote, pos + 1);
            }
            return inQuotedString;
        },

        /**
         * Process the line value knowing it is quoted
         *
         * @param {String[]} line Line split on separator
         * @param {Number} idx Index of the value to consider
         * @param {Object} flags
         * - {Boolean} inQuotedString
         * - {Boolean} includeCarriageReturn
         * @returns {Number} Next value index
         */
        _processQuotedLineValue: function (line, idx, flags) {
            var value = line[idx];
            // Concatenate with 'previous' item
            var previousValue = [line[idx - 1]];
            if (flags.includeCarriageReturn) {
                previousValue.push("\r\n");
            } else {
                // part of the escaped string
                previousValue.push(this._separator);
            }
            flags.inQuotedString = this._unquote(value);
            previousValue.push(this._unquotedValue);
            line[idx - 1] = previousValue.join("");
            flags.includeCarriageReturn = false;
            line.splice(idx, 1);
            return idx;
        },

        /**
         * Process the line value to check if any quote exists
         *
         * @param {String[]} line Line split on separator
         * @param {Number} idx Index of the value to consider
         * @param {Object} flags
         * - {Boolean} inQuotedString
         * - {Boolean} includeCarriageReturn
         * @returns {Number} Next value index
         */
        _processLineValue: function (line, idx, flags) {
            var value = line[idx];
            if (0 === value.indexOf(this._quote)) {
                flags.inQuotedString = this._unquote(value.substr(1));
                line[idx] = this._unquotedValue;
            }
            return idx + 1;
        },

        // Convert the line into values starting at idx
        _convertLineIntoValuesFrom: function (line, idx, flags) {
            while (idx < line.length) {
                if (flags.inQuotedString) {
                    idx = this._processQuotedLineValue(line, idx, flags);
                } else {
                    idx = this._processLineValue(line, idx, flags);
                }
            }
        },

        /**
         * Convert the line into values
         *
         * @param {String} line
         * @param {String[]} values
         * @param {Object} flags
         * - {Boolean} inQuotedString
         * - {Boolean} includeCarriageReturn
         * @returns {Boolean}
         */
        _convertLineIntoValues: function (line, values, flags) {
            var idx;
            if (flags.inQuotedString) {
                flags.includeCarriageReturn = true;
                line.unshift(values.pop()); // Last value is not completed
                idx = 1;
            } else {
                idx = 0;
                flags.includeCarriageReturn = false;
            }
            this._convertLineIntoValuesFrom(line, idx, flags);
            [].push.apply(values, line);
            return !flags.inQuotedString;
        },

        _convertLinesIntoValues: function (values, flags) {
            var lines = this._lines,
                separator = this._separator,
                line;
            while (lines.length) {
                line = lines.shift().split(separator);
                if (this._convertLineIntoValues(line, values, flags)) {
                    break;
                }
            }
        },

        /**
         * Read one 'line' of values.
         * Quote escaping is handled meaning that a line might be on several lines
         *
         * @returns {String[]}
         */
        _readValues: function (line) {
            var values = [],
                flags = {
                    inQuotedString: false,
                    includeCarriageReturn: false
                };
            this._convertLinesIntoValues(values, flags);
            if (flags.inQuotedString) {
                gpf.Error.csvInvalid();
            }
            return values;
        },

        _write: function (line) {
            if (!this._header) {
                this._header = line;
                if (!this._separator) {
                    this._deduceSeparator();
                }
                this._columns = line.split(this._separator);
                return;
            }
            var values = this._readValues(line),
                record;
            if (values) {
                record = {};
                _gpfArrayForEach(this._columns, function (name, idx) {
                    record[name] = values[idx];
                });
                this._appendToReadBuffer(record);
            }
        },

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
         * @gpf:sameas gpf.interfaces.IWritableStream#write
         */
        flush: function () {
            this._flush();
            return Promise.resolve();
        }

        //endregion

    });

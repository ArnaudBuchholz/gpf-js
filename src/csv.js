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
/*global _gpfStringReplaceEx*/
/*exported _GpfCsvParser*/ // gpf.csv.Parser
/*#endif*/

// https://regex101.com/r/CFRnRL/1

_gpfErrorDeclare("csv", {
    InvalidCSV:
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
         * @param {gpf.typedef.csvParserOptions} [options] Parsing options
         * @constructor gpf.csv.Parser
         * @implements {gpf.interfaces.IReadableStream}
         * @implements {gpf.interfaces.IWritableStream}
         * @implements {gpf.interfaces.IFlushableStream}
         */
        constructor: function (options) {
            var me = this;
            if (options) {
                _gpfArrayForEach([
                    "header",
                    "separator",
                    "quote",
                    "escapeQuote",
                    "newLine"
                ], function (optionName) {
                    if (options[optionName]) {
                        me["_" + optionName] = options[optionName];
                    }
                });
            }
        },

        //region options

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

        /** @property {String[]} Columns' name */
        _columns: [],

        _buildParsingRegExp: function () {
            this._reParsing = new RegExp([
                // Non-capturing group
                "(?:",
                // Unquoted value
                "([^", this._quote, this._separator, "]+)",
                // OR
                "|",
                // Quoted value
                this._quote, "(",
                // Non-capturing group
                "(?:",
                // Anything but quote
                "[^", this._quote, "]",
                // OR
                "|",
                // Escaped quote
                this._escapeQuote, this._quote,
                // End of non-capturing group
                ")+",
                ")", this._quote,
                // End of non-capturing group
                ")"
            ].join(""), "gy");
        },
/*
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
*/

        _unescape: function (value) {
            var replaces = {};
            replaces[this._escapeQuote + this._quote] = this._quote;
            return _gpfStringReplaceEx(value, replaces);
        },

        _parseValues: function (line) {
            this._reParsing.lastIndex = 0;
            var values = [],
                match = this._reParsing.exec(line),
                separator;
            while (match) {
                if (match[1]) {
                    values.push(match[1]);
                } else if (match[2]) {
                    values.push(this._unescape(match[2]));
                }
                separator = line.charAt(this._reParsing.lastIndex);
                if (separator === this._separator) {
                    ++this._reParsing.lastIndex;
                    match = this._reParsing.exec(line);
                } else {
                    break;
                }
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
                this._buildParsingRegExp();
                return;
            }
            var values = this._parseValues(line),
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
         * @gpf:sameas gpf.interfaces.IWritableStream#flush
         */
        flush: function () {
            this._completeReadBuffer();
            return Promise.resolve();
        }

        //endregion

    });

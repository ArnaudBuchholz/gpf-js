/**
 * @file CSV helper
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*exported _gpfCsvParse*/ // CSV parsing function
/*#endif*/

_gpfErrorDeclare("csv", {
    csvInvalid:
        "Invalid CSV syntax (bad quote sequence or missing end of file)"
});

var
    // Usual CSV separators
    _gpfCsvSeparators = ";,\t ".split("");

/**
 * Deduce CSV separator from line (usually, the header)
 *
 * @param {String} header
 * @return {String}
 */
function _gpfCsvComputeSeparator (header) {
    var result;
    if (_gpfCsvSeparators.every(function (separator) {
        if (-1 !== header.indexOf(separator)) {
            result = separator;
            return false;
        }
        return true;
    })) {
        return _gpfCsvSeparators[0];
    }
    return result;
}

/**
 * Remove final \r from the line
 *
 * @param {String} line
 * @return {String}
 */
function _gpfTrimFinalR (line) {
    var len = line.length - 1;
    if ("\r" === line.charAt(len)) {
        return line.substr(0, len);
    }
    return line;
}

/**
 * CSV Parser
 *
 * @param {String} content CSV content
 * @param {Object} options
 * - {String} [header=undefined] header
 * - {String} [separator=undefined] separator can be deduced from header
 * - {String} [quote="\""] quote
 * @class {_GpfCsvParse}
 * @constructor
 */
function _GpfCsvParser (content, options) {
    /*jshint validthis:true*/ // constructor
    options = options || {}; // to have at least an empty object
    this._lines = content.split("\n").map(_gpfTrimFinalR);
    this._getHeader(options);
    this._getSeparator(options);
    this._getQuote(options);
    this._columns = this._header.split(this._separator);
}

_GpfCsvParser.prototype = {

    // @property {String[]} Array of lines
    _lines: [],

    // @property {String} Header line
    _header: "",

    // Column separator
    _separator: "",

    // Quote
    _quote: "",

    // @property {String[]} Columns' name
    _columns: [],

    /**
     * Get header line from the options or the first line of the file
     *
     * @param {Object} options
     */
    _getHeader: function (options) {
        if (options.header) {
            this._header = options.header;
        } else {
            this._header = this._lines.shift();
        }
    },

    /**
     * Get separator character from the options or the header
     *
     * @param {Object} options
     */
    _getSeparator: function (options) {
        if (options.separator) {
            this._separator = options.separator;
        } else {
            this._separator = _gpfCsvComputeSeparator(this._header);
        }
    },

    /**
     * Get quote character from the options or use default
     *
     * @param {Object} options
     */
    _getQuote: function (options) {
        if (options.quote) {
            this._quote = options.quote;
        } else {
            this._quote = "\"";
        }
    },

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
        throw gpf.Error.csvInvalid();
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
    _readValues: function () {
        var values = [],
            flags = {
                inQuotedString: false,
                includeCarriageReturn: false
            };
        this._convertLinesIntoValues(values, flags);
        if (flags.inQuotedString) {
            throw gpf.Error.csvInvalid();
        }
        return values;
    },

    /**
     * Read one record
     *
     * @returns {Object}
     */
    read: function () {
        var values = this._readValues(),
            record = {};
        this._columns.forEach(function (name, idx) {
            record[name] = values[idx];
        });
        return record;
    },

    /**
     * Read all records
     *
     * @returns {Object[]}
     */
    readAll: function () {
        var result = [];
        while (this._lines.length) {
            result.push(this.read());
        }
        return result;
    }

};

gpf.csv = {

    /**
     * CSV parsing function
     *
     * @param {String} content CSV content
     * @param {Object} options
     * - {String} [header=undefined] header
     * - {String} [separator=undefined] separator can be deduced from header
     * - {String} [quote="\""] quote
     *
     * @return {Object[]} records
     */
    parse: function (content, options) {
        var csvParser = new _GpfCsvParser(content, options);
        return csvParser.readAll();
    }

};

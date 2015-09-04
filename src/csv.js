/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*exported _gpfCsvParse*/
/*#endif*/

_gpfErrorDeclare("csv", {
    CsvInvalid:
        "Invalid CSV syntax (bad quote sequence or missing end of file)"
});

var
    // Usual CSV separators
    _gpfCsvSeparators = ";,\t ";

/**
 * Deduce CSV separator from line (usually, the header)
 *
 * @param {String} header
 * @return {String}
 */
function _gpfCsvComputeSeparator (header) {
    var len = _gpfCsvSeparators.length,
        idx,
        separator;
    for(idx = 0; idx < len; ++idx) {
        separator = _gpfCsvSeparators.charAt(idx);
        if( -1 !== header.indexOf(separator)) {
            return separator;
        }
    }
    // Default
    return _gpfCsvSeparators.charAt(0);
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
    var header = options.header || this._lines.shift();
    this._separator = options.separator || _gpfCsvComputeSeparator(header);
    this._quote = options.quote || "\"";
    this._columns = header.split(this._separator);
}

_GpfCsvParser.prototype = {

    // @property {String[]} Array of lines
    _lines: [],

    // Column separator
    _separator: "",

    // Quote
    _quote: "",

    // @property {String[]} Columns
    _columns: [],

    /**
     * Handle quoted value.
     * Either the quote appears in the middle of the value: it must be followed by another quote.
     * And/Or it appears at the end of the value: it means this ends the quoted value
     *
     * @param {String} value
     * @return {Array}
     * - First element is the result value
     * - Second element indicates if the quote escaping is still active
     */
    _unquote: function (value) {
        var quote = this._quote,
            pos = value.indexOf(quote),
            inQuotedString = true;
        while (-1 < pos) {
            if (pos === value.length - 1) {
                // Last character of the string
                value = value.substr(0, pos);
                inQuotedString = false;
                break;
            }
            else {
                if (value.charAt(pos + 1) === quote) {
                    // Double quote means escaped one
                    value = value.substr(0, pos) + value.substr(pos + 1);
                } else {
                    throw gpf.Error.CsvInvalid();
                }
            }
            pos = value.indexOf(quote, pos + 1);
        }
        return [value, inQuotedString];
    },

    /**
     * Read one 'line' of values. quote escaping is handled meaning that a line
     * might be on several lines.
     *
     * @param {String[]} lines
     * @param {String} separator
     * @param {String} quote
     */
    _readValues: function () {
        var lines = this._lines,
            separator = this._separator,
            quote = this._quote,
            values = [],
            line,
            inQuotedString = false,
            includeCarriageReturn,
            idx,
            value,
            unQuoted;
        while (lines.length) {
            line = lines.shift();
            line = line.split(separator);

            if (inQuotedString) {
                includeCarriageReturn = true;
                line.unshift(values.pop()); // Last value is not completed
                idx = 1;
            } else {
                idx = 0;
                includeCarriageReturn = false;
            }
            /* Check the values to see if quote has been used */
            while (idx < line.length) {
                value = line[idx];
                if (inQuotedString) {
                    // Concatenate with 'previous' item
                    var previousValue = [line[idx - 1]];
                    if (includeCarriageReturn) {
                        previousValue.push("\r\n");
                    } else {
                        // part of the escaped string
                        previousValue.push(separator);
                    }
                    unQuoted = this._unquote(value);
                    previousValue.push(unQuoted[0]);
                    inQuotedString = unQuoted[1];
                    line[idx - 1] = previousValue.join("");
                    includeCarriageReturn = false;
                    line.splice(idx, 1);
                } else {
                    if (0 === value.indexOf(quote)) {
                        inQuotedString = true;
                        unQuoted = this._unquote(value.substr(1));
                        line[idx] = unQuoted[0];
                        inQuotedString = unQuoted[1];
                    }
                    ++idx;
                }
            }
            values = values.concat(line);
            if (inQuotedString) {
                if (0 === lines.length) {
                    throw gpf.Error.CsvInvalid();
                }
            } else {
                return values;
            }

        }
    },

    // Read one record
    read: function () {
        var values = this._readValues(),
            record = {};
        /*gpf:inline(array)*/ this._columns.forEach(function (name, idx) {
            record[name] = values[idx];
        });
        return record;
    },

    // Read all records
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

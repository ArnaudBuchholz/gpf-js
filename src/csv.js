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

    _processQuotedLineValue: function (line, idx, values) {
        var value = line[idx],
            unQuoted;
        // Concatenate with 'previous' item
        var previousValue = [line[idx - 1]];
        if (values.includeCarriageReturn) {
            previousValue.push("\r\n");
        } else {
            // part of the escaped string
            previousValue.push(this._separator);
        }
        unQuoted = this._unquote(value);
        previousValue.push(unQuoted[0]);
        values.inQuotedString = unQuoted[1];
        line[idx - 1] = previousValue.join("");
        values.includeCarriageReturn = false;
        line.splice(idx, 1);
        return idx;
    },

    _processLineValue: function (line, idx, values) {
        var value = line[idx],
            unQuoted;
        if (0 === value.indexOf(this._quote)) {
            values.inQuotedString = true;
            unQuoted = this._unquote(value.substr(1));
            line[idx] = unQuoted[0];
            values.inQuotedString = unQuoted[1];
        }
        return idx + 1;
    },

    _processLineValues: function (line, values) {
        var idx;
        if (values.inQuotedString) {
            values.includeCarriageReturn = true;
            line.unshift(values.pop()); // Last value is not completed
            idx = 1;
        } else {
            idx = 0;
            values.includeCarriageReturn = false;
        }
        while (idx < line.length) {
            if (values.inQuotedString) {
                idx = this._processQuotedLineValue(line, idx, values);
            } else {
                idx = this._processLineValue(line, idx, values);
            }
        }
        [].splice.apply(values, [values.length, 0].concat(line));
        return !values.inQuotedString;
    },

    /**
     * Read one 'line' of values.
     * Quote escaping is handled meaning that a line might be on several lines.
     */
    _readValues: function () {
        var lines = this._lines,
            separator = this._separator,
            values = [],
            line;
        values.inQuotedString = false;
        values.includeCarriageReturn = undefined;
        while (lines.length) {
            line = lines.shift().split(separator);
            if (this._processLineValues(line, values)) {
                break;
            }
        }
        if (values.inQuotedString) {
            throw gpf.Error.CsvInvalid();
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
        /*gpf:inline(array)*/ this._columns.forEach(function (name, idx) {
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

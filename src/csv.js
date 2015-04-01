/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
// /*#endif*/

_gpfErrorDeclare("csv", {
    CsvInvalid:
        "Invalid CSV syntax (bad quote sequence or missing end of file)"
});

var
    /**
     * Usual CSV separators
     *
     * @type {string}
     * @private
     */
    _gpfCsvSeparators = ";,\t ",

    /**
     * Deduce CSV separator from line (usually, the header)
     *
     * @param {String} header
     * @returns {string}
     * @private
     */
    _gpfCsvComputeSeparator = function (header) {
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
    },

    /**
     * Handle quoted value.
     * Either the quote appears in the middle of the value: it must be followed
     * by another quote.
     * And/Or it appears at the end of the value: it means this ends the quoted
     * value
     *
     * @param {String} value
     * @param {String} quote
     * @returns {Array}
     * First element is the result value
     * Second element indicates if the quote escaping is still active
     * @private
     */
    _gpfCsvUnquote = function (value, quote) {
        var
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
     * @private
     */
    _gpfCsvReadValues = function (lines, separator, quote) {
        var values = [],
            line,
            inQuotedString = false,
            includeCarriageReturn,
            idx,
            value,
            previousValue,
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
                    previousValue = [line[idx - 1]];
                    if (includeCarriageReturn) {
                        previousValue.push("\r\n");
                    } else {
                        // part of the escaped string
                        previousValue.push(separator);
                    }
                    unQuoted = _gpfCsvUnquote(value, quote);
                    previousValue.push(unQuoted[0]);
                    inQuotedString = unQuoted[1];
                    line[idx - 1] = previousValue.join("");
                    includeCarriageReturn = false;
                    line.splice(idx, 1);
                } else {
                    if (0 === value.indexOf(quote)) {
                        inQuotedString = true;
                        unQuoted = _gpfCsvUnquote(value.substr(1), quote);
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

    /**
     * Remove final \r from the line
     *
     * @param {String} line
     * @return {String}
     * @private
     */
    _trimFinalR = function (line) {
        var len = line.length - 1;
        if ("\r" === line.charAt(len)) {
            return line.substr(0, len);
        }
        return line;
    },

    /**
     * @inheritDoc gpf.csv.parse
     * @private
     */
    _gpfCsvParse = function (content, options) {
        options = options || {}; // to have at least an empty object
        var
            lines = content.split("\n").map(_trimFinalR),
            header = options.header || lines.shift(),
            headerLen,
            separator = options.separator || _gpfCsvComputeSeparator(header),
            values,
            record,
            idx,
            result = [];
        header = header.split(separator);
        headerLen = header.length;
        while (lines.length) {
            values = _gpfCsvReadValues(lines, separator, options.quote || "\"");
            // Create a new record
            record = {};
            for (idx = 0; idx < headerLen; ++idx) {
                record[header[idx]] = values[idx];
            }
            result.push(record);
        }
        return result;
    };

gpf.csv = {

    /**
     * CSV parsing function
     *
     * @param {String} content CSV content
     * @param {Object} options
     * <ul>
     *     <li>{String} [header=undefined] header</li>
     *     <li>{String} [separator=undefined] separator can be deduced from
     *     header</li>
     *     <li>{String} [quote="\""] quote</li>
     * </ul>
     * @return {Object[]} records
     * @private
     */
    parse: _gpfCsvParse

};


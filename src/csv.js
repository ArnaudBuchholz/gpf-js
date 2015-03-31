/*#ifndef(UMD)*/
"use strict";
/*#endif*/

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

    _gpfCsvReadValues = function (lines, separator) {
        var values = [],
            line,
            inEscapedString = false,
            includeCarriageReturn,
            idx,
            value;
        while (lines.length) {
            line = lines.shift();
            // TODO remove trailing \r
            line = line.split(separator);
            if (inEscapedString) {
                includeCarriageReturn = true;
                line.unshift(values.pop()); // Last value is not completed
                idx = 1;
            } else {
                idx = 0;
                includeCarriageReturn = false;
            }
            /* Check the values to see if " has been used */
            while (idx < line.length) {
                value = line[idx];
                if (inEscapedString) {
                    // Concatenate with 'previous' item
                    value = [value];
                    if (includeCarriageReturn) {
                        value.push("\r\n");
                    } else {
                        value.push(separator); // part of the escaped string
                    }
                    line.push()
                }
                        line[idx - 1] + ( includeCarriageReturn ? "\r\n" : separator ) + unQuote(value);
                    includeCarriageReturn = false;
                    line.splice(idx, 1);
                }
                else {
                    if (0 === value.indexOf("\"")) {
                        inEscapedString = true;
                        line[idx] = unQuote(value.substr(1));
                    }
                    ++idx;
                }
            }
            values = values.concat(line);
            if (inEscapedString) {
                if (0 === lines.length) {
                    // TODO Invalid CSV syntax
                    lines;
                }
            } else {

    }

    _gpfCsvUnquote = function (value) {
        var pos = value.indexOf("\"");
        while (-1 < pos) {
            if (pos === value.length - 1) {
                // Last character of the string
                value = value.substr(0, value.length - 1);
                inString = _F;
                break;
            }
            else {
                if (value.charAt(pos + 1) === "\"") {
                    // Double quote means escaped one
                    value = value.substr(0, pos) + value.substr(pos + 1);
                } else {
                    // TODO signal the issue
                }
            }
            pos = value.indexOf("\"", pos + 1);
        }
        return value;
    },

    /**
     * @inheritDoc gpf.csv.parse
     * @private
     */
    _gpfCsvParse = function (content, options) {
        options = options || {}; // to have at least an empty object
        var
            lines = content.split("\n"),
            header = options.header || lines.shift(),
            headerLen,
            separator = options.separator || _gpfCsvComputeSeparator(header),
            idx,
            values,
            record,
            result = [];
        header = header.split(separator);
        headerLen = header.length;
        while (lines.length) {
            values = _gpfCsvReadValues(lines, separator);
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
     * </ul>
     * @return {Object[]} records
     * @private
     */
    parse: _gpfCsvParse

};


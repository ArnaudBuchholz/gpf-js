/**
 * @file HTTP headers parser helper
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfRegExpForEach*/ // Executes the callback for each match of the regular expression
/*exported _gpfHttpParseHeaders*/ // Parse HTTP response headers
/*#endif*/

var _gpfHttpHeadersParserRE = new RegExp("([^:\\s]+)\\s*: ?([^\\r]*)", "gm");

/**
 * Parse HTTP response headers
 *
 * @param {String} headers Response headers
 * @return {Object} headers dictionary
 */
function _gpfHttpParseHeaders (headers) {
    var result = {};
    _gpfHttpHeadersParserRE.lastIndex = 0;
    _gpfRegExpForEach(_gpfHttpHeadersParserRE, headers, function (match) {
        result[match[1]] = match[2];
    });
    return result;
}

/**
 * @file HTTP headers parser helper
 */
/*#ifndef(UMD)*/
"use strict";
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
    _gpfHttpHeadersParserRE.lastIndex = 0;
    var match = _gpfHttpHeadersParserRE.exec(headers),
        result = {};
    while (match) {
        result[match[1]] = match[2];
        match = _gpfHttpHeadersParserRE.exec(headers);
    }
    return result;
}

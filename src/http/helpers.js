/**
 * @file HTTP helpers
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfRegExpForEach*/ // Executes the callback for each match of the regular expression
/*exported _gpfHttpParseHeaders*/ // Parse HTTP response headers
/*exported _gpfHttpGenSend*/ // Generates a function that implements the http send logic
/*exported _gpfHttpGenSetHeaders*/ // Generates a function that transmit headers to the http object
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

/**
 * Generates a function that transmit headers to the http object
 *
 * @param {String} methodName Name of the method to call
 * @return {Function} Method to set the headers
 * @gpf:closure
 */
function _gpfHttpGenSetHeaders (methodName) {
    return function (httpObj, headers) {
        if (headers) {
            Object.keys(headers).forEach(function (headerName) {
                httpObj[methodName](headerName, headers[headerName]);
            });
        }
    };
}

/**
 * Generates a function that implements the http send logic
 *
 * @param {String} methodName Name of the method to call
 * @return {Function} Method to trigger the send
 * @gpf:closure
 */
function _gpfHttpGenSend (methodName) {
    return function (httpObj, data) {
        if (data) {
            httpObj[methodName](data);
        } else {
            httpObj[methodName]();
        }
    };
}

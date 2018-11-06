/**
 * @file HTTP helpers
 * @since 0.2.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfArrayForEach*/ // Almost like [].forEach (undefined are also enumerated)
/*global _gpfRegExpForEach*/ // Executes the callback for each match of the regular expression
/*exported _GPF_HTTP_METHODS*/ // HTTP Methods
/*exported _gpfHttpGenGetResponse*/ // Generates a function that extracts response from the http object
/*exported _gpfHttpGenSend*/ // Generates a function that implements the http send logic
/*exported _gpfHttpGenSetHeaders*/ // Generates a function that transmit headers to the http object
/*exported _gpfHttpParseHeaders*/ // Parse HTTP response headers
/*#endif*/

/**
 * @namespace gpf.http
 * @description Root namespace for http specifics
 * @since 0.2.1
 */
gpf.http = {};

/**
 * Http methods
 * @since 0.2.1
 */
var _GPF_HTTP_METHODS = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    OPTIONS: "OPTIONS",
    DELETE: "DELETE",
    HEAD: "HEAD"
};

var _gpfHttpHeadersParserRE = new RegExp("([^:\\s]+)\\s*: ?([^\\r]*)", "gm"),
    _GPF_HTTP_HELPERS_HEADER_NAME = 1,
    _GPF_HTTP_HELPERS_HEADER_VALUE = 2;

/**
 * Parse HTTP response headers
 *
 * @param {String} headers Response headers
 * @return {Object} headers dictionary
 * @since 0.2.1
 */
function _gpfHttpParseHeaders (headers) {
    var result = {};
    _gpfArrayForEach(_gpfRegExpForEach(_gpfHttpHeadersParserRE, headers), function (match) {
        result[match[_GPF_HTTP_HELPERS_HEADER_NAME]] = match[_GPF_HTTP_HELPERS_HEADER_VALUE];
    });
    return result;
}

/**
 * Generates a function that transmit headers to the http object
 *
 * @param {String} methodName Name of the method to call
 * @return {Function} Method to set the headers
 * @gpf:closure
 * @since 0.2.1
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
 * @since 0.2.1
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

/**
 * Generates a function that extracts response from the http object
 *
 * @param {String} status Name of the status property
 * @param {String} getAllResponseHeaders Name of the getAllResponseHeaders method
 * @param {String} responseText Name of the responseText property
 * @return {Function} Method to generate response
 * @gpf:closure
 * @since 0.2.7
 */
function _gpfHttpGenGetResponse (status, getAllResponseHeaders, responseText) {
    return function (httpObj) {
        return {
            status: httpObj[status],
            headers: _gpfHttpParseHeaders(httpObj[getAllResponseHeaders]()),
            responseText: httpObj[responseText]
        };
    };
}

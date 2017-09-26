/**
 * @file HTTP mocking
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HTTP_METHODS*/ // HTTP Methods
/*global _gpfArrayForEachFalsy*/ // _gpfArrayForEach that returns first truthy value computed by the callback
/*exported _gpfHttpMockCheck*/ // Check if the provided request match any of the mocked one
/*#endif*/

/**
 * Mocked response callback
 *
 * @callback gpf.typedef.mockedResponseCallback
 *
 * @param {gpf.typedef.httpRequestSettings} HTTP request settings
 * @param {...String} captured Regular expression capturing group values
 * @return {Promise<gpf.typedef.httpRequestResponse>|undefined}
 */

/**
 * Definition of a mocked request
 *
 * @typedef gpf.typedef.mockedRequest
 * @property {gpf.http.methods} method HTTP method to mock
 * @property {RegExp} url Regular expression matching the URL to mock
 * @property {gpf.typedef.mockedResponseCallback} response Function that generates response when mocking applies
 */

/**
 * Mocked request identifier
 *
 * @typedef gpf.typedef.mockedRequestID
 */

/**
 * Maps request method to an array of mocked requests
 *
 * @type {Object}
 */
var _gpfHttpMockedRequests = {};

/**
 * Match the provided request with the mocked one
 *
 * @param {gpf.typedef.mockedRequest} mockedRequest Mocked request to match
 * @return {Promise<gpf.typedef.httpRequestResponse>|undefined} undefined if not matching
 * @this {gpf.typedef.httpRequestSettings}
 */
function _gpfHttMockMatchRequest (mockedRequest) {
    /*jshint validthis:true*/
    var url = mockedRequest.url,
        match;
    url.lastIndex = 0;
    match = url.exec(this.url);
    if (match) {
        return mockedRequest.response.apply(null, [this].concat([].slice.call(match, 1)));
    }
}

/**
 * Match the provided request to the list of mocked ones
 *
 * @param {gpf.typedef.mockedRequest[]} mockedRequests List of mocked requests for the given method
 * @param {gpf.typedef.httpRequestSettings} request Request to match
 * @return {Promise<gpf.typedef.httpRequestResponse>|undefined} undefined if no mocked request matches
 */
function _gpfHttMockMatch (mockedRequests, request) {
    return _gpfArrayForEachFalsy(mockedRequests, _gpfHttMockMatchRequest.bind(request));
}

/**
 * Check if the provided request match any of the mocked one
 *
 * @param {gpf.typedef.httpRequestSettings} request Request to check
 * @return {Promise<gpf.typedef.httpRequestResponse>|undefined} undefined if no mocked request matches
 */
function _gpfHttpMockCheck (request) {
    return _gpfHttMockMatch(_gpfHttpMockedRequests[request.method], request);
}

var _gpfHttpMockLastId = 0;

/**
 * Add a mocked request
 *
 * @param {gpf.typedef.mockedRequest} definition Mocked request definition
 * @return {gpf.typedef.mockedRequestID} Mocked request identifier, to be used with {@link gpf.http.mock.remove}
 * @see gpf.http
 */
function _gpfHttpMockAdd (definition) {
    var method = definition.method,
        id;
    ++_gpfHttpMockLastId;
    id = method + "." + _gpfHttpMockLastId;
    _gpfHttpMockedRequests[method].unshift(Object.assign({
        method: method,
        id: id
    }, definition));
    return id;
}

/**
 * Removes a mocked request
 *
 * @param {gpf.typedef.mockedRequestID} id Mocked request identifier returned by {@link gpf.http.mock}
 */
function _gpfHttpMockRemove (id) {
    var method = id.split(".")[0];
    _gpfHttpMockedRequests[method] = _gpfHttpMockedRequests[method].filter(function (mockedRequest) {
        return mockedRequest.id !== id;
    });
}

/**
 * Clears all mocked requests
 */
function _gpfHttpMockReset () {
    Object.keys(_GPF_HTTP_METHODS).forEach(function (method) {
        _gpfHttpMockedRequests[method] = [];
    });
}

_gpfHttpMockReset();

/** @sameas _gpfHttpMockAdd */
gpf.http.mock = _gpfHttpMockAdd;

/** @sameas _gpfHttpMockRemove */
gpf.http.mock.remove = _gpfHttpMockRemove;

/** @sameas _gpfHttpMockReset */
gpf.http.mock.reset = _gpfHttpMockReset;

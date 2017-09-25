/**
 * @file HTTP mocking
 */
/*#ifndef(UMD)*/
"use strict";
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
 * @property {gpf.http.methods} [method=gpf.http.methods.get] HTTP method to mock
 * @property {RegExp} url Regular expression matching the URL to mock
 * @property {gpf.typedef.mockedResponseCallback} response Function that generates response when mocking applies
 */

var _gpfHttpMockedRequests = {};

function _gpfHttpMock (request) {
    var result;
    // Every?
    _gpfArrayForEach(_gpfHttpMockedRequests[request.method], function (mockedRequest) {
        var url = mockedRequest.url,
            match;
        url.lastIndex = 0;
        match = url.exec(request.url);
        if (match) {
            result = mockedRequest.response.apply(null, [request].concat([].slice(match, 1)));
        }
    });
    return result;
}

function _gpfHttpMockAdd (definition) {
    // Install handler

}

function _gpfHttpMockRemove (definition) {

}

function _gpfHttpMockReset (definition) {

}


// gpf.http.mock = _gpfHttpMockAdd;

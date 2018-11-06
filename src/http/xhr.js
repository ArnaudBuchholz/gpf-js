/**
 * @file Browser specific HTTP implementation
 * @since 0.2.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfHttpGenGetResponse*/ // Generates a function that extracts response from the http object
/*global _gpfHttpGenSend*/ // Generates a function that implements the http send logic
/*global _gpfHttpGenSetHeaders*/ // Generates a function that transmit headers to the http object
/*global _gpfHttpSetRequestImplIf*/ // Set the http request implementation if the host matches
/*#endif*/

/*jshint browser: true*/
/*eslint-env browser*/

var _GPF_HTTP_XHR_READYSTATE_DONE = 4,
    _gpfHttpXhrSetHeaders = _gpfHttpGenSetHeaders("setRequestHeader"),
    _gpfHttpXhrSend = _gpfHttpGenSend("send"),
    _gpfHttpXhrGetResponse = _gpfHttpGenGetResponse("status", "getAllResponseHeaders", "responseText");

function _gpfHttpXhrOpen (request) {
    var xhr = new XMLHttpRequest();
    xhr.open(request.method, request.url);
    return xhr;
}

function _gpfHttpXhrWaitForCompletion (xhr, callback) {
    xhr.onreadystatechange = function () {
        if (xhr.readyState === _GPF_HTTP_XHR_READYSTATE_DONE) {
            callback();
        }
    };
}

function _gpfHttpXhrRequest (request, resolve) {
    var xhr = _gpfHttpXhrOpen(request);
    _gpfHttpXhrSetHeaders(xhr, request.headers);
    _gpfHttpXhrWaitForCompletion(xhr, function () {
        resolve(_gpfHttpXhrGetResponse(xhr));
    });
    _gpfHttpXhrSend(xhr, request.data);
}

_gpfHttpSetRequestImplIf(_GPF_HOST.BROWSER, _gpfHttpXhrRequest);
_gpfHttpSetRequestImplIf(_GPF_HOST.PHANTOMJS, _gpfHttpXhrRequest);

/**
 * @file Browser specific HTTP implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfHttpGenSend*/ // Generates a function that implements the http send logic
/*global _gpfHttpGenSetHeaders*/ // Generates a function that transmit headers to the http object
/*global _gpfHttpParseHeaders*/ // Parse HTTP response headers
/*global _gpfHttpRequestImplByHost*/ // HTTP Request Implementation per host
/*#endif*/

/*jshint browser: true*/
/*eslint-env browser*/

var _gpfHttpXhrSetHeaders = _gpfHttpGenSetHeaders("setRequestHeader"),
    _gpfHttpXhrSend = _gpfHttpGenSend("send");

function _gpfHttpXhrOpen (request) {
    var xhr = new XMLHttpRequest();
    xhr.open(request.method, request.url);
    return xhr;
}

function _gpfHttpXhrWaitForCompletion (xhr, callback) {
    xhr.onreadystatechange = function () {
        if (4 === xhr.readyState) {
            callback();
        }
    };
}

_gpfHttpRequestImplByHost[_GPF_HOST.BROWSER]
    = _gpfHttpRequestImplByHost[_GPF_HOST.PHANTOMJS]
    = function (request, resolve) {
        var xhr = _gpfHttpXhrOpen(request);
        _gpfHttpXhrSetHeaders(xhr, request.headers);
        _gpfHttpXhrSend(xhr, request.data);
        _gpfHttpXhrWaitForCompletion(xhr, function () {
            resolve({
                status: xhr.status,
                headers: _gpfHttpParseHeaders(xhr.getAllResponseHeaders()),
                responseText: xhr.responseText
            });
        });
    };

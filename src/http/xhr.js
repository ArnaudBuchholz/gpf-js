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

_gpfHttpRequestImplByHost[_GPF_HOST.BROWSER]
    = _gpfHttpRequestImplByHost[_GPF_HOST.PHANTOMJS]
    = function (request, resolve) {
        var xhr = new XMLHttpRequest();
        xhr.open(request.method, request.url);
        _gpfHttpXhrSetHeaders(xhr, request.headers);
        xhr.onreadystatechange = function () {
            if (4 === xhr.readyState) {
                resolve({
                    status: xhr.status,
                    headers: _gpfHttpParseHeaders(xhr.getAllResponseHeaders()),
                    responseText: xhr.responseText
                });
            }
        };
        _gpfHttpXhrSend(xhr, request.data);
    };

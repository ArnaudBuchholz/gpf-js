/**
 * @file Browser specific HTTP implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfHost*/ // Host type
/*global _gpfHttpParseHeaders*/ // Parse HTTP response headers
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfSetHttpRequestImpl*/ // Set the HTTP Request Implementation method
/*#endif*/

/*jshint browser: true*/
/*eslint-env browser*/

/* istanbul ignore next */ // Because tested with NodeJS
if (_GPF_HOST.BROWSER === _gpfHost || _GPF_HOST.PHANTOMJS === _gpfHost) {

    _gpfSetHttpRequestImpl(function (request, resolve, reject) {
        _gpfIgnore(reject);
        var xhr = new XMLHttpRequest();
        xhr.open(request.method, request.url);
        if (request.headers) {
            Object.keys(request.headers).forEach(function (headerName) {
                xhr.setRequestHeader(headerName, request.headers[headerName]);
            });
        }
        xhr.onreadystatechange = function () {
            if (4 === xhr.readyState) {
                resolve({
                    status: xhr.status,
                    headers: _gpfHttpParseHeaders(xhr.getAllResponseHeaders()),
                    responseText: xhr.responseText
                });
            }
        };
        xhr.send(request.data || null);
    });

}

/**
 * @file Browser specific HTTP implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfHost*/ // Host type
/*global _gpfHttpParseHeaders*/ // Parse HTTP response headers
/*global _gpfSetHttpRequestImpl*/ // Set the HTTP Request Implementation method
/*#endif*/

/*jshint browser: true*/
/*eslint-env browser*/

function _gpfHttpXhrSetHeaders (xhr, headers) {
    if (headers) {
        Object.keys(headers).forEach(function (headerName) {
            xhr.setRequestHeader(headerName, headers[headerName]);
        });
    }
}

function _gpfHttpXhrSend (xhr, data) {
    if (data) {
        xhr.send(data);
    } else {
        xhr.send();
    }
}

/* istanbul ignore next */ // Because tested with NodeJS
if (_GPF_HOST.BROWSER === _gpfHost || _GPF_HOST.PHANTOMJS === _gpfHost) {

    _gpfSetHttpRequestImpl(function (request, resolve) {
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
    });

}

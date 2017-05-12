/**
 * @file Browser specific HTTP implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfHost*/ // Host type
/*global _gpfHttpRequestImpl:true*/ // HTTP request host specific implementation
/*#endif*/

/*jshint browser: true*/
/*eslint-env browser*/

var _gpfHttpBrowserResponseHeadersParser = new RegExp("([a-zA-Z\\-]+)\\s*:(.*)", "g");

function _gpfHttpBrowserGetResponseHeaders (xhr) {
    _gpfHttpBrowserResponseHeadersParser.lastIndex = 0;
    var responseHeaders = xhr.getAllResponseHeaders(),
        match = _gpfHttpBrowserResponseHeadersParser.exec(responseHeaders),
        result = {};
    while (match) {
        result[match[1]] = match[2];
        match = _gpfHttpBrowserResponseHeadersParser.exec(responseHeaders);
    }
    return result;
}

/* istanbul ignore next */ // Because tested with NodeJS
if (_GPF_HOST.BROWSER === _gpfHost) {

    _gpfHttpRequestImpl = function (request, resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(request.method, request.url);
        Object.keys(request.headers).forEach(function (headerName) {
            xhr.setRequestHeader(headerName, request.headers[headerName]);
        });
        xhr.onreadystatechange = function () {
            if (4 === xhr.readyState) {
                var response = {
                    status: xhr.status,
                    headers: _gpfHttpBrowserGetResponseHeaders(xhr),
                    responseText: xhr.responseText
                };
                if (2 === Math.floor(xhr.status / 100)) {
                    resolve(response);
                } else {
                    reject(response);
                }
            }
        };
        xhr.send(request.data);
    };

}

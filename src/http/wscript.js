/**
 * @file MS Script specific HTTP implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfHost*/ // Host type
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfSetHttpRequestImpl*/ // Set the HTTP Request Implementation method
/*#endif*/

/*jshint wsh: true*/
/*eslint-env wsh*/
/*eslint-disable new-cap*/

if (_GPF_HOST.WSCRIPT === _gpfHost) {

    _gpfSetHttpRequestImpl(function (request, resolve, reject) {
        _gpfIgnore(reject);
        var winHttp = new ActiveXObject("WinHttp.WinHttpRequest.5.1");
        // winHttp.SetTimeouts(0, 60000, 30000, 30000);
        winHttp.Open(request.method, request.url);
        if (request.headers) {
            Object.keys(request.headers).forEach(function (headerName) {
                winHttp.setRequestHeader(headerName, request.headers[headerName]);
            });
        }
        winHttp.Send(request.data || null);
        resolve({
            status: winHttp.Status,
            responseText: winHttp.ResponseText
        });
    });

}

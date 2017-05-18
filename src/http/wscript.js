/**
 * @file MS Script specific HTTP implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfHost*/ // Host type
/*global _gpfHttpParseHeaders*/ // Parse HTTP response headers
/*global _gpfSetHttpRequestImpl*/ // Set the HTTP Request Implementation method
/*#endif*/

/*jshint wsh: true*/
/*eslint-env wsh*/
/*eslint-disable new-cap*/

function _gpfHttpWScriptSetHeaders (winHttp, headers) {
    if (headers) {
        Object.keys(headers).forEach(function (headerName) {
            winHttp.setRequestHeader(headerName, headers[headerName]);
        });
    }
}

function _gpfHttpWScriptSend (winHttp, data) {
    if (data) {
        winHttp.Send(data);
    } else {
        winHttp.Send();
    }
}

if (_GPF_HOST.WSCRIPT === _gpfHost) {

    _gpfSetHttpRequestImpl(function (request, resolve) {
        var winHttp = new ActiveXObject("WinHttp.WinHttpRequest.5.1");
        // winHttp.SetTimeouts(0, 60000, 30000, 30000);
        winHttp.Open(request.method, request.url);
        _gpfHttpWScriptSetHeaders(winHttp, request.headers);
        _gpfHttpWScriptSend(winHttp, request.data);
        resolve({
            status: winHttp.Status,
            headers: _gpfHttpParseHeaders(winHttp.GetAllResponseHeaders()),
            responseText: winHttp.ResponseText
        });
    });

}

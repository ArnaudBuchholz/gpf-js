/**
 * @file MS Script specific HTTP implementation
 * @since 0.2.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfHttpGenSend*/ // Generates a function that implements the http send logic
/*global _gpfHttpGenSetHeaders*/ // Generates a function that transmit headers to the http object
/*global _gpfHttpParseHeaders*/ // Parse HTTP response headers
/*global _gpfHttpSetRequestImplIf*/ // Set the request implementation if the host matches
/*#endif*/

/*jshint wsh: true*/
/*eslint-env wsh*/
/*eslint-disable new-cap*/

var _gpfHttpWScriptSetHeaders = _gpfHttpGenSetHeaders("setRequestHeader"),
    _gpfHttpWScriptSend = _gpfHttpGenSend("Send");

function _gpfHttpWScriptAllocate (request) {
    var winHttp = new ActiveXObject("WinHttp.WinHttpRequest.5.1");
    winHttp.Open(request.method, request.url);
    return winHttp;
}

function _gpfHttpWScriptResolve (winHttp, resolve) {
    resolve({
        status: winHttp.Status,
        headers: _gpfHttpParseHeaders(winHttp.GetAllResponseHeaders()),
        responseText: winHttp.ResponseText
    });
}

function _gpfHttpWscriptRequestImpl (request, resolve) {
    var winHttp = _gpfHttpWScriptAllocate(request);
    _gpfHttpWScriptSetHeaders(winHttp, request.headers);
    _gpfHttpWScriptSend(winHttp, request.data);
    _gpfHttpWScriptResolve(winHttp, resolve);
}

_gpfHttpSetRequestImplIf(_GPF_HOST.WSCRIPT, _gpfHttpWscriptRequestImpl);

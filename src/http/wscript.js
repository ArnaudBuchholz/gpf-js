/**
 * @file MS Script specific HTTP implementation
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

/*jshint wsh: true*/
/*eslint-env wsh*/
/*eslint-disable new-cap*/

var _gpfHttpWScriptSetHeaders = _gpfHttpGenSetHeaders("setRequestHeader"),
    _gpfHttpWScriptSend = _gpfHttpGenSend("Send"),
    _gpfHttpWScriptGetResponse = _gpfHttpGenGetResponse("Status", "GetAllResponseHeaders", "ResponseText");

function _gpfHttpWScriptAllocate (request) {
    var winHttp = new ActiveXObject("WinHttp.WinHttpRequest.5.1");
    winHttp.Open(request.method, request.url);
    return winHttp;
}

function _gpfHttpWScriptResolve (winHttp, resolve) {
    resolve(_gpfHttpWScriptGetResponse(winHttp));
}

function _gpfHttpWscriptRequestImpl (request, resolve) {
    var winHttp = _gpfHttpWScriptAllocate(request);
    _gpfHttpWScriptSetHeaders(winHttp, request.headers);
    _gpfHttpWScriptSend(winHttp, request.data);
    _gpfHttpWScriptResolve(winHttp, resolve);
}

_gpfHttpSetRequestImplIf(_GPF_HOST.WSCRIPT, _gpfHttpWscriptRequestImpl);

/**
 * @file NodeJS specific HTTP implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfHttpRequestImplByHost*/ // HTTP Request Implementation per host
/*global _GpfNodeReadableStream*/ // gpf.node.ReadableStream
/*global _gpfStringFromStream*/ // Read the stream
/*global _gpfNodeHttp*/ // Node require("http")
/*global  _gpfNodeUrl*/ // Node require("url")
/*#endif*/

/*jshint node: true*/
/*eslint-env node*/

function _gpfHttpNodeProcessResponse (nodeResponse, resolve) {
    nodeResponse.setEncoding("utf8");
    var iReadableStream = new _GpfNodeReadableStream(nodeResponse);
    _gpfStringFromStream(iReadableStream)
        .then(function (responseText) {
            iReadableStream.close();
            resolve({
                status: nodeResponse.statusCode,
                headers: nodeResponse.headers,
                responseText: responseText
            });
        });
}

function _gpfHttpNodeAllocate (request, resolve) {
    return _gpfNodeHttp.request(Object.assign(_gpfNodeUrl.parse(request.url), request), function (nodeResponse) {
        _gpfHttpNodeProcessResponse(nodeResponse, resolve);
    });
}

function _gpfHttpNodeSend (clientRequest, data) {
    if (data) {
        clientRequest.write(data);
    }
    clientRequest.end();
}

_gpfHttpRequestImplByHost[_GPF_HOST.NODEJS] = function (request, resolve, reject) {
    var clientRequest = _gpfHttpNodeAllocate(request, resolve);
    clientRequest.on("error", reject);
    _gpfHttpNodeSend(clientRequest, request.data);
};

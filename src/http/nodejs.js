/**
 * @file NodeJS specific HTTP implementation
 * @since 0.2.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _GpfNodeReadableStream*/ // gpf.node.ReadableStream
/*global _gpfHttpSetRequestImplIf*/ // Set the http request implementation if the host matches
/*global _gpfNodeHttp*/ // Node require("http")
/*global _gpfNodeHttps*/ // Node require("https")
/*global _gpfNodeUrl*/ // Node require("url")
/*global _gpfStringFromStream*/ // Read the stream
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

function _gpfHttpNodeAdjustSettingsForSend (settings, data) {
    if (data) {
        settings.headers = Object.assign({
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": Buffer.byteLength(data)
        }, settings.headers);
    }
}

function _gpfHttpNodeBuildRequestSettings (request) {
    var settings = Object.assign(_gpfNodeUrl.parse(request.url), request);
    _gpfHttpNodeAdjustSettingsForSend(settings, request.data);
    return settings;
}

function _gpfHttpNodeGetMessageHandler (settings) {
    if ("https:" === settings.protocol) {
        return _gpfNodeHttps;
    }
    return _gpfNodeHttp;
}

function _gpfHttpNodeAllocate (request, resolve) {
    var settings = _gpfHttpNodeBuildRequestSettings(request),
        messageHandler = _gpfHttpNodeGetMessageHandler(settings);
    return messageHandler.request(settings, function (nodeResponse) {
        _gpfHttpNodeProcessResponse(nodeResponse, resolve);
    });
}

function _gpfHttpNodeSend (clientRequest, data) {
    if (data) {
        clientRequest.write(data, "utf8", function () {
            clientRequest.end();
        });
    } else {
        clientRequest.end();
    }
}

function _gpfHttpNodeRequestImpl (request, resolve, reject) {
    var clientRequest = _gpfHttpNodeAllocate(request, resolve);
    clientRequest.on("error", reject);
    _gpfHttpNodeSend(clientRequest, request.data);
}

_gpfHttpSetRequestImplIf(_GPF_HOST.NODEJS, _gpfHttpNodeRequestImpl);

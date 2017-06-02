/**
 * @file Rhino specific HTTP implementation
 * @since 0.2.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _GpfRhinoReadableStream*/ // gpf.rhino.ReadableStream
/*global _GpfRhinoWritableStream*/ // gpf.rhino.WritableStream
/*global _gpfHttpGenSetHeaders*/ // Generates a function that transmit headers to the http object
/*global _gpfHttpRequestImplByHost*/ // HTTP Request Implementation per host
/*global _gpfStringFromStream*/ // Read the stream
/*#endif*/

/*jshint rhino: true*/
/*eslint-env rhino*/

var _gpfHttpRhinoSetHeaders = _gpfHttpGenSetHeaders("setRequestProperty");

function _gpfHttpRhinoSendData (httpConnection, data) {
    if (data) {
        httpConnection.setDoOutput(true);
        var iWritableStream = new _GpfRhinoWritableStream(httpConnection.getOutputStream());
        return iWritableStream.write(data)
            .then(function () {
                iWritableStream.close();
            });
    }
    return Promise.resolve();
}

function _gpfHttpRhinoGetResponse (httpConnection) {
    try {
        return httpConnection.getInputStream();
    } catch (e) {
        return httpConnection.getErrorStream();
    }
}

function _gpfHttpRhinoGetResponseText (httpConnection) {
    var iReadableStream = new _GpfRhinoReadableStream(_gpfHttpRhinoGetResponse(httpConnection));
    return _gpfStringFromStream(iReadableStream)
        .then(function (responseText) {
            iReadableStream.close();
            return responseText;
        });
}

function _gpfHttpRhinoGetHeaders (httpConnection) {
    var headers = {},
        headerFields = httpConnection.getHeaderFields(),
        keys = headerFields.keySet().toArray();
    keys.forEach(function (key) {
        headers[String(key)] = String(headerFields.get(key).get(0));
    });
    return headers;
}

function _gpfHttpRhinoResolve (httpConnection, resolve) {
    _gpfHttpRhinoGetResponseText(httpConnection)
        .then(function (responseText) {
            resolve({
                status: httpConnection.getResponseCode(),
                headers: _gpfHttpRhinoGetHeaders(httpConnection),
                responseText: responseText
            });
        });
}

_gpfHttpRequestImplByHost[_GPF_HOST.RHINO] = function (request, resolve) {
    var httpConnection = new java.net.URL(request.url).openConnection();
    httpConnection.setRequestMethod(request.method);
    _gpfHttpRhinoSetHeaders(httpConnection, request.headers);
    _gpfHttpRhinoSendData(httpConnection, request.data);
    _gpfHttpRhinoResolve(httpConnection, resolve);
};

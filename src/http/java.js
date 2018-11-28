/**
 * @file Java (Rhino, Nashorn) specific HTTP implementation
 * @since 0.2.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _GPF_START*/ // 0
/*global _GpfStreamJavaReadable*/ // gpf.java.ReadableStream
/*global _GpfStreamJavaWritable*/ // gpf.java.WritableStream
/*global _gpfArrayForEach*/ // Almost like [].forEach (undefined are also enumerated)
/*global _gpfHttpGenSetHeaders*/ // Generates a function that transmit headers to the http object
/*global _gpfHttpSetRequestImplIf*/ // Set the http request implementation if the host matches
/*global _gpfStringFromStream*/ // Read the stream
/*#endif*/

/*jshint rhino: true*/
/*eslint-env rhino*/

var _gpfHttpJavaSetHeaders = _gpfHttpGenSetHeaders("setRequestProperty");

function _gpfHttpJavaSendData (httpConnection, data) {
    if (data) {
        httpConnection.setDoOutput(true);
        var iWritableStream = new _GpfStreamJavaWritable(httpConnection.getOutputStream());
        return iWritableStream.write(data)
            .then(function () {
                iWritableStream.close();
            });
    }
    return Promise.resolve();
}

function _gpfHttpJavaGetResponse (httpConnection) {
    try {
        return httpConnection.getInputStream();
    } catch (e) {
        return httpConnection.getErrorStream();
    }
}

function _gpfHttpJavaGetResponseText (httpConnection) {
    var iReadableStream = new _GpfStreamJavaReadable(_gpfHttpJavaGetResponse(httpConnection));
    return _gpfStringFromStream(iReadableStream)
        .then(function (responseText) {
            iReadableStream.close();
            return responseText;
        });
}

function _gpfHttpJavaGetHeaders (httpConnection) {
    var headers = {},
        headerFields = httpConnection.getHeaderFields(),
        keys = headerFields.keySet().toArray();
    _gpfArrayForEach(keys, function (key) {
        headers[String(key)] = String(headerFields.get(key).get(_GPF_START));
    });
    return headers;
}

function _gpfHttpJavaResolve (httpConnection, resolve) {
    _gpfHttpJavaGetResponseText(httpConnection)
        .then(function (responseText) {
            resolve({
                status: httpConnection.getResponseCode(),
                headers: _gpfHttpJavaGetHeaders(httpConnection),
                responseText: responseText
            });
        });
}

function _gpfHttpJavaRequestImpl (request, resolve) {
    var httpConnection = new java.net.URL(request.url).openConnection();
    httpConnection.setRequestMethod(request.method);
    _gpfHttpJavaSetHeaders(httpConnection, request.headers);
    _gpfHttpJavaSendData(httpConnection, request.data)
        .then(function () {
            _gpfHttpJavaResolve(httpConnection, resolve);
        });

}

_gpfHttpSetRequestImplIf(_GPF_HOST.RHINO, _gpfHttpJavaRequestImpl);
_gpfHttpSetRequestImplIf(_GPF_HOST.NASHORN, _gpfHttpJavaRequestImpl);

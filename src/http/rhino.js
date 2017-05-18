/**
 * @file Rhino specific HTTP implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfHttpGenSetHeaders*/ // Generates a function that transmit headers to the http object
/*global _gpfHttpRequestImplByHost*/ // HTTP Request Implementation per host
/*#endif*/

/*jshint rhino: true*/
/*eslint-env rhino*/

var _gpfHttpRhinoSetHeaders = _gpfHttpGenSetHeaders("setRequestProperty");

function _gpfHttpRhinoSendData (httpConnection, data) {
    if (data) {
        httpConnection.setDoOutput(true);
        var outputStreamWriter = new java.io.OutputStreamWriter(httpConnection.getOutputStream());
        outputStreamWriter.write(data);
        outputStreamWriter.flush();
        outputStreamWriter.close();
    }
}

function _gpfHttpRhinoGetResponse (httpConnection) {
    try {
        return httpConnection.getInputStream();
    } catch (e) {
        return httpConnection.getErrorStream();
    }
}

function _gpfHttpRhinoGetResponseText (httpConnection) {
    var response = _gpfHttpRhinoGetResponse(httpConnection),
        scanner = new java.util.Scanner(response),
        responseText = String(scanner.useDelimiter("\\A").next());
    response.close();
    return responseText;
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

_gpfHttpRequestImplByHost[_GPF_HOST.RHINO] = function (request, resolve) {
    var httpConnection = new java.net.URL(request.url).openConnection();
    httpConnection.setRequestMethod(request.method);
    _gpfHttpRhinoSetHeaders(httpConnection, request.headers);
    _gpfHttpRhinoSendData(httpConnection, request.data);
    var responseText = _gpfHttpRhinoGetResponseText(httpConnection);
    var headers = _gpfHttpRhinoGetHeaders(httpConnection);
    resolve({
        status: httpConnection.getResponseCode(),
        headers: headers,
        responseText: responseText
    });
};

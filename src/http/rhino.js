/**
 * @file Rhino specific HTTP implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfHost*/ // Host type
/*global _gpfSetHttpRequestImpl*/ // Set the HTTP Request Implementation method
/*#endif*/

/*jshint rhino: true*/
/*eslint-env rhino*/

function _gpfHttpRhinoSetHeaders (httpConnection, headers) {
    if (headers) {
        Object.keys(headers).forEach(function (headerName) {
            httpConnection.setRequestProperty(headerName, headers[headerName]);
        });
    }
}

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

if (_GPF_HOST.RHINO === _gpfHost) {

    _gpfSetHttpRequestImpl(function (request, resolve) {
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
    });

}

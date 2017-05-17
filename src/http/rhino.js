/**
 * @file Rhino specific HTTP implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfHost*/ // Host type
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfSetHttpRequestImpl*/ // Set the HTTP Request Implementation method
/*#endif*/

/*jshint rhino: true*/
/*eslint-env rhino*/

if (_GPF_HOST.RHINO === _gpfHost) {

    _gpfSetHttpRequestImpl(function (request, resolve, reject) {
        _gpfIgnore(reject);
        var httpConnection = new java.net.URL(request.url).openConnection();
        httpConnection.setRequestMethod(request.method);
        if (request.headers) {
            Object.keys(request.headers).forEach(function (headerName) {
                httpConnection.setRequestProperty(headerName, request.headers[headerName]);
            });
        }
        if (request.data) {
            httpConnection.setDoOutput(true);
            httpConnection.getOutputStream(); // .write(request.data);
        }
        var response;
        try {
            response = httpConnection.getInputStream();
        } catch (e) {
            response = httpConnection.getErrorStream();
        }
        var scanner = new java.util.Scanner(response),
            responseText = String(scanner.useDelimiter("\\A").next());
        response.close();
        var headers = {},
            headerFields = httpConnection.getHeaderFields(),
            keys = headerFields.keySet().toArray();
        keys.forEach(function (key) {
            headers[String(key)] = String(headerFields.get(key).get(0));
        });
        resolve({
            status: httpConnection.getResponseCode(),
            headers: headers,
            responseText: responseText
        });
    });

}

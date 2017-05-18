/**
 * @file NodeJS specific HTTP implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfHttpRequestImplByHost*/ // HTTP Request Implementation per host
/*#endif*/

/*jshint node: true*/
/*eslint-env node*/

var _gpfNodeJSURL,
    _gpfNodeJSHTTP;

function _gpfHttpNodeInitURLAndHTTP () {
    if (!_gpfNodeJSURL) {
        _gpfNodeJSURL = require("url");
        _gpfNodeJSHTTP = require("http");
    }
}

function _gpfHttpNodeProcessResponse (resolve, nodeResponse) {
    var response = {
            status: nodeResponse.statusCode,
            headers: nodeResponse.headers
        },
        responseText = [];
    nodeResponse.setEncoding("utf8");
    nodeResponse
        .on("data", function (chunk) {
            responseText.push(chunk.toString());
        })
        .on("end", function () {
            response.responseText = responseText.join("");
            resolve(response);
        });
}

_gpfHttpRequestImplByHost[_GPF_HOST.NODEJS] = function (request, resolve, reject) {
    _gpfHttpNodeInitURLAndHTTP();
    var options = Object.assign(_gpfNodeJSURL.parse(request.url), request),
        clientRequest = _gpfNodeJSHTTP.request(options, _gpfHttpNodeProcessResponse.bind(null, resolve));
    clientRequest.on("error", reject);
    if (request.data) {
        clientRequest.write(request.data);
    }
    clientRequest.end();
};

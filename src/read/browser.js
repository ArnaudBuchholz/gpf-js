/**
 * @file Browser read implementation
 * @since 0.2.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _GPF_HTTP_METHODS*/ // HTTP Methods
/*global _gpfHttpRequest*/ // HTTP request common implementation
/*global _gpfReadSetImplIf*/ // Set the read implementation if the host matches
/*#endif*/

var _GPF_READ_HTTP_STATUS_CLASS = 100,
    _GPF_READ_HTTP_STATUS_CLASS_OK = 2;

function _gpfReadHttp (path) {
    return _gpfHttpRequest({
        method: _GPF_HTTP_METHODS.GET,
        url: path
    }).then(function (response) {
        if (Math.floor(response.status / _GPF_READ_HTTP_STATUS_CLASS) !== _GPF_READ_HTTP_STATUS_CLASS_OK) {
            throw new Error(response.responseText);
        }
        return response.responseText;
    });
}

_gpfReadSetImplIf(_GPF_HOST.BROWSER, _gpfReadHttp);

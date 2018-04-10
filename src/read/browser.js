/**
 * @file Browser read implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/
/*global _GPF_HTTP_METHODS*/ // HTTP Methods
/*global _gpfHttpRequest*/ // HTTP request common implementation
/*global _gpfReadImplByHost*/ // gpf.read per host
/*#endif*/

_gpfReadImplByHost[_GPF_HOST.BROWSER] = function _gpfReadHttp (path) {
    return _gpfHttpRequest({
        method: _GPF_HTTP_METHODS.GET,
        url: path
    }).then(function (response) {
        return response.responseText;
    });
};

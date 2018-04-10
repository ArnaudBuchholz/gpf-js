/**
 * @file Require browser specific definitions
 * @since 0.2.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _GPF_HTTP_METHODS*/ // HTTP Methods
/*global _gpfHttpRequest*/ // HTTP request common implementation
/*global _gpfRequireLoadByHost*/ // Host specific loading procedure
/*global _gpfRequireSourceMapByHost*/ // Host specific source mapping procedure
/*#endif*/

/*jshint browser: true*/
/*eslint-env browser*/

_gpfRequireLoadByHost[_GPF_HOST.BROWSER] = function _gpfRequireLoadHTTP (name) {
    return _gpfHttpRequest({
        method: _GPF_HTTP_METHODS.GET,
        url: name
    }).then(function (response) {
        return response.responseText;
    });
};

_gpfRequireSourceMapByHost[_GPF_HOST.BROWSER] = function _gpfRequireSourceMapBrowswer (name, content) {
    var baseUrl;
    if ("/" === name.charAt(0)) {
        baseUrl = location.origin;
    } else {
        baseUrl = location.toString();
    }
    return "//# sourceURL=" + baseUrl + name + "?gpf.require\n" + content;
};

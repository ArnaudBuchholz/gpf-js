/**
 * @file Require definitions for other hosts
 * @since 0.2.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfRead*/ // Generic read method
/*global _gpfRequireLoadByHost*/ // Host specific loading procedure
/*global _gpfRequireSourceMapByHost*/ // Host specific source mapping procedure
/*#endif*/

function _gpfRequireLoadFS (name) {
    // Must be relative to the current execution path
    var path;
    if (name.charAt(0) === "/") {
        path = "." + name;
    } else {
        path = "./" + name;
    }
    return _gpfRead(path);
}

function _gpfRequireSourceMapNone (name, content) {
    return content;
}

Object.keys(_GPF_HOST)
    .filter(function (hostKey) {
        return hostKey !== "BROWSER";
    })
    .forEach(function (hostKey) {
        var host = _GPF_HOST[hostKey];
        _gpfRequireLoadByHost[host] = _gpfRequireLoadFS;
        _gpfRequireSourceMapByHost[host] = _gpfRequireSourceMapNone;
    });

/**
 * @file Require definitions for other hosts
 * @since 0.2.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfRequireSourceMapByHost*/ // Host specific source mapping procedure
/*#endif*/

function _gpfRequireSourceMapNone (name, content) {
    return content;
}

Object.keys(_GPF_HOST)
    .filter(function (hostKey) {
        return hostKey !== "BROWSER";
    })
    .forEach(function (hostKey) {
        _gpfRequireSourceMapByHost[_GPF_HOST[hostKey]] = _gpfRequireSourceMapNone;
    });

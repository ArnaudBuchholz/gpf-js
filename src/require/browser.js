/**
 * @file Require browser specific definitions
 * @since 0.2.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfPathJoin*/ // Join all arguments together and normalize the resulting path
/*global _gpfRequireSourceMapByHost*/ // Host specific source mapping procedure
/*#endif*/

/*jshint browser: true*/
/*eslint-env browser*/

_gpfRequireSourceMapByHost[_GPF_HOST.BROWSER] = function _gpfRequireSourceMapBrowswer (name, content) {
    return "//# sourceURL=" + location.origin + _gpfPathJoin(location.pathname, name) + "?gpf.require\n" + content;
};

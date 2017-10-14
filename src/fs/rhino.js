/**
 * @file Rhino File system implementation
 * @since 0.2.2
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfFsReadImplByHost*/ // gpf.fs.read per host
/*#endif*/

/*jshint rhino: true*/
/*eslint-env rhino*/

_gpfFsReadImplByHost[_GPF_HOST.RHINO] = function (path) {
    return new Promise(function (resolve) {
        resolve(readFile(path));
    });
};

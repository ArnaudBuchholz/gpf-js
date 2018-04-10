/**
 * @file Rhino File system read implementation
 * @since 0.2.2
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfReadImplByHost*/ // gpf.read per host
/*#endif*/

/*jshint rhino: true*/
/*eslint-env rhino*/

_gpfReadImplByHost[_GPF_HOST.RHINO] = function (path) {
    return new Promise(function (resolve) {
        resolve(readFile(path));
    });
};

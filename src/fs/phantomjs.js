/**
 * @file PhantomJS File system implementation
 * @since 0.2.2
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfFsReadImplByHost*/ // gpf.fs.read per host
/*global _gpfNodeFs*/ // Node/PhantomJS require("fs")
/*#endif*/

_gpfFsReadImplByHost[_GPF_HOST.PHANTOMJS] = function (path) {
    return new Promise(function (resolve, reject) {
        try {
            resolve(_gpfNodeFs.read(path));
        } catch (e) {
            // Error is a string
            reject(new Error(e));
        }
    });
};

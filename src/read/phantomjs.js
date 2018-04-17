/**
 * @file PhantomJS File system read implementation
 * @since 0.2.2
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfNodeFs*/ // Node/PhantomJS require("fs")
/*global _gpfReadSetImplIf*/ // Set the read implementation if the host matches
/*#endif*/

function _gpfReadPhantomJS (path) {
    return new Promise(function (resolve, reject) {
        try {
            resolve(_gpfNodeFs.read(path));
        } catch (e) {
            // Error is a string
            reject(new Error(e));
        }
    });
}

_gpfReadSetImplIf(_GPF_HOST.PHANTOMJS, _gpfReadPhantomJS);

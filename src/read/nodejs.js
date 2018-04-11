/**
 * @file NodeJS read implementation
 * @since 0.2.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfNodeFs*/ // Node/PhantomJS require("fs")
/*global _gpfReadImplByHost*/ // gpf.read per host
/*#endif*/

_gpfReadImplByHost[_GPF_HOST.NODEJS] = function (path) {
    return new Promise(function (resolve, reject) {
        _gpfNodeFs.readFile(path, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data.toString());
            }
        });
    });
};

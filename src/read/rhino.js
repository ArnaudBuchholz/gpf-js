/**
 * @file Rhino File system read implementation
 * @since 0.2.2
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfReadSetImplIf*/ // Set the read implementation if the host matches
/*#endif*/

/*jshint rhino: true*/
/*eslint-env rhino*/

function _gpfReadRhino (path) {
    return new Promise(function (resolve) {
        resolve(readFile(path));
    });
}

_gpfReadSetImplIf(_GPF_HOST.RHINO, _gpfReadRhino);

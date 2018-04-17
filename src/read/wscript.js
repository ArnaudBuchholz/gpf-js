/**
 * @file WScript specific File System implementation
 * @since 0.2.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfMsFSO*/ // Scripting.FileSystemObject activeX
/*global _gpfReadSetImplIf*/ // Set the read implementation if the host matches
/*#endif*/

/*jshint wsh:true*/
/*eslint-env wsh*/
/*eslint-disable new-cap*/ // FileSystem object APIs are uppercased

function _gpfReadWScript (path) {
    return new Promise(function (resolve) {
        var file = _gpfMsFSO.OpenTextFile(path, 1, false);
        resolve(file.ReadAll());
        file.Close();
    });
}

_gpfReadSetImplIf(_GPF_HOST.WSCRIPT, _gpfReadWScript);

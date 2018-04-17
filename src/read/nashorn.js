/**
 * @file Nashorn read implementation
 * @since 0.2.4
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _GpfStreamJavaReadable*/ // gpf.java.ReadableStream
/*global _GpfStreamWritableString*/ // gpf.stream.WritableString
/*global _gpfReadSetImplIf*/ // Set the read implementation if the host matches
/*#endif*/

/*jshint rhino: true*/
/*eslint-env rhino*/

function _gpfReadNashorn (path) {
    var javaPath = java.nio.file.Paths.get(path);
    if (java.nio.file.Files.exists(javaPath)) {
        return new Promise(function (resolve, reject) {
            var javaInputStream = java.nio.file.Files.newInputStream(javaPath),
                iStreamReader = new _GpfStreamJavaReadable(javaInputStream),
                iWritableString = new _GpfStreamWritableString();
            return iStreamReader.read(iWritableString)
                .then(function () {
                    resolve(iWritableString.toString());
                })["catch"](reject);
        });
    }
    return Promise.reject(new Error("File not found")); // To be improved
}

_gpfReadSetImplIf(_GPF_HOST.NASHORN, _gpfReadNashorn);

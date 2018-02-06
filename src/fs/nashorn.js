/**
 * @file Nashorn File system implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfFsReadImplByHost*/ // gpf.fs.read per host
/*global _GpfStreamJavaReadable*/ // gpf.java.ReadableStream
/*global _GpfStreamWritableString*/ // gpf.stream.WritableString
/*#endif*/

/*jshint rhino: true*/
/*eslint-env rhino*/

_gpfFsReadImplByHost[_GPF_HOST.NASHORN] = function (path) {
    var javaPath = java.nio.file.Paths.get(path);
    if (java.nio.file.Files.exists(javaPath)) {
        try {
            var javaInputStream = java.nio.file.Files.newInputStream(javaPath),
                iStreamReader = new _GpfStreamJavaReadable(javaInputStream),
                iWritableString = new _GpfStreamWritableString();
            return iStreamReader.read(iWritableString)
                .then(function () {
                    return iWritableString.toString();
                });
        } catch (e) {
            return Promise.reject(e);
        }
    }
    return Promise.reject(new Error("File not found")); // To be improved
};

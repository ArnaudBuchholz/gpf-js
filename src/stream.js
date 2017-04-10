/**
 * @file Streams helpers
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*exported _GPF_STREAM_DEFAULT_READ_SIZE*/ // Global default for stream read size
/*exported _gpfStreamSecureRead*/ // Generate a wrapper to secure multiple calls to stream#read
/*exported _gpfStreamSecureWrite*/ // Generates a wrapper to secure multiple calls to stream#write
/*#endif*/

_gpfErrorDeclare("stream", {
    readInProgress:
        "A read operation is already in progress",
    writeInProgress:
        "A write operation is already in progress"
});

var _GPF_STREAM_DEFAULT_READ_SIZE = 4096;

/**
 * @namespace gpf.stream
 * @description Root namespace for GPF streams
 */
gpf.stream = {};

/**
 * Generate a wrapper to secure multiple calls to stream#read
 *
 * @param {Function} read Read function
 * @return {Function} Function exposing {@see gpf.interfaces.IReadableStream#read}
 * @gpf:closure
 */
function _gpfStreamSecureRead (read) {
    var inProgress = false;
    return function (output) {
        if (inProgress) {
            gpf.error.readInProgress();
        }
        inProgress = true;
        return read(output)
            .then(function (result) {
                inProgress = false;
                return Promise.resolve(result);
            }, function (reason) {
                inProgress = false;
                return Promise.reject(reason);
            });
    };
}

/**
 * Generate a wrapper to secure multiple calls to stream#write
 *
 * @param {Function} write Write function
 * @return {Function} Function exposing {@see gpf.interfaces.IWritableStream#write}
 * @gpf:closure
 */
function _gpfStreamSecureWrite (write) {
    var inProgress = false;
    return function (buffer) {
        if (inProgress) {
            gpf.error.readInProgress();
        }
        inProgress = true;
        return write(buffer)
            .then(function (result) {
                inProgress = false;
                return Promise.resolve(result);
            }, function (reason) {
                inProgress = false;
                return Promise.reject(reason);
            });
    };
}

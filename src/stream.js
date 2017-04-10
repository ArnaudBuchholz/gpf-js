/**
 * @file Streams helpers
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*exported _GPF_STREAM_DEFAULT_READ_SIZE*/ // Global default for stream read size
/*exported _gpfStreamSecuredRead*/
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

function _gpfStreamSecuredRead (size) {
    this.read = gpf.error.readInProgress;
    return this._read(size).then(undefined, function (e) {
        this.read = _gpfStreamSecuredRead
    }.bind(this));
}

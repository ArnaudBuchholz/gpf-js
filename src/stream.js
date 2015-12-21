/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*exported _GPF_STREAM_DEFAULT_READ_SIZE*/ // Global default for stream read size
/*#endif*/

_gpfErrorDeclare("stream", {
    readInProgress:
        "A read operation is already in progress",
    writeInProgress:
        "A write operation is already in progress"
});

var _GPF_STREAM_DEFAULT_READ_SIZE = 4096;

gpf.stream = {
};

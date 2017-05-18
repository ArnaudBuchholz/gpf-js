/**
 * @file Helper to read strings from stream
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfStreamQueryReadable*/ // Get an IReadableStream or fail if not implemented
/*global _GpfStreamWritableString*/ // gpf.stream.WritableString
/*exported _gpfStringFromStream*/ // Read the stream
/*#endif*/

/**
 * Read the stream
 *
 * @param {gpf.interfaces.IReadableStream} readableStream stream to read content from
 * @return {Promise<String>} Resolved when the stream has been read
 */
function _gpfStringFromStream (readableStream) {
    var iWritableString = new _GpfStreamWritableString(),
        iReadableStream = _gpfStreamQueryReadable(readableStream);
    return iReadableStream.read(iWritableString)
        .then(function () {
            return iWritableString.toString();
        });
}

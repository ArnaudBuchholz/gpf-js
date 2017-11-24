/**
 * @file Stream piping
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfStreamQueryReadable*/ // Get an IReadableStream or fail if not implemented
/*global _gpfStreamQueryWritable*/ // Get an IWritableStream or fail if not implemented
/*global _gpfInterfaceQuery*/ // gpf.interfaces.query
/*global _gpfIFlushableStream*/ // gpf.interfaces.IFlushableStream
/*exported _gpfStreamPipe*/ // gpf.stream.pipe
/*#endif*/

/**
 * Creates a pipe sequence chain between an intermediate stream and a writable (flushable?) destination
 *
 * @param {Object} intermediate Must at least implements IReadableStream interface.
 * If it implements the IFlushableStream interface, it is assumed that it retains data
 * until it receives the Flush. Meaning, the read won't complete until the flush call.
 * If it does not implement the IFlushableStream, the read may end before the whole sequence
 * has finished. It means that the next write should trigger a new read and flush must be simulated at
 * least to pass it to the
 * @param destination
 * @private
 */
/*
function _gpfStreamPipeToFlushableWrite (intermediate, destination) {

    var iReadableStream = _gpfStreamQueryReadable(intermediate),
        iWritableStream = _gpfStreamQueryWritable(destination),
        iFlushableOutStream = _gpfInterfaceQuery(_gpfIFlushableStream, destination);

}
*/

/**
 * Pipe streams.
 *
 * @param {gpf.interfaces.IReadableStream} source Source stream
 * @param {...gpf.interfaces.IWritableStream} destination Writable streams
 * @return {Promise} Resolved when reading (and subsequent writings) are done
 */
function _gpfStreamPipe (source, destination) {
    var iReadableStream = _gpfStreamQueryReadable(source),
        iWritableStream = _gpfStreamQueryWritable(destination);
    try {
        return iReadableStream.read(iWritableStream)
            .then(function () {
                var iFlushableStream = _gpfInterfaceQuery(_gpfIFlushableStream, iWritableStream);
                if (iFlushableStream) {
                    return iFlushableStream.flush();
                }
            });
    } catch (e) {
        return Promise.reject(e);
    }
}

/** @gpf:sameas _gpfStreamPipe */
gpf.stream.pipe = _gpfStreamPipe;
